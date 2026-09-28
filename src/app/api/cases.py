import uuid
from datetime import datetime
from typing import List
from fastapi import APIRouter, HTTPException, status
from app.models.schemas import Case, CaseCreate, CaseUpdate, CaseStatus
from app.services.seed_service import cases_db, SeedService
from app.db.graph_db import db

router = APIRouter(prefix="/cases", tags=["Cases"])

@router.get("", response_model=List[Case])
def list_cases():
    SeedService.seed_demo_case()
    for c_id, case in cases_db.items():
        graph_data = db.get_case_graph(c_id)
        case.entity_count = len(graph_data.get("nodes", []))
        case.transaction_count = len(graph_data.get("edges", []))
    return list(cases_db.values())

@router.post("", response_model=Case, status_code=status.HTTP_201_CREATED)
def create_case(case_in: CaseCreate):
    case_id = f"CFNA-CASE-{uuid.uuid4().hex[:6].upper()}"
    case_num = f"CFNA-2026-{uuid.uuid4().hex[:4].upper()}"
    now = datetime.now().isoformat()
    new_case = Case(
        case_id=case_id,
        case_number=case_num,
        title=case_in.title,
        description=case_in.description or "",
        investigator=case_in.investigator,
        status=CaseStatus.OPEN,
        created_at=now,
        updated_at=now,
        tags=case_in.tags
    )
    cases_db[case_id] = new_case
    return new_case

@router.get("/{case_id}", response_model=Case)
def get_case(case_id: str):
    SeedService.seed_demo_case()
    if case_id not in cases_db:
        raise HTTPException(status_code=404, detail="Case not found")
    c = cases_db[case_id]
    graph_data = db.get_case_graph(case_id)
    c.entity_count = len(graph_data.get("nodes", []))
    c.transaction_count = len(graph_data.get("edges", []))
    return c

@router.patch("/{case_id}", response_model=Case)
def update_case(case_id: str, case_in: CaseUpdate):
    if case_id not in cases_db:
        raise HTTPException(status_code=404, detail="Case not found")
    c = cases_db[case_id]
    if case_in.title is not None:
        c.title = case_in.title
    if case_in.description is not None:
        c.description = case_in.description
    if case_in.status is not None:
        c.status = case_in.status
    if case_in.investigator is not None:
        c.investigator = case_in.investigator
    c.updated_at = datetime.now().isoformat()
    return c

@router.delete("/{case_id}")
def archive_case(case_id: str):
    if case_id not in cases_db:
        raise HTTPException(status_code=404, detail="Case not found")
    cases_db[case_id].status = CaseStatus.ARCHIVED
    return {"message": f"Case {case_id} marked as ARCHIVED"}
