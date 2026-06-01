import uuid
from sqlalchemy import Column, String, Text, DateTime
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(200), nullable=False)
    name = Column(String(100), nullable=False)
    role = Column(String(20), default="user")  # "user" or "admin"
    phone = Column(String(20), nullable=True)
    
    # JSON-serialized string of addresses
    addresses = Column(Text, default="[]") 
    
    # JSON-serialized string of product IDs representing wishlist
    wishlist = Column(Text, default="[]")
    
    created_at = Column(DateTime, default=datetime.utcnow)
