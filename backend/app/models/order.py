import uuid
from sqlalchemy import Column, String, Text, Float, DateTime, ForeignKey
from datetime import datetime
from app.database import Base

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(50), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    # JSON-serialized list of line items: 
    # [{"product_id": "...", "title": "...", "custom_design_id": "...", "quantity": 1, "size": "M", "color": "Black", "price": 999.0}]
    items = Column(Text, nullable=False)
    
    # JSON-serialized address: {"name": "...", "address_line": "...", "city": "...", "state": "...", "zip": "..."}
    shipping_address = Column(Text, nullable=False)
    
    gst_number = Column(String(50), nullable=True)
    coupon_code = Column(String(50), nullable=True)
    
    total_amount = Column(Float, nullable=False)
    discount_amount = Column(Float, default=0.0)
    
    payment_method = Column(String(20), default="COD")  # "COD" or "Razorpay"
    payment_status = Column(String(20), default="Pending")  # "Pending", "Paid", "Failed"
    order_status = Column(String(20), default="Pending")  # "Pending", "Processing", "Printed", "Shipped", "Delivered"
    
    razorpay_order_id = Column(String(100), nullable=True)
    razorpay_payment_id = Column(String(100), nullable=True)
    
    tracking_number = Column(String(100), nullable=True)
    invoice_url = Column(String(500), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
