# =====================================================================
# BACKEND API ROUTER: AUTHENTICATION
# File: backend/app/api/auth.py
# =====================================================================

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.models.models import User, StudentProfile, CollegeRoster
from backend.app.schemas.schemas import UserRegister, UserLogin, TokenResponse, UserOut
from backend.app.core.security import hash_password, verify_password, create_access_token
from backend.app.core.encryption import encrypt_data, decrypt_data
from backend.app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    email_clean = user_in.email.lower().strip()
    # Check duplicate email
    existing_user = db.query(User).filter(User.email == email_clean).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address is already registered."
        )

    role_clean = user_in.role.lower().strip()
    if role_clean not in ['student', 'teacher', 'recruiter', 'tpo', 'govt']:
        role_clean = 'student'

    user = User(
        email=email_clean,
        hashed_password=hash_password(user_in.password),
        full_name=user_in.full_name.strip(),
        role=role_clean
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Automatically create StudentProfile for student roles
    if user.role == 'student':
        student_roll = (user_in.roll_number or "NIT2026-CSE01").strip()
        student_college = (user_in.college or "National Institute of Technology").strip()
        student_branch = (user_in.branch or "Computer Science Engineering").strip()
        student_batch = user_in.batch_year or 2026
        student_c_email = (user_in.college_email or email_clean).lower().strip()
        
        # Check if student is already in College Roster uploaded by TPO
        roster_entry = db.query(CollegeRoster).filter(
            (CollegeRoster.college_email == student_c_email) | 
            (CollegeRoster.roll_number == student_roll)
        ).first()

        is_auto_verified = roster_entry is not None

        profile = StudentProfile(
            user_id=user.id,
            roll_number=student_roll,
            roll_number_encrypted=encrypt_data(student_roll),
            college=student_college,
            branch=student_branch,
            batch_year=student_batch,
            college_email=student_c_email,
            is_verified_by_tpo=is_auto_verified,
            college_verified=is_auto_verified,
            first_time_login_verified=is_auto_verified,
            tpo_status="Verified" if is_auto_verified else "Pending Verification"
        )
        db.add(profile)
        db.commit()

    token = create_access_token(subject=user.id, role=user.role)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role
    }

@router.post("/login", response_model=TokenResponse)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    email_clean = user_in.email.lower().strip()
    user = db.query(User).filter(User.email == email_clean).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

    # Student First-Time Verification Sign-In Gate
    if user.role == 'student':
        profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
        if profile and not profile.is_verified_by_tpo and not profile.first_time_login_verified:
            # Check if auto-verifiable via uploaded roster
            roster_entry = db.query(CollegeRoster).filter(
                (CollegeRoster.college_email == email_clean) | 
                (CollegeRoster.roll_number == profile.roll_number)
            ).first()

            if roster_entry:
                profile.is_verified_by_tpo = True
                profile.college_verified = True
                profile.first_time_login_verified = True
                profile.tpo_status = "Verified"
                db.commit()
            else:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"🚨 Student Sign-In Blocked: Your account (Roll No: '{profile.roll_number or 'Pending'}') has not been verified by your college TPO/Placement Cell yet. Access will be granted once TPO verifies your Roll Number and College Email."
                )

    token = create_access_token(subject=user.id, role=user.role)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role
    }

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
