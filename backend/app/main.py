"""Punto de entrada principal de la aplicación FastAPI ASTRAHEALTH-AI.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.health import router as health_router
from app.api.v1.ai import router as ai_router
from app.api.v1.measurements import router as measurements_router
from app.core.config import API_V1_PREFIX, CORS_ORIGINS, PROJECT_NAME, VERSION

app = FastAPI(
    title=PROJECT_NAME,
    version=VERSION,
    description=(
        "API REST para el monitoreo fisiológico de astronautas en misiones espaciales. "
        "Desarrollado para el desafío NASA Space Apps 2026."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusión de rutas
app.include_router(health_router)
app.include_router(measurements_router, prefix=API_V1_PREFIX)
app.include_router(ai_router, prefix=API_V1_PREFIX)


@app.get("/", tags=["Root"], summary="Punto de bienvenida de la API")
async def root() -> dict:
    """Ruta raíz de bienvenida e información de la API."""
    return {
        "project": PROJECT_NAME,
        "version": VERSION,
        "docs": "/docs",
        "health": "/health",
        "api_v1": API_V1_PREFIX,
    }
