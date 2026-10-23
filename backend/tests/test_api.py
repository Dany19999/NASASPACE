"""Pruebas automatizadas para los endpoints, validaciones Pydantic y persistencia SQLAlchemy.
"""

from unittest.mock import MagicMock
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.main import app
from app.models.sql_models import Alert, Measurement

# Base de datos SQLite en memoria para pruebas de persistencia SQLAlchemy
TEST_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

client = TestClient(app)


def override_get_db():
    """Generador de sesiones de prueba en memoria."""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(autouse=True)
def setup_and_teardown_db():
    """Crea las tablas antes de cada prueba y las limpia al terminar."""
    from app.services.storage import measurement_storage
    measurement_storage.clear()
    Base.metadata.create_all(bind=test_engine)
    app.dependency_overrides[get_db] = override_get_db
    yield
    Base.metadata.drop_all(bind=test_engine)
    app.dependency_overrides.clear()
    measurement_storage.clear()


# ============================================================================
# 1. Pruebas de Health Check y Estado
# ============================================================================

def test_health_check_returns_200():
    """Comprueba que el endpoint /health responda correctamente con estado 'ok'."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "service" in data
    assert "version" in data
    assert "database" in data


def test_root_endpoint_returns_200():
    """Comprueba que la ruta raíz responda con información básica."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["health"] == "/health"
    assert data["docs"] == "/docs"


# ============================================================================
# 2. Pruebas de Persistencia SQLAlchemy (POST, GET latest, GET history)
# ============================================================================

def test_post_measurement_success():
    """Valida la inserción exitosa y persistencia en la base de datos."""
    payload = {
        "device_id": "ASTRA-ESP32-01",
        "heart_rate": 75.0,
        "spo2": 98.5,
        "temperature": 36.8,
        "activity": "resting",
        "timestamp": "2026-10-22T16:00:00Z"
    }
    response = client.post("/api/v1/measurements", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["id"] == 1
    assert data["device_id"] == "ASTRA-ESP32-01"
    assert data["heart_rate"] == 75.0
    assert data["spo2"] == 98.5
    assert data["temperature"] == 36.8
    assert data["activity"] == "resting"
    assert "received_at" in data

    # Verificar que el registro persiste directamente en la sesión de base de datos
    db = TestingSessionLocal()
    saved = db.query(Measurement).filter_by(id=1).first()
    assert saved is not None
    assert saved.device_id == "ASTRA-ESP32-01"
    db.close()


def test_post_measurement_default_timestamp():
    """Valida que si no se envía timestamp, se genere y persista uno por defecto."""
    payload = {
        "device_id": "ASTRA-ESP32-02",
        "heart_rate": 82.0,
        "spo2": 97.0,
        "temperature": 37.1,
        "activity": "exercise"
    }
    response = client.post("/api/v1/measurements", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "timestamp" in data
    assert data["timestamp"] is not None


def test_get_latest_measurement_not_found_initially():
    """Comprueba que /latest responda 404 si la base de datos no tiene mediciones."""
    response = client.get("/api/v1/measurements/latest")
    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "No measurements recorded yet"


def test_get_latest_measurement_after_insertions():
    """Comprueba que /latest consulte y retorne la última medición registrada."""
    payload1 = {
        "device_id": "ASTRA-01",
        "heart_rate": 70.0,
        "spo2": 99.0,
        "temperature": 36.5,
        "activity": "sleep",
        "timestamp": "2026-10-22T15:00:00Z"
    }
    payload2 = {
        "device_id": "ASTRA-01",
        "heart_rate": 110.0,
        "spo2": 96.0,
        "temperature": 37.3,
        "activity": "eva",
        "timestamp": "2026-10-22T16:00:00Z"
    }
    client.post("/api/v1/measurements", json=payload1)
    client.post("/api/v1/measurements", json=payload2)

    response = client.get("/api/v1/measurements/latest")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 2
    assert data["heart_rate"] == 110.0
    assert data["activity"] == "eva"


def test_get_history_and_limit():
    """Comprueba la recuperación del historial y el parámetro de límite."""
    for i in range(5):
        client.post("/api/v1/measurements", json={
            "device_id": "ASTRA-TEST",
            "heart_rate": 60.0 + i,
            "spo2": 98.0,
            "temperature": 36.5,
            "activity": "resting",
            "timestamp": f"2026-10-22T10:0{i}:00Z"
        })

    # Consulta de todo el historial
    response_all = client.get("/api/v1/measurements/history")
    assert response_all.status_code == 200
    history = response_all.json()
    assert len(history) == 5

    # Consulta con límite de 2
    response_limited = client.get("/api/v1/measurements/history?limit=2")
    assert response_limited.status_code == 200
    limited_history = response_limited.json()
    assert len(limited_history) == 2
    assert limited_history[0]["heart_rate"] == 63.0
    assert limited_history[1]["heart_rate"] == 64.0


# ============================================================================
# 3. Pruebas de Validación y Rechazo de Datos Inválidos (HTTP 422)
# ============================================================================

def test_validation_rejects_missing_fields():
    """Rechaza cargas con campos obligatorios faltantes."""
    payload = {
        "device_id": "ASTRA-ESP32-01"
    }
    response = client.post("/api/v1/measurements", json=payload)
    assert response.status_code == 422


def test_validation_rejects_empty_device_id():
    """Rechaza device_id vacío."""
    payload = {
        "device_id": "",
        "heart_rate": 75.0,
        "spo2": 98.0,
        "temperature": 36.6,
        "activity": "resting"
    }
    response = client.post("/api/v1/measurements", json=payload)
    assert response.status_code == 422


def test_validation_rejects_out_of_range_heart_rate():
    """Rechaza frecuencia cardíaca fuera de rango (20 - 300)."""
    res_low = client.post("/api/v1/measurements", json={
        "device_id": "ASTRA-01",
        "heart_rate": 10.0,
        "spo2": 98.0,
        "temperature": 36.6,
        "activity": "resting"
    })
    assert res_low.status_code == 422

    res_high = client.post("/api/v1/measurements", json={
        "device_id": "ASTRA-01",
        "heart_rate": 350.0,
        "spo2": 98.0,
        "temperature": 36.6,
        "activity": "resting"
    })
    assert res_high.status_code == 422


def test_validation_rejects_out_of_range_spo2():
    """Rechaza SpO2 fuera de rango (50 - 100)."""
    res_low = client.post("/api/v1/measurements", json={
        "device_id": "ASTRA-01",
        "heart_rate": 75.0,
        "spo2": 45.0,
        "temperature": 36.6,
        "activity": "resting"
    })
    assert res_low.status_code == 422

    res_high = client.post("/api/v1/measurements", json={
        "device_id": "ASTRA-01",
        "heart_rate": 75.0,
        "spo2": 105.0,
        "temperature": 36.6,
        "activity": "resting"
    })
    assert res_high.status_code == 422


def test_validation_rejects_out_of_range_temperature():
    """Rechaza temperatura corporal fuera de rango (30.0 - 45.0)."""
    res_low = client.post("/api/v1/measurements", json={
        "device_id": "ASTRA-01",
        "heart_rate": 75.0,
        "spo2": 98.0,
        "temperature": 28.0,
        "activity": "resting"
    })
    assert res_low.status_code == 422

    res_high = client.post("/api/v1/measurements", json={
        "device_id": "ASTRA-01",
        "heart_rate": 75.0,
        "spo2": 98.0,
        "temperature": 48.0,
        "activity": "resting"
    })
    assert res_high.status_code == 422


def test_validation_rejects_invalid_timestamp():
    """Rechaza un timestamp con formato no válido."""
    payload = {
        "device_id": "ASTRA-01",
        "heart_rate": 75.0,
        "spo2": 98.0,
        "temperature": 36.6,
        "activity": "resting",
        "timestamp": "fecha-invalida"
    }
    response = client.post("/api/v1/measurements", json=payload)
    assert response.status_code == 422


# ============================================================================
# 4. Pruebas de Seguridad y Gestión de Errores de Base de Datos
# ============================================================================

def test_database_error_handling_sanitized():
    """Comprueba que errores de base de datos no expongan credenciales ni cadenas de conexión."""
    mock_db = MagicMock()
    mock_db.add.side_effect = OperationalError("secret_password@host:5432", {}, Exception("DB Error"))

    app.dependency_overrides[get_db] = lambda: mock_db

    payload = {
        "device_id": "ASTRA-01",
        "heart_rate": 75.0,
        "spo2": 98.0,
        "temperature": 36.6,
        "activity": "resting"
    }
    response = client.post("/api/v1/measurements", json=payload)
    assert response.status_code == 500
    data = response.json()
    # Verifica que el mensaje esté sanitizado y no contenga contraseñas ni URLs
    assert "secret_password" not in data["detail"]
    assert "Error interno al registrar la medición en la base de datos" in data["detail"]


def test_unconfigured_database_returns_503():
    """Comprueba que si no hay base de datos configurada, devuelva HTTP 503 adecuadamente."""
    # Quitar cualquier override para evaluar get_db original cuando SessionLocal es None
    app.dependency_overrides.clear()
    from app.core import database
    original_session = database.SessionLocal
    database.SessionLocal = None

    try:
        response = client.get("/api/v1/measurements/latest")
        assert response.status_code == 503
        data = response.json()
        assert "no está configurada" in data["detail"]
    finally:
        database.SessionLocal = original_session


# ============================================================================
# 5. Pruebas de Configuración de CORS
# ============================================================================

def test_cors_headers_present():
    """Comprueba que los encabezados CORS estén habilitados para el frontend."""
    headers = {
        "Origin": "http://localhost:5173",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type"
    }
    response = client.options("/api/v1/measurements", headers=headers)
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") in ("*", "http://localhost:5173")


# ============================================================================
# 6. Pruebas del Módulo de Inteligencia Artificial y Reglas de Seguridad
# ============================================================================

def test_ai_analyze_normal_measurement():
    """Valida que una medición con signos vitales normales devuelva estado 'normal' sin generar alertas."""
    payload = {
        "device_id": "ASTRA-01",
        "heart_rate": 72.0,
        "spo2": 98.5,
        "temperature": 36.6,
        "activity": "resting"
    }
    response = client.post("/api/v1/ai/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "normal"
    assert data["values"]["heart_rate"] == 72.0
    assert data["values"]["spo2"] == 98.5
    assert data["values"]["temperature"] == 36.6
    assert data["alert_created"] is False
    assert data["alert_id"] is None
    assert "disclaimer" in data
    assert "Prototipo educativo" in data["disclaimer"]


def test_ai_analyze_warning_measurement_and_creates_alert():
    """Valida que una taquicardia moderada genere estado 'warning' y persista una alerta en la tabla alerts."""
    payload = {
        "device_id": "ASTRA-01",
        "heart_rate": 115.0,
        "spo2": 96.0,
        "temperature": 36.6,
        "activity": "resting",
        "save_alert": True
    }
    response = client.post("/api/v1/ai/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "warning"
    assert len(data["anomalies"]) >= 1
    assert any("Taquicardia moderada" in a for a in data["anomalies"])
    assert data["alert_created"] is True
    assert data["alert_id"] is not None

    # Verificar que la alerta persiste efectivamente en la base de datos
    db = TestingSessionLocal()
    alert = db.query(Alert).filter_by(id=data["alert_id"]).first()
    assert alert is not None
    assert alert.severity == "warning"
    assert "Taquicardia moderada" in alert.message
    db.close()


def test_ai_analyze_critical_measurement_and_creates_alert():
    """Valida que una hipoxia severa genere estado 'critical' y persista una alerta crítica."""
    payload = {
        "device_id": "ASTRA-01",
        "heart_rate": 145.0,
        "spo2": 88.0,
        "temperature": 38.8,
        "activity": "eva",
        "save_alert": True
    }
    response = client.post("/api/v1/ai/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "critical"
    assert len(data["anomalies"]) >= 2
    assert any("Hipoxia severa" in a for a in data["anomalies"])
    assert data["alert_created"] is True

    db = TestingSessionLocal()
    alert = db.query(Alert).filter_by(id=data["alert_id"]).first()
    assert alert is not None
    assert alert.severity == "critical"
    db.close()


def test_ai_analyze_save_alert_false_does_not_persist():
    """Valida que si save_alert=False, no se persista ninguna alerta en la base de datos."""
    payload = {
        "device_id": "ASTRA-01",
        "heart_rate": 150.0,
        "spo2": 85.0,
        "temperature": 39.0,
        "save_alert": False
    }
    response = client.post("/api/v1/ai/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "critical"
    assert data["alert_created"] is False
    assert data["alert_id"] is None

    db = TestingSessionLocal()
    count = db.query(Alert).count()
    assert count == 0
    db.close()


def test_ai_analyze_rejects_invalid_data():
    """Comprueba que mediciones con valores fisiológicamente imposibles sean rechazadas con 422."""
    # Frecuencia cardíaca fuera del rango de validación Pydantic
    res1 = client.post("/api/v1/ai/analyze", json={
        "heart_rate": 10.0,
        "spo2": 98.0,
        "temperature": 36.6
    })
    assert res1.status_code == 422

    # SpO2 superior al 100%
    res2 = client.post("/api/v1/ai/analyze", json={
        "heart_rate": 75.0,
        "spo2": 105.0,
        "temperature": 36.6
    })
    assert res2.status_code == 422


def test_ai_analyze_fallback_on_insufficient_training_data():
    """Valida el manejo graceful y transparente cuando no existen suficientes datos de entrenamiento históricos."""
    from app.services.ai_service import telemetry_ai
    # Verificar que el modelo señale model_trained=False ante falta de datos históricos consolidados
    assert telemetry_ai.is_custom_trained is False

    payload = {
        "heart_rate": 75.0,
        "spo2": 98.0,
        "temperature": 36.6
    }
    response = client.post("/api/v1/ai/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["model_trained"] is False
    assert "perfil de referencia sintético" in data["explanation"]


def test_ai_retrain_endpoint_insufficient_samples():
    """Valida que /retrain informe cuando hay menos de 20 muestras sin arrojar errores."""
    response = client.post("/api/v1/ai/retrain")
    assert response.status_code == 200
    data = response.json()
    assert data["trained"] is False
    assert data["samples_count"] == 0
    assert data["required_minimum"] == 20


def test_ai_retrain_endpoint_success_with_samples():
    """Valida que /retrain calibre el modelo si se cuenta con al menos 20 registros."""
    # Insertar 22 mediciones sintéticas en la base de datos de prueba
    for i in range(22):
        client.post("/api/v1/measurements", json={
            "device_id": "ASTRA-TRAIN",
            "heart_rate": 68.0 + (i % 15),
            "spo2": 97.0 + ((i % 4) * 0.5),
            "temperature": 36.4 + ((i % 5) * 0.1),
            "activity": "resting"
        })

    response = client.post("/api/v1/ai/retrain")
    assert response.status_code == 200
    data = response.json()
    assert data["trained"] is True
    assert data["samples_count"] == 22
    assert "calibrado exitosamente" in data["message"]
