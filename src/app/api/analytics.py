from fastapi import APIRouter
from app.models.schemas import NetworkAnalytics
from app.services.analytics_service import NetworkAnalyticsEngine

router = APIRouter(prefix="/cases", tags=["Network Analytics"])

@router.get("/{case_id}/analytics", response_model=NetworkAnalytics)
def get_case_analytics(case_id: str):
    return NetworkAnalyticsEngine.calculate_analytics(case_id)
