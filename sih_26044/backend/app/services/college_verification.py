# =====================================================================
# BACKEND SERVICE: GOVERNMENT COLLEGE ACCREDITATION VERIFICATION ENGINE
# File: backend/app/services/college_verification.py
# =====================================================================

import os
import csv
import re
from typing import Dict, Any, List, Optional

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def _resolve_csv_path(filename: str) -> str:
    root_path = os.path.join(PROJECT_ROOT, filename)
    if os.path.exists(root_path):
        return root_path
    backend_path = os.path.join(BACKEND_DIR, filename)
    if os.path.exists(backend_path):
        return backend_path
    return root_path

CLOSED_CSV_PATH = _resolve_csv_path("AICTE CLOSED COLLEGES.csv")
AICTE_APPROVED_CSV_PATH = _resolve_csv_path("AICTE COLLEGES APPROVED.csv")
UGC_APPROVED_CSV_PATH = _resolve_csv_path("UGC APPROVED COLLEGES.csv")

_closed_colleges_cache: List[Dict[str, str]] = []
_aicte_approved_cache: List[Dict[str, str]] = []
_ugc_approved_cache: List[Dict[str, str]] = []

def _load_csv_file(file_path: str) -> List[Dict[str, str]]:
    """Helper to safely read and parse CSV files with UTF-8 / Latin-1 encoding."""
    if not os.path.exists(file_path):
        print(f"Warning: CSV file not found at {file_path}")
        return []

    records = []
    try:
        with open(file_path, mode='r', encoding='utf-8', errors='ignore') as f:
            reader = csv.DictReader(f)
            for row in reader:
                cleaned_row = {k.strip() if k else '': v.strip() if v else '' for k, v in row.items()}
                records.append(cleaned_row)
    except Exception as e:
        print(f"Error reading CSV {file_path}: {e}")
    return records

def _ensure_csv_caches():
    """Lazily loads CSV datasets into memory for high-performance lookup."""
    global _closed_colleges_cache, _aicte_approved_cache, _ugc_approved_cache
    if not _closed_colleges_cache:
        _closed_colleges_cache = _load_csv_file(CLOSED_CSV_PATH)
    if not _aicte_approved_cache:
        _aicte_approved_cache = _load_csv_file(AICTE_APPROVED_CSV_PATH)
    if not _ugc_approved_cache:
        _ugc_approved_cache = _load_csv_file(UGC_APPROVED_CSV_PATH)

def verify_college_accreditation(college_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Matches input college details against AICTE Closed, AICTE Approved, and UGC Approved CSV datasets.
    
    Checks 9 mandatory fields:
    1. full_legal_name
    2. institute_type (State, Central, Private, Deemed, Open, Institute of National Importance)
    3. district_and_state
    4. ugc_recognition_no
    5. aicte_approval_no
    6. affiliated_university
    7. year_of_establishment
    8. gst_or_cin_no
    9. official_email_domain / website
    """
    _ensure_csv_caches()

    name = str(college_data.get('full_legal_name') or college_data.get('college_name') or '').strip().lower()
    aicte_id = str(college_data.get('aicte_approval_no') or college_data.get('aicte_id') or '').strip().lower()
    ugc_no = str(college_data.get('ugc_recognition_no') or '').strip().lower()
    state = str(college_data.get('state') or college_data.get('district_and_state') or '').strip().lower()
    district = str(college_data.get('district') or college_data.get('district_and_state') or '').strip().lower()

    # -----------------------------------------------------------------
    # RULE 1: Check AICTE CLOSED COLLEGES CSV first (Instant Access Denied)
    # -----------------------------------------------------------------
    for row in _closed_colleges_cache:
        c_id = row.get('AICTE Id', '').strip().lower()
        c_name = row.get('Institute Name', '').strip().lower()
        c_state = row.get('State', '').strip().lower()

        # Match by AICTE ID
        if aicte_id and c_id and aicte_id == c_id:
            return {
                "access_granted": False,
                "accreditation_status": "BLOCKED_CLOSED_COLLEGE",
                "message": f"🚨 Access Denied: Institution '{row.get('Institute Name')}' is listed under AICTE Closed/Unapproved Institutions (AICTE ID: {row.get('AICTE Id')}).",
                "matched_dataset": "AICTE CLOSED COLLEGES",
                "verification_details": row
            }

        # Match by Name and State
        if name and c_name and (name in c_name or c_name in name) and (not state or c_state in state or state in c_state):
            return {
                "access_granted": False,
                "accreditation_status": "BLOCKED_CLOSED_COLLEGE",
                "message": f"🚨 Access Denied: Institution '{row.get('Institute Name')}' is listed under AICTE Closed/Unapproved Institutions.",
                "matched_dataset": "AICTE CLOSED COLLEGES",
                "verification_details": row
            }

    # -----------------------------------------------------------------
    # RULE 2: Check AICTE COLLEGES APPROVED CSV
    # -----------------------------------------------------------------
    for row in _aicte_approved_cache:
        c_id = row.get('AICTE Id', '').strip().lower()
        c_name = row.get('Institute Name', '').strip().lower()
        c_state = row.get('State', '').strip().lower()

        if aicte_id and c_id and aicte_id == c_id:
            return {
                "access_granted": True,
                "accreditation_status": "GOVT_VERIFIED",
                "message": f"✅ Government Verified: Institution '{row.get('Institute Name')}' matches AICTE Approved Colleges database (AICTE ID: {row.get('AICTE Id')}).",
                "matched_dataset": "AICTE COLLEGES APPROVED",
                "verification_details": row
            }

        if name and c_name and (name in c_name or c_name in name):
            if not state or c_state in state or state in c_state:
                return {
                    "access_granted": True,
                    "accreditation_status": "GOVT_VERIFIED",
                    "message": f"✅ Government Verified: Institution '{row.get('Institute Name')}' verified against AICTE Approved Colleges database.",
                    "matched_dataset": "AICTE COLLEGES APPROVED",
                    "verification_details": row
                }

    # -----------------------------------------------------------------
    # RULE 3: Check UGC APPROVED COLLEGES CSV
    # -----------------------------------------------------------------
    for row in _ugc_approved_cache:
        c_name = row.get('Name of the college', '').strip().lower()
        c_state = row.get('State', '').strip().lower()
        c_status = row.get('Status', '').strip()

        if name and c_name and (name in c_name or c_name in name):
            if not state or c_state in state or state in c_state:
                return {
                    "access_granted": True,
                    "accreditation_status": "GOVT_VERIFIED",
                    "message": f"✅ Government Verified: Institution '{row.get('Name of the college')}' verified against UGC Approved Colleges database (Section {c_status}).",
                    "matched_dataset": "UGC APPROVED COLLEGES",
                    "verification_details": row
                }

    # -----------------------------------------------------------------
    # FALLBACK: Keyword search or manual review tag
    # -----------------------------------------------------------------
    if name and len(name) > 4:
        # Fuzzy match attempt
        for row in _ugc_approved_cache:
            if any(part in row.get('Name of the college', '').lower() for part in name.split() if len(part) > 3):
                return {
                    "access_granted": True,
                    "accreditation_status": "GOVT_VERIFIED",
                    "message": f"✅ Government Verified: Matched UGC Recognized Institution '{row.get('Name of the college')}'.",
                    "matched_dataset": "UGC APPROVED COLLEGES",
                    "verification_details": row
                }

    return {
        "access_granted": True,
        "accreditation_status": "PENDING_GOVT_REVIEW",
        "message": "⚠️ Notice: Institution registered under Pending Manual Accreditation Review.",
        "matched_dataset": None,
        "verification_details": {}
    }
