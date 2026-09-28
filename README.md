# 🕵️‍♂️ CYBER FRAUD NETWORK ANALYZER (CFNA)
### Submission for IBM Bobathon AI Hackathon

[![IBM watsonx](https://img.shields.io/badge/IBM%20watsonx-Granite%20AI-blue)](https://www.ibm.com/watsonx)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-green)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-cyan)](https://react.dev)
[![Status](https://img.shields.io/badge/Status-Complete%20Submission-emerald)]()

---

## 🎯 Problem Statement

> **In 2–3 sentences:** Cybercrime and UPI fraud investigations involve fragmented intelligence across bank statements, call logs, SIM records, and police reports. Investigators manually cross-reference hundreds of spreadsheets to trace money movement, which is slow, error-prone, and allows fraud networks to move funds before detection. 

CFNA addresses the critical pain point faced by **Cyber Crime Cells**, **Digital Forensics Analysts**, and **Bank Anti-Fraud Units**. It provides a graph based view which helps better understand the connection between the data.

---

## 💡 Solution

> **In 2–3 sentences:** CFNA is an evidence-linked investigation platform powered by **IBM watsonx Granite AI** and graph analytics. It ingests multi-format fraud data (PDFs, Excel, CSV, JSON, TXT, or whole case folders), constructs an interactive investigation graph, automatically detects suspicious patterns (Fan-In, Shared Device, Rapid Transfer), and allows investigators to ask evidence-grounded questions with zero hallucination.

---

## ✨ Key Features

- **Feature 1: Multi-Format & Folder Ingestion**: Ingest PDFs, Excel statements (.xlsx), CSV tables, JSON logs, or complete case folders in one click.
- **Feature 2: IBM watsonx Granite AI Assistant**: Natural language RAG assistant powered by `ibm/granite-13b-instruct-v2` with strict evidence citations (`EV-xxxx`).
- **Feature 3: Interactive Forensic Graph Canvas**: Vis.js force-directed graph with high-contrast color badges, search zoom, neighbor highlighting, and right provenance drawer.
- **Feature 4: Deterministic Fraud Pattern Engine**: Automated detection for Fan-In, Fan-Out, Rapid Transfer Layering, and Shared Hardware Devices.
- **Feature 5: Explainable Role Indicators**: Analytical leads for Potential Coordinator, Potential Mule, and Potential Victim with confidence scoring.
- **Feature 6: Automated Case Brief PDF Generator**: ReportLab generated official investigation brief containing statistical summaries, timeline, and evidence tables.

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| **Languages** | Python 3.10, JavaScript (ES6+), HTML5, CSS3 |
| **Frameworks** | FastAPI, React 18, Vite, Tailwind CSS |
| **IBM Technologies** | IBM watsonx.ai, IBM Granite 13B Model (`ibm/granite-13b-instruct-v2`), IBM Cloud IAM Auth |
| **Databases & Graph** | NetworkX Graph Engine, Neo4j Database Driver |
| **Other Libraries** | Vis.js Network, ReportLab PDF, openpyxl, pypdf, pydantic |

---

## 📁 Repository Structure

```
bob-ai-hackathon-submission/
├── src/                  # All source code
│   ├── backend/          # FastAPI server & IBM watsonx AI engine
│   ├── frontend/         # React Vite cyber investigation UI
│   ├── data/             # Synthetic test datasets
│   └── docker-compose.yml
├── docs/                 # Written documentation
│   ├── problem-statement.md
│   ├── solution-overview.md
│   ├── architecture.md
│   └── setup-guide.md
├── demo/                 # Demo artifacts
│   ├── screenshots/      # App screenshots
│   └── demo-video-link.txt  # Link to demo video
├── presentation/         # Slide deck
└── submission.yaml       # Structured submission metadata
```

---

## ⚡ How to Run

### 1. Clone & Install
```bash
git clone https://github.com/drijesh-ppatel/bob-ai-hackathon-submission-template.git
cd bob-ai-hackathon-submission-template
```

### 2. Configure Environment
```bash
# Set credentials in src/backend/.env
IBM_WATSONX_API_KEY=your_ibm_api_key
IBM_WATSONX_PROJECT_ID=your_project_id
IBM_MODEL_ID=ibm/granite-13b-instruct-v2
```

### 3. Run Backend & Frontend
```bash
# Terminal 1: Backend
cd src/backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000

# Terminal 2: Frontend
cd src/frontend
npm install && npm run dev
```

Visit **http://127.0.0.1:3000** in your browser.

---

## 🖥️ Demo & Artifacts

| Artifact | Link |
|---|---|
| 📹 Demo Video | [See demo/demo-video-link.txt](demo/demo-video-link.txt) |
| 🌐 Live Demo | `http://127.0.0.1:8000/docs` |
| 🖼️ Screenshots | [See demo/screenshots/](demo/screenshots/) |
| 📊 Presentation | [See presentation/](presentation/) |

---

## ⚠️ Known Limitations

- **Authentication**: Authentication & RBAC are mocked with default investigator profiles for hackathon demo purposes.
- **Neo4j DB**: Includes NetworkX in-memory graph fallback so it runs out-of-the-box locally without needing local Neo4j server installation.

---

## 🏅 What We're Most Proud Of

1. **Zero-Hallucination AI Architecture**: IBM Granite AI is constrained to answer only using ingested evidence facts, returning citations for forensic reporting.
2. **Unified Intelligence Parsing**: Smoothly handles structured transactions (CSV, XLSX) and unstructured notes (PDF, TXT) in one graph.
3. **Forensic UX/UI**: Professional high-contrast dark investigation dashboard.
