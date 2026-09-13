# =====================================================================
# ACADEMIA ↔ INDUSTRY PLATFORM: END-TO-END SYSTEM INTEGRATION TEST
# File: tests/test_end_to_end.py
# =====================================================================

import os
import json
import unittest
from resume_processing.pipeline import process_resume_and_evaluate
from resume_processing.identity_verification import verify_candidate_identity
from resume_processing.fraud_detection import inspect_resume_anti_fraud
from resume_processing.github_verification import verify_github_profile

class TestAcademiaIndustryPlatform(unittest.TestCase):

    def test_candidate_a_high_match(self):
        """Candidate A: Strong Python & Machine Learning skills, 10 years exp."""
        candidate_data = {
            'Name': 'Ashley Ali',
            'Skills': 'TensorFlow, NLP, Pytorch, Python',
            'Experience (Years)': 10,
            'Education': 'B.Sc',
            'Certifications': 'Deep Learning Specialization',
            'Job Role': 'AI Researcher',
            'Projects Count': 8,
            'Salary Expectation ($)': 104895,
            'GitHub_URL': 'https://github.com/torvalds'
        }

        res = process_resume_and_evaluate(candidate_data=candidate_data)

        self.assertEqual(res['decision'], 'SHORTLIST')
        self.assertGreaterEqual(res['final_match_score'], 60.0)
        self.assertTrue(res['verification']['identity_verified'])
        self.assertEqual(res['anti_fraud']['fraud_risk'], 'low')

    def test_candidate_b_low_match(self):
        """Candidate B: Minimal skills, low experience."""
        candidate_data = {
            'Name': 'John Doe',
            'Skills': 'HTML, CSS',
            'Experience (Years)': 0,
            'Education': 'B.Sc',
            'Certifications': 'None',
            'Job Role': 'AI Researcher',
            'Projects Count': 0,
            'Salary Expectation ($)': 120000
        }

        res = process_resume_and_evaluate(candidate_data=candidate_data)
        self.assertLess(res['final_match_score'], 60.0)

    def test_white_text_anti_fraud(self):
        """Verify white-text fraud triggers penalty and high risk level."""
        text = "Experienced Software Developer with background in Python."
        hidden = ["Python", "Machine Learning", "Deep Learning", "TensorFlow"]
        
        fraud_res = inspect_resume_anti_fraud(text, hidden_keywords=hidden)
        self.assertEqual(fraud_res['fraud_risk'], 'high')
        self.assertLessEqual(fraud_res['penalty_score'], -20.0)

    def test_identity_verification_mismatch(self):
        """Verify candidate name mismatch triggers failed identity flag."""
        ident_res = verify_candidate_identity(
            candidate_name="Robert Smith",
            extracted_text="Resume of Jane Doe. Skills: Java, C++.",
            github_url="https://github.com/janedoe"
        )
        self.assertFalse(ident_res['identity_verified'])

    def test_resume_pending_upload_state(self):
        """Verify candidate without uploaded resume displays pending upload state instead of fake 33.3% score."""
        candidate_data = {
            'Name': 'New Candidate',
            'Skills': 'Python, SQL',
            'has_uploaded_resume': False
        }
        res = process_resume_and_evaluate(candidate_data=candidate_data)
        self.assertEqual(res['status_label'], 'Resume Pending Upload')
        self.assertEqual(res['decision'], 'PENDING_RESUME')
        self.assertEqual(res['final_match_score'], 0.0)
        self.assertFalse(res['has_uploaded_resume'])

if __name__ == '__main__':
    unittest.main()
