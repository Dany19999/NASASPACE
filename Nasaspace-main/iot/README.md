# ASTRAHEALTH-AI — Simulación IoT en Wokwi (ESP32)

Kit de telemetría médica para astronautas simulado mediante un microcontrolador **ESP32** en la plataforma **Wokwi**.

---

## 🛠️ Componentes Simulados

* **Microcontrolador:** ESP32 DevKit v4.
* **Sensores virtuales:**
  * Monitor de frecuencia cardíaca (lpm) con variaciones de reposo y actividad.
  * Pulsioxímetro de saturación de oxígeno (SpO₂ %).
  * Sensor de temperatura corporal (°C).
* **Conectividad:** WiFi simulado (`Wokwi-GUEST`) y cliente HTTP REST.

---

## 🚀 Cómo Ejecutar la Simulación

1. Abre [Wokwi](https://wokwi.com/).
2. Crea un nuevo proyecto para **ESP32**.
3. Copia el contenido de [sketch.ino](file:///c:/Users/LENIN/Documents/ASTRAHEALTH/iot/sketch.ino) en el editor de código.
4. En la pestaña de configuración del circuito, pega el contenido de [diagram.json](file:///c:/Users/LENIN/Documents/ASTRAHEALTH/iot/diagram.json).
5. Configura la URL del endpoint en `serverUrl`:
   * Para conectar con tu backend desplegado en Render:
     `https://<tu-backend>.onrender.com/api/v1/measurements`
   * Para pruebas locales: usa la pasarela Wokwi IoT Gateway (`http://host.wokwi.internal:8000/api/v1/measurements`).
6. Inicia la simulación (botón verde de Play). Observa el monitor serie y la transmisión de datos hacia el dashboard.
