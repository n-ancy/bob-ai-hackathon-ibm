from typing import List
from app.models.schemas import TimelineEvent
from app.db.graph_db import db

class TimelineService:
    """Module 10: Investigation Timeline Correlation Service."""

    @classmethod
    def get_case_timeline(cls, case_id: str) -> List[TimelineEvent]:
        timeline: List[TimelineEvent] = []
        graph_data = db.get_case_graph(case_id)
        edges = graph_data.get("edges", [])

        idx = 1
        for edge in edges:
            timestamp = edge.get("timestamp") or "2026-09-01T10:00:00"
            rel_type = edge.get("type", "ACTIVITY")
            src = edge.get("source")
            dst = edge.get("target")

            event_type = "TRANSACTION" if rel_type == "TRANSFERRED_TO" else ("CALL" if rel_type == "CALLED" else "DEVICE_ACTIVITY")
            details = f"Observed {rel_type} relationship from {src} to {dst}"

            timeline.append(TimelineEvent(
                event_id=f"EVT-{idx:04d}",
                case_id=case_id,
                timestamp=timestamp,
                event_type=event_type,
                source_entity=src,
                target_entity=dst,
                amount=edge.get("amount"),
                source_record_id=edge.get("source_record_id", f"REC-{idx}"),
                evidence_id=f"EV-{edge.get('id', '000')}",
                details=details
            ))
            idx += 1

        # Sort chronologically
        timeline.sort(key=lambda x: x.timestamp)
        return timeline
