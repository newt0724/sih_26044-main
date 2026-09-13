# =====================================================================
# BACKEND API ROUTER: RESUME UPLOAD & ANALYSIS
# File: backend/app/api/resumes.py
# =====================================================================

import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.models.models import User, StudentProfile, Resume
from backend.app.api.deps import get_current_user
from backend.app.core.config import settings
from resume_processing.pipeline import process_resume_and_evaluate

router = APIRouter(prefix="/resumes", tags=["Resumes"])

ALLOWED_EXTENSIONS = {'.pdf', '.png', '.jpg', '.jpeg'}

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        profile = StudentProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{ext}'. Allowed file extensions: PDF, PNG, JPG, JPEG."
        )

    # Secure file saving
    safe_filename = f"{uuid.uuid4().hex[:10]}_{file.filename.replace(' ', '_')}"
    save_path = os.path.join(settings.UPLOAD_DIR, safe_filename)

    with open(save_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)

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
        "assessment_score": profile.assessment_score or 0.0
    }

    eval_result = process_resume_and_evaluate(file_path=save_path, candidate_data=candidate_data)

    # Save Resume record to DB
    resume_obj = Resume(
        candidate_id=profile.id,
        filename=file.filename,
        file_path=save_path,
        extracted_text=eval_result.get('extracted_text_preview', ''),
        identity_verified=eval_result['verification']['identity_verified'],
        fraud_risk=eval_result['anti_fraud']['fraud_risk'],
        hidden_keywords_count=len(eval_result['anti_fraud']['signals']),
        penalty_score=eval_result['anti_fraud']['penalty_score']
    )
    db.add(resume_obj)

    # Update Profile scores & resume flags
    profile.has_uploaded_resume = True
    profile.last_resume_path = save_path
    profile.raw_ml_score = eval_result['raw_ml_score']
    profile.final_match_score = eval_result['final_match_score']
    profile.decision = eval_result['decision']

    db.commit()

    return {
        "file_name": file.filename,
        "save_path": save_path,
        "evaluation": eval_result
    }
