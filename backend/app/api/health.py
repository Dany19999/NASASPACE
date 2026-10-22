"""Endpoint de comprobación de salud de la API.
"""

from fastapi import APIRouter
from app.core.config import PROJECT_NAME, VERSION
from app.models.schemas import HealthResponse

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse, summary="Verificar estado de la API")
async def health_check() -> HealthResponse:
    """Verifica que el servicio esté operativo."""
    return HealthResponse(
        status="ok",
        service=PROJECT_NAME,
        version=VERSION
    )
