# ASTRAHEALTH-AI — Esquema de Base de Datos (Supabase PostgreSQL)

Módulo de persistencia relacional para telemetría de astronautas y eventos de alerta.

---

## 🏛️ Estructura de Tablas

### 1. `measurements` (Telemetría Fisiológica)
* `id` (`BIGINT`, PK): Identificador autoincremental.
* `device_id` (`TEXT`): Identificador del dispositivo IoT (ej. `ASTRA-ESP32-01`).
* `heart_rate` (`INTEGER`): Frecuencia cardíaca en latidos por minuto.
* `spo2` (`DOUBLE PRECISION`): Porcentaje de saturación de oxígeno en sangre.
* `temperature` (`DOUBLE PRECISION`): Temperatura corporal en °C.
* `activity` (`TEXT`): Estado de actividad (`resting`, `exercise`, `eva`, `sleep`).
* `measured_at` (`TIMESTAMPTZ`): Marca temporal de la captura del sensor.
* `created_at` (`TIMESTAMPTZ`): Marca temporal de recepción en el servidor.

### 2. `alerts` (Anomalías y Alertas Clínicas)
* `id` (`BIGINT`, PK): Identificador autoincremental de la alerta.
* `measurement_id` (`BIGINT`, FK): Referencia a la medición causante (opcional).
* `severity` (`TEXT`): Severidad del evento (`normal`, `warning`, `critical`).
* `message` (`TEXT`): Descripción técnica del evento o anomalía detectada.
* `created_at` (`TIMESTAMPTZ`): Fecha y hora del registro.

---

## 🚀 Aplicación de Migraciones

Puedes ejecutar el script `migrations/20261022_initial_schema.sql` directamente desde el **SQL Editor** del panel de Supabase o mediante la CLI de Supabase:

```bash
supabase db push
```
