import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.app.db.session import get_db
from backend.app.models.models import User, StudentProfile, Job, Application
from backend.app.schemas.schemas import JobCreate, JobOut, ApplicationOut
from backend.app.api.deps import get_current_user, require_role
from resume_processing.pipeline import process_resume_and_evaluate

router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.get("", response_model=List[JobOut])
def list_jobs(db: Session = Depends(get_db)):
    jobs = db.query(Job).filter(Job.is_active == True).order_by(Job.created_at.desc()).all()
    return jobs

@router.post("", response_model=JobOut)
def create_job(
    job_in: JobCreate,
    current_user: User = Depends(require_role(["recruiter", "tpo"])),
    db: Session = Depends(get_db)
):
    job = Job(
        recruiter_id=current_user.id,
        company_name=job_in.company_name,
        company_rating=job_in.company_rating,
        job_role=job_in.job_role,
        location=job_in.location,
        salary_range=job_in.salary_range,
        required_skills=job_in.required_skills,
        min_experience=job_in.min_experience,
        description=job_in.description,
        deadline_days=20,
        is_active=True
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job

@router.delete("/{job_id}")
def delete_job(
    job_id: int,
    current_user: User = Depends(require_role(["recruiter", "tpo"])),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job.is_active = False
    db.commit()
    return {"message": f"Job posting '{job.job_role}' at {job.company_name} deleted / closed successfully."}

@router.get("/recruiter/applications", response_model=List[ApplicationOut])
def get_recruiter_applications(
    current_user: User = Depends(require_role(["recruiter", "tpo"])),
    db: Session = Depends(get_db)
):
    recruiter_jobs = db.query(Job).filter(Job.recruiter_id == current_user.id, Job.is_active == True).all()
    job_ids = [j.id for j in recruiter_jobs]
    if not job_ids:
        applications = db.query(Application).order_by(Application.applied_date.desc()).all()
    else:
        applications = db.query(Application).filter(Application.job_id.in_(job_ids)).order_by(Application.applied_date.desc()).all()

    now = datetime.datetime.utcnow()
    res = []
    for app in applications:
        # Calculate 20-day candidate application review deadline
        days_passed = (now - app.applied_date).days
        rem_days = max(0, 20 - days_passed)

        if rem_days == 0 and app.status == "Under Review":
            app.status = "Expired / Auto-Rejected (20-Day Limit)"
            app.decision = "REJECT"
            db.commit()

        app.days_remaining = rem_days
        res.append(app)

    return res

@router.post("/applications/{app_id}/decision")
def update_application_decision(
    app_id: int,
    approve: bool = True,
    current_user: User = Depends(require_role(["recruiter", "tpo"])),
    db: Session = Depends(get_db)
):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application record not found")

    app.status = "Shortlisted" if approve else "Rejected"
    app.decision = "SHORTLIST" if approve else "REJECT"
    db.commit()
    db.refresh(app)
    return {
        "app_id": app.id,
        "status": app.status,
        "decision": app.decision,
        "message": f"Candidate application decision updated to '{app.status}'."
    }

@router.get("/{job_id}", response_model=JobOut)
def get_job_by_id(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job posting not found")
    return job

@router.post("/{job_id}/match")
def match_job_for_current_student(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")

    candidate_data = {
        "Name": current_user.full_name,
        "Skills": profile.skills,
        "Experience (Years)": profile.experience_years,
        "Education": profile.education,
        "Certifications": profile.certifications,
        "Job Role": job.job_role,
        "Projects Count": profile.projects_count,
        "Salary Expectation ($)": profile.salary_expectation,
        "GitHub_URL": profile.github_url,
        "LinkedIn_URL": profile.linkedin_url,
        "has_uploaded_resume": profile.has_uploaded_resume
    }

    eval_result = process_resume_and_evaluate(
        file_path=profile.last_resume_path if profile.has_uploaded_resume else None,
        candidate_data=candidate_data
    )

    req_skills = [s.strip().lower() for s in job.required_skills.split(",") if s.strip()]
    cand_skills = [s.strip().lower() for s in (profile.skills or "").split(",") if s.strip()]

    matching = [s.title() for s in cand_skills if any(r in s or s in r for r in req_skills)]
    missing = [r.title() for r in req_skills if not any(s in r or r in s for s in cand_skills)]

    return {
        "job_id": job.id,
        "job_role": job.job_role,
        "company_name": job.company_name,
        "match_score": eval_result['final_match_score'],
        "decision": eval_result['decision'],
        "status_label": eval_result['status_label'],
        "matching_skills": matching,
        "missing_skills": missing,
        "flags": eval_result.get('flags', []),
        "verification": eval_result['verification'],
        "anti_fraud": eval_result['anti_fraud']
    }

@router.post("/{job_id}/apply", response_model=ApplicationOut)
def apply_to_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=400, detail="Student profile required before applying")

    existing = db.query(Application).filter(
        Application.student_id == profile.id,
        Application.job_id == job_id
    ).first()

    if existing:
        existing.days_remaining = max(0, 20 - (datetime.datetime.utcnow() - existing.applied_date).days)
        return existing

    match_res = match_job_for_current_student(job_id, current_user, db)

    application = Application(
        student_id=profile.id,
        job_id=job.id,
        applied_date=datetime.datetime.utcnow(),
        status="Under Review",
        match_score=match_res['match_score'],
        decision=match_res['decision'],
        explainability=match_res,
        flag_details={"flags": match_res.get('flags', [])}
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    application.days_remaining = 20
    return application
