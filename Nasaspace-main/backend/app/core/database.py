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

    engine = create_engine(
        db_url,
        pool_pre_ping=True,
        pool_recycle=300,
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
