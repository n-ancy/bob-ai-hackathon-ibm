import os
from pathlib import Path

# Load .env file manually if exists
env_path = Path(__file__).resolve().parent.parent / ".env"
if env_path.exists():
    with open(env_path, "r") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ[k.strip()] = v.strip()

class Settings:
    PROJECT_NAME: str = "Cyber Fraud Network Analyzer (CFNA)"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "cfna-cyber-investigation-super-secret-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    
    # Neo4j settings
    NEO4J_URI: str = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    NEO4J_USER: str = os.getenv("NEO4J_USER", "neo4j")
    NEO4J_PASSWORD: str = os.getenv("NEO4J_PASSWORD", "password123")
    USE_IN_MEMORY_FALLBACK: bool = True
    
    # Configurable detection thresholds
    FAN_IN_THRESHOLD: int = 3
    FAN_OUT_THRESHOLD: int = 3
    RAPID_TRANSFER_WINDOW_MINUTES: int = 60

    # IBM watsonx / Bob AI configuration
    IBM_WATSONX_API_KEY: str = os.getenv("IBM_WATSONX_API_KEY", "")
    IBM_WATSONX_PROJECT_ID: str = os.getenv("IBM_WATSONX_PROJECT_ID", "")
    IBM_WATSONX_URL: str = os.getenv("IBM_WATSONX_URL", "https://us-south.ml.cloud.ibm.com")
    IBM_MODEL_ID: str = os.getenv("IBM_MODEL_ID", "ibm/granite-13b-instruct-v2")

settings = Settings()
