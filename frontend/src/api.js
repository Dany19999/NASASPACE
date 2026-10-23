/**
 * Cliente API para ASTRAHEALTH-AI Backend
 * Consume endpoints de FastAPI y módulo de IA.
 */

const BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Normaliza errores HTTP para el cliente.
 */
async function handleResponse(response) {
  if (!response.ok) {
    let errorDetail = `Error HTTP ${response.status}`;
    try {
      const errorJson = await response.json();
      if (errorJson && errorJson.detail) {
        errorDetail = typeof errorJson.detail === 'string' 
          ? errorJson.detail 
          : JSON.stringify(errorJson.detail);
      }
    } catch {
      // Ignorar fallo de parseo
    }
    const error = new Error(errorDetail);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

/**
 * 1. Comprobar salud y conexión de la API
 */
export async function checkBackendHealth() {
  const res = await fetch(`${BASE_URL}/health`, {
    headers: { 'Accept': 'application/json' },
  });
  return handleResponse(res);
}

/**
 * 2. Obtener la última medición registrada
 */
export async function fetchLatestMeasurement() {
  const res = await fetch(`${BASE_URL}/api/v1/measurements/latest`, {
    headers: { 'Accept': 'application/json' },
  });
  return handleResponse(res);
}

/**
 * 3. Obtener el historial de mediciones
 */
export async function fetchMeasurementHistory(limit = 30) {
  const res = await fetch(`${BASE_URL}/api/v1/measurements/history?limit=${limit}`, {
    headers: { 'Accept': 'application/json' },
  });
  return handleResponse(res);
}

/**
 * 4. Analizar telemetría mediante el módulo de Inteligencia Artificial
 */
export async function analyzeTelemetryWithAI(payload) {
  const res = await fetch(`${BASE_URL}/api/v1/ai/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

/**
 * 5. Enviar una medición de prueba para validar la persistencia en vivo
 */
export async function sendSampleMeasurement(sampleData = null) {
  const body = sampleData || {
    device_id: 'ASTRA-ESP32-DEMO',
    heart_rate: Number((65 + Math.random() * 20).toFixed(1)),
    spo2: Number((97.5 + Math.random() * 2).toFixed(1)),
    temperature: Number((36.4 + Math.random() * 0.6).toFixed(1)),
    activity: 'resting'
  };

  const res = await fetch(`${BASE_URL}/api/v1/measurements`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}

export { BASE_URL };
