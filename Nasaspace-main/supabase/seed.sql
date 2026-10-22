-- ============================================================================
-- ASTRAHEALTH-AI: Datos Sintéticos Iniciales (Seed Data)
-- Telemetría de prueba para demostración y evaluación del modelo de IA
-- ============================================================================

INSERT INTO public.measurements (device_id, heart_rate, spo2, temperature, activity, measured_at, created_at)
VALUES
    ('ASTRA-ESP32-01', 72, 98.4, 36.6, 'resting', now() - interval '25 minutes', now() - interval '25 minutes'),
    ('ASTRA-ESP32-01', 74, 98.2, 36.6, 'resting', now() - interval '20 minutes', now() - interval '20 minutes'),
    ('ASTRA-ESP32-01', 71, 98.5, 36.5, 'resting', now() - interval '15 minutes', now() - interval '15 minutes'),
    ('ASTRA-ESP32-01', 75, 98.1, 36.7, 'resting', now() - interval '10 minutes', now() - interval '10 minutes'),
    ('ASTRA-ESP32-01', 73, 98.6, 36.6, 'resting', now() - interval '5 minutes',  now() - interval '5 minutes'),
    ('ASTRA-ESP32-01', 115, 96.2, 37.1, 'exercise', now() - interval '3 minutes', now() - interval '3 minutes'),
    ('ASTRA-ESP32-01', 122, 95.8, 37.3, 'exercise', now() - interval '1 minute',  now() - interval '1 minute');

INSERT INTO public.alerts (measurement_id, severity, message, created_at)
VALUES
    (6, 'warning', 'Frecuencia cardíaca elevada: Taquicardia moderada (115 lpm)', now() - interval '3 minutes');
