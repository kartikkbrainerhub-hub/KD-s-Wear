import logging
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

# Setup simple logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Database")

Base = declarative_base()

# Attempt to connect to PostgreSQL first
try:
    logger.info(f"Connecting to PostgreSQL: {settings.DATABASE_URL.split('@')[-1] if '@' in settings.DATABASE_URL else settings.DATABASE_URL}")
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True
    )
    # Test connection
    with engine.connect() as conn:
        logger.info("Successfully connected to PostgreSQL database.")
except Exception as e:
    logger.warning(f"Failed to connect to PostgreSQL: {e}. Falling back to local SQLite database.")
    # For SQLite, we require connect_args={"check_same_thread": False}
    engine = create_engine(
        settings.SQLITE_FALLBACK_URL,
        connect_args={"check_same_thread": False} if "sqlite" in settings.SQLITE_FALLBACK_URL else {}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """FastAPI Dependency to inject database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
