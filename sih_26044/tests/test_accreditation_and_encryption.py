# =====================================================================
# ACCREDITATION & ENCRYPTION UNIT TESTS
# File: tests/test_accreditation_and_encryption.py
# =====================================================================

import unittest
from backend.app.core.encryption import encrypt_data, decrypt_data
from backend.app.services.college_verification import verify_college_accreditation

class TestAccreditationAndEncryption(unittest.TestCase):

    def test_fernet_encryption_decryption(self):
        original = "NIT2026-CSE01"
        encrypted = encrypt_data(original)
        self.assertNotEqual(original, encrypted)
        decrypted = decrypt_data(encrypted)
        self.assertEqual(original, decrypted)

    def test_approved_college_verification(self):
        req = {
            "full_legal_name": "G.PULLA REDDY ENGINEERING COLLEGE",
            "type_of_institute": "Private-Self Financing",
            "district": "KURNOOL",
            "state": "Andhra Pradesh",
            "aicte_approval_no": "1-9319586590"
        }
        res = verify_college_accreditation(req)
        self.assertEqual(res["accreditation_status"], "GOVT_VERIFIED")
        self.assertTrue(res["access_granted"])
        self.assertEqual(res["matched_dataset"], "AICTE COLLEGES APPROVED")

    def test_closed_college_verification_blocked(self):
        req = {
            "full_legal_name": "GIET DEGREE COLLEGE",
            "type_of_institute": "Private-Self Financing",
            "district": "EAST GODAVARI",
            "state": "Andhra Pradesh",
            "aicte_approval_no": "1-44645053830"
        }
        res = verify_college_accreditation(req)
        self.assertEqual(res["accreditation_status"], "BLOCKED_CLOSED_COLLEGE")
        self.assertFalse(res["access_granted"])
        self.assertEqual(res["matched_dataset"], "AICTE CLOSED COLLEGES")

if __name__ == '__main__':
    unittest.main()
