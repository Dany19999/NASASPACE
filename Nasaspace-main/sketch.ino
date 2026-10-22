#include <Arduino.h>

// Definición del pin del potenciómetro
const int POT_PIN = 34;

void setup() {
  // Inicializar comunicación serial a 115200 baudios
  Serial.begin(115200);
  delay(1000);
  
  pinMode(POT_PIN, INPUT);
  Serial.println("=== Sistema de Simulacion Fisiologica ESP32 iniciado ===");
}

void loop() {
  // 1. Leer el valor del potenciómetro (0 - 4095)
  int potValue = analogRead(POT_PIN);

  // 2. Simular datos fisiológicos en función del potenciómetro
  int heartRate = map(potValue, 0, 4095, 60, 160);
  float spo2 = map(potValue, 0, 4095, 95, 100); 
  float temperature = 36.0 + (float(potValue) / 4095.0) * 3.5;

  // 3. Crear el string en formato JSON
  String jsonPayload = "{";
  jsonPayload += "\"device_id\": \"esp32_sim_01\",";
  jsonPayload += "\"heart_rate\": " + String(heartRate) + ",";
  jsonPayload += "\"spo2\": " + String(spo2, 1) + ",";
  jsonPayload += "\"temperature\": " + String(temperature, 2);
  jsonPayload += "}";

  // 4. Mostrar en el monitor serial
  Serial.println(jsonPayload);

  // Esperar 2 segundos antes de la siguiente lectura
  delay(2000);
}