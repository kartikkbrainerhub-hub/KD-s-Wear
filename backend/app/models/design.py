import uuid
from sqlalchemy import Column, String, Text, ForeignKey, DateTime
from datetime import datetime
from app.database import Base

class CustomDesign(Base):
    __tablename__ = "custom_designs"
    
    id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(50), ForeignKey("users.id", ondelete="CASCADE"), nullable=True) # nullable for guest designs
    
    # Store FabricJS JSON representation
    canvas_json = Column(Text, nullable=False)
    
    preview_image_url = Column(Text, nullable=False)
    shirt_color = Column(String(20), default="White")
    view = Column(String(10), default="front")  # "front" or "back"
    
    created_at = Column(DateTime, default=datetime.utcnow)
