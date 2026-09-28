from fastapi import APIRouter
from typing import List
from app.models.schemas import RoleIndicator
from app.services.role_service import RoleIndicatorEngine

router = APIRouter(prefix="/cases", tags=["Role Indicators"])

@router.get("/{case_id}/roles", response_model=List[RoleIndicator])
def get_case_roles(case_id: str):
    return RoleIndicatorEngine.evaluate_roles(case_id)
