# ⚡ Setup & Execution Guide

## Prerequisites
- Python 3.10+
- Node.js v18+ & npm
- IBM Cloud watsonx API Key & Project ID

---

## Quickstart Setup

### 1. Clone & Setup Environment
```bash
git clone https://github.com/drijesh-ppatel/bob-ai-hackathon-submission-template.git
cd bob-ai-hackathon-submission-template
```

### 2. Backend Setup
```bash
cd src/backend
python -m pip install -r requirements.txt
cp .env.example .env
# Edit .env with your IBM_WATSONX_API_KEY and IBM_WATSONX_PROJECT_ID
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
- API Documentation: `http://127.0.0.1:8000/docs`
- Health Endpoint: `http://127.0.0.1:8000/health`

### 3. Frontend Setup
```bash
cd src/frontend
npm install
npm run dev
```
- Web Application UI: `http://127.0.0.1:3000`

---

## Running with Docker Compose
```bash
docker-compose up --build
```
