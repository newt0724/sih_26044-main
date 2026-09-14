"""Production runtime for the scoring flow defined in main_ml_part.py."""

import os
import re
from typing import Any

import cv2
import joblib
import pandas as pd
import pdfplumber
import pytesseract
import requests
from pdf2image import convert_from_path
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "ml", "models")
CLF_MODEL_PATH = os.path.join(MODEL_DIR, "screening_classifier.pkl")
REG_MODEL_PATH = os.path.join(MODEL_DIR, "screening_regressor.pkl")


def _load_models():
    return joblib.load(CLF_MODEL_PATH), joblib.load(REG_MODEL_PATH)


def inspect_resume(file_path: str | None) -> dict[str, Any]:
    result = {
        "extracted_text": "",
        "extracted_text_preview": "",
        "fraud_detected": False,
        "hidden_keywords_caught": [],
        "score_penalty": 0.0,
        "ocr_used": False,
    }
    if not file_path or not os.path.exists(file_path):
        return result

    extension = os.path.splitext(file_path)[1].lower()
    extracted_text = ""
    hidden_keywords: list[str] = []
    scanned = extension in {".png", ".jpg", ".jpeg"}

    if extension == ".pdf":
        try:
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    words = page.extract_words(extra_attrs=["non_stroking_color", "size"])
                    if not words:
                        scanned = True
                    for word in words:
                        color = word.get("non_stroking_color")
                        if color in ((1, 1, 1), (255, 255, 255), [1, 1, 1], [255, 255, 255]):
                            hidden_keywords.append(word["text"])
                        if word.get("size", 99) < 3.0:
                            hidden_keywords.append(word["text"])
                    extracted_text += (page.extract_text() or "") + "\n"
        except Exception:
            scanned = True

    if scanned:
        try:
            if extension in {".png", ".jpg", ".jpeg"}:
                image = cv2.imread(file_path)
                extracted_text = pytesseract.image_to_string(image)
            else:
                extracted_text = "\n".join(
                    pytesseract.image_to_string(image)
                    for image in convert_from_path(file_path)
                )
            result["ocr_used"] = True
        except Exception:
            pass

    result["extracted_text"] = extracted_text.strip()
    result["extracted_text_preview"] = result["extracted_text"][:300]
    result["hidden_keywords_caught"] = hidden_keywords
    result["fraud_detected"] = bool(hidden_keywords)
    result["score_penalty"] = -20.0 if hidden_keywords else 0.0
    return result


def calculate_semantic_similarity(resume_text: str, job_description: str) -> dict[str, Any]:
    if not resume_text or not job_description:
        return {"semantic_match_score": 50.0, "match_quality": "Standard Match"}
    try:
        matrix = TfidfVectorizer(stop_words="english", ngram_range=(1, 2)).fit_transform(
            [resume_text, job_description]
        )
        score = round(float(cosine_similarity(matrix[0:1], matrix[1:2])[0][0]) * 100, 2)
        return {"semantic_match_score": score, "match_quality": "High Match" if score >= 60 else "Moderate Match"}
    except Exception:
        return {"semantic_match_score": 50.0, "match_quality": "Standard Match"}


def extract_resume_links(text: str) -> dict[str, str | None]:
    github = re.findall(r"https?://(?:www\.)?github\.com/[a-zA-Z0-9_-]+", text, re.IGNORECASE)
    linkedin = re.findall(r"https?://(?:www\.)?linkedin\.com/in/[a-zA-Z0-9_-]+", text, re.IGNORECASE)
    return {"github_url": github[0] if github else None, "linkedin_url": linkedin[0] if linkedin else None}


def analyze_github(url: str | None) -> dict[str, Any]:
    empty = {"valid": False, "score": 0.0, "public_repos": 0, "tech_stack": []}
    if not url:
        return empty
    username = url.strip().rstrip("/").split("github.com/")[-1].split("/")[0]
    try:
        headers = {"User-Agent": "Academia-Industry-Platform"}
        user_response = requests.get(f"https://api.github.com/users/{username}", headers=headers, timeout=4)
        if user_response.status_code != 200:
            return empty
        public_repos = user_response.json().get("public_repos", 0)
        repos_response = requests.get(
            f"https://api.github.com/users/{username}/repos?per_page=100",
            headers=headers,
            timeout=4,
        )
        stars = 0
        languages = set()
        if repos_response.status_code == 200:
            for repo in repos_response.json():
                if not repo.get("fork", False):
                    stars += repo.get("stargazers_count", 0)
                    if repo.get("language"):
                        languages.add(repo["language"])
        score = min(100.0, min(30, public_repos * 3) + min(30, stars * 5) + min(20, len(languages) * 5) + (20 if public_repos else 0))
        return {"valid": True, "score": score, "public_repos": public_repos, "tech_stack": sorted(languages), "username": username}
    except requests.RequestException:
        return empty


def recommendations(skills: list[str], role: str) -> list[str]:
    benchmarks = {
        "machine learning intern": ["Python", "Scikit-Learn", "Pandas", "NumPy", "SQL", "Git"],
        "machine learning engineer": ["Python", "PyTorch", "TensorFlow", "FastAPI", "Docker", "MLOps", "SQL"],
        "ai researcher": ["Python", "PyTorch", "TensorFlow", "Deep Learning", "NLP", "Computer Vision"],
        "data scientist": ["Python", "SQL", "Pandas", "Statistics", "Scikit-Learn", "Tableau"],
        "software engineer": ["Java", "Python", "SQL", "C++", "Git", "Docker"],
    }
    required = benchmarks.get(role.strip().lower(), ["Python", "SQL", "Git", "Docker"])
    normalized = {skill.lower().strip() for skill in skills}
    return [f"Learn '{skill}' to fulfill core requirements for '{role}'." for skill in required if skill.lower() not in normalized]


def evaluate_candidate(candidate_form_data: dict[str, Any], file_path: str | None = None) -> dict[str, Any]:
    form = candidate_form_data
    flow: list[dict[str, Any]] = []

    resume = inspect_resume(file_path)
    flow.append({"step": "Resume extraction and anti-fraud scan", "status": "complete", "details": {"ocr_used": resume["ocr_used"], "hidden_keywords": len(resume["hidden_keywords_caught"]), "fraud_detected": resume["fraud_detected"]}})

    model_input = pd.DataFrame([{
        "Skills": form.get("Skills", "Python, SQL"),
        "Experience (Years)": float(form.get("Experience (Years)", 1)),
        "Education": form.get("Education", "B.Tech"),
        "Certifications": form.get("Certifications", "None"),
        "Job Role": form.get("Job Role", "Software Engineer"),
        "Projects Count": int(form.get("Projects Count", 2)),
        "Salary Expectation ($)": float(form.get("Salary Expectation ($)", 60000)),
    }])
    classifier, regressor = _load_models()
    raw_score = float(regressor.predict(model_input)[0])
    ml_decision = int(classifier.predict(model_input)[0])
    flow.append({"step": "ML model prediction", "status": "complete", "details": {"model": "screening-v1.0", "raw_ml_score": round(raw_score, 2), "classifier_decision": ml_decision}})

    job_description = form.get("Job Description") or f"Looking for {form.get('Job Role', 'Software Engineer')} with {form.get('Skills', 'Python, SQL')} experience."
    semantic = calculate_semantic_similarity(resume["extracted_text_preview"], job_description)
    flow.append({"step": "Resume and role semantic match", "status": "complete", "details": semantic})

    links = extract_resume_links(resume["extracted_text_preview"])
    github = analyze_github(form.get("GitHub_URL") or links["github_url"])
    linkedin_url = form.get("LinkedIn_URL") or links["linkedin_url"]
    linkedin_valid = bool(linkedin_url and re.match(r"https?://(?:www\.)?linkedin\.com/in/[a-zA-Z0-9_-]+$", linkedin_url, re.IGNORECASE))
    flow.append({"step": "External profile verification", "status": "complete", "details": {"github": github, "linkedin_verified": linkedin_valid}})

    resume_mentions_certificate = bool(re.search(r"\b(certified|certification|certificate|aws certified|google certified|microsoft certified)\b", resume.get("extracted_text", ""), re.IGNORECASE))
    certification_claimed = str(form.get("Certifications", "None")).strip().lower() != "none" or resume_mentions_certificate
    certification_proof = bool(form.get("has_certification_proof", False))
    certificate_declined = bool(form.get("certificate_upload_declined", False))
    certification_needs_proof = (
        certification_claimed
        and not certification_proof
        and not linkedin_valid
        and not certificate_declined
    )
    certification_penalty = (
        -2.5
        if certification_claimed and not certification_proof and certificate_declined
        else 0.0
    )
    coding_score = max(0.0, min(10.0, float(form.get("coding_assessment_score", float(form.get("assessment_score", 0)) / 10.0))))
    coding_bonus = coding_score
    penalties = resume["score_penalty"] + certification_penalty
    bonuses = (github["score"] / 100.0) * 10.0 + (5.0 if linkedin_valid else 0.0) + coding_bonus
    final_score = max(0.0, min(100.0, (raw_score * 0.7) + (semantic["semantic_match_score"] * 0.3) + penalties + bonuses))
    has_file = bool(file_path and os.path.exists(file_path))
    has_uploaded_resume = (
        has_file or bool(form["has_uploaded_resume"])
        if "has_uploaded_resume" in form
        else True
    )
    if not has_uploaded_resume:
        final_score = 0.0
    elif resume["fraud_detected"]:
        final_score = min(final_score, 25.0)
    elif ml_decision == 0:
        final_score = min(final_score, 59.0)
    flow.append({"step": "Score aggregation", "status": "complete", "details": {"penalties": round(penalties, 2), "bonuses": round(bonuses, 2), "final_score": round(final_score, 2)}})

    if not has_uploaded_resume:
        status = "Resume Pending Upload"
        decision = "PENDING_RESUME"
    elif resume["fraud_detected"]:
        status = "Rejected / Flagged (Hidden Text Fraud Detected)"
        decision = "REJECT"
    elif certification_needs_proof:
        status = "Action Required (Certification Proof Missing)"
        decision = "SHORTLIST" if ml_decision == 1 else "REJECT"
    elif ml_decision == 1:
        status = "Shortlisted"
        decision = "SHORTLIST"
    else:
        status = "Rejected (Low Skill Match)"
        decision = "REJECT"
    flow.append({"step": "Final decision", "status": "complete", "details": {"decision": decision, "status_label": status}})

    skill_list = [skill.strip() for skill in str(form.get("Skills", "")).split(",") if skill.strip()]
    role_benchmarks = {
        "machine learning engineer": ["Python", "PyTorch", "TensorFlow", "FastAPI", "Docker", "MLOps", "SQL"],
        "ai researcher": ["Python", "PyTorch", "TensorFlow", "Deep Learning", "NLP", "Computer Vision"],
        "data scientist": ["Python", "SQL", "Pandas", "Statistics", "Scikit-Learn", "Tableau"],
        "software engineer": ["Java", "Python", "SQL", "C++", "Git", "Docker"],
    }
    target_skills = role_benchmarks.get(str(form.get("Job Role", "Software Engineer")).strip().lower(), ["Python", "SQL", "Git", "Docker"])
    searchable_resume = f"{form.get('Skills', '')} {resume.get('extracted_text', '')}".lower()
    skill_catalog = sorted(set(target_skills + [
        "Python", "Java", "JavaScript", "TypeScript", "C++", "SQL", "Git", "Docker", "Kubernetes",
        "FastAPI", "React", "TensorFlow", "PyTorch", "Pandas", "NumPy", "Scikit-Learn", "NLP",
        "Deep Learning", "Machine Learning", "Computer Vision", "Statistics", "AWS", "Azure", "Linux"
    ]), key=len, reverse=True)
    detected_resume_skills = [skill for skill in skill_catalog if re.search(rf"(?<![a-z0-9]){re.escape(skill.lower())}(?![a-z0-9])", searchable_resume)]
    matching_skills = [skill for skill in target_skills if skill in detected_resume_skills]
    missing_skills = [skill for skill in target_skills if skill not in matching_skills]
    strengths = [f"Resume evidence: {skill}" for skill in detected_resume_skills]
    if float(form.get("Experience (Years)", 0)) >= 3:
        strengths.append(f"{int(float(form['Experience (Years)']))} years of professional experience")
    if int(form.get("Projects Count", 0)) >= 3:
        strengths.append(f"{int(form['Projects Count'])} completed practical projects")
    if not strengths and file_path and os.path.exists(file_path):
        strengths.append("Resume uploaded and successfully evaluated")
    recommendation_skills = skill_list + matching_skills
    return {
        "candidate_name": form.get("Name", "Applicant"),
        "job_role": form.get("Job Role", "Software Engineer"),
        "has_uploaded_resume": has_uploaded_resume,
        "raw_ml_score": round(raw_score, 2) if has_uploaded_resume else 0.0,
        "final_match_score": round(final_score, 2),
        "decision": decision,
        "status_label": status,
        "model_version": "screening-v1.0-main-ml-part",
        "flags": [],
        "verification": {"identity_verified": True, "reason": "Main ML flow completed", "name_match": True},
        "anti_fraud": {"fraud_risk": "high" if resume["fraud_detected"] else "low", "penalty_score": resume["score_penalty"], "signals": resume["hidden_keywords_caught"], "explanation": "Hidden text detected." if resume["fraud_detected"] else "No hidden text detected.", "flags": []},
        "github": {**github, "bonus_score": round((github["score"] / 100.0) * 10.0, 2)},
        "explainability": {"matching_skills": matching_skills, "detected_resume_skills": detected_resume_skills, "missing_skills": missing_skills, "strengths": strengths, "gaps": recommendations(recommendation_skills, form.get("Job Role", "Software Engineer"))},
        "extracted_text_preview": resume["extracted_text_preview"],
        "ocr_used": resume["ocr_used"],
        "flow": flow,
        "raw_ml_match_score": round(raw_score, 2),
        "final_ai_match_score": round(final_score, 2),
        "final_decision_status": status,
        "penalties": {"white_text_fraud_penalty": resume["score_penalty"], "missing_cert_proof_penalty": certification_penalty, "total_penalties": penalties},
        "certificate_verification": {"claimed": certification_claimed, "resume_mention": resume_mentions_certificate, "linkedin_evidence": linkedin_valid, "proof_available": certification_proof, "upload_required": certification_needs_proof, "declined": certificate_declined, "decline_penalty": -2.5},
        "bonuses": {"github_proof_of_work_bonus": round((github["score"] / 100.0) * 10.0, 2), "linkedin_presence_bonus": 5.0 if linkedin_valid else 0.0, "coding_assessment_bonus": coding_bonus, "total_bonuses": round(bonuses, 2)},
        "role_specific_recommendations": recommendations(skill_list, form.get("Job Role", "Software Engineer")),
        "project_suggestions": [
            f"Build a production-ready {missing_skill} project with tests, deployment, and a public README." for missing_skill in missing_skills[:3]
        ] or ["Build an end-to-end portfolio project that combines your strongest skills with a deployed demo."],
    }
