import uuid
from typing import List
from app.models.schemas import RoleIndicator, RoleType
from app.db.graph_db import db
from app.services.analytics_service import NetworkAnalyticsEngine

class RoleIndicatorEngine:
    """Module 9: Explainable Cyber Network Role Indicator Engine."""

    @classmethod
    def evaluate_roles(cls, case_id: str) -> List[RoleIndicator]:
        indicators: List[RoleIndicator] = []
        analytics = NetworkAnalyticsEngine.calculate_analytics(case_id)
        graph_data = db.get_case_graph(case_id)

        in_degree_map = {}
        out_degree_map = {}

        for edge in graph_data.get("edges", []):
            if edge.get("type") == "TRANSFERRED_TO":
                src = edge.get("source")
                dst = edge.get("target")
                out_degree_map[src] = out_degree_map.get(src, 0) + 1
                in_degree_map[dst] = in_degree_map.get(dst, 0) + 1

        for ent in analytics.top_centrality_entities:
            e_id = ent.entity_id

            # 1. POTENTIAL COORDINATOR INDICATOR
            if ent.betweenness > 0.15 or ent.degree > 0.2:
                indicators.append(RoleIndicator(
                    indicator_id=f"ROLE-COORD-{uuid.uuid4().hex[:6].upper()}",
                    entity_id=e_id,
                    role_type=RoleType.POTENTIAL_COORDINATOR,
                    confidence_score=min(0.95, round(0.6 + ent.betweenness * 0.8, 2)),
                    explanation=f"Entity {e_id} exhibits structural coordinator traits: high betweenness centrality ({ent.betweenness}) and acts as a pivotal bridge across distinct sub-clusters.",
                    supporting_entities=[e_id],
                    supporting_transactions=[],
                    supporting_evidence=[],
                    limitations="Analytical lead based on graph topology. Requires verification of legal ownership and user credentials."
                ))

            # 2. POTENTIAL MULE INDICATOR
            in_cnt = in_degree_map.get(e_id, 0)
            out_cnt = out_degree_map.get(e_id, 0)
            if (in_cnt >= 2 and out_cnt >= 1) or (in_cnt >= 1 and out_cnt >= 2):
                indicators.append(RoleIndicator(
                    indicator_id=f"ROLE-MULE-{uuid.uuid4().hex[:6].upper()}",
                    entity_id=e_id,
                    role_type=RoleType.POTENTIAL_MULE,
                    confidence_score=min(0.92, round(0.5 + (in_cnt + out_cnt) * 0.1, 2)),
                    explanation=f"Entity {e_id} exhibits intermediary financial mule traits: received transfers from {in_cnt} source(s) and rapidly disbursed to {out_cnt} target(s).",
                    supporting_entities=[e_id],
                    supporting_transactions=[],
                    supporting_evidence=[],
                    limitations="High turnover indicator. Confirm whether entity is an authorized business gateway or compromised account."
                ))

            # 3. POTENTIAL VICTIM INDICATOR
            if in_cnt == 0 and out_cnt >= 1 and ent.betweenness < 0.05:
                indicators.append(RoleIndicator(
                    indicator_id=f"ROLE-VICTIM-{uuid.uuid4().hex[:6].upper()}",
                    entity_id=e_id,
                    role_type=RoleType.POTENTIAL_VICTIM,
                    confidence_score=0.88,
                    explanation=f"Entity {e_id} acts solely as an outflow origin node with low graph connectivity, typical of reported fraud victim accounts.",
                    supporting_entities=[e_id],
                    supporting_transactions=[],
                    supporting_evidence=[],
                    limitations="Based on un-reciprocated outbound transfer. Verify complaint statements and KYC records."
                ))

        return indicators
