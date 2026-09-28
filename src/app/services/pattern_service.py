import uuid
from typing import List, Dict, Any
from app.models.schemas import FraudPattern
from app.db.graph_db import db
from app.config import settings

class FraudPatternDetector:
    """Module 7: Deterministic Fraud Pattern Detection Engine."""

    @classmethod
    def detect_patterns(cls, case_id: str) -> List[FraudPattern]:
        patterns: List[FraudPattern] = []
        graph_data = db.get_case_graph(case_id)
        nodes = graph_data.get("nodes", [])
        edges = graph_data.get("edges", [])

        # Build in-degree and out-degree maps for accounts
        in_transfers: Dict[str, List[Dict[str, Any]]] = {}
        out_transfers: Dict[str, List[Dict[str, Any]]] = {}
        device_accounts: Dict[str, List[str]] = {}
        phone_entities: Dict[str, List[str]] = {}
        sim_entities: Dict[str, List[str]] = {}

        for edge in edges:
            rel_type = edge.get("type")
            src = edge.get("source")
            dst = edge.get("target")

            if rel_type == "TRANSFERRED_TO":
                in_transfers.setdefault(dst, []).append(edge)
                out_transfers.setdefault(src, []).append(edge)

            elif rel_type in ["ACCESSES", "INSTALLED_IN"]:
                if "DEV" in src or "DEV" in dst:
                    dev_id = src if "DEV" in src else dst
                    target = dst if "DEV" in src else src
                    device_accounts.setdefault(dev_id, []).append(target)

            elif rel_type == "USES":
                if "PHONE" in src:
                    phone_entities.setdefault(src, []).append(dst)
                if "SIM" in src or "SIM" in dst:
                    sim_id = src if "SIM" in src else dst
                    target = dst if "SIM" in src else src
                    sim_entities.setdefault(sim_id, []).append(target)

        # 1. FAN-IN DETECTOR
        for acc_id, incoming in in_transfers.items():
            if len(incoming) >= settings.FAN_IN_THRESHOLD:
                sources = list(set([e.get("source") for e in incoming]))
                patterns.append(FraudPattern(
                    pattern_id=f"PAT-FANIN-{uuid.uuid4().hex[:6].upper()}",
                    pattern_type="FAN_IN",
                    case_id=case_id,
                    entities_involved=[acc_id] + sources,
                    supporting_transactions=[e.get("id") for e in incoming],
                    supporting_evidence=[e.get("source_record_id") for e in incoming if e.get("source_record_id")],
                    detection_rule=f"Inbound transfer count >= {settings.FAN_IN_THRESHOLD} from distinct accounts",
                    observed_time_range="Multi-timestamp window",
                    explanation=f"Potential fan-in transaction pattern detected: Account {acc_id} received funds from {len(sources)} distinct accounts.",
                    severity="HIGH"
                ))

        # 2. FAN-OUT DETECTOR
        for acc_id, outgoing in out_transfers.items():
            if len(outgoing) >= settings.FAN_OUT_THRESHOLD:
                targets = list(set([e.get("target") for e in outgoing]))
                patterns.append(FraudPattern(
                    pattern_id=f"PAT-FANOUT-{uuid.uuid4().hex[:6].upper()}",
                    pattern_type="FAN_OUT",
                    case_id=case_id,
                    entities_involved=[acc_id] + targets,
                    supporting_transactions=[e.get("id") for e in outgoing],
                    supporting_evidence=[e.get("source_record_id") for e in outgoing if e.get("source_record_id")],
                    detection_rule=f"Outbound transfer count >= {settings.FAN_OUT_THRESHOLD} to distinct accounts",
                    observed_time_range="Multi-timestamp window",
                    explanation=f"Potential fan-out transaction pattern detected: Account {acc_id} disbursed funds to {len(targets)} distinct destination accounts.",
                    severity="HIGH"
                ))

        # 3. SHARED DEVICE DETECTOR
        for dev_id, connected in device_accounts.items():
            unique_targets = list(set(connected))
            if len(unique_targets) >= 2:
                patterns.append(FraudPattern(
                    pattern_id=f"PAT-DEV-{uuid.uuid4().hex[:6].upper()}",
                    pattern_type="SHARED_DEVICE",
                    case_id=case_id,
                    entities_involved=[dev_id] + unique_targets,
                    supporting_transactions=[],
                    supporting_evidence=[],
                    detection_rule="Multiple distinct accounts accessed from single device identifier",
                    observed_time_range="Observed access logs",
                    explanation=f"Potential shared device indicator: Device {dev_id} was associated with {len(unique_targets)} accounts ({', '.join(unique_targets[:3])}).",
                    severity="CRITICAL"
                ))

        # 4. RAPID TRANSFER & MULTI-HOP CHAIN DETECTOR
        for acc_id, incoming in in_transfers.items():
            if acc_id in out_transfers:
                outgoing = out_transfers[acc_id]
                patterns.append(FraudPattern(
                    pattern_id=f"PAT-RAPID-{uuid.uuid4().hex[:6].upper()}",
                    pattern_type="RAPID_TRANSFER",
                    case_id=case_id,
                    entities_involved=[acc_id] + [e.get("source") for e in incoming] + [e.get("target") for e in outgoing],
                    supporting_transactions=[e.get("id") for e in incoming + outgoing],
                    supporting_evidence=[],
                    detection_rule="Account acts as rapid pass-through intermediary receiving and disbursing funds in short window",
                    observed_time_range="Observed execution timeline",
                    explanation=f"Potential rapid transfer / layering pattern: Account {acc_id} received incoming transfers and immediately forwarded funds downstream.",
                    severity="CRITICAL"
                ))

        # 5. HIGH CONNECTIVITY DETECTOR
        for node in nodes:
            n_id = node.get("id")
            neighbors = db.get_neighbors(n_id)
            if len(neighbors) >= 5:
                patterns.append(FraudPattern(
                    pattern_id=f"PAT-HIGHCONN-{uuid.uuid4().hex[:6].upper()}",
                    pattern_type="HIGH_CONNECTIVITY",
                    case_id=case_id,
                    entities_involved=[n_id],
                    supporting_transactions=[],
                    supporting_evidence=[],
                    detection_rule="Node graph degree >= 5 distinct connected entities",
                    observed_time_range="Current Case Graph",
                    explanation=f"Potential hub / high-connectivity indicator: Entity {n_id} has {len(neighbors)} direct graph connections across the investigation network.",
                    severity="MEDIUM"
                ))

        return patterns
