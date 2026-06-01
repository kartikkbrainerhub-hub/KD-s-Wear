import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Kora Wear API"
    API_V1_STR: str = "/api"
    
    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/ajay_wear"
    # Fallback path for SQLite to enable zero-configuration local runs
    SQLITE_FALLBACK_URL: str = "sqlite:///./ajay_wear.db"
    
    # JWT
    JWT_SECRET: str = "supersecretbrandsignaturekey1234567890!@"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 1 week
    
    # Third Party Keys (Mocked or real)
    CLOUDINARY_CLOUD_NAME: str = "demo_cloud"
    CLOUDINARY_API_KEY: str = "demo_key"
    CLOUDINARY_API_SECRET: str = "demo_secret"
    
    # RAZORPAY
    RAZORPAY_KEY_ID: str = "rzp_test_demo12345"
    RAZORPAY_KEY_SECRET: str = "demosignaturesales123"
    
    # Default Admin
    ADMIN_EMAIL: str = "admin@korawear.com"
    ADMIN_PASSWORD: str = "admin123"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
