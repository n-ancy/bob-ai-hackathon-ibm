import re
import uuid
import hashlib
from datetime import datetime
from typing import List, Dict, Tuple, Any
from app.models.schemas import Entity, Relationship, EntityType, RelationshipType, Evidence
from app.db.graph_db import db

class EntityExtractor:
    """Enhanced Regex & Heuristic Entity and Relationship Extractor for Unstructured Data."""

    PHONE_REGEX = re.compile(r'(?:\+91[\-\s]?)?[6-9]\d{9}')
    UPI_REGEX = re.compile(r'[a-zA-Z0-9.\-_]+@[a-zA-Z]{2,}')
    IP_REGEX = re.compile(r'\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b')
    ACCOUNT_REGEX = re.compile(r'\bACC\-[A-Z0-9\-]+\b')
    DEVICE_REGEX = re.compile(r'\bDEV\-[A-Z0-9\-]+\b')
    SIM_REGEX = re.compile(r'\b(?:SIM|IMSI)\-[A-Z0-9\-]+\b')
    IMEI_REGEX = re.compile(r'\bIMEI\-?[0-9]{10,15}\b|\b[0-9]{15}\b')
    TXN_REGEX = re.compile(r'\bTXN?\-?[0-9]{3,8}\b|\bTX[0-9]{3}\b')
    AMOUNT_REGEX = re.compile(r'(?:INR|Rs\.?|₹)\s*([0-9,]+)')

    @classmethod
    def extract_from_text(cls, text: str, case_id: str, source_file: str, source_record_id: str) -> Tuple[List[Entity], List[Relationship], Evidence]:
        entities = []
        relationships = []
        
        # Evidence record
        evidence_id = f"EV-{uuid.uuid4().hex[:8].upper()}"
        content_hash = hashlib.sha256(text.encode('utf-8')).hexdigest()[:16]
        evidence = Evidence(
            evidence_id=evidence_id,
            case_id=case_id,
            source_file=source_file,
            source_record_id=source_record_id,
            source_type="UNSTRUCTURED_DOCUMENT",
            timestamp=datetime.now().isoformat(),
            hash_checksum=content_hash,
            original_content_reference=text[:300],
            extraction_method="deterministic_regex_nlp",
            confidence=0.95,
            created_at=datetime.now().isoformat()
        )

        extracted_entities_map = {}

        # 1. Extract Phones
        for phone in set(cls.PHONE_REGEX.findall(text)):
            ent_id = f"ENT-PHONE-{phone.replace('+', '').strip()}"
            ent = Entity(
                entity_id=ent_id,
                entity_type=EntityType.Phone,
                normalized_value=phone,
                original_value=phone,
                case_id=case_id,
                source_file=source_file,
                source_record_id=source_record_id,
                confidence=0.98
            )
            entities.append(ent)
            extracted_entities_map[ent_id] = ent
            db.add_entity(ent)

        # 2. Extract Accounts
        for acc in set(cls.ACCOUNT_REGEX.findall(text)):
            ent_id = f"ENT-ACC-{acc}"
            ent = Entity(
                entity_id=ent_id,
                entity_type=EntityType.BankAccount,
                normalized_value=acc,
                original_value=acc,
                case_id=case_id,
                source_file=source_file,
                source_record_id=source_record_id,
                confidence=0.99
            )
            entities.append(ent)
            extracted_entities_map[ent_id] = ent
            db.add_entity(ent)

        # 3. Extract Devices
        for dev in set(cls.DEVICE_REGEX.findall(text)):
            ent_id = f"ENT-DEV-{dev}"
            ent = Entity(
                entity_id=ent_id,
                entity_type=EntityType.Device,
                normalized_value=dev,
                original_value=dev,
                case_id=case_id,
                source_file=source_file,
                source_record_id=source_record_id,
                confidence=0.95
            )
            entities.append(ent)
            extracted_entities_map[ent_id] = ent
            db.add_entity(ent)

        # 4. Extract IP Addresses
        for ip in set(cls.IP_REGEX.findall(text)):
            ent_id = f"ENT-IP-{ip}"
            ent = Entity(
                entity_id=ent_id,
                entity_type=EntityType.IP,
                normalized_value=ip,
                original_value=ip,
                case_id=case_id,
                source_file=source_file,
                source_record_id=source_record_id,
                confidence=0.99
            )
            entities.append(ent)
            extracted_entities_map[ent_id] = ent
            db.add_entity(ent)

        # 5. Extract SIM identifiers
        for sim in set(cls.SIM_REGEX.findall(text)):
            ent_id = f"ENT-SIM-{sim}"
            ent = Entity(
                entity_id=ent_id,
                entity_type=EntityType.SIM,
                normalized_value=sim,
                original_value=sim,
                case_id=case_id,
                source_file=source_file,
                source_record_id=source_record_id,
                confidence=0.95
            )
            entities.append(ent)
            extracted_entities_map[ent_id] = ent
            db.add_entity(ent)

        # Build relationships between co-occurring entities in same document/text line
        ent_ids = list(extracted_entities_map.keys())
        for i in range(len(ent_ids)):
            for j in range(i + 1, len(ent_ids)):
                e1 = extracted_entities_map[ent_ids[i]]
                e2 = extracted_entities_map[ent_ids[j]]
                rel_type = RelationshipType.ASSOCIATED_WITH
                if e1.entity_type == EntityType.Device and e2.entity_type == EntityType.BankAccount:
                    rel_type = RelationshipType.ACCESSES
                elif e1.entity_type == EntityType.Phone and e2.entity_type == EntityType.Device:
                    rel_type = RelationshipType.INSTALLED_IN
                elif e1.entity_type == EntityType.Phone and e2.entity_type == EntityType.SIM:
                    rel_type = RelationshipType.USES
                elif e1.entity_type == EntityType.BankAccount and e2.entity_type == EntityType.BankAccount:
                    rel_type = RelationshipType.TRANSFERRED_TO
                
                rel = Relationship(
                    relationship_id=f"REL-{uuid.uuid4().hex[:8].upper()}",
                    source_entity=e1.entity_id,
                    relationship_type=rel_type,
                    target_entity=e2.entity_id,
                    case_id=case_id,
                    source_record_id=source_record_id,
                    timestamp=datetime.now().isoformat(),
                    confidence=0.9,
                    extraction_method="unstructured_doc_linker"
                )
                relationships.append(rel)
                db.add_relationship(rel)

        return entities, relationships, evidence
