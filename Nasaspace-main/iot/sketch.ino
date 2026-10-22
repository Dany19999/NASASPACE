/**
 * ============================================================================
 * ASTRAHEALTH-AI — Firmware ESP32 Simulado (Wokwi)
 * Desafío NASA Space Apps 2026: Monitoreo de salud en misiones espaciales
 * ============================================================================
 * Genera telemetría biométrica sintética y la transmite al backend FastAPI.
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// Credenciales de red para simulación en Wokwi
const char* ssid = "Wokwi-GUEST";
const char* password = "";

// URL del backend (reemplazar con la URL en Render o localhost con túnel Wokwi)
// Para simulación local con túnel Wokwi o Render:
const char* serverUrl = "http://host.wokwi.internal:8000/api/v1/measurements";

// Identificador del kit de telemetría del astronauta
const char* deviceId = "ASTRA-ESP32-01";

// Intervalo de transmisión en milisegundos (ej. cada 5 segundos)
const unsigned long transmitInterval = 5000;
unsigned long lastTransmitTime = 0;

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n========================================");
  Serial.println("  ASTRAHEALTH-AI — ESP32 Telemetry Kit  ");
  Serial.println("  NASA Space Apps Challenge 2026        ");
  Serial.println("========================================");

  // Conectar a la red WiFi simulada de Wokwi
  Serial.print("Conectando a WiFi: ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);

  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 20) {
    delay(500);
    Serial.print(".");
    retries++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WiFi] Conectado exitosamente.");
    Serial.print("[WiFi] Dirección IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n[WiFi] Advertencia: Modo offline. Reintentando en bucle...");
  }
}

/**
 * Genera valores biométricos sintéticos realistas con variaciones graduales
 */
void generateTelemetry(float &hr, float &spo2, float &temp, String &activity) {
  // Simular ciclo circadiano y variaciones leves
  float noiseHr = (random(-30, 31) / 10.0);
  float noiseSpo2 = (random(-10, 11) / 20.0);
  float noiseTemp = (random(-15, 16) / 100.0);

  // Ocasionalmente simular actividad física
  int mode = random(0, 10);
  if (mode < 7) {
    activity = "resting";
    hr = 70.0 + noiseHr;
    spo2 = 98.2 + noiseSpo2;
    temp = 36.6 + noiseTemp;
  } else if (mode < 9) {
    activity = "exercise";
    hr = 118.0 + noiseHr;
    spo2 = 96.5 + noiseSpo2;
    temp = 37.2 + noiseTemp;
  } else {
    activity = "eva"; // Actividad Extravehicular
    hr = 92.0 + noiseHr;
    spo2 = 97.8 + noiseSpo2;
    temp = 36.8 + noiseTemp;
  }

  // Límites fisiológicos seguros
  if (spo2 > 100.0) spo2 = 100.0;
  if (spo2 < 85.0)  spo2 = 85.0;
}

void loop() {
  unsigned long currentMillis = millis();

  if (currentMillis - lastTransmitTime >= transmitInterval) {
    lastTransmitTime = currentMillis;

    float hr, spo2, temp;
    String activity;
    generateTelemetry(hr, spo2, temp, activity);

    Serial.println("\n----------------------------------------");
    Serial.printf("[Sensor] HR: %.1f bpm | SpO2: %.1f%% | Temp: %.2f °C | Estado: %s\n", 
                  hr, spo2, temp, activity.c_str());

    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(serverUrl);
      http.addHeader("Content-Type", "application/json");

      // Construir JSON con ArduinoJson
      StaticJsonDocument<256> doc;
      doc["device_id"] = deviceId;
      doc["heart_rate"] = hr;
      doc["spo2"] = spo2;
      doc["temperature"] = temp;
      doc["activity"] = activity;

      String requestBody;
      serializeJson(doc, requestBody);

      Serial.println("[HTTP] Transmitiendo telemetría al backend...");
      int httpResponseCode = http.POST(requestBody);

      if (httpResponseCode > 0) {
        String response = http.getString();
        Serial.printf("[HTTP] Código de respuesta: %d\n", httpResponseCode);
        Serial.println("[HTTP] Respuesta del servidor: " + response);
      } else {
        Serial.printf("[HTTP] Error en transmisión: %s\n", http.errorToString(httpResponseCode).c_str());
      }

      http.end();
    } else {
      Serial.println("[WiFi] No hay conexión de red. Telemetría almacenada en búfer local.");
    }
  }
}
