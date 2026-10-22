"""Configuración central de la aplicación FastAPI.
"""

PROJECT_NAME = "ASTRAHEALTH-AI API"
VERSION = "1.0.0"
API_V1_PREFIX = "/api/v1"

# Permitir CORS para desarrollo local y futura integración con React
CORS_ORIGINS = [
    "*",
]
