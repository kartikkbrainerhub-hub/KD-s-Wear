import json
import logging
from datetime import datetime, timedelta
from app.database import SessionLocal, Base, engine
from app.models.category import Category
from app.models.product import Product
from app.models.coupon import Coupon, Review

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("DatabaseSeeder")

def seed_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # 1. Clear existing database values for clean seeding
    logger.info("Cleaning up old database values...")
    db.query(Review).delete()
    db.query(Product).delete()
    db.query(Category).delete()
    db.query(Coupon).delete()
    db.commit()
    
    # 2. Seed Categories
    logger.info("Seeding Categories...")
    oversized = Category(
        name="Oversized Streetwear",
        slug="oversized-streetwear",
        description="Premium heavy-cotton drop shoulder tees designed for contemporary boxy draping.",
        image_url="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60"
    )
    minimalist = Category(
        name="Minimalist Collection",
        slug="minimalist-collection",
        description="Clean, sophisticated styling utilizing premium flat embroideries and typography.",
        image_url="https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&auto=format&fit=crop&q=60"
    )
    graphics = Category(
        name="Vintage Graphic Tees",
        slug="vintage-graphics",
        description="Distressed details, retro halftones, and bold statement canvas prints.",
        image_url="https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500&auto=format&fit=crop&q=60"
    )
    
    db.add_all([oversized, minimalist, graphics])
    db.commit()
    db.refresh(oversized)
    db.refresh(minimalist)
    db.refresh(graphics)
    
    # 3. Seed Products
    logger.info("Seeding Products...")
    
    sizes = json.dumps(["S", "M", "L", "XL", "XXL"])
    colors = json.dumps([
        {"name": "Carbon Black", "hex": "#0a0a0a"},
        {"name": "Off White", "hex": "#f4f4f5"},
        {"name": "Sage Green", "hex": "#708090"},
        {"name": "Crimson Wine", "hex": "#722f37"}
    ])
    
    # Customizable Blank T-Shirt base
    custom_blank = Product(
        title="Custom Designer Heavyweight Blank Tee",
        description="Our heavy 240GSM cotton blank, ready for your custom graphic placement. Select your canvas colors, text, and logos in the editor.",
        base_price=699.00,
        category_id=oversized.id,
        sizes=sizes,
        colors=colors,
        images=json.dumps([
            "/images/products/blank_tee_black.png",
            "/images/products/blank_tee_white.png"
        ]),
        inventory=100,
        ratings=4.8,
        is_customizable=True
    )
    
    # Premium Finished Pre-made Products
    neon_overdrive = Product(
        title="Neon Overdrive Oversized Graphic Tee",
        description="Featuring high-contrast retro halftone cyberpunk canvas graphics. Screen printed in bright Tokyo-neon shades on dense charcoal knit cotton.",
        base_price=999.00,
        category_id=graphics.id,
        sizes=sizes,
        colors=json.dumps([
            {"name": "Charcoal Grey", "hex": "#2e2e2e"},
            {"name": "Neon Pink", "hex": "#ff1493"}
        ]),
        images=json.dumps([
            "/images/products/neon_tee.png"
        ]),
        inventory=45,
        ratings=4.9,
        is_customizable=False
    )
    
    sacred_lotus = Product(
        title="Sacred Lotus Minimalist T-Shirt",
        description="A beautiful, ultra-fine white thread flat embroidery design centered on the chest. Designed for premium daily wear and absolute aesthetic balance.",
        base_price=899.00,
        category_id=minimalist.id,
        sizes=sizes,
        colors=json.dumps([
            {"name": "Off White", "hex": "#f4f4f5"},
            {"name": "Carbon Black", "hex": "#0a0a0a"}
        ]),
        images=json.dumps([
            "/images/products/lotus_tee.png"
        ]),
        inventory=30,
        ratings=4.7,
        is_customizable=False
    )
    
    vintage_wash = Product(
        title="1995 Vintage Acid-Wash Graphic Tee",
        description="Heavy stone-washed faded streetwear essential featuring distressed vintage brand emblems. Unique textures across every piece.",
        base_price=1199.00,
        category_id=graphics.id,
        sizes=sizes,
        colors=json.dumps([
            {"name": "Acid Wash Grey", "hex": "#3d3d3d"}
        ]),
        images=json.dumps([
            "/images/products/blank_tee_black.png"
        ]),
        inventory=25,
        ratings=4.6,
        is_customizable=False
    )
    
    db.add_all([custom_blank, neon_overdrive, sacred_lotus, vintage_wash])
    db.commit()
    db.refresh(custom_blank)
    db.refresh(neon_overdrive)
    db.refresh(sacred_lotus)
    db.refresh(vintage_wash)
    
    # 4. Seed Reviews
    logger.info("Seeding Reviews...")
    review1 = Review(
        product_id=neon_overdrive.id,
        user_name= "Kartik S.",
        rating=5.0,
        comment="Absolutely mindblowing print quality! Heavy cotton feels very premium. Buying another color tomorrow."
    )
    review2 = Review(
        product_id=neon_overdrive.id,
        user_name= "Ajay K.",
        rating=4.8,
        comment="Fit is perfectly boxy and oversized. The colors stand out so well. Fast delivery too."
    )
    review3 = Review(
        product_id=sacred_lotus.id,
        user_name= "Priya R.",
        rating=4.5,
        comment="Minimalist embroidery is very elegant and clean. Great stitching quality."
    )
    db.add_all([review1, review2, review3])
    
    # 5. Seed Coupons
    logger.info("Seeding Coupons...")
    c1 = Coupon(
        code="KORA10",
        discount_type="percentage",
        value=10.0,
        min_order_amount=500.0,
        is_active=True,
        expires_at=datetime.utcnow() + timedelta(days=90)
    )
    c2 = Coupon(
        code="FIRSTORDER",
        discount_type="flat",
        value=150.0,
        min_order_amount=1000.0,
        is_active=True,
        expires_at=datetime.utcnow() + timedelta(days=90)
    )
    db.add_all([c1, c2])
    
    db.commit()
    logger.info("Database seeding successfully completed!")
    db.close()

if __name__ == "__main__":
    seed_db()
