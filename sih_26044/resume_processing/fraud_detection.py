# =====================================================================
# RESUME PROCESSING: ANTI-FRAUD INSPECTION ENGINE
# File: resume_processing/fraud_detection.py
# =====================================================================

import re
from typing import List, Dict, Any

def inspect_resume_anti_fraud(extracted_text: str, hidden_keywords: List[str] = None) -> Dict[str, Any]:
    """
    Analyzes resume text and font attributes for anti-fraud signals:
    - Hidden/white text keyword stuffing
    - Extreme keyword repeating / keyword stuffing
    - Placeholder / template resume text
    Returns fraud risk level (low/medium/high), penalty score, signals, and detailed flags.
    """
    if hidden_keywords is None:
        hidden_keywords = []

    signals = []
    flags = []
    penalty = 0.0

    # 1. White / Tiny Text Inspection
    has_white_text = len(hidden_keywords) > 0
    if has_white_text:
        msg = f"Hidden white-font keywords detected: {hidden_keywords[:10]}"
        signals.append(msg)
        flags.append({"type": "WHITE_TEXT_FRAUD", "severity": "HIGH", "message": msg})
        penalty -= 25.0

    # 2. Keyword Stuffing Detection
    text_lower = extracted_text.lower() if extracted_text else ""
    high_value_keywords = ['python', 'machine learning', 'deep learning', 'aws', 'sql', 'pytorch', 'tensorflow', 'react', 'java', 'docker', 'c++', 'javascript']
    excessive_keywords = []

    if text_lower:
        for kw in high_value_keywords:
            count = len(re.findall(r'\b' + re.escape(kw) + r'\b', text_lower))
            if count > 5:
                excessive_keywords.append(f"'{kw}' ({count}x)")

    if excessive_keywords:
        msg = f"Artificial keyword stuffing detected: {', '.join(excessive_keywords)}"
        signals.append(msg)
        flags.append({"type": "KEYWORD_STUFFING", "severity": "MEDIUM", "message": msg})
        penalty -= 15.0

    # 3. Placeholder / Fake Content Check
    fake_patterns = ['lorem ipsum', 'sample text', 'john doe', 'jane doe', 'your name here', 'insert experience']
    if any(p in text_lower for p in fake_patterns):
        msg = "Template or fake placeholder resume content detected."
        signals.append(msg)
        flags.append({"type": "FAKE_CONTENT", "severity": "HIGH", "message": msg})
        penalty -= 30.0

    # Determine Risk Level
    if has_white_text or len(excessive_keywords) > 2 or any(f['type'] == 'FAKE_CONTENT' for f in flags):
        risk_level = "high"
        penalty = min(penalty, -25.0)
        explanation = "🚨 High Risk: Fraudulent resume detected! File contains hidden white-text or artificial keyword manipulation."
    elif len(signals) > 0:
        risk_level = "medium"
        explanation = "⚠️ Medium Risk: Resume exhibits suspicious keyword repetition or formatting anomalies."
    else:
        risk_level = "low"
        explanation = "✅ Low Risk: No suspicious text properties or white-font manipulation detected."

    return {
        "fraud_risk": risk_level,
        "penalty_score": penalty,
        "signals": signals,
        "flags": flags,
        "explanation": explanation,
        "hidden_keywords_count": len(hidden_keywords),
        "is_flagged": (risk_level == "high")
    }
