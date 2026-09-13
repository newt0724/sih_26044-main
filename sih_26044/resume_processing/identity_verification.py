# =====================================================================
# RESUME PROCESSING: IDENTITY VERIFICATION ENGINE
# File: resume_processing/identity_verification.py
# =====================================================================

import re
from typing import Dict, Any

def verify_candidate_identity(candidate_name: str, extracted_text: str, github_url: str = None, linkedin_url: str = None) -> Dict[str, Any]:
    """
    Dynamically verifies candidate identity using regex word boundary matching.
    Checks candidate name against extracted resume text and optional GitHub/LinkedIn handles.
    """
    if not candidate_name or not candidate_name.strip():
        return {
            "identity_verified": True,
            "verification_reason": "No candidate name provided for verification.",
            "name_match": True,
            "github_match": True,
            "linkedin_match": True
        }

    clean_name = candidate_name.strip()
    name_parts = clean_name.split()
    first_name = name_parts[0].lower()
    last_name = name_parts[-1].lower() if len(name_parts) > 1 else ""

    text_lower = extracted_text.lower() if extracted_text else ""

    # 1. Resume Text Regex Match
    # Match first name as exact word boundary
    first_name_pattern = r'\b' + re.escape(first_name) + r'\b'
    first_name_found = bool(re.search(first_name_pattern, text_lower))

    last_name_found = True
    if last_name and len(last_name) > 2:
        last_name_pattern = r'\b' + re.escape(last_name) + r'\b'
        last_name_found = bool(re.search(last_name_pattern, text_lower))

    name_in_resume = first_name_found or last_name_found if text_lower else True

    # 2. GitHub Username Match (if supplied)
    github_match = True
    if github_url and 'github.com/' in github_url.lower():
        handle = github_url.strip().rstrip('/').split('github.com/')[-1].split('/')[0].lower()
        if first_name not in handle and (last_name and last_name not in handle):
            # Check if handle appears in resume text as fallback
            if text_lower and handle not in text_lower:
                github_match = False

    # 3. LinkedIn Username Match (if supplied)
    linkedin_match = True
    if linkedin_url and 'linkedin.com/in/' in linkedin_url.lower():
        handle = linkedin_url.strip().rstrip('/').split('linkedin.com/in/')[-1].split('/')[0].lower()
        if first_name not in handle and (last_name and last_name not in handle):
            if text_lower and handle not in text_lower:
                linkedin_match = False

    identity_verified = name_in_resume and github_match and linkedin_match

    reasons = []
    flags = []
    if not name_in_resume:
        msg = f"Candidate name '{clean_name}' was not found in the uploaded resume text."
        reasons.append(msg)
        flags.append({"type": "NAME_MISMATCH", "severity": "HIGH", "message": msg})
    if not github_match:
        msg = f"GitHub profile handle in '{github_url}' does not align with candidate name or resume."
        reasons.append(msg)
        flags.append({"type": "FALSE_GITHUB_URL", "severity": "MEDIUM", "message": msg})
    if not linkedin_match:
        msg = f"LinkedIn profile handle in '{linkedin_url}' does not align with candidate name or resume."
        reasons.append(msg)
        flags.append({"type": "FALSE_LINKEDIN_URL", "severity": "MEDIUM", "message": msg})

    verification_reason = "Identity successfully verified." if identity_verified else " ".join(reasons)

    return {
        "identity_verified": identity_verified,
        "verification_reason": verification_reason,
        "name_match": name_in_resume,
        "github_match": github_match,
        "linkedin_match": linkedin_match,
        "flags": flags
    }
