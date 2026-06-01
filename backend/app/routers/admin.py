import json
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.product import Product
from app.models.category import Category
from app.models.order import Order
from app.models.design import CustomDesign
from app.models.coupon import Coupon
from app.schemas.schemas import (
    ProductCreate, ProductResponse, 
    CategoryCreate, CategoryResponse, 
    OrderResponse, OrderUpdateStatus, 
    CouponCreate, CouponResponse, DashboardStats
)
from app.utils.security import get_current_admin

router = APIRouter(prefix="/admin", tags=["Admin Operations"], dependencies=[Depends(get_current_admin)])

# --- DASHBOARD STATISTICS ---
@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    # Calculate gross revenue from paid or processing orders
    revenue_sum = db.query(func.sum(Order.total_amount)).filter(
        (Order.payment_status == "Paid") | (Order.payment_method == "COD")
    ).scalar() or 0.0
    
    orders_count = db.query(Order).count()
    users_count = db.query(User).filter(User.role != "admin").count()
    designs_count = db.query(CustomDesign).count()
    
    # Generate 7 days of sales chart data
    sales_data = []
    today = datetime.utcnow().date()
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        day_str = day.strftime("%b %d")
        
        # Query total revenue for this specific date
        day_rev = db.query(func.sum(Order.total_amount)).filter(
            func.date(Order.created_at) == day,
            (Order.payment_status == "Paid") | (Order.payment_method == "COD")
        ).scalar() or 0.0
        
        day_cnt = db.query(Order).filter(func.date(Order.created_at) == day).count()
        sales_data.append({"date": day_str, "revenue": float(day_rev), "orders": day_cnt})
        
    return {
        "revenue": float(revenue_sum),
        "orders_count": orders_count,
        "users_count": users_count,
        "designs_count": designs_count,
        "sales_data": sales_data
    }

# --- PRODUCT CRUD ---
@router.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(product_in: ProductCreate, db: Session = Depends(get_db)):
    db_product = Product(
        title=product_in.title,
        description=product_in.description,
        base_price=product_in.base_price,
        category_id=product_in.category_id,
        sizes=product_in.sizes,
        colors=product_in.colors,
        images=product_in.images,
        inventory=product_in.inventory,
        is_customizable=product_in.is_customizable
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.put("/products/{product_id}", response_model=ProductResponse)
def update_product(product_id: str, product_in: ProductCreate, db: Session = Depends(get_db)):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found.")
        
    db_product.title = product_in.title
    db_product.description = product_in.description
    db_product.base_price = product_in.base_price
    db_product.category_id = product_in.category_id
    db_product.sizes = product_in.sizes
    db_product.colors = product_in.colors
    db_product.images = product_in.images
    db_product.inventory = product_in.inventory
    db_product.is_customizable = product_in.is_customizable
    
    db.commit()
    db.refresh(db_product)
    return db_product

@router.delete("/products/{product_id}", status_code=status.HTTP_200_OK)
def delete_product(product_id: str, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")
    db.delete(product)
    db.commit()
    return {"message": "Product deleted successfully."}

# --- CATEGORY CRUD ---
@router.post("/categories", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(category_in: CategoryCreate, db: Session = Depends(get_db)):
    db_cat = Category(
        name=category_in.name,
        slug=category_in.slug,
        description=category_in.description,
        image_url=category_in.image_url
    )
    db.add(db_cat)
    db.commit()
    db.refresh(db_cat)
    return db_cat

@router.delete("/categories/{cat_id}", status_code=status.HTTP_200_OK)
def delete_category(cat_id: str, db: Session = Depends(get_db)):
    cat = db.query(Category).filter(Category.id == cat_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found.")
    db.delete(cat)
    db.commit()
    return {"message": "Category deleted successfully."}

# --- ORDER STATUS MANAGEMENT ---
@router.get("/orders", response_model=List[OrderResponse])
def get_all_orders(db: Session = Depends(get_db)):
    return db.query(Order).order_by(Order.created_at.desc()).all()

@router.put("/orders/{order_id}", response_model=OrderResponse)
def update_order_status(order_id: str, status_in: OrderUpdateStatus, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")
        
    order.order_status = status_in.order_status
    if status_in.tracking_number:
        order.tracking_number = status_in.tracking_number
    db.commit()
    db.refresh(order)
    return order

# --- COUPON CRUD ---
@router.post("/coupons", response_model=CouponResponse, status_code=status.HTTP_201_CREATED)
def create_coupon(coupon_in: CouponCreate, db: Session = Depends(get_db)):
    db_coupon = Coupon(
        code=coupon_in.code,
        discount_type=coupon_in.discount_type,
        value=coupon_in.value,
        min_order_amount=coupon_in.min_order_amount,
        is_active=coupon_in.is_active,
        expires_at=coupon_in.expires_at
    )
    db.add(db_coupon)
    db.commit()
    db.refresh(db_coupon)
    return db_coupon

@router.get("/coupons", response_model=List[CouponResponse])
def get_all_coupons(db: Session = Depends(get_db)):
    return db.query(Coupon).all()
