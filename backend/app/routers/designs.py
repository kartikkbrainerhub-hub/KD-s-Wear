import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.design import CustomDesign
from app.models.order import Order
from app.schemas.schemas import CustomDesignCreate, CustomDesignResponse
from app.utils.security import get_current_user

router = APIRouter(prefix="/designs", tags=["Custom Canvas Designs"])

@router.post("", response_model=CustomDesignResponse, status_code=status.HTTP_201_CREATED)
def save_design(
    design_in: CustomDesignCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_design = CustomDesign(
        user_id=current_user.id,
        canvas_json=design_in.canvas_json,
        preview_image_url=design_in.preview_image_url,
        shirt_color=design_in.shirt_color,
        view=design_in.view
    )
    db.add(db_design)
    db.commit()
    db.refresh(db_design)
    return db_design

@router.put("/{design_id}", response_model=CustomDesignResponse)
def update_design(
    design_id: str,
    design_in: CustomDesignCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    design = db.query(CustomDesign).filter(
        CustomDesign.id == design_id,
        CustomDesign.user_id == current_user.id
    ).first()
    
    if not design:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Design not found or access denied."
        )
    
    design.canvas_json = design_in.canvas_json
    design.preview_image_url = design_in.preview_image_url
    design.shirt_color = design_in.shirt_color
    design.view = design_in.view
    
    db.commit()
    db.refresh(design)
    return design

@router.get("/feed", response_model=List[CustomDesignResponse])
def get_public_design_feed(
    db: Session = Depends(get_db)
):
    # Fetch all confirmed orders (either paid online or cash on delivery)
    confirmed_orders = db.query(Order).filter(
        (Order.payment_status == "Paid") | (Order.payment_method == "COD")
    ).all()
    
    ordered_design_ids = set()
    for order in confirmed_orders:
        try:
            items_list = json.loads(order.items)
            for item in items_list:
                design_id = item.get("custom_design_id")
                if design_id:
                    ordered_design_ids.add(design_id)
        except Exception:
            continue
            
    if not ordered_design_ids:
        return []
        
    return db.query(CustomDesign).filter(
        CustomDesign.id.in_(list(ordered_design_ids))
    ).order_by(CustomDesign.created_at.desc()).limit(24).all()

@router.get("", response_model=List[CustomDesignResponse])
def get_user_designs(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(CustomDesign).filter(CustomDesign.user_id == current_user.id).order_by(CustomDesign.created_at.desc()).all()

@router.get("/{design_id}", response_model=CustomDesignResponse)
def get_design_by_id(
    design_id: str,
    db: Session = Depends(get_db)
):
    design = db.query(CustomDesign).filter(CustomDesign.id == design_id).first()
    if not design:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Design not found."
        )
    return design

@router.delete("/{design_id}", status_code=status.HTTP_200_OK)
def delete_design(
    design_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    design = db.query(CustomDesign).filter(
        CustomDesign.id == design_id, 
        CustomDesign.user_id == current_user.id
    ).first()
    
    if not design:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Design not found or access denied."
        )
        
    db.delete(design)
    db.commit()
    return {"message": "Design deleted successfully."}
