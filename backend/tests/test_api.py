"""Pruebas automatizadas para los endpoints y validaciones de ASTRAHEALTH-AI API.
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.storage import measurement_storage

client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_storage():
    """Limpia el almacenamiento en memoria antes de cada prueba."""
    measurement_storage.clear()
    yield
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


def test_root_endpoint_returns_200():
    """Comprueba que la ruta raíz responda con información básica."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["health"] == "/health"
    assert data["docs"] == "/docs"


# ============================================================================
# 2. Pruebas de Recepción y Consulta de Mediciones Válidas
# ============================================================================

def test_post_measurement_success():
    """Valida la inserción exitosa de una medición completa."""
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


def test_post_measurement_default_timestamp():
    """Valida que si no se envía timestamp, el servidor genere uno por defecto."""
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
    """Comprueba que /latest responda 404 si la memoria está vacía."""
    response = client.get("/api/v1/measurements/latest")
    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "No measurements recorded yet"


def test_get_latest_measurement_after_insertions():
    """Comprueba que /latest retorne la última medición registrada."""
    payload1 = {
        "device_id": "ASTRA-01",
        "heart_rate": 70.0,
        "spo2": 99.0,
        "temperature": 36.5,
        "activity": "sleep"
    }
    payload2 = {
        "device_id": "ASTRA-01",
        "heart_rate": 110.0,
        "spo2": 96.0,
        "temperature": 37.3,
        "activity": "eva"
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
    """Comprueba la recuperación de historial y el parámetro limit."""
    for i in range(5):
        client.post("/api/v1/measurements", json={
            "device_id": "ASTRA-TEST",
            "heart_rate": 60.0 + i,
            "spo2": 98.0,
            "temperature": 36.5,
            "activity": "resting"
        })

    # Sin límite (por defecto 50)
    response_all = client.get("/api/v1/measurements/history")
    assert response_all.status_code == 200
    history = response_all.json()
    assert len(history) == 5

    # Con limit=2
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
        # Faltan heart_rate, spo2, temperature, activity
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
    """Rechaza frecuencia cardíaca fuera del rango permitido (20 - 300)."""
    # Menor al rango
    res_low = client.post("/api/v1/measurements", json={
        "device_id": "ASTRA-01",
        "heart_rate": 10.0,
        "spo2": 98.0,
        "temperature": 36.6,
        "activity": "resting"
    })
    assert res_low.status_code == 422

    # Mayor al rango
    res_high = client.post("/api/v1/measurements", json={
        "device_id": "ASTRA-01",
        "heart_rate": 350.0,
        "spo2": 98.0,
        "temperature": 36.6,
        "activity": "resting"
    })
    assert res_high.status_code == 422


def test_validation_rejects_out_of_range_spo2():
    """Rechaza SpO2 fuera del rango permitido (50 - 100)."""
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
    """Rechaza temperatura fuera del rango permitido (30.0 - 45.0)."""
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
    """Rechaza un timestamp que no tenga formato de fecha válido."""
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
# 4. Pruebas de Configuración de CORS
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
