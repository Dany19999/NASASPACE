# ASTRAHEALTH-AI — Simulación IoT en Wokwi (ESP32)

Kit de telemetría médica para astronautas simulado mediante un microcontrolador **ESP32** en la plataforma virtual **Wokwi**.

---

## 🔗 Enlace al Proyecto Wokwi

Puedes abrir, ejecutar y probar la simulación en tiempo real directamente desde tu navegador:

* **Proyecto Wokwi:** [https://wokwi.com/projects/478637477072440321](https://wokwi.com/projects/478637477072440321)

---

## 📋 Requerimientos Implementados

1. **Circuito Virtual con ESP32:**
   - Placa ESP32 DevKit (`board-esp32-devkit-c-v4`) con conexión al monitor serial.
   - Potenciómetro lineal analógico (`wokwi-potentiometer`) conectado a **GPIO 34** (ADC1_CH6).
2. **Generación de Datos Fisiológicos Simulados:**
   - **Frecuencia Cardíaca:** 60.0 a 140.0 lpm (bpm).
   - **Saturación de Oxígeno (SpO₂):** 90.0% a 100.0%.
   - **Temperatura Corporal:** 36.0°C a 39.5°C.
3. **Modulación Dinámica mediante Potenciómetro:**
   - Al rotar el potenciómetro de 0 a 4095, las 3 variables varían de forma simultánea y proporcional con resolución decimal continua.
   - Cálculo automático del estado de actividad del astronauta (`resting`, `exercise`, `eva`).
4. **Visualización en Monitor Serial en Formato JSON:**
   - Emisión cada 2 segundos con formato estructurado legible por consola y por analizadores automáticos.
5. **Preparación y Envío HTTP POST al Backend FastAPI:**
   - Conexión a red WiFi simulada `Wokwi-GUEST`.
   - Cliente HTTP con cabecera `Content-Type: application/json`.
   - Impresión del código de respuesta del servidor y confirmación de persistencia.

---

## 🔌 Conexiones del Circuito (`diagram.json`)

| Componente | Pin Componente | Pin ESP32 | Función / Color de Cable |
| :--- | :--- | :--- | :--- |
| **Potenciómetro** | `VCC` | `3V3` | Alimentación positiva (Rojo) |
| **Potenciómetro** | `GND` | `GND.1` | Referencia de tierra (Negro) |
| **Potenciómetro** | `SIG` | `GPIO 34` | Señal analógica de entrada ADC1 (Verde) |
| **Serial Monitor** | `RX` | `TX` | Transmisión serial de telemetría |
| **Serial Monitor** | `TX` | `RX` | Recepción serial de comandos |

---

## 📦 Formato del JSON Emitido

```json
{
  "device_id": "ASTRA-ESP32-01",
  "frecuencia_cardiaca": 84.5,
  "heart_rate": 84.5,
  "spo2": 97.2,
  "temperatura": 36.8,
  "temperature": 36.8,
  "activity": "resting",
  "potenciometro": 1250
}
```

> **Nota de Compatibilidad:** El payload incluye claves tanto en español (`frecuencia_cardiaca`, `temperatura`) como en inglés (`heart_rate`, `temperature`), asegurando compatibilidad directa con el esquema Pydantic `MeasurementCreate` del backend y con interfaces de evaluación académica.

---

## 🚀 Instrucciones para Ejecutar la Simulación

1. Abre el enlace [Wokwi ESP32](https://wokwi.com/projects/478637477072440321).
2. Haz clic en el botón verde **Start Simulation** (Play).
3. Abre la pestaña **Serial Monitor** en la parte inferior para ver los registros y los JSON generados.
4. Gira la perilla del potenciómetro para alterar los signos vitales y ver cómo cambian en tiempo real.
5. **Configuración del endpoint backend:**
   - En `sketch.ino`, la variable `serverUrl` está configurada por defecto hacia:
     `https://nasaspace-main.onrender.com/api/v1/measurements`
   - Si deseas apuntar a un backend local en desarrollo, puedes usar la pasarela Wokwi IoT Gateway:
     `http://host.wokwi.internal:8000/api/v1/measurements` (o alias `/api/telemetria`).

---

## 📁 Archivos Entregables

- **`sketch.ino`**: Código C++ para Arduino/ESP32 con lógica de muestreo, cálculo de signos vitales, JSON y cliente HTTP.
- **`diagram.json`**: Definición gráfica y cableado del circuito para el simulador Wokwi.
- **`wokwi.toml`**: Configuración de entorno Wokwi.