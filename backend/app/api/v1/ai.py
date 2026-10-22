"""Endpoints de Inteligencia Artificial (/api/v1/ai).
Análisis de telemetría, detección de anomalías y persistencia de alertas en Supabase.
"""

from datetime import datetime, timezone
import logging
from typing import Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.schemas import AIAnalysisRequest, AIAnalysisResponse, AIAnalysisValues
from app.models.sql_models import Alert
from app.services.ai_service import telemetry_ai

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["Artificial Intelligence"])


@router.post(
    "/analyze",
    response_model=AIAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Analizar telemetría fisiológica con IA y reglas de seguridad"
)
async def analyze_telemetry(
    payload: AIAnalysisRequest,
    db: Session = Depends(get_db)
) -> AIAnalysisResponse:
    """Evalúa frecuencia cardíaca, SpO2 y temperatura mediante IsolationForest y reglas clínicas independientes.
    Si se detecta estado 'warning' o 'critical' y save_alert=True, persiste la alerta en Supabase.
    """
    analysis = telemetry_ai.analyze_measurement(
        heart_rate=payload.heart_rate,
        spo2=payload.spo2,
        temperature=payload.temperature
    )

    alert_created = False
    alert_id: Optional[int] = None

    # Si hay una alerta (warning o critical) y se solicitó persistirla, guardar en Supabase
    if analysis["status"] in ("warning", "critical") and payload.save_alert:
        try:
            alert_message = "; ".join(analysis["anomalies"]) if analysis["anomalies"] else "Anomalía no especificada"
            db_alert = Alert(
                measurement_id=payload.measurement_id,
                severity=analysis["status"],
                message=alert_message,
                created_at=datetime.now(timezone.utc)
            )
            db.add(db_alert)
            db.commit()
            db.refresh(db_alert)
            alert_created = True
            alert_id = db_alert.id
        except Exception as exc:
            db.rollback()
            logger.error(f"Error al registrar alerta en Supabase: {exc}")
            # Continuamos devolviendo el análisis sin romper la respuesta del cliente

    return AIAnalysisResponse(
        device_id=payload.device_id,
        status=analysis["status"],
        values=AIAnalysisValues(
            heart_rate=payload.heart_rate,
            spo2=payload.spo2,
            temperature=payload.temperature
        ),
        anomalies=analysis["anomalies"],
        is_ai_anomaly=analysis["is_ai_anomaly"],
        ai_score=analysis["ai_score"],
        model_trained=analysis["model_trained"],
        explanation=analysis["explanation"],
        alert_created=alert_created,
        alert_id=alert_id
    )
