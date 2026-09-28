from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import Dict, Any, List
from app.services.ingestion_service import IngestionService

router = APIRouter(prefix="/cases", tags=["Ingestion"])

@router.post("/{case_id}/ingest")
async def ingest_single_file(case_id: str, file: UploadFile = File(...)) -> Dict[str, Any]:
    content_bytes = await file.read()
    filename = file.filename or "unknown.txt"
    res = IngestionService.process_file(content_bytes, filename, case_id)
    return {"case_id": case_id, "filename": filename, "result": res}

@router.post("/{case_id}/ingest-multiple")
async def ingest_multiple_files(case_id: str, files: List[UploadFile] = File(...)) -> Dict[str, Any]:
    """Batch upload multiple intelligence files or an entire folder of case files."""
    results = []
    total_entities = 0
    total_relationships = 0

    for file in files:
        content_bytes = await file.read()
        filename = file.filename or "unknown.txt"
        res = IngestionService.process_file(content_bytes, filename, case_id)
        total_entities += res.get("entities_discovered", 0)
        total_relationships += res.get("relationships_discovered", 0)
        results.append({"filename": filename, "result": res})

    return {
        "case_id": case_id,
        "total_files": len(files),
        "total_entities_discovered": total_entities,
        "total_relationships_discovered": total_relationships,
        "file_details": results
    }
