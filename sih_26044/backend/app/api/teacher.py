# =====================================================================
# BACKEND API ROUTER: TEACHER & SYLLABUS GAP ENGINE
# File: backend/app/api/teacher.py
# =====================================================================

import os
import re
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from backend.app.db.session import get_db
from backend.app.models.models import User, StudentProfile, Syllabus
from backend.app.api.deps import get_current_user, require_role
from backend.app.core.config import settings
from resume_processing.pdf_extractor import extract_pdf_content
from resume_processing.ocr import perform_ocr_on_file

router = APIRouter(prefix="/teacher", tags=["Teacher Module"])

INDUSTRY_SKILL_BENCHMARKS = {
    'Machine Learning & AI': [
        'Python', 'PyTorch', 'TensorFlow', 'Scikit-Learn', 'Pandas', 'NumPy',
        'FastAPI', 'Docker', 'MLOps', 'Vector Databases', 'Deep Learning', 'NLP'
    ],
    'Full Stack Software Engineering': [
        'JavaScript', 'React', 'Node.js', 'FastAPI', 'Docker', 'Kubernetes',
        'PostgreSQL', 'Redis', 'Git', 'CI/CD Pipelines', 'System Design'
    ],
    'Data Engineering & Analytics': [
        'Python', 'SQL', 'PySpark', 'Airflow', 'Snowflake', 'Docker',
        'ETL Pipelines', 'Pandas', 'Tableau', 'PostgreSQL'
    ]
}

@router.get("/students")
def get_teacher_students(
    current_user: User = Depends(require_role(["teacher", "tpo", "recruiter"])),
    db: Session = Depends(get_db)
):
    students = db.query(StudentProfile).all()
    result = []
    for s in students:
        user = db.query(User).filter(User.id == s.user_id).first()
        result.append({
            "student_id": s.id,
            "full_name": user.full_name if user else "Student",
            "email": user.email if user else "",
            "branch": s.branch,
            "batch_year": s.batch_year,
            "skills": s.skills,
            "experience_years": s.experience_years,
            "final_match_score": s.final_match_score,
            "decision": s.decision,
            "tpo_status": s.tpo_status
        })
    return result

SKILL_ALIASES = {
    'Python': ['python', 'py'],
    'PyTorch': ['pytorch', 'torch', 'pytorch framework'],
    'TensorFlow': ['tensorflow', 'tf', 'keras'],
    'Scikit-Learn': ['scikit-learn', 'scikit learn', 'sklearn', 'machine learning', 'ml algorithms'],
    'Pandas': ['pandas', 'dataframe', 'data manipulation'],
    'NumPy': ['numpy', 'numerical python', 'array processing'],
    'FastAPI': ['fastapi', 'fast api', 'rest api', 'flask', 'django', 'web service'],
    'Docker': ['docker', 'container', 'containerization', 'kubernetes'],
    'MLOps': ['mlops', 'model deployment', 'ml pipeline', 'ml engineering', 'ci/cd'],
    'Vector Databases': ['vector database', 'vector db', 'chroma', 'pinecone', 'milvus', 'faiss', 'embedding', 'vector search'],
    'Deep Learning': ['deep learning', 'neural network', 'neural networks', 'cnn', 'rnn', 'transformer', 'deep neural'],
    'NLP': ['nlp', 'natural language processing', 'text mining', 'language model', 'llm'],
    'JavaScript': ['javascript', 'js', 'ecmascript'],
    'React': ['react', 'reactjs', 'react.js', 'frontend framework'],
    'Node.js': ['node.js', 'nodejs', 'node', 'express'],
    'PostgreSQL': ['postgresql', 'postgres', 'sql', 'database'],
    'Redis': ['redis', 'caching', 'in-memory'],
    'Git': ['git', 'github', 'version control'],
    'CI/CD Pipelines': ['ci/cd', 'continuous integration', 'github actions', 'jenkins'],
    'System Design': ['system design', 'architecture', 'scalability', 'distributed systems'],
    'PySpark': ['pyspark', 'spark', 'apache spark', 'big data'],
    'Airflow': ['airflow', 'apache airflow', 'orchestration'],
    'Snowflake': ['snowflake', 'data warehouse', 'cloud warehouse'],
    'ETL Pipelines': ['etl', 'extract transform load', 'data pipeline'],
    'Tableau': ['tableau', 'power bi', 'business intelligence', 'visualization']
}

@router.post("/syllabus-gap")
async def analyze_syllabus_gap(
    domain_category: str = Form("Machine Learning & AI"),
    file: UploadFile = File(...),
    current_user: User = Depends(require_role(["teacher", "tpo"])),
    db: Session = Depends(get_db)
):
    safe_filename = f"syllabus_{uuid.uuid4().hex[:8]}_{file.filename.replace(' ', '_')}"
    save_path = os.path.join(settings.UPLOAD_DIR, safe_filename)

    with open(save_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)

    extracted_text = ""
    ext = os.path.splitext(file.filename)[1].lower()

    if ext == '.pdf':
        pdf_res = extract_pdf_content(save_path)
        extracted_text = pdf_res.get('extracted_text', '')
        if pdf_res.get('is_scanned') or len(extracted_text.strip()) < 50:
            ocr_res = perform_ocr_on_file(save_path)
            if ocr_res.get('extracted_text'):
                extracted_text += "\n" + ocr_res.get('extracted_text')
    else:
        ocr_res = perform_ocr_on_file(save_path)
        extracted_text = ocr_res.get('extracted_text', '')

    target_skills = INDUSTRY_SKILL_BENCHMARKS.get(
        domain_category,
        INDUSTRY_SKILL_BENCHMARKS['Machine Learning & AI']
    )

    text_lower = (extracted_text + " " + file.filename).lower()
    covered_skills = []
    missing_skills = []

    for skill in target_skills:
        aliases = SKILL_ALIASES.get(skill, [skill.lower()])
        matched = False
        for alias in aliases:
            pattern = r'\b' + re.escape(alias) + r'\b'
            if re.search(pattern, text_lower) or alias in text_lower:
                matched = True
                break
        if matched:
            covered_skills.append(skill)
        else:
            missing_skills.append(skill)

    total_req = len(target_skills)
    total_cov = len(covered_skills)
    alignment_pct = round((total_cov / max(1, total_req)) * 100.0, 2)

    recommendations = []
    if missing_skills:
        recommendations.append(f"Curriculum Action Item: Add modules covering [{', '.join(missing_skills)}] to achieve 100% industry demand alignment.")
        recommendations.append(f"Suggested Practical Lab: Introduce projects for [{missing_skills[0]}].")
    else:
        recommendations.append("Outstanding! Syllabus covers all core industry benchmarks.")

    # Save to DB
    syllabus_record = Syllabus(
        teacher_id=current_user.id,
        domain_category=domain_category,
        filename=file.filename,
        file_path=save_path,
        alignment_score=alignment_pct,
        covered_skills=covered_skills,
        missing_skills=missing_skills,
        recommendations=recommendations
    )
    db.add(syllabus_record)
    db.commit()

    return {
        "filename": file.filename,
        "domain_category": domain_category,
        "syllabus_alignment_score": f"{alignment_pct}%",
        "covered_skills_count": f"{total_cov} / {total_req} Skills",
        "covered_skills": covered_skills,
        "missing_skills": missing_skills,
        "recommendations": recommendations
    }
