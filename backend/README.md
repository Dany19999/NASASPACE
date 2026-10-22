# ASTRAHEALTH-AI — Backend API

Backend modular desarrollado con **FastAPI**, validación de datos con **Pydantic** y persistencia relacional con **SQLAlchemy** conectada a **Supabase PostgreSQL** para el monitoreo fisiológico de astronautas en misiones espaciales.

---

## 🚀 1. Instalación de Dependencias

Se recomienda utilizar un entorno virtual de Python (3.10+):

```bash
# Crear y activar entorno virtual (opcional pero recomendado)
python -m venv .venv
# En Windows:
.venv\Scripts\activate
# En Linux/macOS:
source .venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

---

## 🔑 2. Configuración de Variables de Entorno

Copiar el archivo de plantilla `.env.example` a `.env` dentro de `backend/`:

```bash
cp .env.example .env
```

Configurar la variable de conexión a Supabase:

```env
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

> 🔒 **Seguridad:** El archivo `.env` se encuentra ignorado por `.gitignore` y jamás debe ser subido al repositorio.

---

## 🏃 3. Ejecución del Servidor

Desde el directorio `backend/`:

```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

* **Swagger UI interactivo:** [http://localhost:8000/docs](http://localhost:8000/docs)
* **ReDoc:** [http://localhost:8000/redoc](http://localhost:8000/redoc)
* **Comprobación de salud:** [http://localhost:8000/health](http://localhost:8000/health)

---

## 🧪 4. Ejecución de Pruebas Automatizadas

Desde el directorio `backend/`:

```bash
python -m pytest tests -v
```

---

## 📡 5. Endpoints Disponibles

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/health` | Diagnóstico de estado operativo de la API y de la conexión a Supabase |
| `POST` | `/api/v1/measurements` | Recibir, validar y persistir telemetría de signos vitales en Supabase |
| `GET` | `/api/v1/measurements/latest` | Obtener la última medición registrada en la base de datos |
| `GET` | `/api/v1/measurements/history` | Obtener historial temporal de mediciones (`?limit=50`) |
| `POST` | `/api/v1/ai/analyze` | Análisis de anomalías con IsolationForest y reglas de seguridad |
| `POST` | `/api/v1/ai/retrain` | Calibrar modelo IsolationForest con historial de telemetría de Supabase |
