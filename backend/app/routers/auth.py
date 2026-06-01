import json
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.schemas import UserCreate, UserLogin, UserResponse, Token
from app.utils.security import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )
    
    # Hash password and create user
    hashed_pw = get_password_hash(user_in.password)
    db_user = User(
        email=user_in.email,
        hashed_password=hashed_pw,
        name=user_in.name,
        phone=user_in.phone,
        role="user"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Generate token
    token = create_access_token(subject=db_user.id)
    return {"access_token": token, "token_type": "bearer", "user": db_user}

@router.post("/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password."
        )
    
    token = create_access_token(subject=user.id)
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.get("/profile", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserResponse)
def update_profile(
    name: str, 
    phone: str = None, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    current_user.name = name
    if phone is not None:
        current_user.phone = phone
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/address", response_model=UserResponse)
def add_address(address: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        addr_list = json.loads(current_user.addresses or "[]")
    except Exception:
        addr_list = []
    
    # If this address is set as default, remove default flag from others
    if address.get("is_default"):
        for a in addr_list:
            a["is_default"] = False
            
    addr_list.append(address)
    current_user.addresses = json.dumps(addr_list)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.delete("/address/{index}", response_model=UserResponse)
def remove_address(index: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        addr_list = json.loads(current_user.addresses or "[]")
    except Exception:
        addr_list = []
        
    if 0 <= index < len(addr_list):
        addr_list.pop(index)
        
    current_user.addresses = json.dumps(addr_list)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/wishlist/{product_id}", response_model=UserResponse)
def toggle_wishlist(product_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        w_list = json.loads(current_user.wishlist or "[]")
    except Exception:
        w_list = []
        
    if product_id in w_list:
        w_list.remove(product_id)
    else:
        w_list.append(product_id)
        
    current_user.wishlist = json.dumps(w_list)
    db.commit()
    db.refresh(current_user)
    return current_user
