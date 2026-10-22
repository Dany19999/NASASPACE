# ASTRAHEALTH-AI 🚀🩺

> Prototipo educativo de software de monitoreo de la salud para astronautas en misiones espaciales.
> Proyecto desarrollado para el desafío **NASA Space Apps 2026**.

---

## 🎯 1. Objetivo del Proyecto

**ASTRAHEALTH-AI** es un sistema integral de telemetría y monitoreo fisiológico en tiempo real diseñado para simular el seguimiento de la salud de astronautas en entornos de microgravedad y aislamiento espacial. El sistema captura métricas vitales, detecta anomalías fisiológicas mediante modelos de Inteligencia Artificial (`IsolationForest`) y reglas de seguridad clínicas, y despliega visualizaciones y alertas en un centro de control (dashboard web).

> ⚠️ **Aviso ético y de alcance:** Este software es un **prototipo educativo y de demostración**. Utiliza datos sintéticos y algoritmos de referencia con fines conceptuales; **no** constituye un dispositivo ni un sistema de diagnóstico médico validado.

---

## 🛠️ 2. Stack Tecnológico

- **Frontend:** React + Vite (Dashboard interactivo, métricas en tiempo real y alertas).
- **Backend:** Python + FastAPI (API REST asíncrona, validación de esquemas y lógica de negocio).
- **Inteligencia Artificial:** Python + scikit-learn (IsolationForest + motor de reglas clínicas deterministas).
- **Base de Datos:** Supabase PostgreSQL (Almacenamiento de telemetría y eventos de alerta).
- **IoT / Simulación de Sensores:** ESP32 simulado en Wokwi (Generación de datos biométricos).
- **Despliegue Cloud:** Render (Web Service para Backend y Static Site para Frontend vía `render.yaml`).
- **Control de Versiones:** Git & GitHub.

---

## 🏛️ 3. Estructura del Proyecto

```text
ASTRAHEALTH-AI/
├── backend/       # API FastAPI, esquemas Pydantic, conexión Supabase y módulo de IA
├── frontend/      # Dashboard React + Vite, gráficos históricos SVG y panel de alertas
├── iot/           # Archivos y esquemas de simulación ESP32 en Wokwi
├── supabase/      # Migraciones SQL y esquemas de tablas
├── render.yaml    # Blueprint de infraestructura como código para Render
├── .gitignore     # Exclusión estricta de secretos, entornos virtuales y dependencias
└── README.md      # Documentación principal del sistema
```

---

## 🚀 4. Estado de Fases de Desarrollo

- [x] **Fase 1:** Estructura inicial del repositorio y configuración de directrices.
- [x] **Fase 2:** Backend modular con FastAPI y validaciones con Pydantic.
- [x] **Fase 3:** Integración con Supabase PostgreSQL y persistencia relacional.
- [x] **Fase 4:** Módulo de Inteligencia Artificial (IsolationForest) y reglas clínicas.
- [ ] **Fase 5:** Simulación IoT de ESP32 en Wokwi (gestionada por el equipo de hardware/IoT).
- [x] **Fase 6:** Dashboard interactivo en React + Vite.
- [x] **Fase 7:** Integración integral y preparación para despliegue en Render.

---

## 🏃 5. Ejecución Local del Proyecto

### 5.1. Backend (FastAPI)
```bash
cd backend
python -m venv .venv
# Activar entorno (.venv\Scripts\activate en Windows o source .venv/bin/activate en Linux/macOS)
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
* **Documentación interactiva Swagger:** [http://localhost:8000/docs](http://localhost:8000/docs)
* **Health Check:** [http://localhost:8000/health](http://localhost:8000/health)

### 5.2. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
* **Dashboard Web:** [http://localhost:5173](http://localhost:5173)

---

## ☁️ 6. Guía de Despliegue en Render

El repositorio incluye el archivo [render.yaml](file:///c:/Users/LENIN/Documents/ASTRAHEALTH/render.yaml) para desplegar el backend y el frontend en Render mediante Blueprints.

### 6.1. Servicio 1: Backend (`astrahealth-backend`)
* **Tipo:** Web Service (Python)
* **Root Directory:** `backend`
* **Build Command:** `pip install -r requirements.txt`
* **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
* **Variables de entorno:**
  * `DATABASE_URL`: Cadena de conexión al pooler de Supabase (`postgresql://postgres.[REF]:[PASS]@[HOST]:6543/postgres?sslmode=require`).
  * `CORS_ORIGINS`: URL del frontend desplegado en Render (o `*`).
  * `PYTHON_VERSION`: `3.11.9`

### 6.2. Servicio 2: Frontend (`astrahealth-frontend`)
* **Tipo:** Static Site
* **Root Directory:** `frontend`
* **Build Command:** `npm install && npm run build`
* **Publish Directory:** `dist`
* **Rewrite Rule:** `/*` ➔ `/index.html` (SPA routing)
* **Variables de entorno:**
  * `VITE_API_URL`: URL pública asignada al backend en Render (ej. `https://astrahealth-backend.onrender.com`).
