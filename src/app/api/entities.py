from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.db.graph_db import db

router = APIRouter(prefix="", tags=["Entities"])

@router.get("/cases/{case_id}/entities")
def get_case_entities(case_id: str) -> List[Dict[str, Any]]:
    graph_data = db.get_case_graph(case_id)
    return graph_data.get("nodes", [])

@router.get("/cases/{case_id}/relationships")
def get_case_relationships(case_id: str) -> List[Dict[str, Any]]:
    graph_data = db.get_case_graph(case_id)
    return graph_data.get("edges", [])

@router.get("/entities/{entity_id}")
def get_entity_details(entity_id: str):
    ent = db.entities.get(entity_id)
    if not ent:
        # Check node
        if entity_id in db.graph:
            d = db.graph.nodes[entity_id]
            return {"entity_id": entity_id, "type": d.get("entity_type"), "normalized_value": d.get("normalized_value", entity_id)}
        raise HTTPException(status_code=404, detail="Entity not found")
    return ent
