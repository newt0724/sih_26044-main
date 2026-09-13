# =====================================================================
# BACKEND CORE CONFIGURATION
# File: backend/app/core/config.py
# =====================================================================

import os
try:
    from pydantic_settings import BaseSettings
except ImportError:
    from pydantic import BaseModel as BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Academia ↔ Industry Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-academia-industry-platform-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{os.path.join(BASE_DIR, 'app.db')}")
    
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", os.path.join(BASE_DIR, "uploads"))
    MODEL_DIR: str = os.getenv("MODEL_DIR", os.path.join(BASE_DIR, "ml", "models"))
    
    GITHUB_TOKEN: str = os.getenv("GITHUB_TOKEN", "")

settings = Settings()
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
