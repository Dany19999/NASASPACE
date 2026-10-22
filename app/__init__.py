"""Paquete de enlace para compatibilidad de despliegue en Render desde la raíz.
Permite que 'import app.main' resuelva transparentemente los submódulos en backend/app.
"""

import sys
from pathlib import Path

# Añadir la carpeta backend al path de búsqueda de módulos de Python
backend_root = Path(__file__).resolve().parent.parent / "backend"
if str(backend_root) not in sys.path:
    sys.path.insert(0, str(backend_root))

# Extender el path del paquete app para incluir backend/app
backend_app_path = backend_root / "app"
if str(backend_app_path) not in __path__:
    __path__.append(str(backend_app_path))
