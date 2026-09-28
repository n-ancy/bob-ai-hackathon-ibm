from fastapi import APIRouter
from app.models.schemas import AIQuery, AIResponse
from app.services.ai_service import AIInvestigationAssistant

router = APIRouter(prefix="/ai", tags=["AI Assistant"])

@router.post("/query", response_model=AIResponse)
def query_ai_assistant(query_in: AIQuery):
    return AIInvestigationAssistant.query(query_in)
