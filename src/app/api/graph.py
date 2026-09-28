from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from app.db.graph_db import db

router = APIRouter(prefix="", tags=["Graph Engine"])

class PathRequest(BaseModel):
    source_entity: str
    target_entity: str

@router.get("/cases/{case_id}/graph")
def get_case_graph(case_id: str) -> Dict[str, Any]:
    return db.get_case_graph(case_id)

@router.get("/entities/{entity_id}/neighbors")
def get_entity_neighbors(entity_id: str) -> List[Dict[str, Any]]:
    return db.get_neighbors(entity_id)

@router.post("/graph/shortest-path")
def find_shortest_path(req: PathRequest):
    path = db.get_shortest_path(req.source_entity, req.target_entity)
    if not path:
        return {"found": False, "message": "No observable connection path between entities", "path": []}
    
    # Format path nodes and edges
    nodes_info = []
    edges_info = []
    for i in range(len(path)):
        nodes_info.append({"id": path[i], "entity": db.entities.get(path[i])})
        if i < len(path) - 1:
            u, v = path[i], path[i+1]
            edge_data = db.graph.get_edge_data(u, v) or db.graph.get_edge_data(v, u) or {}
            edges_info.append({"source": u, "target": v, "details": edge_data})

    return {
        "found": True,
        "path_length": len(path) - 1,
        "nodes": nodes_info,
        "edges": edges_info,
        "path_sequence": path
    }
