import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.db.graph_db import neo4j_db, db
from app.services.seed_service import SeedService

# Routers
from app.api.cases import router as cases_router
from app.api.ingestion import router as ingestion_router
from app.api.entities import router as entities_router
from app.api.graph import router as graph_router
from app.api.patterns import router as patterns_router
from app.api.analytics import router as analytics_router
from app.api.roles import router as roles_router
from app.api.timeline import router as timeline_router
from app.api.ai import router as ai_router
from app.api.reports import router as reports_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("CFNA.Main")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Evidence-Linked Cyber Fraud Network Analyzer (CFNA) API Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(cases_router, prefix=settings.API_V1_STR)
app.include_router(ingestion_router, prefix=settings.API_V1_STR)
app.include_router(entities_router, prefix=settings.API_V1_STR)
app.include_router(graph_router, prefix=settings.API_V1_STR)
app.include_router(patterns_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)
app.include_router(roles_router, prefix=settings.API_V1_STR)
app.include_router(timeline_router, prefix=settings.API_V1_STR)
app.include_router(ai_router, prefix=settings.API_V1_STR)
app.include_router(reports_router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def on_startup():
    logger.info("Initializing Cyber Fraud Network Analyzer backend service...")
    # Seed default synthetic case
    SeedService.seed_demo_case()

@app.on_event("shutdown")
def on_shutdown():
    neo4j_db.close()

@app.get("/health", tags=["Health"])
def health_check():
    neo4j_status = "connected" if neo4j_db.connected else "fallback_in_memory_networkx"
    return {
        "status": "HEALTHY",
        "service": settings.PROJECT_NAME,
        "neo4j_status": neo4j_status,
        "nodes_count": db.graph.number_of_nodes(),
        "edges_count": db.graph.number_of_edges()
    }
