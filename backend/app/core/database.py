"""Configuración de conexión y sesión de base de datos con SQLAlchemy.
Conecta con Supabase PostgreSQL mediante DATABASE_URL.
"""

from typing import Generator
from fastapi import HTTPException, status
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session

from app.core.config import DATABASE_URL

Base = declarative_base()

engine = None
SessionLocal = None

if DATABASE_URL:
    db_url = DATABASE_URL
    # Normalizar esquemas de conexión para compatibilidad con SQLAlchemy 2.0 y psycopg2
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql+psycopg2://", 1)
    elif db_url.startswith("postgresql://") and not db_url.startswith("postgresql+"):
        db_url = db_url.replace("postgresql://", "postgresql+psycopg2://", 1)

    # Traducir automáticamente host directo de Supabase (IPv6) al pooler IPv4 de AWS
    import re
    supabase_match = re.search(r"@db\.([a-zA-Z0-9]+)\.supabase\.co(?::\d+)?/(.+)", db_url)
    if supabase_match:
        project_ref = supabase_match.group(1)
        db_name = supabase_match.group(2)
        prefix = db_url[:supabase_match.start()]
        if "://postgres:" in prefix:
            prefix = prefix.replace("://postgres:", f"://postgres.{project_ref}:")
        db_url = f"{prefix}@aws-0-us-east-1.pooler.supabase.com:5432/{db_name}"

    engine = create_engine(
        db_url,
        pool_pre_ping=True,
        pool_recycle=300,
        connect_args={"connect_timeout": 5},
    )
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """Dependencia de FastAPI para obtener una sesión de base de datos.
    Gestiona la apertura y cierre seguros de la sesión.
    """
    if SessionLocal is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="La base de datos PostgreSQL no está configurada. Configure DATABASE_URL en su archivo .env."
        )
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
