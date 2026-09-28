import logging
import json
import urllib.request
import urllib.parse
import time
from app.config import settings

logger = logging.getLogger("CFNA.IBMAI")

class IBMBobAIService:
    """Integration adapter for IBM watsonx.ai / Granite / Bob AI LLM Service with IAM Authentication."""

    _cached_token = None
    _token_expiry = 0

    @classmethod
    def get_iam_token(cls) -> str:
        """Exchanges IBM Cloud API key for an IAM Bearer Token."""
        api_key = settings.IBM_WATSONX_API_KEY
        if not api_key:
            return None

        # Return cached token if valid
        if cls._cached_token and time.time() < cls._token_expiry:
            return cls._cached_token

        try:
            iam_url = "https://iam.cloud.ibm.com/identity/token"
            headers = {"Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json"}
            data = urllib.parse.urlencode({
                "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
                "apikey": api_key
            }).encode('utf-8')

            req = urllib.request.Request(iam_url, data=data, headers=headers)
            with urllib.request.urlopen(req, timeout=10) as resp:
                result = json.loads(resp.read().decode('utf-8'))
                token = result.get("access_token")
                expires_in = result.get("expires_in", 3600)
                cls._cached_token = token
                cls._token_expiry = time.time() + expires_in - 60
                logger.info("Successfully authenticated with IBM Cloud IAM.")
                return token
        except Exception as e:
            logger.error(f"Failed to obtain IBM Cloud IAM token: {e}")
            return None

    @classmethod
    def generate_response(cls, user_query: str, evidence_context: str) -> str:
        """Sends query + evidence context to IBM watsonx Granite LLM."""
        if not settings.IBM_WATSONX_API_KEY or not settings.IBM_WATSONX_PROJECT_ID:
            logger.info("IBM watsonx credentials not configured; using local deterministic fallback.")
            return None

        iam_token = cls.get_iam_token()
        if not iam_token:
            logger.warning("Could not acquire IBM IAM token; falling back to local engine.")
            return None

        url = f"{settings.IBM_WATSONX_URL}/ml/v1/text/generation?version=2023-05-29"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {iam_token}"
        }

        system_instruction = (
            "You are CFNA Bob AI, an evidence-grounded cybercrime investigation assistant powered by IBM watsonx Granite. "
            "Your task is to analyze the provided case evidence and answer the investigator's query. "
            "Base your answers STRICTLY on the provided evidence context. "
            "Never invent or hallucinate people, accounts, phone numbers, or transactions. "
            "Always cite evidence IDs (e.g. EV-xxxx) and maintain professional forensic terminology."
        )

        prompt = f"<|system|>\n{system_instruction}\n\nEvidence Context:\n{evidence_context}\n<|user|>\n{user_query}\n<|assistant|>\n"

        payload = {
            "input": prompt,
            "parameters": {
                "decoding_method": "greedy",
                "max_new_tokens": 500,
                "min_new_tokens": 10,
                "stop_sequences": ["<|user|>", "<|system|>"],
                "repetition_penalty": 1.1
            },
            "model_id": settings.IBM_MODEL_ID,
            "project_id": settings.IBM_WATSONX_PROJECT_ID
        }

        try:
            req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers)
            with urllib.request.urlopen(req, timeout=20) as response:
                res = json.loads(response.read().decode('utf-8'))
                generated_text = res['results'][0]['generated_text'].strip()
                logger.info("Successfully generated investigation answer using IBM watsonx Granite Model!")
                return generated_text
        except Exception as e:
            logger.error(f"Error executing IBM watsonx text generation: {e}")
            return None
