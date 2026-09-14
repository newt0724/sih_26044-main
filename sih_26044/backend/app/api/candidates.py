# =====================================================================
# BACKEND API ROUTER: CANDIDATES & PROFILE EVALUATION
# File: backend/app/api/candidates.py
# =====================================================================

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
import os
import shutil
from sqlalchemy.orm import Session
from typing import Dict, Any
from backend.app.db.session import get_db
from backend.app.models.models import User, StudentProfile, Job
from backend.app.schemas.schemas import StudentProfileUpdate, StudentProfileOut
from backend.app.api.deps import get_current_user
from resume_processing.pipeline import process_resume_and_evaluate
from resume_processing.github_verification import verify_github_profile

router = APIRouter(prefix="/candidates", tags=["Candidates"])

from backend.app.core.encryption import encrypt_data, decrypt_data

@router.post("/certificate-proof")
async def upload_certificate_proof(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    allowed_extensions = {'.pdf', '.png', '.jpg', '.jpeg'}
    extension = os.path.splitext(file.filename or '')[1].lower()
    if extension not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Certificate proof must be PDF, PNG, JPG, or JPEG.")

    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")

    proof_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'uploads', 'certificates')
    os.makedirs(proof_dir, exist_ok=True)
    proof_path = os.path.join(proof_dir, f"student_{current_user.id}_certificate{extension}")
    with open(proof_path, 'wb') as destination:
        shutil.copyfileobj(file.file, destination)
    profile.has_certification_proof = True
    profile.certificate_upload_declined = False
    db.commit()
    return {"uploaded": True, "filename": file.filename}

@router.get("/me", response_model=StudentProfileOut)
def get_my_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        profile = StudentProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@router.put("/me", response_model=StudentProfileOut)
def update_my_profile(
    profile_in: StudentProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        profile = StudentProfile(user_id=current_user.id)
        db.add(profile)

    update_data = profile_in.dict(exclude_unset=True)
    for field, val in update_data.items():
        if val is not None:
            setattr(profile, field, val)

    if profile.roll_number:
        profile.roll_number_encrypted = encrypt_data(profile.roll_number)

    db.commit()
    db.refresh(profile)
    return profile

@router.post("/evaluate")
def evaluate_candidate_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")

    candidate_data = {
        "Name": current_user.full_name,
        "Skills": profile.skills,
        "Experience (Years)": profile.experience_years,
        "Education": profile.education,
        "Certifications": profile.certifications,
        "Job Role": "Software Engineer",
        "Projects Count": profile.projects_count,
        "Salary Expectation ($)": profile.salary_expectation,
        "GitHub_URL": profile.github_url,
        "LinkedIn_URL": profile.linkedin_url,
        "assessment_score": profile.assessment_score or 0.0,
        "has_certification_proof": getattr(profile, "has_certification_proof", False),
        "certificate_upload_declined": getattr(profile, "certificate_upload_declined", False),
        "has_uploaded_resume": profile.has_uploaded_resume
    }

    eval_result = process_resume_and_evaluate(
        file_path=profile.last_resume_path if profile.has_uploaded_resume else None,
        candidate_data=candidate_data
    )

    # Persist scores in DB
    profile.raw_ml_score = eval_result['raw_ml_score']
    profile.final_match_score = eval_result['final_match_score']
    profile.decision = eval_result['decision']

    db.commit()

    return eval_result

@router.post("/github-verify")
def verify_github(
    github_url: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    result = verify_github_profile(github_url)
    
    # Save URL to profile if valid
    if result['valid']:
        profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
        if profile:
            profile.github_url = github_url
            db.commit()

    return result

@router.get("/recommendations")
def get_job_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        return []

    active_jobs = db.query(Job).filter(Job.is_active == True).all()
    user_skills = [s.strip().lower() for s in (profile.skills or "").split(",") if s.strip()]

    recommendations = []
    for job in active_jobs:
        req_skills = [s.strip().lower() for s in job.required_skills.split(",") if s.strip()]
        matching = [s for s in user_skills if any(r in s or s in r for r in req_skills)]
        missing = [r for r in req_skills if not any(s in r or r in s for s in user_skills)]

        match_pct = round((len(matching) / max(1, len(req_skills))) * 100, 2)
        
        # Calculate dynamic job match score
        rec_score = min(100.0, match_pct * 0.7 + (profile.experience_years * 5.0) + (job.company_rating * 5.0))

        recommendations.append({
            "job_id": job.id,
            "company_name": job.company_name,
            "company_rating": job.company_rating,
            "job_role": job.job_role,
            "location": job.location,
            "salary_range": job.salary_range,
            "match_score": round(rec_score, 2),
            "matching_skills": [s.title() for s in matching],
            "missing_skills": [m.title() for m in missing],
            "recommendation_reason": f"Matches {len(matching)} key skills with strong experience alignment." if matching else "Consider building required skills."
        })

    # Sort recommendations by match score descending
    recommendations.sort(key=lambda x: x['match_score'], reverse=True)
    return recommendations
