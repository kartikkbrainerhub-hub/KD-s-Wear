import json
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.product import Product
from app.models.category import Category
from app.models.coupon import Review
from app.schemas.schemas import ProductResponse, CategoryResponse, ReviewCreate, ReviewResponse
from app.utils.security import get_current_user

router = APIRouter(tags=["Catalog & Products"])

# --- CATEGORIES ---
@router.get("/categories", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()

# --- PRODUCTS ---
@router.get("/products", response_model=List[ProductResponse])
def get_products(
    category_slug: Optional[str] = None,
    size: Optional[str] = None,
    color: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    is_customizable: Optional[bool] = None,
    q: Optional[str] = None,
    sort: Optional[str] = "newest",  # "price_asc", "price_desc", "rating", "newest"
    db: Session = Depends(get_db)
):
    query = db.query(Product)
    
    # Filter by category
    if category_slug:
        cat = db.query(Category).filter(Category.slug == category_slug).first()
        if cat:
            query = query.filter(Product.category_id == cat.id)
            
    # Filter by price range
    if min_price is not None:
        query = query.filter(Product.base_price >= min_price)
    if max_price is not None:
        query = query.filter(Product.base_price <= max_price)
        
    # Customizable flag
    if is_customizable is not None:
        query = query.filter(Product.is_customizable == is_customizable)
        
    # Text search
    if q:
        query = query.filter(
            (Product.title.ilike(f"%{q}%")) | 
            (Product.description.ilike(f"%{q}%"))
        )
        
    products = query.all()
    
    # Filter on the Python side for JSON text properties (sizes & colors) to ensure SQLite/Postgres portability
    filtered_products = []
    for p in products:
        # Size filter
        if size:
            try:
                sizes_list = json.loads(p.sizes or "[]")
                if size.upper() not in [s.upper() for s in sizes_list]:
                    continue
            except Exception:
                continue
                
        # Color filter
        if color:
            try:
                colors_list = json.loads(p.colors or "[]")
                # colors_list: [{"name": "Crimson", "hex": "#dc2626"}]
                color_names = [c["name"].lower() for c in colors_list]
                if color.lower() not in color_names:
                    continue
            except Exception:
                continue
                
        filtered_products.append(p)
        
    # Sort
    if sort == "price_asc":
        filtered_products.sort(key=lambda x: x.base_price)
    elif sort == "price_desc":
        filtered_products.sort(key=lambda x: x.base_price, reverse=True)
    elif sort == "rating":
        filtered_products.sort(key=lambda x: x.ratings, reverse=True)
    
    return filtered_products

@router.get("/products/{product_id}", response_model=ProductResponse)
def get_product(product_id: str, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found."
        )
    return product

# --- REVIEWS ---
@router.get("/products/{product_id}/reviews", response_model=List[ReviewResponse])
def get_product_reviews(product_id: str, db: Session = Depends(get_db)):
    return db.query(Review).filter(Review.product_id == product_id).order_by(Review.created_at.desc()).all()

@router.post("/products/{product_id}/reviews", response_model=ReviewResponse)
def add_product_review(
    product_id: str,
    review_in: ReviewCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found."
        )
        
    db_review = Review(
        product_id=product_id,
        user_name=current_user.name,
        rating=review_in.rating,
        comment=review_in.comment
    )
    db.add(db_review)
    
    # Recalculate average ratings
    reviews = db.query(Review).filter(Review.product_id == product_id).all()
    total_ratings = sum([r.rating for r in reviews]) + review_in.rating
    product.ratings = round(total_ratings / (len(reviews) + 1), 1)
    
    db.commit()
    db.refresh(db_review)
    return db_review
