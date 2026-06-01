import logging
from fastapi import FastAPI, Depends, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.config import settings
from app.database import engine, get_db, Base
from app.utils.security import get_password_hash
from app.models.user import User

# Import routers
from app.routers.auth import router as auth_router
from app.routers.products import router as products_router
from app.routers.designs import router as designs_router
from app.routers.orders import router as orders_router
from app.routers.admin import router as admin_router

# Configure simple logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("MainApp")

# Create database tables automatically
try:
    logger.info("Initializing SQL schema tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("SQL tables created successfully.")
except Exception as e:
    logger.error(f"Error creating database tables: {e}")

# Pre-populate default admin user
def create_initial_admin():
    db = next(get_db())
    try:
        admin = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
        if not admin:
            logger.info("No default admin user found. Creating one now...")
            hashed_pw = get_password_hash(settings.ADMIN_PASSWORD)
            new_admin = User(
                email=settings.ADMIN_EMAIL,
                hashed_password=hashed_pw,
                name="Executive Admin",
                phone="9876543210",
                role="admin"
            )
            db.add(new_admin)
            db.commit()
            logger.info(f"Default admin user created successfully! Email: {settings.ADMIN_EMAIL}")
    except Exception as e:
         logger.warning(f"Could not create initial admin user: {e}")
    finally:
         db.close()

create_initial_admin()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    docs_url="/docs",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Enable CORS for next.js dev and production URLs
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Attach router endpoints
api_router = APIRouter(prefix=settings.API_V1_STR)
api_router.include_router(auth_router)
api_router.include_router(products_router)
api_router.include_router(designs_router)
api_router.include_router(orders_router)
api_router.include_router(admin_router)

app.include_router(api_router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "brand": "Ahankar Wear API Server",
        "version": "1.0.0",
        "docs": "/docs"
    }
