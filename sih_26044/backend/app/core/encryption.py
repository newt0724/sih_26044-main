# =====================================================================
# BACKEND CORE SECURITY: DATA ENCRYPTION ENGINE (AES-256 / Fernet)
# File: backend/app/core/encryption.py
# =====================================================================

import os
import base64
import hashlib
from cryptography.fernet import Fernet

# Secret salt / key derived from environment or default persistent key
SECRET_KEY = os.getenv("SECRET_KEY", "Antigravity_Academia_Industry_Platform_Secret_2026_Key")

def _generate_fernet_key(secret: str) -> bytes:
    """Derives a deterministic 32-byte url-safe base64 encoded Fernet key from secret string."""
    digest = hashlib.sha256(secret.encode()).digest()
    return base64.urlsafe_b64encode(digest)

_fernet = Fernet(_generate_fernet_key(SECRET_KEY))

def encrypt_data(plaintext: str) -> str:
    """
    Encrypts sensitive string (e.g. Roll Number, Phone Number, College ID) using Fernet (AES-128-CBC with HMAC).
    Returns ciphertext string.
    """
    if not plaintext:
        return ""
    try:
        encrypted_bytes = _fernet.encrypt(str(plaintext).encode('utf-8'))
        return encrypted_bytes.decode('utf-8')
    except Exception as e:
        print(f"Encryption error: {e}")
        return str(plaintext)

def decrypt_data(ciphertext: str) -> str:
    """
    Decrypts ciphertext string back into original plaintext string.
    """
    if not ciphertext:
        return ""
    try:
        # Check if already plaintext
        if not ciphertext.startswith("gAAAAA"):
            return ciphertext
        decrypted_bytes = _fernet.decrypt(str(ciphertext).encode('utf-8'))
        return decrypted_bytes.decode('utf-8')
    except Exception:
        # Return as-is if decryption fails or string was not encrypted
        return ciphertext
