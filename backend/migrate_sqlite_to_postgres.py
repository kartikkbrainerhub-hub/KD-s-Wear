import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base, SessionLocal
from app.models.user import User
from app.models.design import CustomDesign
from app.models.product import Product
from app.models.category import Category
from app.models.order import Order
from app.models.coupon import Coupon, Review

def migrate():
    sqlite_url = "sqlite:///./ajay_wear.db"
    if not os.path.exists("ajay_wear.db"):
        print("SQLite database 'ajay_wear.db' does not exist. No data to migrate.")
        return

    print("Connecting to fallback SQLite database...")
    sqlite_engine = create_engine(sqlite_url)
    SQLiteSession = sessionmaker(bind=sqlite_engine)
    sqlite_db = SQLiteSession()

    print("Connecting to active PostgreSQL database...")
    postgres_db = SessionLocal()

    try:
        # 1. Migrate Users
        print("\n--- Migrating Users ---")
        sqlite_users = sqlite_db.execute(sqlite_db.query(User.id, User.email, User.name, User.hashed_password, User.role, User.phone, User.addresses, User.wishlist, User.created_at).statement).fetchall()
        for su in sqlite_users:
            exists = postgres_db.query(User).filter(User.id == su.id).first()
            if not exists:
                exists_email = postgres_db.query(User).filter(User.email == su.email).first()
                if exists_email:
                    print(f"Skipping user {su.email} (Email conflict in Postgres)")
                    continue
                db_user = User(
                    id=su.id,
                    email=su.email,
                    name=su.name,
                    hashed_password=su.hashed_password,
                    role=su.role,
                    phone=su.phone,
                    addresses=su.addresses,
                    wishlist=su.wishlist,
                    created_at=su.created_at
                )
                postgres_db.add(db_user)
                print(f"Migrated User: {su.name} ({su.email})")
            else:
                print(f"User {su.email} already exists in Postgres.")

        postgres_db.commit()

        # 2. Migrate Custom Designs
        print("\n--- Migrating Custom Designs ---")
        sqlite_designs = sqlite_db.execute(sqlite_db.query(CustomDesign.id, CustomDesign.user_id, CustomDesign.canvas_json, CustomDesign.preview_image_url, CustomDesign.shirt_color, CustomDesign.view, CustomDesign.created_at).statement).fetchall()
        for sd in sqlite_designs:
            exists = postgres_db.query(CustomDesign).filter(CustomDesign.id == sd.id).first()
            if not exists:
                # Check if user exists in Postgres to satisfy Foreign Key Constraint
                user_exists = postgres_db.query(User).filter(User.id == sd.user_id).first() if sd.user_id else None
                db_design = CustomDesign(
                    id=sd.id,
                    user_id=sd.user_id if user_exists else None,
                    canvas_json=sd.canvas_json,
                    preview_image_url=sd.preview_image_url,
                    shirt_color=sd.shirt_color,
                    view=sd.view,
                    created_at=sd.created_at
                )
                postgres_db.add(db_design)
                print(f"Migrated Custom Design: {sd.id} (Color: {sd.shirt_color})")
            else:
                print(f"Design {sd.id} already exists in Postgres.")

        postgres_db.commit()

        # 3. Migrate Orders
        print("\n--- Migrating Orders ---")
        try:
            sqlite_orders = sqlite_db.execute(sqlite_db.query(Order.id, Order.user_id, Order.items, Order.total_amount, Order.shipping_address, Order.payment_method, Order.payment_status, Order.order_status, Order.created_at).statement).fetchall()
            for so in sqlite_orders:
                exists = postgres_db.query(Order).filter(Order.id == so.id).first()
                if not exists:
                    user_exists = postgres_db.query(User).filter(User.id == so.user_id).first() if so.user_id else None
                    db_order = Order(
                        id=so.id,
                        user_id=so.user_id if user_exists else None,
                        items=so.items,
                        total_amount=so.total_amount,
                        shipping_address=so.shipping_address,
                        payment_method=so.payment_method,
                        payment_status=so.payment_status,
                        order_status=so.order_status,
                        created_at=so.created_at
                    )
                    postgres_db.add(db_order)
                    print(f"Migrated Order: {so.id}")
                else:
                    print(f"Order {so.id} already exists in Postgres.")
            postgres_db.commit()
        except Exception as oe:
            print(f"Could not migrate orders: {oe}")

        print("\nDatabase migration completed successfully!")

    except Exception as e:
        postgres_db.rollback()
        print(f"\nMigration failed: {e}")
    finally:
        sqlite_db.close()
        postgres_db.close()

if __name__ == "__main__":
    migrate()
