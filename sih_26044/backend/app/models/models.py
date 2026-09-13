# =====================================================================
# BACKEND DATABASE MODELS (SQLAlchemy ORM)
# File: backend/app/models/models.py
# =====================================================================

import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from backend.app.db.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, nullable=False, default="student")  # student, teacher, recruiter, tpo
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    student_profile = relationship("StudentProfile", back_populates="user", uselist=False)
    jobs_posted = relationship("Job", back_populates="recruiter")
    syllabi_uploaded = relationship("Syllabus", back_populates="teacher")


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    roll_number = Column(String, nullable=True, default="NIT2026-CSE01")
    roll_number_encrypted = Column(String, nullable=True)
    college_id_number = Column(String, nullable=True)
    college_email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    college = Column(String, nullable=True, default="National Institute of Technology")
    branch = Column(String, nullable=True, default="Computer Science & Engineering")
    batch_year = Column(Integer, nullable=True, default=2026)
    
    # Candidate ML Features
    experience_years = Column(Float, default=1.0)
    education = Column(String, default="B.Tech")
    skills = Column(Text, default="Python, SQL")
    certifications = Column(Text, default="None")
    projects_count = Column(Integer, default=2)
    salary_expectation = Column(Float, default=60000.0)
    
    # External verification links
    github_url = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)

    # Status & TPO Verification Gate
    is_verified_by_tpo = Column(Boolean, default=False)
    college_verified = Column(Boolean, default=False)
    first_time_login_verified = Column(Boolean, default=False)
    tpo_status = Column(String, default="Pending Verification")
    
    # Resume Upload & Evaluation Status
    has_uploaded_resume = Column(Boolean, default=False)
    last_resume_path = Column(String, nullable=True)
    
    # Latest Evaluation & Assessment Results
    assessment_score = Column(Float, default=0.0)
    raw_ml_score = Column(Float, default=0.0)
    final_match_score = Column(Float, default=0.0)
    decision = Column(String, default="PENDING")
    
    user = relationship("User", back_populates="student_profile")
    resumes = relationship("Resume", back_populates="candidate")
    applications = relationship("Application", back_populates="student")
    submissions = relationship("CodeSubmission", back_populates="student")


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    recruiter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    company_name = Column(String, nullable=False)
    company_rating = Column(Float, default=4.5)
    job_role = Column(String, nullable=False, index=True)
    location = Column(String, nullable=False)
    salary_range = Column(String, nullable=False)
    required_skills = Column(Text, nullable=False)
    min_experience = Column(Float, default=0.0)
    description = Column(Text, nullable=True)
    deadline_days = Column(Integer, default=20)
    expires_at = Column(DateTime, default=lambda: datetime.datetime.utcnow() + datetime.timedelta(days=20))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    recruiter = relationship("User", back_populates="jobs_posted")
    applications = relationship("Application", back_populates="job")


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    applied_date = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String, default="Under Review")  # Under Review, Shortlisted, Rejected
    match_score = Column(Float, default=0.0)
    decision = Column(String, default="PENDING")
    explainability = Column(JSON, nullable=True)
    flag_details = Column(JSON, nullable=True)

    student = relationship("StudentProfile", back_populates="applications")
    job = relationship("Job", back_populates="applications")


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("student_profiles.id"), nullable=False)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    extracted_text = Column(Text, nullable=True)
    
    # Fraud & Identity flags
    identity_verified = Column(Boolean, default=True)
    fraud_risk = Column(String, default="low")
    hidden_keywords_count = Column(Integer, default=0)
    penalty_score = Column(Float, default=0.0)
    flag_details = Column(JSON, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    candidate = relationship("StudentProfile", back_populates="resumes")


class AssessmentQuestion(Base):
    __tablename__ = "assessment_questions"

    id = Column(Integer, primary_key=True, index=True)
    topic = Column(String, nullable=False)
    role_category = Column(String, default="Software Engineer")
    question_text = Column(Text, nullable=False)
    code_snippet = Column(Text, nullable=True)
    expected_answer = Column(String, nullable=False)
    difficulty = Column(String, default="Medium")


class CodeSubmission(Base):
    __tablename__ = "code_submissions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"), nullable=False)
    score = Column(Float, default=0.0)
    total_questions = Column(Integer, default=10)
    correct_count = Column(Integer, default=0)
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow)

    student = relationship("StudentProfile", back_populates="submissions")


class Syllabus(Base):
    __tablename__ = "syllabi"

    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    domain_category = Column(String, nullable=False)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    alignment_score = Column(Float, default=0.0)
    covered_skills = Column(JSON, nullable=True)
    missing_skills = Column(JSON, nullable=True)
    recommendations = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    teacher = relationship("User", back_populates="syllabi_uploaded")


class CollegeAccreditation(Base):
    __tablename__ = "college_accreditations"

    id = Column(Integer, primary_key=True, index=True)
    full_legal_name = Column(String, nullable=False, index=True)
    institute_type = Column(String, nullable=False, default="State")  # State, Central, Private, Deemed, Open, Institute of National Importance
    district_and_state = Column(String, nullable=False)
    ugc_recognition_no = Column(String, nullable=True)
    aicte_approval_no = Column(String, nullable=True)
    affiliated_university = Column(String, nullable=True)
    year_of_establishment = Column(Integer, nullable=True)
    gst_or_cin_no = Column(String, nullable=True)
    official_email_domain = Column(String, nullable=False)
    
    accreditation_status = Column(String, default="GOVT_VERIFIED")  # GOVT_VERIFIED, BLOCKED_CLOSED_COLLEGE, PENDING_GOVT_REVIEW
    verification_message = Column(Text, nullable=True)
    matched_dataset = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class CollegeRoster(Base):
    __tablename__ = "college_rosters"

    id = Column(Integer, primary_key=True, index=True)
    college_name = Column(String, nullable=False, index=True)
    roll_number = Column(String, nullable=False, index=True)
    full_name = Column(String, nullable=False)
    branch = Column(String, nullable=True)
    batch_year = Column(Integer, nullable=True)
    college_email = Column(String, nullable=True)
    is_verified = Column(Boolean, default=True)
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)


class GovtSuggestion(Base):
    __tablename__ = "govt_suggestions"

    id = Column(Integer, primary_key=True, index=True)
    govt_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    college_name = Column(String, nullable=False)
    official_email = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    suggestion_text = Column(Text, nullable=False)
    missing_skills_highlighted = Column(Text, nullable=True)
    sent_at = Column(DateTime, default=datetime.datetime.utcnow)
