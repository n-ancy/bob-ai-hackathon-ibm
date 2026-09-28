from fastapi import APIRouter
from typing import List
from app.models.schemas import FraudPattern
from app.services.pattern_service import FraudPatternDetector

router = APIRouter(prefix="/cases", tags=["Fraud Patterns"])

@router.get("/{case_id}/patterns", response_model=List[FraudPattern])
def get_case_fraud_patterns(case_id: str):
    return FraudPatternDetector.detect_patterns(case_id)
