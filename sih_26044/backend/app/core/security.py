# =====================================================================
# BACKEND CORE SECURITY: AUTH, PASSWORD HASHING & JWT TOKENS
# File: backend/app/core/security.py
# =====================================================================

import hashlib
import os
import jwt
from datetime import datetime, timedelta, timezone
from typing import Optional, Any, Dict
from backend.app.core.config import settings

def hash_password(password: str) -> str:
    """Hashes plain password using SHA-256 with salt."""
    salt = os.urandom(16).hex()
    pwd_hash = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    ).hex()
    return f"{salt}${pwd_hash}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies plain password against stored salt$hash."""
    try:
        salt, stored_hash = hashed_password.split('$')
        pwd_hash = hashlib.pbkdf2_hmac(
            'sha256',
            plain_password.encode('utf-8'),
            salt.encode('utf-8'),
            100000
        ).hex()
        return pwd_hash == stored_hash
    except Exception:
        return False

def create_access_token(subject: Any, role: str, expires_delta: Optional[timedelta] = None) -> str:
    """Generates JWT token containing user identity and role."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {
        "sub": str(subject),
        "role": role,
        "exp": expire
    }
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodes and validates JWT token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except Exception:
        return None
