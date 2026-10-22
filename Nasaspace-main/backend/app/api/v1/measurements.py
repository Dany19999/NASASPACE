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
    try:
        latest = (
            db.query(Measurement)
            .order_by(Measurement.timestamp.desc(), Measurement.id.desc())
            .first()
        )
    except SQLAlchemyError:
        logger.error("Error al consultar la última medición en PostgreSQL")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al consultar la última medición en la base de datos"
        )

    if latest is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No measurements recorded yet"
        )
    return latest


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
        # Retornar en orden cronológico ascendente para gráficos de series de tiempo
        return list(reversed(measurements))
    except SQLAlchemyError:
        logger.error("Error al consultar el historial de mediciones en PostgreSQL")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al consultar el historial en la base de datos"
        )
