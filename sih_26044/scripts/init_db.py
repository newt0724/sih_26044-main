# =====================================================================
# DIRECT DATABASE INITIALIZATION & SEEDING SCRIPT
# File: scripts/init_db.py
# =====================================================================

import sys
import os

# Add project root directory to python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.db.session import engine, Base, SessionLocal
from backend.app.models.models import User, StudentProfile, Job
from backend.app.core.security import hash_password
from backend.app.core.config import settings

def init_database(reset: bool = False):
    """
    Initializes database tables and seeds demo accounts.
    """
    print(f" Connecting to Database: {settings.DATABASE_URL}")

    if reset:
        print(" Resetting database (dropping existing tables)...")
        Base.metadata.drop_all(bind=engine)

    print(" Creating database schema & tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Seed Recruiter Account
        recruiter = db.query(User).filter(User.email == "recruiter@google.com").first()
        if not recruiter:
            print(" Seeding Recruiter user (recruiter@google.com)...")
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
            print(" Seeding initial Job postings...")
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

        # Seed TPO Account
        tpo = db.query(User).filter(User.email == "tpo@nit.edu").first()
        if not tpo:
            print(" Seeding TPO user (tpo@nit.edu)...")
            tpo = User(
                email="tpo@nit.edu",
                hashed_password=hash_password("tpo123"),
                full_name="Prof. Placement Officer",
                role="tpo"
            )
            db.add(tpo)

        # Seed Teacher Account
        teacher = db.query(User).filter(User.email == "teacher@nit.edu").first()
        if not teacher:
            print(" Seeding Teacher user (teacher@nit.edu)...")
            teacher = User(
                email="teacher@nit.edu",
                hashed_password=hash_password("teacher123"),
                full_name="Dr. Alan Turing",
                role="teacher"
            )
            db.add(teacher)

        # Seed Demo Student Account
        student = db.query(User).filter(User.email == "student@nit.edu").first()
        if not student:
            print(" Seeding Student user (student@nit.edu)...")
            student = User(
                email="student@nit.edu",
                hashed_password=hash_password("student123"),
                full_name="Alex Johnson",
                role="student"
            )
            db.add(student)
            db.commit()
            db.refresh(student)

            student_profile = StudentProfile(
                user_id=student.id,
                skills="Python, PyTorch, SQL, Machine Learning",
                experience_years=2.0,
                education="B.Tech Computer Science",
                certifications="Deep Learning Specialization",
                projects_count=4,
                salary_expectation=75000.0,
                github_url="https://github.com/alexjohnson",
                tpo_status="Verified"
            )
            db.add(student_profile)

        db.commit()
        print(" Database successfully initialized and seeded!")

    except Exception as e:
        db.rollback()
        print(f" Error initializing database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    reset_db = "--reset" in sys.argv
    init_database(reset=reset_db)
