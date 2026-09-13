# =====================================================================
# BACKEND PYDANTIC SCHEMAS (Request / Response Validation)
# File: backend/app/schemas/schemas.py
# =====================================================================

from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- Auth Schemas ---
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = "student"  # student, teacher, recruiter, tpo
    roll_number: Optional[str] = None
    college: Optional[str] = None
    branch: Optional[str] = None
    batch_year: Optional[int] = None
    college_email: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    email: str
    full_name: str
    role: str

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- Student Profile Schemas ---
class StudentProfileUpdate(BaseModel):
    roll_number: Optional[str] = None
    college_id_number: Optional[str] = None
    phone: Optional[str] = None
    college: Optional[str] = None
    branch: Optional[str] = None
    batch_year: Optional[int] = None
    experience_years: Optional[float] = None
    education: Optional[str] = None
    skills: Optional[str] = None
    certifications: Optional[str] = None
    projects_count: Optional[int] = None
    salary_expectation: Optional[float] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None

class StudentProfileOut(BaseModel):
    id: int
    user_id: int
    roll_number: Optional[str] = None
    college_id_number: Optional[str] = None
    phone: Optional[str] = None
    college: Optional[str] = None
    branch: Optional[str] = None
    batch_year: Optional[int] = None
    experience_years: float
    education: str
    skills: str
    certifications: str
    projects_count: int
    salary_expectation: float
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    is_verified_by_tpo: bool
    college_verified: Optional[bool] = False
    tpo_status: str
    has_uploaded_resume: Optional[bool] = False
    last_resume_path: Optional[str] = None
    assessment_score: Optional[float] = 0.0
    raw_ml_score: float
    final_match_score: float
    decision: str

    class Config:
        from_attributes = True

# --- Job Schemas ---
class JobCreate(BaseModel):
    company_name: str
    company_rating: float = 4.5
    job_role: str
    location: str
    salary_range: str
    required_skills: str
    min_experience: float = 0.0
    description: Optional[str] = None
    deadline_days: Optional[int] = 20

class JobOut(BaseModel):
    id: int
    recruiter_id: int
    company_name: str
    company_rating: float
    job_role: str
    location: str
    salary_range: str
    required_skills: str
    min_experience: float
    description: Optional[str] = None
    deadline_days: Optional[int] = 20
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- Application Schemas ---
class ApplicationCreate(BaseModel):
    job_id: int

class ApplicationOut(BaseModel):
    id: int
    student_id: int
    job_id: int
    applied_date: datetime
    status: str
    match_score: float
    decision: str
    days_remaining: Optional[int] = 20
    explainability: Optional[Dict[str, Any]] = None
    flag_details: Optional[Dict[str, Any]] = None
    job: Optional[JobOut] = None
    student: Optional[StudentProfileOut] = None

    class Config:
        from_attributes = True

# --- Assessment Schemas ---
class AssessmentAnswerSubmission(BaseModel):
    answers: Dict[str, str]  # question_id -> user answer string

# --- Evaluation Request Schema ---
class EvaluationRequest(BaseModel):
    candidate_data: Dict[str, Any]
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None

# --- College Accreditation Schemas (9 Mandatory Fields) ---
class CollegeRegistrationRequest(BaseModel):
    full_legal_name: str
    institute_type: str = "State"  # State, Central, Private, Deemed, Open, Institute of National Importance
    district_and_state: str
    ugc_recognition_no: Optional[str] = None
    aicte_approval_no: Optional[str] = None
    affiliated_university: Optional[str] = None
    year_of_establishment: Optional[int] = 2000
    gst_or_cin_no: Optional[str] = None
    official_email_domain: str

class CollegeAccreditationOut(BaseModel):
    id: Optional[int] = None
    full_legal_name: str
    accreditation_status: str  # GOVT_VERIFIED, BLOCKED_CLOSED_COLLEGE, PENDING_GOVT_REVIEW
    access_granted: bool
    verification_message: str
    matched_dataset: Optional[str] = None
    official_email_domain: Optional[str] = None

class RosterItem(BaseModel):
    roll_number: str
    full_name: str
    branch: Optional[str] = None
    batch_year: Optional[int] = None
    college_email: Optional[str] = None

class StudentRosterUploadResponse(BaseModel):
    total_parsed: int
    total_auto_verified: int
    message: str


class SyllabusSuggestionCreate(BaseModel):
    college_name: str
    official_email: EmailStr
    subject: str
    suggestion_text: str
    missing_skills_highlighted: Optional[str] = None


class GovtSuggestionOut(BaseModel):
    id: int
    college_name: str
    official_email: str
    subject: str
    suggestion_text: str
    sent_at: datetime

    class Config:
        from_attributes = True
