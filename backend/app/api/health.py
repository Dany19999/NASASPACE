"""Endpoint de comprobación de salud de la API.
"""

from fastapi import APIRouter
from sqlalchemy import text

from app.core.config import PROJECT_NAME, VERSION
from app.core.database import SessionLocal
from app.models.schemas import HealthResponse

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse, summary="Verificar estado de la API")
async def health_check() -> HealthResponse:
    """Verifica que el servicio esté operativo y diagnostica la conexión a la base de datos."""
    db_status = "not_configured"
    if SessionLocal is not None:
        try:
            db = SessionLocal()
            try:
                db.execute(text("SELECT 1"))
                db_status = "connected"
            finally:
                db.close()
        except Exception:
            # Error de conexión gestionado sin exponer credenciales
            db_status = "error"

    return HealthResponse(
        status="ok",
        service=PROJECT_NAME,
        version=VERSION,
        database=db_status
    )
