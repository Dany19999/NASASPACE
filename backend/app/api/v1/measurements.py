"""Endpoints de telemetría fisiológica (/api/v1/measurements).
"""

from typing import List
from fastapi import APIRouter, HTTPException, Query, status

from app.models.schemas import MeasurementCreate, MeasurementResponse
from app.services.storage import measurement_storage

router = APIRouter(prefix="/measurements", tags=["Measurements"])


@router.post(
    "",
    response_model=MeasurementResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar nueva medición de telemetría"
)
async def create_measurement(payload: MeasurementCreate) -> MeasurementResponse:
    """Recibe y valida una medición de signos vitales enviada por un sensor o dispositivo IoT."""
    return measurement_storage.add(payload)


@router.get(
    "/latest",
    response_model=MeasurementResponse,
    status_code=status.HTTP_200_OK,
    summary="Obtener la última medición registrada"
)
async def get_latest_measurement() -> MeasurementResponse:
    """Retorna la medición más reciente en memoria. Devuelve 404 si no hay registros."""
    latest = measurement_storage.get_latest()
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
    summary="Obtener historial de mediciones"
)
async def get_measurement_history(
    limit: int = Query(50, ge=1, le=1000, description="Límite de registros a recuperar")
) -> List[MeasurementResponse]:
    """Retorna el historial de mediciones almacenadas en memoria hasta el límite indicado."""
    return measurement_storage.get_history(limit=limit)
