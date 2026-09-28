# 🛠️ System Architecture

```
                               CFNA PLATFORM
                                     │
         ┌───────────────────────────┴───────────────────────────┐
         │                                                       │
     CASE MANAGEMENT (Mod 2)                           AUTH & SECURITY (Mod 15)
         │
         ▼
 INTELLIGENCE INGESTION (Mod 3: PDF, XLSX, CSV, JSON, TXT, Folders)
         │
         ▼
 ENTITY & RELATIONSHIP EXTRACTION (Mod 4: Regex & Heuristics)
         │
         ▼
 EVIDENCE STORE & PROVENANCE (Mod 12: Hash & Line Tracking)
         │
         ▼
 INVESTIGATION GRAPH ENGINE (Mod 5: Neo4j / NetworkX Dual Engine)
         │
  ┌──────┼───────────────────────┐
  │      │                       │
  ▼      ▼                       ▼
NETWORK ANALYTICS     FRAUD PATTERN DETECTOR     TRANSACTION FLOW ANALYZER
(Mod 8: Centralities & (Mod 7: Fan-In/Out, Shared  (Mod 6: Multi-Hop Tracing)
 Communities)         Device & Rapid Transfer)
  │      │                       │
  └──────┼───────────────────────┘
         ▼
 CHRONOLOGICAL TIMELINE (Mod 10: Calls, Logins, Txns)
         │
         ▼
 ROLE INDICATOR ENGINE (Mod 9: Coordinator, Mule, Victim Leads)
         │
         ▼
 MULTI-HOP CONNECTION TRACER (Mod 11: Shortest Path)
         │
         ▼
 IBM watsonx / GRANITE AI ASSISTANT (Mod 13: Zero Hallucination RAG)
         │
         ▼
 PDF INVESTIGATION CASE BRIEF (Mod 14: ReportLab Generator)
```

## Backend Services
- **FastAPI**: Asynchronous REST API framework
- **NetworkX & Neo4j**: Multi-graph engine with NetworkX centralities
- **IBM watsonx.ai SDK**: IAM OAuth authentication token handler querying `ibm/granite-13b-instruct-v2`
- **ReportLab**: PDF case brief generator

## Frontend Services
- **React + Vite + Tailwind CSS**: Modern high-contrast cyber investigation UI
- **Vis.js Canvas**: Interactive force-directed network graph renderer
