# =====================================================================
# BACKEND API ROUTER: SYSTEM ANALYTICS
# File: backend/app/api/analytics.py
# =====================================================================

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.models.models import User, StudentProfile, Job, Application, Resume, Syllabus

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/overview")
def get_platform_overview_analytics(db: Session = Depends(get_db)):
    total_users = db.query(User).count()
    total_students = db.query(User).filter(User.role == 'student').count()
    total_teachers = db.query(User).filter(User.role == 'teacher').count()
    total_recruiters = db.query(User).filter(User.role == 'recruiter').count()
    total_tpos = db.query(User).filter(User.role == 'tpo').count()

    total_jobs = db.query(Job).filter(Job.is_active == True).count()
    total_applications = db.query(Application).count()
    total_resumes = db.query(Resume).count()

    shortlisted_apps = db.query(Application).filter(Application.decision == 'SHORTLIST').count()
    high_risk_fraud = db.query(Resume).filter(Resume.fraud_risk == 'high').count()

    return {
        "users": {
            "total": total_users,
            "students": total_students,
            "teachers": total_teachers,
            "recruiters": total_recruiters,
            "tpo": total_tpos
        },
        "platform": {
            "active_jobs": total_jobs,
            "total_applications": total_applications,
            "shortlisted_applications": shortlisted_apps,
            "resumes_processed": total_resumes,
            "fraud_flagged_resumes": high_risk_fraud
        }
    }
