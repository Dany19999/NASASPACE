# ASTRAHEALTH-AI — Frontend Dashboard (React + Vite)

Dashboard interactivo y centro de control para el monitoreo de la salud de astronautas en misiones espaciales. Proyecto desarrollado para el desafío **NASA Space Apps 2026**.

---

## 🚀 1. Instalación de Dependencias

Desde la carpeta `frontend/`:

```bash
npm install
```

---

## 🔑 2. Variables de Entorno

El frontend se conecta al backend de FastAPI mediante la variable `VITE_API_URL`.

Copia el archivo `.env.example` a `.env`:

```bash
cp .env.example .env
```

Contenido por defecto en `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000
```

---

## 🏃 3. Ejecución en Desarrollo

Para iniciar el servidor de desarrollo local con Vite:

```bash
npm run dev
```

El dashboard estará disponible en: [http://localhost:5173](http://localhost:5173)

---

## 📦 4. Compilación para Producción

Para compilar el proyecto optimizado:

```bash
npm run build
```

Los artefactos listos para despliegue se generarán en la carpeta `frontend/dist/`.
