from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Any, Dict
from datetime import datetime

# --- AUTH SCHEMAS ---
class UserBase(BaseModel):
    email: EmailStr
    name: str
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class AddressSchema(BaseModel):
    name: str
    address_line: str
    city: str
    state: str
    zip_code: str
    is_default: Optional[bool] = False

class UserResponse(UserBase):
    id: str
    role: str
    addresses: str  # raw json list string
    wishlist: str   # raw json list string
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# --- CATEGORY SCHEMAS ---
class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    image_url: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: str

    class Config:
        from_attributes = True

# --- PRODUCT SCHEMAS ---
class ProductBase(BaseModel):
    title: str
    description: str
    base_price: float
    category_id: Optional[str] = None
    sizes: str  # raw JSON string e.g. '["S","M","L","XL"]'
    colors: str  # raw JSON string e.g. '[{"name":"Crimson","hex":"#dc2626"}]'
    images: str  # raw JSON string e.g. '["https://image1.jpg"]'
    inventory: int = 50
    ratings: float = 5.0
    is_customizable: bool = False

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: str

    class Config:
        from_attributes = True

# --- CUSTOM DESIGN SCHEMAS ---
class CustomDesignBase(BaseModel):
    canvas_json: str
    preview_image_url: str
    shirt_color: str = "White"
    view: str = "front"

class CustomDesignCreate(CustomDesignBase):
    pass

class CustomDesignResponse(CustomDesignBase):
    id: str
    user_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- CART / ORDER SCHEMAS ---
class OrderItemSchema(BaseModel):
    product_id: str
    title: str
    custom_design_id: Optional[str] = None
    quantity: int
    size: str
    color: str
    price: float

class OrderCreate(BaseModel):
    items: str  # raw JSON string of List[OrderItemSchema]
    shipping_address: str  # raw JSON string of AddressSchema
    gst_number: Optional[str] = None
    coupon_code: Optional[str] = None
    payment_method: str = "COD"  # "COD" or "Razorpay"
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None

class OrderUpdateStatus(BaseModel):
    order_status: str
    tracking_number: Optional[str] = None

class OrderResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    items: str
    shipping_address: str
    gst_number: Optional[str] = None
    coupon_code: Optional[str] = None
    total_amount: float
    discount_amount: float
    payment_method: str
    payment_status: str
    order_status: str
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    tracking_number: Optional[str] = None
    invoice_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- COUPON SCHEMAS ---
class CouponCreate(BaseModel):
    code: str
    discount_type: str = "percentage"  # "percentage" or "flat"
    value: float
    min_order_amount: float = 0.0
    is_active: bool = True
    expires_at: Optional[datetime] = None

class CouponResponse(CouponCreate):
    id: str

    class Config:
        from_attributes = True

class ReviewCreate(BaseModel):
    product_id: str
    user_name: str
    rating: float
    comment: Optional[str] = None

class ReviewResponse(ReviewCreate):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    revenue: float
    orders_count: int
    users_count: int
    designs_count: int
    sales_data: List[Dict[str, Any]]
