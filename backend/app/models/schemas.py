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
    database: Optional[str] = Field(default=None, examples=["connected", "not_configured", "error"])


class AIAnalysisRequest(BaseModel):
    """Esquema de solicitud para análisis con IA y reglas de seguridad."""
    device_id: Optional[str] = Field(
        default=None,
        max_length=100,
        description="Identificador del dispositivo IoT del astronauta",
        examples=["ASTRA-ESP32-01"]
    )
    heart_rate: float = Field(
        ...,
        ge=20.0,
        le=300.0,
        description="Frecuencia cardíaca en lpm",
        examples=[75.0]
    )
    spo2: float = Field(
        ...,
        ge=50.0,
        le=100.0,
        description="Saturación de oxígeno en sangre (%)",
        examples=[98.2]
    )
    temperature: float = Field(
        ...,
        ge=30.0,
        le=45.0,
        description="Temperatura corporal en °C",
        examples=[36.6]
    )
    activity: Optional[str] = Field(
        default="resting",
        max_length=50,
        description="Nivel de actividad (ej. resting, exercise, eva, sleep)",
        examples=["resting"]
    )
    measurement_id: Optional[int] = Field(
        default=None,
        description="ID opcional de la medición asociada en base de datos"
    )
    save_alert: bool = Field(
        default=True,
        description="Persistir alerta en Supabase si el estado es warning o critical"
    )


class AIAnalysisValues(BaseModel):
    """Valores fisiológicos evaluados."""
    heart_rate: float
    spo2: float
    temperature: float


class AIAnalysisResponse(BaseModel):
    """Respuesta completa del análisis de telemetría médica con IA y reglas."""
    device_id: Optional[str] = None
    status: str = Field(
        ...,
        description="Clasificación del estado: 'normal', 'warning' o 'critical'",
        examples=["normal"]
    )
    values: AIAnalysisValues
    anomalies: list[str] = Field(
        default_factory=list,
        description="Lista de anomalías detectadas por reglas o modelo de ML"
    )
    is_ai_anomaly: bool = Field(
        ...,
        description="Indica si el modelo IsolationForest clasificó el vector como anómalo"
    )
    ai_score: Optional[float] = Field(
        default=None,
        description="Puntuación de anomalía calculada por IsolationForest"
    )
    model_trained: bool = Field(
        ...,
        description="Indica si el modelo IsolationForest cuenta con suficientes datos o si opera con baseline sintético"
    )
    explanation: str = Field(
        ...,
        description="Resumen interpretativo de las métricas fisiológicas"
    )
    alert_created: bool = Field(
        default=False,
        description="Indica si se persistió una alerta en la tabla alerts de Supabase"
    )
    alert_id: Optional[int] = Field(
        default=None,
        description="Identificador de la alerta persistida"
    )
    disclaimer: str = Field(
        default="Prototipo educativo de telemetría de monitoreo espacial. No constituye un dispositivo ni diagnóstico médico certificado.",
        description="Descargo de responsabilidad de alcance educativo"
    )
