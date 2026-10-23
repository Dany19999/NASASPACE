"""Configuración central de la aplicación FastAPI.
"""

import os
from dotenv import load_dotenv

# Cargar variables de entorno desde el archivo .env si existe
load_dotenv()

PROJECT_NAME = "ASTRAHEALTH-AI API"
VERSION = "1.0.0"
API_V1_PREFIX = "/api/v1"

# Configuración de CORS dinámica y segura para despliegue en Render
cors_env = os.getenv("CORS_ORIGINS")
if cors_env:
    CORS_ORIGINS = [origin.strip() for origin in cors_env.split(",") if origin.strip()]
else:
    # Por defecto permite orígenes de desarrollo local
    CORS_ORIGINS = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*",
    ]

# URL de conexión a Supabase PostgreSQL (utiliza el pooler IPv4 por defecto)
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres.puwouhppqlkljzjqjzln:Lenin123Sabino@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
)

# Puerto configurable para Render o ejecución local
PORT = int(os.getenv("PORT", "8000"))
