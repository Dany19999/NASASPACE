from pathlib import Path
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.api.health import router as health_router
from app.api.v1.ai import router as ai_router
from app.api.v1.measurements import router as measurements_router
from app.core.config import API_V1_PREFIX, CORS_ORIGINS, PROJECT_NAME, VERSION

app = FastAPI(
    title=PROJECT_NAME,
    version=VERSION,
    description=(
        "API REST para el monitoreo fisiológico de astronautas en misiones espaciales. "
        "Desarrollado para el desafío NASA Space Apps 2026."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusión de rutas API
app.include_router(health_router)
app.include_router(measurements_router, prefix=API_V1_PREFIX)
app.include_router(ai_router, prefix=API_V1_PREFIX)

# Configuración de archivos estáticos del frontend React
BASE_DIR = Path(__file__).resolve().parent.parent
possible_dirs = [
    BASE_DIR / "static",
    BASE_DIR.parent / "static",
    BASE_DIR.parent / "frontend" / "dist",
    Path("static").resolve(),
    Path("backend/static").resolve(),
]
STATIC_DIR = next((d for d in possible_dirs if (d / "index.html").is_file()), BASE_DIR / "static")

if STATIC_DIR.exists() and (STATIC_DIR / "assets").exists():
    app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="static_assets")


@app.get("/favicon.svg", include_in_schema=False)
async def serve_favicon():
    fav = STATIC_DIR / "favicon.svg"
    if fav.is_file():
        return FileResponse(fav)
    raise HTTPException(status_code=404, detail="Favicon not found")


@app.get("/icons.svg", include_in_schema=False)
async def serve_icons():
    icon = STATIC_DIR / "icons.svg"
    if icon.is_file():
        return FileResponse(icon)
    raise HTTPException(status_code=404, detail="Icons not found")


@app.get("/", tags=["Root"], summary="Punto de bienvenida de la API o Dashboard Web")
async def root(request: Request):
    """Retorna el Dashboard interactivo para navegadores web o metadatos JSON para clientes de API."""
    accept = request.headers.get("accept", "")
    # Si la petición proviene de un navegador web (solicita text/html) y los estáticos existen
    if "text/html" in accept and STATIC_DIR.exists() and (STATIC_DIR / "index.html").is_file():
        return FileResponse(STATIC_DIR / "index.html")

    return {
        "project": PROJECT_NAME,
        "version": VERSION,
        "docs": "/docs",
        "health": "/health",
        "api_v1": API_V1_PREFIX,
    }


@app.get("/dashboard", tags=["Root"], summary="Acceso directo al Dashboard Web")
async def dashboard():
    """Acceso directo al Dashboard interactivo de monitoreo de salud."""
    index_file = STATIC_DIR / "index.html"
    if index_file.is_file():
        return FileResponse(index_file)
    return {
        "project": PROJECT_NAME,
        "version": VERSION,
        "message": "Dashboard en construcción. Por favor verifique los archivos estáticos."
    }
