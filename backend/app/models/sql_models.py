"""Modelos ORM de SQLAlchemy compatibles con las tablas de Supabase PostgreSQL.
Respeta exactamente las columnas y tipos de las tablas 'measurements' y 'alerts' en Supabase.
"""

from datetime import datetime, timezone
from sqlalchemy import BigInteger, Column, DateTime, Float, ForeignKey, Integer, Text

from app.core.database import Base


class Measurement(Base):
    """Modelo ORM para la tabla 'measurements' de Supabase."""
    __tablename__ = "measurements"

    id = Column(
        BigInteger().with_variant(Integer, "sqlite"),
        primary_key=True,
        index=True,
        autoincrement=True
    )
    device_id = Column(Text, nullable=False, index=True)
    heart_rate = Column(Integer, nullable=False)
    spo2 = Column(Float, nullable=False)
    temperature = Column(Float, nullable=False)
    activity = Column(Text, nullable=False)
    # Mapea measured_at en Supabase con el atributo timestamp de la API
    timestamp = Column(
        "measured_at",
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc)
    )
    # Mapea created_at en Supabase con el atributo received_at de la API
    received_at = Column(
        "created_at",
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc)
    )


class Alert(Base):
    """Modelo ORM para la tabla 'alerts' de Supabase."""
    __tablename__ = "alerts"

    id = Column(
        BigInteger().with_variant(Integer, "sqlite"),
        primary_key=True,
        index=True,
        autoincrement=True
    )
    measurement_id = Column(
        BigInteger().with_variant(Integer, "sqlite"),
        ForeignKey("measurements.id", ondelete="SET NULL"),
        nullable=True
    )
    severity = Column(Text, nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc)
    )
