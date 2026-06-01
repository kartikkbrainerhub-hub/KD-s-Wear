import uuid
from sqlalchemy import Column, String, Float, Boolean, DateTime, Text
from datetime import datetime
from app.database import Base

class Coupon(Base):
    __tablename__ = "coupons"
    
    id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    code = Column(String(50), unique=True, index=True, nullable=False)
    discount_type = Column(String(20), default="percentage")  # "percentage" or "flat"
    value = Column(Float, nullable=False)
    min_order_amount = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
class Review(Base):
    __tablename__ = "reviews"
    id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = Column(String(50), nullable=False)
    user_name = Column(String(100), nullable=False)
    rating = Column(Float, default=5.0)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
