"""Modelos de datos y esquemas de validación Pydantic para ASTRAHEALTH-AI.
"""

from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class MeasurementBase(BaseModel):
    """Esquema base de telemetría médica para astronautas."""
    device_id: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Identificador del sensor o dispositivo IoT del astronauta",
        examples=["ASTRA-ESP32-01"]
    )
    heart_rate: float = Field(
        ...,
        ge=20.0,
        le=300.0,
        description="Frecuencia cardíaca en lpm (rango válido: 20 - 300)",
        examples=[72.5]
    )
    spo2: float = Field(
        ...,
        ge=50.0,
        le=100.0,
        description="Saturación de oxígeno en sangre (%) (rango válido: 50 - 100)",
        examples=[98.2]
    )
    temperature: float = Field(
        ...,
        ge=30.0,
        le=45.0,
        description="Temperatura corporal en °C (rango válido: 30.0 - 45.0)",
        examples=[36.7]
    )
    activity: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Nivel o estado de actividad (ej. resting, exercise, eva, sleep)",
        examples=["resting"]
    )
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Marca temporal UTC de la medición (ISO 8601)",
        examples=["2026-10-22T16:30:00Z"]
    )


class MeasurementCreate(MeasurementBase):
    """Esquema para recepción y creación de una nueva medición."""
    pass


class MeasurementResponse(MeasurementBase):
    """Esquema de respuesta para mediciones consultadas."""
    id: int = Field(..., description="Identificador secuencial de la medición")
    received_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Marca temporal de recepción en el servidor"
    )

    model_config = ConfigDict(from_attributes=True)


class HealthResponse(BaseModel):
    """Esquema de respuesta para el estado del servicio."""
    status: str = Field(..., examples=["ok"])
    service: str = Field(..., examples=["ASTRAHEALTH-AI Backend"])
    version: str = Field(..., examples=["1.0.0"])
