# =====================================================================
# RESUME PROCESSING: GITHUB REST API VERIFICATION ENGINE
# File: resume_processing/github_verification.py
# =====================================================================

import os
import requests
from typing import Dict, Any

def verify_github_profile(github_url_or_username: str, token: str = None) -> Dict[str, Any]:
    """
    Queries GitHub REST API to extract candidate proof-of-work metrics:
    - Public repositories count
    - Tech stack programming languages
    - Total star count
    Calculates bonus proof-of-work score (0–10%). Handles rate limits & API errors gracefully.
    """
    if not github_url_or_username or not str(github_url_or_username).strip():
        return {
            "valid": False,
            "username": None,
            "public_repos": 0,
            "stars": 0,
            "tech_stack": [],
            "bonus_score": 0.0,
            "message": "No GitHub profile provided."
        }

    clean_input = str(github_url_or_username).strip().rstrip('/')
    if 'github.com/' in clean_input:
        username = clean_input.split('github.com/')[-1].split('/')[0]
    else:
        username = clean_input.split('/')[0]

    headers = {"User-Agent": "AcademiaIndustryPlatform/1.0"}
    if token or os.getenv("GITHUB_TOKEN"):
        headers["Authorization"] = f"token {token or os.getenv('GITHUB_TOKEN')}"

    try:
        # Fetch user profile
        user_url = f"https://api.github.com/users/{username}"
        res = requests.get(user_url, headers=headers, timeout=4)

        if res.status_code != 200:
            return {
                "valid": False,
                "username": username,
                "public_repos": 0,
                "stars": 0,
                "tech_stack": [],
                "bonus_score": 0.0,
                "message": f"GitHub user '{username}' not found or API error ({res.status_code})."
            }

        user_data = res.json()
        public_repos = user_data.get('public_repos', 0)

        # Fetch public repos (up to 100)
        repos_url = f"https://api.github.com/users/{username}/repos?per_page=100&sort=updated"
        repos_res = requests.get(repos_url, headers=headers, timeout=4)

        stars = 0
        languages = set()

        if repos_res.status_code == 200:
            for repo in repos_res.json():
                if not repo.get('fork', False):
                    stars += repo.get('stargazers_count', 0)
                    lang = repo.get('language')
                    if lang:
                        languages.add(lang)

        # Bonus math (max +10% bonus)
        pow_score = min(100.0, (min(30, public_repos * 3) + min(30, stars * 5) + min(20, len(languages) * 5) + (20 if public_repos > 0 else 0)))
        bonus_percentage = round((pow_score / 100.0) * 10.0, 2)

        return {
            "valid": True,
            "username": username,
            "public_repos": public_repos,
            "stars": stars,
            "tech_stack": sorted(list(languages)),
            "proof_of_work_score": round(pow_score, 2),
            "bonus_score": bonus_percentage,
            "message": "GitHub profile verified successfully."
        }

    except Exception as e:
        return {
            "valid": False,
            "username": username,
            "public_repos": 0,
            "stars": 0,
            "tech_stack": [],
            "bonus_score": 0.0,
            "message": f"GitHub API verification connection timeout/error: {str(e)}"
        }
