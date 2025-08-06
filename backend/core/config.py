from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # Application
    app_name: str = "Cognisia's Forge 1"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # Database
    database_url: str = "sqlite:///./forge1.db"
    
    # Security
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # AI Services
    zai_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None
    google_api_key: Optional[str] = None
    
    # Redis (for caching and Celery)
    redis_url: str = "redis://localhost:6379"
    
    # CORS
    backend_cors_origins: list[str] = ["http://localhost:3000", "http://localhost:8000"]
    
    # File Upload
    max_file_size: int = 10 * 1024 * 1024  # 10MB
    upload_dir: str = "uploads"
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()