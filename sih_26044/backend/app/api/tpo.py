# =====================================================================
# BACKEND API ROUTER: TPO & PLACEMENT CELL ANALYTICS
# File: backend/app/api/tpo.py
# =====================================================================

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import csv
import io
from backend.app.db.session import get_db
from backend.app.models.models import User, StudentProfile, Application, Job, Resume, CollegeRoster, CollegeAccreditation
from backend.app.schemas.schemas import CollegeRegistrationRequest, CollegeAccreditationOut, StudentRosterUploadResponse
from backend.app.api.deps import require_role
from backend.app.services.college_verification import verify_college_accreditation

router = APIRouter(prefix="/tpo", tags=["TPO Placement Cell"])

@router.post("/verify-college", response_model=CollegeAccreditationOut)
def verify_college_registration_endpoint(
    req: CollegeRegistrationRequest,
    db: Session = Depends(get_db)
):
    college_data = req.dict()
    res = verify_college_accreditation(college_data)

    # Save accreditation record to DB
    record = CollegeAccreditation(
        full_legal_name=req.full_legal_name,
        institute_type=req.institute_type,
        district_and_state=req.district_and_state,
        ugc_recognition_no=req.ugc_recognition_no,
        aicte_approval_no=req.aicte_approval_no,
        affiliated_university=req.affiliated_university,
        year_of_establishment=req.year_of_establishment,
        gst_or_cin_no=req.gst_or_cin_no,
        official_email_domain=req.official_email_domain,
        accreditation_status=res['accreditation_status'],
        verification_message=res['message'],
        matched_dataset=res['matched_dataset']
    )
    db.add(record)
    db.commit()

    return {
        "id": record.id,
        "full_legal_name": req.full_legal_name,
        "accreditation_status": res['accreditation_status'],
        "access_granted": res['access_granted'],
        "verification_message": res['message'],
        "matched_dataset": res['matched_dataset'],
        "official_email_domain": req.official_email_domain
    }

@router.post("/upload-roster", response_model=StudentRosterUploadResponse)
async def upload_student_roster(
    file: UploadFile = File(...),
    current_user: User = Depends(require_role(["tpo"])),
    db: Session = Depends(get_db)
):
    content = await file.read()
    filename = file.filename.lower()

    records = []
    if filename.endswith('.csv'):
        text = content.decode('utf-8', errors='ignore')
        reader = csv.DictReader(io.StringIO(text))
        for row in reader:
            records.append({k.strip().lower(): v.strip() for k, v in row.items() if k and v})
    else:
        # Fallback text/CSV parse
        text = content.decode('utf-8', errors='ignore')
        reader = csv.DictReader(io.StringIO(text))
        for row in reader:
            records.append({k.strip().lower(): v.strip() for k, v in row.items() if k and v})

    parsed_count = 0
    verified_count = 0

    for r in records:
        roll = r.get('roll_number') or r.get('roll no') or r.get('rollno') or r.get('id')
        name = r.get('full_name') or r.get('name') or r.get('student name')
        email = r.get('college_email') or r.get('email') or r.get('student email')
        branch = r.get('branch') or r.get('department')
        batch = r.get('batch_year') or r.get('batch')

        if roll and name:
            parsed_count += 1
            roster_item = CollegeRoster(
                college_name="National Institute of Technology",
                roll_number=str(roll),
                full_name=str(name),
                branch=str(branch) if branch else "CSE",
                batch_year=int(batch) if batch and str(batch).isdigit() else 2026,
                college_email=str(email) if email else None,
                is_verified=True
            )
            db.add(roster_item)

            # Auto-verify registered students matching roll or email
            students = db.query(StudentProfile).filter(
                (StudentProfile.roll_number == str(roll)) | 
                (StudentProfile.college_email == str(email))
            ).all()

            for s in students:
                s.is_verified_by_tpo = True
                s.college_verified = True
                s.first_time_login_verified = True
                s.tpo_status = "Verified"
                verified_count += 1

    db.commit()

    return {
        "total_parsed": parsed_count,
        "total_auto_verified": verified_count,
        "message": f"Successfully processed {parsed_count} student roster entries. Auto-verified {verified_count} active registered student profiles!"
    }

@router.get("/pending-verifications")
def get_pending_verifications(
    current_user: User = Depends(require_role(["tpo"])),
    db: Session = Depends(get_db)
):
    pending = db.query(StudentProfile).filter(StudentProfile.is_verified_by_tpo == False).all()
    results = []
    for p in pending:
        user = db.query(User).filter(User.id == p.user_id).first()
        results.append({
            "profile_id": p.id,
            "user_id": p.user_id,
            "full_name": user.full_name if user else "Student",
            "email": user.email if user else "",
            "roll_number": p.roll_number or "NIT2026-CSE01",
            "college": p.college,
            "branch": p.branch,
            "batch_year": p.batch_year,
            "status": p.tpo_status,
            "college_verified": p.college_verified
        })
    return results

@router.post("/verify-student")
def verify_student_registration(
    student_profile_id: int,
    approve: bool = True,
    current_user: User = Depends(require_role(["tpo"])),
    db: Session = Depends(get_db)
):
    profile = db.query(StudentProfile).filter(StudentProfile.id == student_profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")

    profile.is_verified_by_tpo = approve
    profile.college_verified = approve
    profile.first_time_login_verified = approve
    profile.tpo_status = "Verified" if approve else "Rejected"
    db.commit()

    return {
        "profile_id": profile.id,
        "is_verified_by_tpo": profile.is_verified_by_tpo,
        "college_verified": profile.college_verified,
        "tpo_status": profile.tpo_status,
        "message": f"Student registration (Roll No: {profile.roll_number}) {'Verified' if approve else 'Rejected'} successfully."
    }

@router.get("/analytics")
def get_tpo_analytics(
    current_user: User = Depends(require_role(["tpo", "teacher"])),
    db: Session = Depends(get_db)
):
    students = db.query(StudentProfile).all()
    total_students = len(students)
    if total_students == 0:
        return {
            "total_students": 0,
            "job_ready_count": 0,
            "average_match_score": 0.0,
            "verified_students_count": 0,
            "flagged_fraud_count": 0,
            "total_applications": 0
        }

    scores = [s.final_match_score for s in students if s.final_match_score > 0]
    avg_score = round(sum(scores) / max(1, len(scores)), 2)

    job_ready_count = len([s for s in students if s.final_match_score >= 60.0])
    verified_count = len([s for s in students if s.is_verified_by_tpo])
    
    flagged_resumes = db.query(Resume).filter(Resume.fraud_risk == "high").all()
    total_apps = db.query(Application).count()

    return {
        "total_students": total_students,
        "job_ready_count": job_ready_count,
        "job_ready_percentage": round((job_ready_count / total_students) * 100.0, 2),
        "average_match_score": avg_score,
        "verified_students_count": verified_count,
        "flagged_fraud_count": len(flagged_resumes),
        "total_applications": total_apps
    }

@router.get("/skill-heatmap")
def get_tpo_skill_heatmap(
    current_user: User = Depends(require_role(["tpo", "teacher"])),
    db: Session = Depends(get_db)
):
    students = db.query(StudentProfile).all()
    total_students = max(1, len(students))

    benchmark_skills = ["Python", "PyTorch", "TensorFlow", "SQL", "Docker", "FastAPI", "MLOps", "React", "Git", "System Design"]
    skill_counts = {s: 0 for s in benchmark_skills}

    for s in students:
        s_skills = [skill.strip().lower() for skill in (s.skills or "").split(",") if skill.strip()]
        for b in benchmark_skills:
            if any(b.lower() in skill for skill in s_skills):
                skill_counts[b] += 1

    heatmap = []
    for skill, count in skill_counts.items():
        cov_pct = round((count / total_students) * 100.0, 1)
        deficit_pct = round(100.0 - cov_pct, 1)
        heatmap.append({
            "skill": skill,
            "covered_count": count,
            "total_students": total_students,
            "coverage_percentage": cov_pct,
            "deficit_percentage": deficit_pct,
            "status": "Critical Gap" if deficit_pct >= 60 else ("Moderate Gap" if deficit_pct >= 30 else "Well Covered")
        })

    heatmap.sort(key=lambda x: x['deficit_percentage'], reverse=True)
    return heatmap

@router.get("/export-candidates")
def export_verified_talent(
    min_score: float = Query(60.0),
    current_user: User = Depends(require_role(["tpo", "recruiter"])),
    db: Session = Depends(get_db)
):
    students = db.query(StudentProfile).filter(StudentProfile.final_match_score >= min_score).all()
    export_list = []

    for idx, s in enumerate(sorted(students, key=lambda x: x.final_match_score, reverse=True), 1):
        user = db.query(User).filter(User.id == s.user_id).first()
        export_list.append({
            "rank": idx,
            "name": user.full_name if user else "Candidate",
            "email": user.email if user else "",
            "branch": s.branch,
            "skills": s.skills,
            "experience_years": s.experience_years,
            "match_score": f"{s.final_match_score}%",
            "decision": s.decision,
            "tpo_verification": s.tpo_status
        })

    return {
        "cutoff_score": min_score,
        "total_exported": len(export_list),
        "candidates": export_list
    }
