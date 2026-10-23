"""Endpoints de telemetría fisiológica (/api/v1/measurements).
Persistencia en Supabase PostgreSQL utilizando SQLAlchemy.
"""

from datetime import datetime, timezone
import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.schemas import MeasurementCreate, MeasurementResponse
from app.models.sql_models import Measurement
from app.services.storage import measurement_storage

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/measurements", tags=["Measurements"])


@router.post(
    "",
    response_model=MeasurementResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar nueva medición de telemetría en Supabase"
)
async def create_measurement(
    payload: MeasurementCreate,
    db: Session = Depends(get_db)
) -> MeasurementResponse:
    """Recibe, valida y almacena una medición de signos vitales en Supabase PostgreSQL."""
    try:
        db_measurement = Measurement(
            device_id=payload.device_id,
            heart_rate=int(round(payload.heart_rate)),
            spo2=payload.spo2,
            temperature=payload.temperature,
            activity=payload.activity,
            timestamp=payload.timestamp,
            received_at=datetime.now(timezone.utc)
        )
        db.add(db_measurement)
        db.commit()
        db.refresh(db_measurement)
        measurement_storage.add(payload)
        return db_measurement
    except SQLAlchemyError:
        db.rollback()
        logger.error("Error al persistir la medición en PostgreSQL")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno al registrar la medición en la base de datos"
        )


@router.get(
    "/latest",
    response_model=MeasurementResponse,
    status_code=status.HTTP_200_OK,
    summary="Obtener la última medición registrada en Supabase"
)
async def get_latest_measurement(
    db: Session = Depends(get_db)
) -> MeasurementResponse:
    """Retorna la medición más reciente registrada en Supabase PostgreSQL. Devuelve 404 si no hay registros."""
    latest = None
    try:
        latest = (
            db.query(Measurement)
            .order_by(Measurement.timestamp.desc(), Measurement.id.desc())
            .first()
        )
    except Exception as exc:
        logger.warning(f"Aviso al consultar última medición en PostgreSQL: {exc}")

    if latest is not None:
        return latest

    # Fallback al almacenamiento en memoria
    latest_mem = measurement_storage.get_latest()
    if latest_mem is not None:
        return latest_mem

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="No measurements recorded yet"
    )


@router.get(
    "/history",
    response_model=List[MeasurementResponse],
    status_code=status.HTTP_200_OK,
    summary="Obtener historial de mediciones desde Supabase"
)
async def get_measurement_history(
    limit: int = Query(50, ge=1, le=1000, description="Límite de registros a recuperar"),
    db: Session = Depends(get_db)
) -> List[MeasurementResponse]:
    """Retorna el historial de mediciones almacenadas en Supabase PostgreSQL hasta el límite indicado."""
    try:
        measurements = (
            db.query(Measurement)
            .order_by(Measurement.timestamp.desc(), Measurement.id.desc())
            .limit(limit)
            .all()
        )
        if measurements:
            return list(reversed(measurements))
    except Exception as exc:
        logger.warning(f"Aviso al consultar historial en PostgreSQL: {exc}")

    # Fallback seguro al almacenamiento en memoria (garantiza siempre respuesta 200 con telemetría)
    return measurement_storage.get_history(limit)
