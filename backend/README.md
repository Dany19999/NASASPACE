# ASTRAHEALTH-AI — Backend API

Backend modular desarrollado con **FastAPI** y validación de datos con **Pydantic** para el monitoreo fisiológico de astronautas en misiones espaciales.

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

## 🏃 2. Ejecución del Servidor

Desde el directorio `backend/`:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

* **Swagger UI interactivo:** [http://localhost:8000/docs](http://localhost:8000/docs)
* **ReDoc:** [http://localhost:8000/redoc](http://localhost:8000/redoc)
* **Comprobación de salud:** [http://localhost:8000/health](http://localhost:8000/health)

---

## 🧪 3. Ejecución de Pruebas Automatizadas

Desde el directorio `backend/`:

```bash
pytest tests -v
```

o ejecutando mediante el intérprete de Python:

```bash
python -m pytest tests -v
```

---

## 📡 4. Endpoints Disponibles

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/health` | Comprobación de estado operativo del servicio |
| `POST` | `/api/v1/measurements` | Recibir y validar telemetría de signos vitales |
| `GET` | `/api/v1/measurements/latest` | Obtener la última medición registrada |
| `GET` | `/api/v1/measurements/history` | Obtener historial temporal de mediciones (`?limit=50`) |
