/*
 * ======================================================================================
 * PROYECTO: ASTRAHEALTH-AI — SIMULADOR IOT DE TELEMETRIA FISIOLOGICA
 * Microcontrolador: ESP32 DevKit (Wokwi Simulation)
 * ======================================================================================
 * Requerimientos implementados:
 * 1. Circuito virtual con ESP32 y potenciómetro en Wokwi.
 * 2. Generación de datos fisiológicos simulados: Frecuencia cardíaca, SpO₂ y Temperatura.
 * 3. Uso de potenciómetro (GPIO 34) para modificar los valores simulados en tiempo real.
 * 4. Mapeo continuo con resolución decimal realista.
 * 5. Visualización de datos en el Monitor Serial en formato JSON.
 * 6. Preparación y envío de datos mediante HTTP POST al backend FastAPI.
 * ======================================================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>

// Pin analógico conectado al pin SIG del potenciómetro (ADC1 - GPIO 34)
const int potPin = 34;

// Credenciales WiFi de la red virtual de Wokwi
const char* ssid = "Wokwi-GUEST";
const char* password = "";

// URL del backend FastAPI (endpoints compatibles: /api/v1/measurements y /api/telemetria)
// 1. Para backend desplegado en Render:
const char* serverUrl = "https://nasaspace-main.onrender.com/api/v1/measurements";

// 2. Para pruebas locales con Wokwi IoT Gateway (descomentar si ejecutas uvicorn localmente):
// const char* serverUrl = "http://host.wokwi.internal:8000/api/v1/measurements";

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n=======================================================");
  Serial.println("  ASTRAHEALTH-AI — ESP32 Telemetria Fisiologica (IoT)  ");
  Serial.println("=======================================================");

  // Configurar pin analógico como entrada
  pinMode(potPin, INPUT);

  // Intentar conectar a la red WiFi virtual de Wokwi
  Serial.print("Conectando a la red WiFi: ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);

  int intentos = 0;
  while (WiFi.status() != WL_CONNECTED && intentos < 20) {
    delay(500);
    Serial.print(".");
    intentos++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WiFi] Conectado exitosamente.");
    Serial.print("[WiFi] IP asignada: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n[WiFi] Aviso: WiFi no conectado aun (los datos se emitiran por Serial).");
  }

  Serial.println("=======================================================\n");
}

void loop() {
  // 1. Lectura del potenciómetro (ADC de 12 bits: 0 a 4095)
  int potValue = analogRead(potPin);
  float factor = (float)potValue / 4095.0;

  // 2. Mapeo dinámico y continuo a valores fisiológicos realistas
  // Frecuencia cardíaca: 60.0 a 140.0 lpm (lpm / bpm)
  float heartRate = 60.0 + (factor * (140.0 - 60.0));

  // Saturación de oxígeno en sangre (SpO₂): 90.0% a 100.0%
  float spo2 = 90.0 + (factor * (100.0 - 90.0));

  // Temperatura corporal: 36.0°C a 39.5°C
  float temperature = 36.0 + (factor * (39.5 - 36.0));

  // 3. Estimación del nivel de actividad según el esfuerzo fisiológico
  String activity = "resting";
  if (heartRate >= 120.0) {
    activity = "eva";          // Actividad Extravehicular (alta demanda)
  } else if (heartRate >= 90.0) {
    activity = "exercise";     // Ejercicio cardiovascular
  } else {
    activity = "resting";      // Reposo basal
  }

  // 4. Construcción del payload JSON estructurado
  // Incluye nombres en español e inglés para compatibilidad total con cualquier consumidor
  String jsonPayload = "{";
  jsonPayload += "\"device_id\":\"ASTRA-ESP32-01\",";
  jsonPayload += "\"frecuencia_cardiaca\":" + String(heartRate, 1) + ",";
  jsonPayload += "\"heart_rate\":" + String(heartRate, 1) + ",";
  jsonPayload += "\"spo2\":" + String(spo2, 1) + ",";
  jsonPayload += "\"temperatura\":" + String(temperature, 1) + ",";
  jsonPayload += "\"temperature\":" + String(temperature, 1) + ",";
  jsonPayload += "\"activity\":\"" + activity + "\",";
  jsonPayload += "\"potenciometro\":" + String(potValue);
  jsonPayload += "}";

  // 5. Mostrar en el Monitor Serial en formato JSON
  Serial.println("---------------- [LECTURA DE TELEMETRIA] ----------------");
  Serial.print("Potenciometro: ");
  Serial.print(potValue);
  Serial.print(" / 4095 | FC: ");
  Serial.print(heartRate, 1);
  Serial.print(" bpm | SpO2: ");
  Serial.print(spo2, 1);
  Serial.print("% | Temp: ");
  Serial.print(temperature, 1);
  Serial.print(" C | Estado: ");
  Serial.println(activity);
  Serial.println("JSON emitido:");
  Serial.println(jsonPayload);

  // 6. Enviar datos mediante HTTP POST al backend FastAPI
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    Serial.print("Enviando HTTP POST a: ");
    Serial.println(serverUrl);

    int httpCode = http.POST(jsonPayload);

    if (httpCode > 0) {
      Serial.print("-> Codigo de respuesta HTTP: ");
      Serial.println(httpCode);
      String response = http.getString();
      Serial.print("-> Respuesta del servidor: ");
      Serial.println(response);
    } else {
      Serial.print("-> Error en HTTP POST: ");
      Serial.println(http.errorToString(httpCode).c_str());
    }

    http.end();
  } else {
    Serial.println("[Aviso] WiFi no conectado. Transmision HTTP omitida en esta muestra.");
  }

  Serial.println("---------------------------------------------------------\n");

  // Frecuencia de muestreo: cada 2 segundos
  delay(2000);
}