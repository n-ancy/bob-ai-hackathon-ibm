import logging
from datetime import datetime
from app.models.schemas import Case, CaseStatus, Entity, Relationship, EntityType, RelationshipType
from app.db.graph_db import db

logger = logging.getLogger("CFNA.Seed")

cases_db = {}

class SeedService:
    """Module 17: End-to-End Synthetic Fraud Investigation Case Generator."""

    @classmethod
    def seed_demo_case(cls):
        case_id = "CFNA-DEMO-001"
        if case_id in cases_db:
            return cases_db[case_id]

        demo_case = Case(
            case_id=case_id,
            case_number="CFNA-2026-0901",
            title="UPI Fraud Network Investigation - Synthetic Case 001",
            description="End-to-end investigation case demonstrating mule accounts, fan-in transfers, rapid layering, and shared device hubs.",
            investigator="Insp. V. Sharma (Digital Forensics)",
            status=CaseStatus.UNDER_INVESTIGATION,
            created_at=datetime.now().isoformat(),
            updated_at=datetime.now().isoformat(),
            tags=["UPI_FRAUD", "MULE_NETWORK", "SHARED_DEVICE", "LAYERING"]
        )
        cases_db[case_id] = demo_case

        # 1. Victims
        for i in range(1, 6):
            v_acc = f"ACC-VICTIM-{i:02d}"
            v_ph = f"+91987654321{i}"
            db.add_entity(Entity(entity_id=f"ENT-ACC-{v_acc}", entity_type=EntityType.BankAccount, normalized_value=v_acc, original_value=v_acc, case_id=case_id))
            db.add_entity(Entity(entity_id=f"ENT-PHONE-{v_ph}", entity_type=EntityType.Phone, normalized_value=v_ph, original_value=v_ph, case_id=case_id))
            db.add_relationship(Relationship(relationship_id=f"REL-V-{i}", source_entity=f"ENT-PHONE-{v_ph}", relationship_type=RelationshipType.OWNS, target_entity=f"ENT-ACC-{v_acc}", case_id=case_id))

        # 2. Mule Tier 1 (Fan-In Receivers)
        mule_acc1 = "ACC-MULE-101"
        mule_acc2 = "ACC-MULE-102"
        mule_dev1 = "DEV-MULE-A1"
        mule_dev2 = "DEV-MULE-A2"

        db.add_entity(Entity(entity_id=f"ENT-ACC-{mule_acc1}", entity_type=EntityType.BankAccount, normalized_value=mule_acc1, original_value=mule_acc1, case_id=case_id))
        db.add_entity(Entity(entity_id=f"ENT-ACC-{mule_acc2}", entity_type=EntityType.BankAccount, normalized_value=mule_acc2, original_value=mule_acc2, case_id=case_id))
        db.add_entity(Entity(entity_id=f"ENT-DEV-{mule_dev1}", entity_type=EntityType.Device, normalized_value=mule_dev1, original_value=mule_dev1, case_id=case_id))
        db.add_entity(Entity(entity_id=f"ENT-DEV-{mule_dev2}", entity_type=EntityType.Device, normalized_value=mule_dev2, original_value=mule_dev2, case_id=case_id))

        db.add_relationship(Relationship(relationship_id="REL-DEV-M1", source_entity=f"ENT-DEV-{mule_dev1}", relationship_type=RelationshipType.ACCESSES, target_entity=f"ENT-ACC-{mule_acc1}", case_id=case_id))
        db.add_relationship(Relationship(relationship_id="REL-DEV-M2", source_entity=f"ENT-DEV-{mule_dev2}", relationship_type=RelationshipType.ACCESSES, target_entity=f"ENT-ACC-{mule_acc2}", case_id=case_id))

        # Victims transfer to Mule 101 (Fan-in)
        for i in range(1, 5):
            db.add_relationship(Relationship(
                relationship_id=f"REL-TXN-FAN-{i}",
                source_entity=f"ENT-ACC-ACC-VICTIM-{i:02d}",
                relationship_type=RelationshipType.TRANSFERRED_TO,
                target_entity=f"ENT-ACC-{mule_acc1}",
                case_id=case_id,
                timestamp=f"2026-09-01T10:{15+i}:00",
                source_record_id=f"TXN-100{i}"
            ))

        # 3. Intermediate Layering Tier (Shared Hub Device DEV-HUB-X)
        int_acc1 = "ACC-INT-201"
        int_acc2 = "ACC-INT-202"
        hub_dev = "DEV-HUB-X"
        hub_ip = "10.0.4.12"

        db.add_entity(Entity(entity_id=f"ENT-ACC-{int_acc1}", entity_type=EntityType.BankAccount, normalized_value=int_acc1, original_value=int_acc1, case_id=case_id))
        db.add_entity(Entity(entity_id=f"ENT-ACC-{int_acc2}", entity_type=EntityType.BankAccount, normalized_value=int_acc2, original_value=int_acc2, case_id=case_id))
        db.add_entity(Entity(entity_id=f"ENT-DEV-{hub_dev}", entity_type=EntityType.Device, normalized_value=hub_dev, original_value=hub_dev, case_id=case_id))
        db.add_entity(Entity(entity_id=f"ENT-IP-{hub_ip}", entity_type=EntityType.IP, normalized_value=hub_ip, original_value=hub_ip, case_id=case_id))

        # DEV-HUB-X accesses multiple intermediate accounts (SHARED DEVICE PATTERN)
        db.add_relationship(Relationship(relationship_id="REL-HUB-ACC1", source_entity=f"ENT-DEV-{hub_dev}", relationship_type=RelationshipType.ACCESSES, target_entity=f"ENT-ACC-{int_acc1}", case_id=case_id))
        db.add_relationship(Relationship(relationship_id="REL-HUB-ACC2", source_entity=f"ENT-DEV-{hub_dev}", relationship_type=RelationshipType.ACCESSES, target_entity=f"ENT-ACC-{int_acc2}", case_id=case_id))
        db.add_relationship(Relationship(relationship_id="REL-HUB-IP", source_entity=f"ENT-DEV-{hub_dev}", relationship_type=RelationshipType.USED_IP, target_entity=f"ENT-IP-{hub_ip}", case_id=case_id))

        # Rapid transfers from Mule to Int
        db.add_relationship(Relationship(relationship_id="REL-TXN-RAPID-1", source_entity=f"ENT-ACC-{mule_acc1}", relationship_type=RelationshipType.TRANSFERRED_TO, target_entity=f"ENT-ACC-{int_acc1}", case_id=case_id, timestamp="2026-09-01T10:32:00", source_record_id="TXN-1005"))
        db.add_relationship(Relationship(relationship_id="REL-TXN-RAPID-2", source_entity=f"ENT-ACC-{mule_acc1}", relationship_type=RelationshipType.TRANSFERRED_TO, target_entity=f"ENT-ACC-{int_acc2}", case_id=case_id, timestamp="2026-09-01T10:35:00", source_record_id="TXN-1006"))

        # 4. Final Aggregator & Crypto Account
        hub_acc = "ACC-HUB-301"
        final_acc = "ACC-FINAL-401"
        master_dev = "DEV-MASTER-Z"

        db.add_entity(Entity(entity_id=f"ENT-ACC-{hub_acc}", entity_type=EntityType.BankAccount, normalized_value=hub_acc, original_value=hub_acc, case_id=case_id))
        db.add_entity(Entity(entity_id=f"ENT-ACC-{final_acc}", entity_type=EntityType.BankAccount, normalized_value=final_acc, original_value=final_acc, case_id=case_id))
        db.add_entity(Entity(entity_id=f"ENT-DEV-{master_dev}", entity_type=EntityType.Device, normalized_value=master_dev, original_value=master_dev, case_id=case_id))

        db.add_relationship(Relationship(relationship_id="REL-TXN-HUB-1", source_entity=f"ENT-ACC-{int_acc1}", relationship_type=RelationshipType.TRANSFERRED_TO, target_entity=f"ENT-ACC-{hub_acc}", case_id=case_id, timestamp="2026-09-01T10:45:00", source_record_id="TXN-1007"))
        db.add_relationship(Relationship(relationship_id="REL-TXN-HUB-2", source_entity=f"ENT-ACC-{int_acc2}", relationship_type=RelationshipType.TRANSFERRED_TO, target_entity=f"ENT-ACC-{hub_acc}", case_id=case_id, timestamp="2026-09-01T10:48:00", source_record_id="TXN-1008"))
        db.add_relationship(Relationship(relationship_id="REL-TXN-FINAL", source_entity=f"ENT-ACC-{hub_acc}", relationship_type=RelationshipType.TRANSFERRED_TO, target_entity=f"ENT-ACC-{final_acc}", case_id=case_id, timestamp="2026-09-01T11:00:00", source_record_id="TXN-1009"))

        # Update metrics
        demo_case.entity_count = len(db.get_case_graph(case_id)["nodes"])
        demo_case.transaction_count = len(db.get_case_graph(case_id)["edges"])

        logger.info(f"Demo case {case_id} seeded successfully with {demo_case.entity_count} entities and {demo_case.transaction_count} edges.")
        return demo_case
