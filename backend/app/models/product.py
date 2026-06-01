import uuid
from sqlalchemy import Column, String, Text, Float, Integer, Boolean, ForeignKey
from app.database import Base

class Product(Base):
    __tablename__ = "products"
    
    id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    base_price = Column(Float, nullable=False)
    category_id = Column(String(50), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    
    # JSON-serialized list of strings: ["S", "M", "L", "XL"]
    sizes = Column(Text, default="[]")
    
    # JSON-serialized list of dicts: [{"name": "Carbon Black", "hex": "#121212"}]
    colors = Column(Text, default="[]")
    
    # JSON-serialized list of image URLs
    images = Column(Text, default="[]")
    
    inventory = Column(Integer, default=50)
    ratings = Column(Float, default=5.0)
    is_customizable = Column(Boolean, default=False)
