/*
 * ======================================================================================
 * PROYECTO: ASTRAHEALTH-AI — TELEMETRIA FISIOLOGICA EN TIEMPO REAL
 * Microcontrolador: ESP32 DevKit V1 (Wokwi)
 * ======================================================================================
 * 1. Lee el sensor de telemetria en GPIO 34 (potenciometro).
 * 2. Mapea frecuencia cardiaca (60-160 bpm), SpO2 (92-99%) y temperatura (36.2-38.5 C).
 * 3. Se conecta a Internet virtual mediante Wokwi-GUEST.
 * 4. Transmite automaticamente los datos via HTTPS POST cada 3 segundos a:
 *    https://nasaspace-6rr9.onrender.com/api/v1/measurements
 * ======================================================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>

// Pin analogico de telemetria (GPIO 34)
const int potPin = 34;
// Pin LED indicador de transmision (LED integrado GPIO 2)
const int ledPin = 2;

// Credenciales WiFi de la red virtual de Wokwi
const char* ssid = "Wokwi-GUEST";
const char* password = "";

// URL del backend desplegado en Render
const char* serverUrl = "https://nasaspace-6rr9.onrender.com/api/v1/measurements";

void setup() {
  Serial.begin(115200);
  delay(1000);

  pinMode(potPin, INPUT);
  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);

  Serial.println("\n=======================================================");
  Serial.println("  ASTRAHEALTH-AI — ESP32 Telemetria en Tiempo Real     ");
  Serial.println("=======================================================");

  Serial.print("[WiFi] Conectando a red: ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);

  int intentos = 0;
  while (WiFi.status() != WL_CONNECTED && intentos < 25) {
    delay(400);
    digitalWrite(ledPin, !digitalRead(ledPin));
    Serial.print(".");
    intentos++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    digitalWrite(ledPin, HIGH);
    delay(500);
    digitalWrite(ledPin, LOW);
    Serial.println("\n[WiFi] Conectado exitosamente.");
    Serial.print("[WiFi] IP local: ");
    Serial.println(WiFi.localIP());
    Serial.print("[Cloud] Servidor destino: ");
    Serial.println(serverUrl);
  } else {
    Serial.println("\n[WiFi] Reintentando conexion en segundo plano...");
  }

  Serial.println("=======================================================\n");
}

void loop() {
  // 1. Lectura del sensor fisiologico (ADC de 12 bits: 0 a 4095)
  int potValue = analogRead(potPin);
  float factor = (float)potValue / 4095.0;

  // 2. Mapeo a valores fisiologicos continuos
  float heartRate = 60.0 + (factor * 100.0);       // 60.0 a 160.0 bpm
  float spo2 = 92.0 + (factor * 7.9);             // 92.0% a 99.9%
  float temperature = 36.2 + (factor * 2.3);      // 36.2 C a 38.5 C

  // 3. Nivel de actividad segun la demanda fisiologica
  String activity = "resting";
  if (heartRate >= 130.0) {
    activity = "eva";
  } else if (heartRate >= 95.0) {
    activity = "exercise";
  } else {
    activity = "resting";
  }

  // 4. Construccion del payload JSON para la API
  String jsonPayload = "{";
  jsonPayload += "\"device_id\":\"ASTRA-ESP32-01\",";
  jsonPayload += "\"heart_rate\":" + String(heartRate, 1) + ",";
  jsonPayload += "\"spo2\":" + String(spo2, 1) + ",";
  jsonPayload += "\"temperature\":" + String(temperature, 1) + ",";
  jsonPayload += "\"activity\":\"" + activity + "\"";
  jsonPayload += "}";

  // 5. Salida en Monitor Serial
  Serial.println("---------------- [TRANSMISION DE TELEMETRIA] ----------------");
  Serial.print("HR: ");
  Serial.print(heartRate, 1);
  Serial.print(" bpm | SpO2: ");
  Serial.print(spo2, 1);
  Serial.print("% | Temp: ");
  Serial.print(temperature, 1);
  Serial.print(" C | Act: ");
  Serial.println(activity);

  // 6. Transmision HTTPS en tiempo real al backend
  if (WiFi.status() == WL_CONNECTED) {
    digitalWrite(ledPin, HIGH); // Encender LED durante envio

    WiFiClientSecure client;
    client.setInsecure(); // Conexion SSL sin verificacion rigida de CA

    HTTPClient http;
    http.begin(client, serverUrl);
    http.addHeader("Content-Type", "application/json");

    int httpCode = http.POST(jsonPayload);

    if (httpCode > 0) {
      Serial.print("[Cloud] Respuesta HTTP: ");
      Serial.println(httpCode);
      if (httpCode == 201 || httpCode == 200) {
        Serial.println("[Cloud] Telemetria registrada con exito en la base de datos.");
      }
    } else {
      Serial.print("[Cloud] Error en envio: ");
      Serial.println(http.errorToString(httpCode).c_str());
    }

    http.end();
    digitalWrite(ledPin, LOW); // Apagar LED
  } else {
    Serial.println("[Aviso] WiFi reconectando...");
    WiFi.reconnect();
  }

  Serial.println("-------------------------------------------------------------\n");

  // Intervalo de transmision continua: cada 3 segundos
  delay(3000);
}