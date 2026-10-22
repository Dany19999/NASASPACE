"""Módulo raíz de enlace para compatibilidad de despliegue en Render.
Permite ejecutar tanto 'uvicorn main:app' como 'uvicorn app.main:app' sin errores.
"""

import sys
from pathlib import Path

# Asegurar que backend esté en el sys.path
backend_root = Path(__file__).resolve().parent / "backend"
if str(backend_root) not in sys.path:
    sys.path.insert(0, str(backend_root))

# Exportar la instancia de FastAPI
from app.main import app  # noqa: F401, E402
