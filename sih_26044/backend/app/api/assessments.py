# =====================================================================
# BACKEND API ROUTER: CODING ASSESSMENT ENGINE
# File: backend/app/api/assessments.py
# =====================================================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from backend.app.db.session import get_db
from backend.app.models.models import User, StudentProfile, CodeSubmission
from backend.app.schemas.schemas import AssessmentAnswerSubmission
from backend.app.api.deps import get_current_user

router = APIRouter(prefix="/assessments", tags=["Coding Assessment"])

QUESTION_BANK: List[Dict[str, Any]] = [
    {
        "id": "1",
        "topic": "FastAPI & REST",
        "question": "Complete the decorator to register a HTTP POST endpoint for candidate application:",
        "code_snippet": "from fastapi import FastAPI\napp = FastAPI()\n\n@app.____(\"/apply\")\ndef submit(data: dict):\n    return {\"status\": \"ok\"}",
        "expected": "post"
    },
    {
        "id": "2",
        "topic": "Pandas Data Cleaning",
        "question": "Fill the missing function to drop missing values from candidate DataFrame:",
        "code_snippet": "import pandas as pd\ndf = pd.read_csv('candidates.csv')\nclean_df = df.____(subset=['email'])",
        "expected": "dropna"
    },
    {
        "id": "3",
        "topic": "PyTorch Deep Learning",
        "question": "Fill in the loss function name commonly used for multi-class classification in PyTorch:",
        "code_snippet": "import torch.nn as nn\ncriterion = nn.____Loss()",
        "expected": "CrossEntropy"
    },
    {
        "id": "4",
        "topic": "SQL Relational Join",
        "question": "Fill the SQL keyword to return matching records from candidates and colleges tables:",
        "code_snippet": "SELECT candidates.name, colleges.name \nFROM candidates \n____ JOIN colleges ON candidates.college_id = colleges.id;",
        "expected": "INNER"
    },
    {
        "id": "5",
        "topic": "Scikit-Learn Cross Validation",
        "question": "Fill the function prefix for evaluating cross validation score in Scikit-Learn:",
        "code_snippet": "from sklearn.model_selection import _____val_score\nscores = _____val_score(model, X, y, cv=5)",
        "expected": "cross"
    },
    {
        "id": "6",
        "topic": "Docker Container Port Mapping",
        "question": "Complete the docker run command to map host port 8000 to container port 8000:",
        "code_snippet": "docker run -d -p 8000:____ candidate-matching-api",
        "expected": "8000"
    },
    {
        "id": "7",
        "topic": "Redis Cache Expiration",
        "question": "Fill the Redis command to set a key with 3600 seconds expiration time:",
        "code_snippet": "import redis\nr = redis.Redis()\nr.____(\"token\", 3600, \"valid\")",
        "expected": "setex"
    },
    {
        "id": "8",
        "topic": "Python List Comprehension",
        "question": "Fill the membership operator keyword in list comprehension filter:",
        "code_snippet": "skills = ['Python', 'SQL', 'Docker']\nml_skills = [s for s in skills if s ____ ['Python', 'PyTorch']]",
        "expected": "in"
    },
    {
        "id": "9",
        "topic": "Scikit-Learn Cosine Similarity",
        "question": "Fill the metric name function used for text vector similarity calculation:",
        "code_snippet": "from sklearn.metrics.pairwise import _____similarity\nscore = _____similarity(resume_vec, jd_vec)",
        "expected": "cosine"
    },
    {
        "id": "10",
        "topic": "Git Branch Creation",
        "question": "Fill the flag option to create and checkout a new branch in Git:",
        "code_snippet": "git checkout -____ feature/candidate-matching",
        "expected": "b"
    },
    {
        "id": "11",
        "topic": "FastAPI Dependency Injection",
        "question": "Complete the parameter annotation so the endpoint receives the authenticated dependency:",
        "code_snippet": "@app.get('/me')\ndef me(user = ____ (get_current_user)):\n    return user",
        "expected": "depends"
    },
    {
        "id": "12",
        "topic": "SQL Window Functions",
        "question": "Fill the window function keyword to rank candidates within each job:",
        "code_snippet": "SELECT candidate_id, job_id, score, ____() OVER (PARTITION BY job_id ORDER BY score DESC) AS rank\nFROM matches;",
        "expected": "rank"
    }
]

@router.get("")
def get_assessment_questions():
    """Returns 10 coding assessment questions without revealing expected answers."""
    questions = []
    for q in QUESTION_BANK:
        questions.append({
            "id": q["id"],
            "topic": q["topic"],
            "question": q["question"],
            "code_snippet": q["code_snippet"]
            ,"difficulty": "Hard" if int(q["id"]) > 8 else "Medium"
        })
    return questions

@router.post("/submit")
def submit_assessment_answers(
    payload: AssessmentAnswerSubmission,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_answers = payload.answers
    correct_count = 0
    detailed_breakdown = []

    for q in QUESTION_BANK:
        q_id = q["id"]
        expected = q["expected"].strip().lower()
        submitted = str(user_answers.get(q_id, "")).strip().lower()

        is_correct = (submitted == expected)
        if is_correct:
            correct_count += 1

        detailed_breakdown.append({
            "question_id": q_id,
            "topic": q["topic"],
            "submitted": submitted,
            "expected": q["expected"],
            "is_correct": is_correct
        })

    score_pct = round((correct_count / len(QUESTION_BANK)) * 100.0, 2)

    # Record submission in DB
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if profile:
        profile.assessment_score = score_pct
        submission = CodeSubmission(
            student_id=profile.id,
            score=score_pct,
            total_questions=len(QUESTION_BANK),
            correct_count=correct_count
        )
        db.add(submission)
        db.commit()

    return {
        "total_questions": len(QUESTION_BANK),
        "correct_count": correct_count,
        "score_percentage": score_pct,
        "coding_bonus_added": f"+{correct_count}%",
        "difficulty": "Hard",
        "level_up": "LEVEL 05" if score_pct >= 75 else "LEVEL 04",
        "project_suggestions": [
            "Ship a FastAPI candidate tracker with auth, background jobs, tests, and Docker deployment.",
            "Build a skill-gap recommender using embeddings, explainable scoring, and a live dashboard.",
            "Create a production analytics pipeline with SQL ranking, caching, CI checks, and monitoring."
        ],
        "breakdown": detailed_breakdown
    }
