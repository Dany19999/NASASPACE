/*
 * ======================================================================================
 * PROYECTO: ASTRAHEALTH-AI — TELEMETRIA FISIOLOGICA EN TIEMPO REAL
 * Microcontrolador: ESP32 DevKit V1 (Wokwi Simulator)
 * ======================================================================================
 * 1. Lee el sensor fisiológico en GPIO 34 (potenciómetro de control de régimen).
 * 2. Genera telemetría dinámica continua con oscilación fisiológica en tiempo real.
 * 3. Se conecta a Internet virtual mediante Wokwi-GUEST.
 * 4. Transmite automáticamente los datos vía HTTPS POST cada 2.5 segundos a:
 *    https://nasaspace-6rr9.onrender.com/api/v1/measurements
 * ======================================================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>

// Pin analógico de telemetría (GPIO 34)
const int potPin = 34;
// Pin LED indicador de transmisión (LED integrado GPIO 2)
const int ledPin = 2;

// Credenciales WiFi de la red virtual de Wokwi
const char* ssid = "Wokwi-GUEST";
const char* password = "";

// URL del backend desplegado en Render
const char* serverUrl = "https://nasaspace-6rr9.onrender.com/api/v1/measurements";

// Contador secuencial de paquetes enviados
unsigned long packetCount = 0;

void setup() {
  Serial.begin(115200);
  delay(1000);

  pinMode(potPin, INPUT);
  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);

  Serial.println("\n=======================================================");
  Serial.println("  ASTRAHEALTH-AI — ESP32 Telemetria en Tiempo Real     ");
  Serial.println("=======================================================");
  Serial.print("[WiFi] Conectando a red virtual: ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  int intentos = 0;
  while (WiFi.status() != WL_CONNECTED && intentos < 25) {
    delay(400);
    Serial.print(".");
    intentos++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    digitalWrite(ledPin, HIGH);
    delay(400);
    digitalWrite(ledPin, LOW);
    Serial.println("\n[WiFi] Enlace establecido con exito.");
    Serial.print("[WiFi] IP local asignada: ");
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
  float factor = (float)potValue / 4095.0; // Rango 0.0 a 1.0

  // 2. Oscilacion fisiologica natural en tiempo real (variabilidad cardiaca y respiratoria)
  unsigned long now = millis();
  float hrOsc = sin(now / 1600.0) * 2.2 + ((float)random(-8, 8) / 10.0);
  float spo2Osc = cos(now / 2400.0) * 0.35 + ((float)random(-3, 3) / 10.0);
  float tempOsc = sin(now / 4500.0) * 0.12;

  // 3. Calculo dinamico segun la posicion del potenciometro
  float baseHr;
  float baseSpo2;
  float baseTemp;
  String activity;

  if (factor < 0.30) {
    // Estado de Reposo (Nominal / Estable)
    baseHr = 68.0 + (factor / 0.30) * 12.0;       // 68.0 a 80.0 bpm
    baseSpo2 = 98.4 - (factor / 0.30) * 0.7;      // 98.4% a 97.7%
    baseTemp = 36.4 + (factor / 0.30) * 0.4;      // 36.4 a 36.8 C
    activity = "resting";
  } else if (factor < 0.65) {
    // Estado de Actividad Fisica / Ejercicio
    float sub = (factor - 0.30) / 0.35;
    baseHr = 82.0 + sub * 38.0;                  // 82.0 a 120.0 bpm
    baseSpo2 = 97.6 - sub * 1.5;                 // 97.6% a 96.1%
    baseTemp = 36.8 + sub * 0.6;                 // 36.8 a 37.4 C
    activity = "exercise";
  } else if (factor < 0.88) {
    // Actividad Extravehicular (EVA) / Demanda Elevada
    float sub = (factor - 0.65) / 0.23;
    baseHr = 122.0 + sub * 28.0;                 // 122.0 a 150.0 bpm
    baseSpo2 = 96.0 - sub * 3.5;                 // 96.0% a 92.5%
    baseTemp = 37.4 + sub * 0.8;                 // 37.4 a 38.2 C
    activity = "eva";
  } else {
    // Estado de Sobreesfuerzo Critico / Hipoxia y Estres Fisiologico
    float sub = (factor - 0.88) / 0.12;
    baseHr = 152.0 + sub * 26.0;                 // 152.0 a 178.0 bpm
    baseSpo2 = 92.2 - sub * 4.8;                 // 92.2% a 87.4%
    baseTemp = 38.2 + sub * 0.9;                 // 38.2 a 39.1 C
    activity = "eva";
  }

  float heartRate = constrain(baseHr + hrOsc, 45.0, 195.0);
  float spo2 = constrain(baseSpo2 + spo2Osc, 80.0, 99.8);
  float temperature = constrain(baseTemp + tempOsc, 35.5, 40.5);

  packetCount++;

  // 4. Construccion del payload JSON para la API
  String jsonPayload = "{";
  jsonPayload += "\"device_id\":\"ASTRA-ESP32-01\",";
  jsonPayload += "\"heart_rate\":" + String(heartRate, 1) + ",";
  jsonPayload += "\"spo2\":" + String(spo2, 1) + ",";
  jsonPayload += "\"temperature\":" + String(temperature, 1) + ",";
  jsonPayload += "\"activity\":\"" + activity + "\"";
  jsonPayload += "}";

  // 5. Salida por consola Serial
  Serial.print("[#");
  Serial.print(packetCount);
  Serial.print("] HR: ");
  Serial.print(heartRate, 1);
  Serial.print(" lpm | SpO2: ");
  Serial.print(spo2, 1);
  Serial.print("% | Temp: ");
  Serial.print(temperature, 1);
  Serial.print(" C | Act: ");
  Serial.print(activity);

  // 6. Transmision HTTPS al backend en Render
  if (WiFi.status() == WL_CONNECTED) {
    digitalWrite(ledPin, HIGH);

    WiFiClientSecure client;
    client.setInsecure(); // Conexion SSL sin CA restrictiva para simulador

    HTTPClient http;
    http.begin(client, serverUrl);
    http.addHeader("Content-Type", "application/json");

    int httpCode = http.POST(jsonPayload);

    if (httpCode > 0) {
      if (httpCode == 201 || httpCode == 200) {
        Serial.print(" -> [HTTP ");
        Serial.print(httpCode);
        Serial.println(" OK: Recibido en Web]");
      } else {
        Serial.print(" -> [HTTP ");
        Serial.print(httpCode);
        Serial.println("]");
      }
    } else {
      Serial.print(" -> [Error envio: ");
      Serial.print(http.errorToString(httpCode).c_str());
      Serial.println("]");
    }

    http.end();
    digitalWrite(ledPin, LOW);
  } else {
    Serial.println(" -> [WiFi desconectado, reconectando...]");
    WiFi.reconnect();
  }

  // Intervalo de transmision en tiempo real: 2.5 segundos
  delay(2500);
}