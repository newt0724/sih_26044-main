# =====================================================================
# RESUME PROCESSING: MASTER EVALUATION & ML INFERENCE PIPELINE
# File: resume_processing/pipeline.py
# =====================================================================

import os
import joblib
import pandas as pd
from typing import Dict, Any

from main_ml_part import evaluate_candidate

from resume_processing.pdf_extractor import extract_pdf_content
from resume_processing.ocr import perform_ocr_on_file
from resume_processing.fraud_detection import inspect_resume_anti_fraud
from resume_processing.identity_verification import verify_candidate_identity
from resume_processing.github_verification import verify_github_profile

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, 'ml', 'models')

CLF_PATHS = [
    os.path.join(MODELS_DIR, 'screening_classifier.pkl'),
    os.path.join(MODELS_DIR, 'screening_classifier_gb.pkl'),
    os.path.join(BASE_DIR, 'screening_classifier_gb.pkl')
]
REG_PATHS = [
    os.path.join(MODELS_DIR, 'screening_regressor.pkl'),
    os.path.join(MODELS_DIR, 'screening_regressor_gb.pkl'),
    os.path.join(BASE_DIR, 'screening_regressor_gb.pkl')
]

_classifier_model = None
_regressor_model = None

def _load_ml_models():
    global _classifier_model, _regressor_model
    if _classifier_model is None or _regressor_model is None:
        clf_p = next((p for p in CLF_PATHS if os.path.exists(p)), None)
        reg_p = next((p for p in REG_PATHS if os.path.exists(p)), None)
        if clf_p and reg_p:
            try:
                _classifier_model = joblib.load(clf_p)
                _regressor_model = joblib.load(reg_p)
            except Exception as e:
                print(f"Warning: Failed to load trained ML models: {e}")
    return _classifier_model, _regressor_model

def process_resume_and_evaluate(
    file_path: str = None,
    candidate_data: Dict[str, Any] = None
) -> Dict[str, Any]:
    """
    Complete Resume & Candidate Pipeline:
    Upload/Path -> Text Extraction -> OCR Fallback -> Identity Verification ->
    Anti-Fraud Scan -> GitHub API Check -> ML Model Predict -> Final Score & Explanation.
    """
    if candidate_data is None:
        candidate_data = {}

    # main_ml_part is the canonical scoring flow. Keep this adapter so the
    # existing API and database callers receive the same response shape.
    return evaluate_candidate(candidate_data, file_path)

    name = candidate_data.get('Name', 'Applicant')
    skills = candidate_data.get('Skills', 'Python, SQL')
    experience = float(candidate_data.get('Experience (Years)', 1))
    education = candidate_data.get('Education', 'B.Tech')
    certifications = candidate_data.get('Certifications', 'None')
    job_role = candidate_data.get('Job Role', 'Software Engineer')
    projects_count = int(candidate_data.get('Projects Count', 2))
    salary_exp = float(candidate_data.get('Salary Expectation ($)', 60000))
    github_url = candidate_data.get('GitHub_URL', '')
    linkedin_url = candidate_data.get('LinkedIn_URL', '')

    extracted_text = ""
    hidden_keywords = []
    is_scanned = False
    ocr_used = False

    # 1. Text & File Extraction
    if file_path and os.path.exists(file_path):
        ext = os.path.splitext(file_path)[1].lower()
        if ext == '.pdf':
            pdf_res = extract_pdf_content(file_path)
            extracted_text = pdf_res.get('extracted_text', '')
            hidden_keywords = pdf_res.get('hidden_keywords', [])
            is_scanned = pdf_res.get('is_scanned', False)

        if is_scanned or ext in ['.png', '.jpg', '.jpeg']:
            ocr_res = perform_ocr_on_file(file_path)
            if ocr_res.get('success') and ocr_res.get('extracted_text'):
                extracted_text = ocr_res.get('extracted_text')
                ocr_used = True

    # 2. Identity Verification
    identity_res = verify_candidate_identity(name, extracted_text, github_url, linkedin_url)

    # 3. Anti-Fraud Inspection
    fraud_res = inspect_resume_anti_fraud(extracted_text, hidden_keywords)

    # 4. GitHub Verification
    github_res = verify_github_profile(github_url)

    # Accumulate all flag warning objects
    all_flags = []
    if fraud_res.get('flags'):
        all_flags.extend(fraud_res['flags'])
    if identity_res.get('flags'):
        all_flags.extend(identity_res['flags'])
    if not github_res['valid'] and github_url:
        all_flags.append({
            "type": "INVALID_GITHUB_PROFILE",
            "severity": "MEDIUM",
            "message": github_res.get('message', "GitHub profile could not be verified.")
        })

    # 5. ML Models Inference
    clf, reg = _load_ml_models()
    
    input_df = pd.DataFrame([{
        'Skills': skills,
        'Experience (Years)': experience,
        'Education': education,
        'Certifications': certifications,
        'Job Role': job_role,
        'Projects Count': projects_count,
        'Salary Expectation ($)': salary_exp
    }])

    if clf is not None and reg is not None:
        try:
            raw_reg_score = float(reg.predict(input_df)[0])
            ml_decision_int = int(clf.predict(input_df)[0])
        except Exception:
            raw_reg_score = min(100.0, max(20.0, (experience * 5.0) + (projects_count * 4.0) + 40.0))
            ml_decision_int = 1 if raw_reg_score >= 60.0 else 0
    else:
        raw_reg_score = min(100.0, max(20.0, (experience * 5.0) + (projects_count * 4.0) + 40.0))
        ml_decision_int = 1 if raw_reg_score >= 60.0 else 0

    # 6. Dynamic Strengths & Gaps Explanations & Benchmark Alignment
    skills_list = [s.strip() for s in skills.split(',') if s.strip()]
    role_benchmarks = {
        'AI Researcher': ['Python', 'PyTorch', 'TensorFlow', 'NLP', 'Deep Learning'],
        'Data Scientist': ['Python', 'SQL', 'Pandas', 'Statistics', 'Scikit-Learn'],
        'Cybersecurity Analyst': ['Ethical Hacking', 'Cybersecurity', 'Linux', 'Networking'],
        'Software Engineer': ['Java', 'Python', 'SQL', 'C++', 'Git', 'Docker']
    }
    target_bench = role_benchmarks.get(job_role, ['Python', 'SQL', 'Git'])
    
    matching_skills = [s for s in skills_list if any(b.lower() in s.lower() for b in target_bench)]
    missing_skills = [b for b in target_bench if not any(b.lower() in s.lower() for s in skills_list)]

    skill_ratio = len(matching_skills) / max(1, len(target_bench))
    skill_factor = 0.3 + (0.7 * skill_ratio)
    adjusted_ml_score = raw_reg_score * skill_factor

    assessment_score = float(candidate_data.get('assessment_score', candidate_data.get('Assessment_Score', 0.0)))

    # 7. Final Score Aggregation
    penalty = fraud_res['penalty_score']
    if len(all_flags) > 0 and penalty == 0:
        penalty = -10.0

    github_bonus = github_res['bonus_score']
    assessment_bonus = round((assessment_score / 100.0) * 15.0, 2)
    
    final_score = max(0.0, min(100.0, adjusted_ml_score + penalty + github_bonus + assessment_bonus))

    has_file = bool(file_path and os.path.exists(file_path))
    # If candidate_data explicitly specifies has_uploaded_resume=False, then False; otherwise True (for tests or uploaded files)
    if 'has_uploaded_resume' in candidate_data:
        has_uploaded_resume = has_file or bool(candidate_data['has_uploaded_resume'])
    else:
        has_uploaded_resume = True

    if not has_uploaded_resume:
        decision = "PENDING_RESUME"
        status_label = "Resume Pending Upload"
        final_score = 0.0
        anti_fraud_explanation = "No resume uploaded yet. Upload a PDF resume to run anti-fraud scan."
    elif fraud_res['is_flagged']:
        decision = "REJECT"
        final_score = min(final_score, 25.0)
        status_label = "Rejected / Flagged (Hidden Text Fraud Detected)"
        anti_fraud_explanation = fraud_res['explanation']
    elif not identity_res['identity_verified']:
        decision = "REJECT"
        status_label = f"Rejected ({identity_res['verification_reason']})"
        anti_fraud_explanation = fraud_res['explanation']
    elif ml_decision_int == 1 and final_score >= 50.0 and skill_ratio >= 0.2:
        decision = "SHORTLIST"
        status_label = "Shortlisted"
        anti_fraud_explanation = fraud_res['explanation']
    else:
        decision = "REJECT"
        status_label = "Rejected (Low Skill Match Score)"
        anti_fraud_explanation = fraud_res['explanation']

    strengths = [f"Strong background in {s}" for s in matching_skills]
    if experience >= 3:
        strengths.append(f"{int(experience)} years of professional experience")
    if projects_count >= 3:
        strengths.append(f"{projects_count} completed practical projects")

    gaps = [f"Missing required skill '{m}' for '{job_role}'" for m in missing_skills]
    if certifications.lower() == 'none':
        gaps.append("No active professional certifications linked")

    return {
        "candidate_name": name,
        "job_role": job_role,
        "has_uploaded_resume": has_uploaded_resume,
        "raw_ml_score": round(raw_reg_score, 2) if has_uploaded_resume else 0.0,
        "final_match_score": round(final_score, 2),
        "decision": decision,
        "status_label": status_label,
        "model_version": "screening-v1.0",
        "flags": all_flags,
        "verification": {
            "identity_verified": identity_res['identity_verified'] if has_uploaded_resume else False,
            "reason": identity_res['verification_reason'] if has_uploaded_resume else "Resume upload required.",
            "name_match": identity_res['name_match'] if has_uploaded_resume else False
        },
        "anti_fraud": {
            "fraud_risk": fraud_res['fraud_risk'] if has_uploaded_resume else 'pending',
            "penalty_score": fraud_res['penalty_score'] if has_uploaded_resume else 0.0,
            "signals": fraud_res['signals'] if has_uploaded_resume else [],
            "explanation": anti_fraud_explanation,
            "flags": fraud_res.get('flags', []) if has_uploaded_resume else []
        },
        "github": {
            "valid": github_res['valid'],
            "username": github_res['username'],
            "public_repos": github_res['public_repos'],
            "tech_stack": github_res['tech_stack'],
            "bonus_score": github_res['bonus_score']
        },
        "explainability": {
            "matching_skills": matching_skills,
            "missing_skills": missing_skills,
            "strengths": strengths if has_uploaded_resume else ["Upload resume PDF to discover candidate strengths"],
            "gaps": gaps
        },
        "extracted_text_preview": extracted_text[:300] if extracted_text else ("Resume pending upload." if not has_uploaded_resume else "No text extracted."),
        "ocr_used": ocr_used
    }
