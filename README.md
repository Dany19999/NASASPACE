# ASTRAHEALTH-AI 🚀🩺

> Prototipo educativo de software de monitoreo de la salud para astronautas en misiones espaciales.
> Proyecto desarrollado para el desafío **NASA Space Apps 2026**.

---

## 🎯 1. Objetivo del Proyecto

**ASTRAHEALTH-AI** es un sistema integral de telemetría y monitoreo fisiológico en tiempo real diseñado para simular el seguimiento de la salud de astronautas en entornos de microgravedad y aislamiento espacial. El sistema captura métricas vitales simuladas, detecta anomalías fisiológicas mediante modelos de Inteligencia Artificial y reglas de seguridad, y despliega visualizaciones y alertas en un centro de control (dashboard web).

> ⚠️ **Aviso ético y de alcance:** Este software es un **prototipo educativo y de demostración**. Utiliza datos sintéticos y algoritmos de referencia con fines conceptuales; **no** constituye un dispositivo ni un sistema de diagnóstico médico validado.

---

## 🛠️ 2. Stack Tecnológico

- **Frontend:** React + Vite (Dashboard interactivo, métricas en tiempo real y alertas).
- **Backend:** Python + FastAPI (API REST asíncrona, validación de esquemas y lógica de negocio).
- **Inteligencia Artificial:** Python + scikit-learn (Detección de anomalías en series de telemetría fisiológica).
- **Base de Datos:** Supabase (PostgreSQL relacional para almacenamiento de dispositivos, telemetría y eventos de alerta).
- **IoT / Simulación de Sensores:** ESP32 simulado en Wokwi (Generación y transmisión de datos fisiológicos simulados).
- **Despliegue Cloud:** Render (Alojamiento web y servicios backend).
- **Control de Versiones:** Git & GitHub.

---

## 🏛️ 3. Estructura y Áreas Principales del Sistema

```text
ASTRAHEALTH-AI/
├── backend/       # API FastAPI, validación de datos (Pydantic), lógica e IA
├── frontend/      # Dashboard React + Vite, gráficos de telemetría y alertas
├── iot/           # Simulación ESP32 en Wokwi, firmware y esquemas de circuito
├── supabase/      # Migraciones SQL, esquemas de tablas y datos de prueba
├── .gitignore     # Exclusión de secretos, dependencias y temporales
└── README.md      # Documentación principal de la arquitectura
```

### Responsabilidades por Módulo:

1. **`backend/` (Servicios y Lógica de Negocio):**
   - API REST construida con FastAPI.
   - Validación estricta de esquemas de telemetría con Pydantic (frecuencia cardíaca, SpO₂, temperatura corporal, actividad).
   - Módulo de inferencia de IA para detección de anomalías y motor de reglas preventivas.
   - Integración con base de datos Supabase.

2. **`frontend/` (Centro de Control de Misión):**
   - Interfaz moderna desarrollada con React y Vite.
   - Monitorización en tiempo real de astronautas y signos vitales.
   - Gráficos históricos de tendencias fisiológicas.
   - Panel de notificaciones y gestión de alertas críticas.

3. **`iot/` (Dispositivos Médicos Simulados):**
   - Simulación de microcontrolador ESP32 en la plataforma Wokwi.
   - Generación de señales biométricas sintéticas continuas.
   - Envío de telemetría hacia el backend a través de protocolos de red (HTTP/MQTT).

4. **`supabase/` (Capa de Persistencia Relacional):**
   - Definición de tablas para `astronautas/dispositivos`, `mediciones` y `alertas`.
   - Scripts de migración SQL reproducibles.
   - Conjuntos de datos sintéticos iniciales (seeding) para pruebas.

---

## 🚀 4. Fases de Desarrollo

- [x] **Fase 1:** Estructura inicial del repositorio y configuración de directrices.
- [ ] **Fase 2:** Backend modular con FastAPI y validaciones con Pydantic.
- [ ] **Fase 3:** Configuración y esquemas en Supabase PostgreSQL.
- [ ] **Fase 4:** Módulo de Inteligencia Artificial y detección de anomalías.
- [ ] **Fase 5:** Simulación IoT de ESP32 en Wokwi.
- [ ] **Fase 6:** Dashboard interactivo en React + Vite.
- [ ] **Fase 7:** Integración integral y despliegue en Render.
