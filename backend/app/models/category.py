import uuid
from sqlalchemy import Column, String, Text
from app.database import Base

class Category(Base):
    __tablename__ = "categories"
    
    id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
