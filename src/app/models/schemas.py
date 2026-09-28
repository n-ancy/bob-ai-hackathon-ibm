from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class CaseStatus(str, Enum):
    OPEN = "OPEN"
    UNDER_INVESTIGATION = "UNDER_INVESTIGATION"
    REVIEW = "REVIEW"
    CLOSED = "CLOSED"
    ARCHIVED = "ARCHIVED"

class EntityType(str, Enum):
    Person = "Person"
    BankAccount = "BankAccount"
    UPI = "UPI"
    Phone = "Phone"
    SIM = "SIM"
    Device = "Device"
    IP = "IP"
    Transaction = "Transaction"
    Location = "Location"
    Case = "Case"

class RelationshipType(str, Enum):
    OWNS = "OWNS"
    USES = "USES"
    ASSOCIATED_WITH = "ASSOCIATED_WITH"
    INSTALLED_IN = "INSTALLED_IN"
    ACCESSES = "ACCESSES"
    TRANSFERRED_TO = "TRANSFERRED_TO"
    CALLED = "CALLED"
    USED_IP = "USED_IP"
    LOCATED_AT = "LOCATED_AT"
    PART_OF_CASE = "PART_OF_CASE"

class RoleType(str, Enum):
    POTENTIAL_COORDINATOR = "Potential Coordinator Indicator"
    POTENTIAL_MULE = "Potential Mule Indicator"
    POTENTIAL_VICTIM = "Potential Victim Indicator"

# --- Case Schemas ---
class CaseCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    investigator: str = "Insp. V. Sharma"
    tags: List[str] = []

class CaseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    investigator: Optional[str] = None
    status: Optional[CaseStatus] = None
    tags: Optional[List[str]] = None

class Case(BaseModel):
    case_id: str
    case_number: str
    title: str
    description: str
    investigator: str
    status: CaseStatus
    created_at: str
    updated_at: str
    tags: List[str]
    entity_count: int = 0
    transaction_count: int = 0
    pattern_count: int = 0
    evidence_count: int = 0

# --- Entity & Relationship Schemas ---
class Entity(BaseModel):
    entity_id: str
    entity_type: EntityType
    normalized_value: str
    original_value: str
    case_id: str
    source_file: str = ""
    source_record_id: str = ""
    confidence: float = 1.0
    attributes: Dict[str, Any] = {}

class Relationship(BaseModel):
    relationship_id: str
    source_entity: str
    relationship_type: RelationshipType
    target_entity: str
    case_id: str
    source_record_id: str = ""
    timestamp: Optional[str] = None
    confidence: float = 1.0
    extraction_method: str = "deterministic"
    attributes: Dict[str, Any] = {}

# --- Evidence Schema ---
class Evidence(BaseModel):
    evidence_id: str
    case_id: str
    source_file: str
    source_record_id: str
    source_type: str
    timestamp: str
    hash_checksum: str
    original_content_reference: str
    extraction_method: str
    confidence: float = 1.0
    created_at: str

# --- Transaction Schema ---
class Transaction(BaseModel):
    transaction_id: str
    case_id: str
    source_account: str
    destination_account: str
    amount: float
    currency: str = "INR"
    timestamp: str
    transaction_type: str = "TRANSFER"
    upi_reference: Optional[str] = None
    source_phone: Optional[str] = None
    dest_phone: Optional[str] = None
    device_id: Optional[str] = None
    ip_address: Optional[str] = None
    location: Optional[str] = None
    evidence_id: str

# --- Fraud Pattern Schema ---
class FraudPattern(BaseModel):
    pattern_id: str
    pattern_type: str
    case_id: str
    entities_involved: List[str]
    supporting_transactions: List[str]
    supporting_evidence: List[str]
    detection_rule: str
    observed_time_range: str
    explanation: str
    severity: str = "MEDIUM"  # LOW, MEDIUM, HIGH, CRITICAL

# --- Network Analytics & Community Schemas ---
class EntityCentrality(BaseModel):
    entity_id: str
    entity_type: str
    degree: float
    betweenness: float
    closeness: float
    pagerank: float

class CommunityCluster(BaseModel):
    community_id: str
    entities: List[str]
    size: int
    dominant_types: List[str]
    bridge_entities: List[str] = []

class NetworkAnalytics(BaseModel):
    total_nodes: int
    total_edges: int
    density: float
    communities_count: int
    top_centrality_entities: List[EntityCentrality]
    communities: List[CommunityCluster]

# --- Role Indicator Schema ---
class RoleIndicator(BaseModel):
    indicator_id: str
    entity_id: str
    role_type: RoleType
    confidence_score: float
    explanation: str
    supporting_entities: List[str]
    supporting_transactions: List[str]
    supporting_evidence: List[str]
    limitations: str

# --- Timeline Event Schema ---
class TimelineEvent(BaseModel):
    event_id: str
    case_id: str
    timestamp: str
    event_type: str # CALL, TRANSACTION, LOGIN, DEVICE_ACTIVITY, SIM_ASSOCIATION, IP_ACTIVITY
    source_entity: str
    target_entity: str
    amount: Optional[float] = None
    source_record_id: str
    evidence_id: str
    details: str

# --- AI Assistant Query & Response ---
class AIQuery(BaseModel):
    query: str
    case_id: str

class AIResponse(BaseModel):
    answer: str
    supporting_evidence: List[str]
    observed_patterns: List[str]
    investigation_leads: List[str]
    uncertainties: List[str]

# --- Audit Log ---
class AuditLog(BaseModel):
    log_id: str
    timestamp: str
    user: str
    action: str
    case_id: Optional[str] = None
    details: str
