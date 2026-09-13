# =====================================================================
# BACKEND MAIN APPLICATION ENTRYPOINT
# File: backend/app/main.py
# =====================================================================

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.db.session import engine, Base, SessionLocal
from backend.app.models.models import User, StudentProfile, Job
from backend.app.core.security import hash_password

from backend.app.api import auth, candidates, resumes, jobs, assessments, teacher, tpo, analytics, govt

# Initialize Database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(candidates.router, prefix=settings.API_V1_STR)
app.include_router(resumes.router, prefix=settings.API_V1_STR)
app.include_router(jobs.router, prefix=settings.API_V1_STR)
app.include_router(assessments.router, prefix=settings.API_V1_STR)
app.include_router(teacher.router, prefix=settings.API_V1_STR)
app.include_router(tpo.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(govt.router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def seed_initial_data():
    db = SessionLocal()
    try:
        # Seed demo admin/recruiter if empty
        recruiter = db.query(User).filter(User.email == "recruiter@google.com").first()
        if not recruiter:
            recruiter = User(
                email="recruiter@google.com",
                hashed_password=hash_password("admin123"),
                full_name="Google University Recruiting",
                role="recruiter"
            )
            db.add(recruiter)
            db.commit()
            db.refresh(recruiter)

            # Seed Jobs
            demo_jobs = [
                Job(
                    recruiter_id=recruiter.id,
                    company_name="Google",
                    company_rating=4.9,
                    job_role="Machine Learning Engineer",
                    location="Bangalore / Remote",
                    salary_range="$60,000 - $90,000",
                    required_skills="Python, PyTorch, TensorFlow, SQL, FastAPI",
                    min_experience=1.0,
                    description="Join Google AI Research team building next-generation machine learning platforms."
                ),
                Job(
                    recruiter_id=recruiter.id,
                    company_name="OpenAI",
                    company_rating=4.8,
                    job_role="AI Researcher",
                    location="Hyderabad",
                    salary_range="$70,000 - $110,000",
                    required_skills="Python, PyTorch, Deep Learning, NLP, Vector Databases",
                    min_experience=2.0,
                    description="Work on frontier AI models, NLP architectures, and scalable deep learning systems."
                ),
                Job(
                    recruiter_id=recruiter.id,
                    company_name="Microsoft",
                    company_rating=4.7,
                    job_role="Software Engineer",
                    location="Bangalore",
                    salary_range="$50,000 - $80,000",
                    required_skills="Java, Python, C++, SQL, Git, System Design",
                    min_experience=0.0,
                    description="Build cloud-native microservices and intelligent enterprise software applications."
                )
            ]
            db.add_all(demo_jobs)
            db.commit()

        # Seed sample TPO user
        tpo = db.query(User).filter(User.email == "tpo@nit.edu").first()
        if not tpo:
            tpo = User(
                email="tpo@nit.edu",
                hashed_password=hash_password("tpo123"),
                full_name="Prof. Placement Officer",
                role="tpo"
            )
            db.add(tpo)
            db.commit()

        # Seed sample Teacher user
        teacher_usr = db.query(User).filter(User.email == "teacher@nit.edu").first()
        if not teacher_usr:
            teacher_usr = User(
                email="teacher@nit.edu",
                hashed_password=hash_password("teacher123"),
                full_name="Dr. Alan Turing",
                role="teacher"
            )
            db.add(teacher_usr)
            db.commit()

        # Seed sample Student user
        student_usr = db.query(User).filter(User.email == "student@nit.edu").first()
        if not student_usr:
            student_usr = User(
                email="student@nit.edu",
                hashed_password=hash_password("student123"),
                full_name="Aryan Sharma",
                role="student"
            )
            db.add(student_usr)
            db.commit()
            db.refresh(student_usr)

            st_prof = StudentProfile(
                user_id=student_usr.id,
                roll_number="NIT2026-CSE01",
                college="National Institute of Technology",
                branch="Computer Science Engineering",
                batch_year=2026,
                skills="Python, SQL, PyTorch",
                experience_years=1.0,
                education="B.Tech",
                certifications="AWS Certified",
                projects_count=3,
                salary_expectation=65000,
                is_verified_by_tpo=True,
                college_verified=True,
                tpo_status="Verified"
            )
            db.add(st_prof)
            db.commit()

        # Seed sample Government user
        govt_usr = db.query(User).filter(User.email == "govt@education.gov.in").first()
        if not govt_usr:
            govt_usr = User(
                email="govt@education.gov.in",
                hashed_password=hash_password("govt123"),
                full_name="Ministry of Education & Accreditation Authority",
                role="govt"
            )
            db.add(govt_usr)
            db.commit()

    finally:
        db.close()

@app.get("/")
def root():
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs"
    }
