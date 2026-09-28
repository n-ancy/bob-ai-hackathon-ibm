import logging
import networkx as nx
from typing import Dict, List, Any, Optional
from app.config import settings
from app.models.schemas import Entity, Relationship, EntityType, RelationshipType

logger = logging.getLogger("CFNA.DB")

class InMemGraphDB:
    """High-performance NetworkX graph store for immediate zero-dependency execution."""
    def __init__(self):
        self.graph = nx.MultiDiGraph()
        self.entities: Dict[str, Entity] = {}
        self.relationships: Dict[str, Relationship] = {}

    def add_entity(self, entity: Entity):
        self.entities[entity.entity_id] = entity
        self.graph.add_node(
            entity.entity_id,
            entity_type=entity.entity_type.value if hasattr(entity.entity_type, 'value') else entity.entity_type,
            normalized_value=entity.normalized_value,
            original_value=entity.original_value,
            case_id=entity.case_id,
            attributes=entity.attributes
        )

    def add_relationship(self, rel: Relationship):
        self.relationships[rel.relationship_id] = rel
        # Ensure nodes exist
        if rel.source_entity not in self.graph:
            self.graph.add_node(rel.source_entity, entity_type="Unknown", case_id=rel.case_id)
        if rel.target_entity not in self.graph:
            self.graph.add_node(rel.target_entity, entity_type="Unknown", case_id=rel.case_id)
            
        self.graph.add_edge(
            rel.source_entity,
            rel.target_entity,
            key=rel.relationship_id,
            relationship_type=rel.relationship_type.value if hasattr(rel.relationship_type, 'value') else rel.relationship_type,
            case_id=rel.case_id,
            timestamp=rel.timestamp,
            confidence=rel.confidence,
            source_record_id=rel.source_record_id
        )

    def get_case_graph(self, case_id: str) -> Dict[str, Any]:
        nodes = []
        for n, data in self.graph.nodes(data=True):
            if data.get("case_id") == case_id or not case_id:
                ent = self.entities.get(n)
                nodes.append({
                    "id": n,
                    "label": data.get("normalized_value", n),
                    "type": data.get("entity_type", "Unknown"),
                    "original": data.get("original_value", n),
                    "case_id": data.get("case_id", case_id),
                    "attributes": data.get("attributes", {})
                })
        
        edges = []
        for u, v, k, data in self.graph.edges(keys=True, data=True):
            if data.get("case_id") == case_id or not case_id:
                edges.append({
                    "id": k,
                    "source": u,
                    "target": v,
                    "type": data.get("relationship_type", "CONNECTED"),
                    "timestamp": data.get("timestamp"),
                    "confidence": data.get("confidence", 1.0),
                    "source_record_id": data.get("source_record_id", "")
                })
        return {"nodes": nodes, "edges": edges}

    def get_neighbors(self, entity_id: str) -> List[Dict[str, Any]]:
        if entity_id not in self.graph:
            return []
        neighbors = []
        # Successors
        for successor in self.graph.successors(entity_id):
            edge_data = self.graph.get_edge_data(entity_id, successor)
            for k, d in edge_data.items():
                neighbors.append({
                    "entity_id": successor,
                    "direction": "OUTGOING",
                    "relationship_id": k,
                    "relationship_type": d.get("relationship_type"),
                    "entity": self.entities.get(successor)
                })
        # Predecessors
        for predecessor in self.graph.predecessors(entity_id):
            edge_data = self.graph.get_edge_data(predecessor, entity_id)
            for k, d in edge_data.items():
                neighbors.append({
                    "entity_id": predecessor,
                    "direction": "INCOMING",
                    "relationship_id": k,
                    "relationship_type": d.get("relationship_type"),
                    "entity": self.entities.get(predecessor)
                })
        return neighbors

    def get_shortest_path(self, source_id: str, target_id: str) -> Optional[List[str]]:
        try:
            # Undirected view for path discovery
            undirected = self.graph.to_undirected()
            return nx.shortest_path(undirected, source=source_id, target=target_id)
        except Exception as e:
            logger.warning(f"No path between {source_id} and {target_id}: {e}")
            return None

class Neo4jGraphDB:
    """Neo4j Database Manager."""
    def __init__(self):
        self.driver = None
        self.connected = False
        try:
            from neo4j import GraphDatabase
            self.driver = GraphDatabase.driver(
                settings.NEO4J_URI,
                auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD)
            )
            # Verify connectivity
            self.driver.verify_connectivity()
            self.connected = True
            logger.info("Successfully connected to Neo4j database.")
        except Exception as e:
            logger.info(f"Neo4j connection disabled/unavailable ({e}). Using NetworkX graph engine fallback.")
            self.connected = False

    def close(self):
        if self.driver:
            self.driver.close()

db = InMemGraphDB()
neo4j_db = Neo4jGraphDB()
