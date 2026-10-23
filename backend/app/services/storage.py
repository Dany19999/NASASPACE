"""Capa de almacenamiento en memoria para la Fase 2.
Mantiene mediciones de manera segura frente a concurrencia.
"""

from datetime import datetime, timezone
import threading
from typing import List, Optional

from app.models.schemas import MeasurementCreate, MeasurementResponse


class InMemoryMeasurementStorage:
    """Gestor de almacenamiento en memoria para telemetría fisiológica."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._measurements: List[MeasurementResponse] = []
        self._counter: int = 0

    def add(self, data: MeasurementCreate) -> MeasurementResponse:
        """Agrega una medición validada al almacén en memoria."""
        with self._lock:
            self._counter += 1
            record = MeasurementResponse(
                id=self._counter,
                device_id=data.device_id,
                heart_rate=data.heart_rate,
                spo2=data.spo2,
                temperature=data.temperature,
                activity=data.activity,
                timestamp=data.timestamp,
                received_at=datetime.now(timezone.utc)
            )
            self._measurements.append(record)
            return record

    def get_latest(self) -> Optional[MeasurementResponse]:
        """Retorna la última medición registrada, o None si no hay registros."""
        with self._lock:
            if not self._measurements:
                return None
            return self._measurements[-1]

    def get_history(self, limit: int = 50) -> List[MeasurementResponse]:
        """Retorna el historial de mediciones (las más recientes hasta el límite)."""
        with self._lock:
            if limit <= 0:
                return []
            # Devolver los últimos 'limit' registros en orden cronológico
            return list(self._measurements[-limit:])

    def clear(self) -> None:
        """Limpia el almacenamiento en memoria (utilizado para pruebas)."""
        with self._lock:
            self._measurements.clear()
            self._counter = 0

    def seed_defaults(self) -> None:
        """Siembra mediciones de telemetría de demostración para visualización inicial."""
        from datetime import timedelta
        now = datetime.now(timezone.utc)
        defaults = [
            (72.0, 98.4, 36.6, "resting", now - timedelta(minutes=15)),
            (74.0, 98.2, 36.6, "resting", now - timedelta(minutes=10)),
            (75.0, 98.5, 36.7, "resting", now - timedelta(minutes=5)),
            (78.0, 98.1, 36.8, "resting", now - timedelta(minutes=2)),
            (73.0, 98.6, 36.6, "resting", now),
        ]
        with self._lock:
            if not self._measurements:
                for hr, spo2, temp, act, ts in defaults:
                    self._counter += 1
                    self._measurements.append(MeasurementResponse(
                        id=self._counter,
                        device_id="ASTRA-ESP32-01",
                        heart_rate=hr,
                        spo2=spo2,
                        temperature=temp,
                        activity=act,
                        timestamp=ts,
                        received_at=ts
                    ))


# Instancia singleton del almacenamiento en memoria para la aplicación
measurement_storage = InMemoryMeasurementStorage()
