from fastapi import APIRouter
from typing import List
from app.models.schemas import TimelineEvent
from app.services.timeline_service import TimelineService

router = APIRouter(prefix="/cases", tags=["Timeline"])

@router.get("/{case_id}/timeline", response_model=List[TimelineEvent])
def get_case_timeline(case_id: str):
    return TimelineService.get_case_timeline(case_id)
