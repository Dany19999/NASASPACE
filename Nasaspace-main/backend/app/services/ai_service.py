"""Módulo de Inteligencia Artificial y Reglas de Seguridad para telemetría fisiológica.
Utiliza scikit-learn (IsolationForest) junto a un motor determinista de reglas clínicas de referencia.
"""

import logging
from typing import Dict, List, Optional, Tuple
import numpy as np
from sklearn.ensemble import IsolationForest

logger = logging.getLogger(__name__)

# Constantes clínicas de referencia para misiones espaciales (datos orientativos)
MIN_TRAINING_SAMPLES = 20

# Límites de reglas de seguridad
RULE_THRESHOLDS = {
    "heart_rate": {
        "critical_low": 45.0,
        "warning_low": 55.0,
        "warning_high": 100.0,
        "critical_high": 140.0,
    },
    "spo2": {
        "critical_low": 90.0,
        "warning_low": 95.0,
    },
    "temperature": {
        "critical_low": 35.0,
        "warning_low": 36.0,
        "warning_high": 37.5,
        "critical_high": 38.5,
    },
}


class AstronautTelemetryAI:
    """Detector de anomalías fisiológicas para astronautas."""

    def __init__(self) -> None:
        self.model: Optional[IsolationForest] = None
        self.is_custom_trained: bool = False
        self._initialize_baseline_model()

    def _generate_synthetic_baseline(self, n_samples: int = 200) -> np.ndarray:
        """Genera un conjunto sintético de referencia con signos vitales normales en reposo/órbita.
        Datos exclusivamente sintéticos con fines educativos.
        """
        rng = np.random.default_rng(seed=42)
        # Frecuencia cardíaca normal: media 72 bpm, std 7
        hr = rng.normal(loc=72.0, scale=7.0, size=n_samples)
        hr = np.clip(hr, 55.0, 95.0)

        # SpO2 normal: media 98.2%, std 0.7
        spo2 = rng.normal(loc=98.2, scale=0.7, size=n_samples)
        spo2 = np.clip(spo2, 95.0, 100.0)

        # Temperatura normal: media 36.6 °C, std 0.25
        temp = rng.normal(loc=36.6, scale=0.25, size=n_samples)
        temp = np.clip(temp, 36.1, 37.2)

        return np.column_stack([hr, spo2, temp])

    def _initialize_baseline_model(self) -> None:
        """Inicializa el modelo IsolationForest con el baseline sintético de referencia."""
        try:
            baseline_data = self._generate_synthetic_baseline(n_samples=250)
            self.model = IsolationForest(
                n_estimators=100,
                contamination=0.04,
                random_state=42
            )
            self.model.fit(baseline_data)
            self.is_custom_trained = False
        except Exception as exc:
            logger.warning(f"Error al inicializar modelo IsolationForest: {exc}")
            self.model = None

    def train_with_history(self, samples: List[List[float]]) -> bool:
        """Entrena el modelo si se dispone de suficientes muestras históricas reales de la base de datos."""
        if len(samples) < MIN_TRAINING_SAMPLES:
            self.is_custom_trained = False
            return False

        try:
            X = np.array(samples, dtype=float)
            model = IsolationForest(
                n_estimators=100,
                contamination=0.05,
                random_state=42
            )
            model.fit(X)
            self.model = model
            self.is_custom_trained = True
            return True
        except Exception as exc:
            logger.error(f"Error reentrenando IsolationForest con historial: {exc}")
            return False

    def evaluate_safety_rules(
        self,
        heart_rate: float,
        spo2: float,
        temperature: float
    ) -> Tuple[str, List[str]]:
        """Aplica reglas deterministas de seguridad para signos vitales fuera de rangos permitidos.
        Retorna el estado de gravedad más alto ('normal', 'warning' o 'critical') y la lista de causas.
        """
        anomalies: List[str] = []
        is_critical = False
        is_warning = False

        # 1. Reglas para Frecuencia Cardíaca
        hr_cfg = RULE_THRESHOLDS["heart_rate"]
        if heart_rate < hr_cfg["critical_low"]:
            is_critical = True
            anomalies.append(f"Frecuencia cardíaca crítica: Bradicardia severa ({heart_rate:.1f} lpm < {hr_cfg['critical_low']})")
        elif heart_rate < hr_cfg["warning_low"]:
            is_warning = True
            anomalies.append(f"Frecuencia cardíaca baja: Bradicardia leve ({heart_rate:.1f} lpm)")
        elif heart_rate >= hr_cfg["critical_high"]:
            is_critical = True
            anomalies.append(f"Frecuencia cardíaca crítica: Taquicardia severa ({heart_rate:.1f} lpm >= {hr_cfg['critical_high']})")
        elif heart_rate > hr_cfg["warning_high"]:
            is_warning = True
            anomalies.append(f"Frecuencia cardíaca elevada: Taquicardia moderada ({heart_rate:.1f} lpm)")

        # 2. Reglas para SpO2
        spo2_cfg = RULE_THRESHOLDS["spo2"]
        if spo2 < spo2_cfg["critical_low"]:
            is_critical = True
            anomalies.append(f"Saturación de oxígeno crítica: Hipoxia severa ({spo2:.1f}% < {spo2_cfg['critical_low']}%)")
        elif spo2 < spo2_cfg["warning_low"]:
            is_warning = True
            anomalies.append(f"Saturación de oxígeno subóptima: Hipoxia leve ({spo2:.1f}% < {spo2_cfg['warning_low']}%)")

        # 3. Reglas para Temperatura
        temp_cfg = RULE_THRESHOLDS["temperature"]
        if temperature < temp_cfg["critical_low"]:
            is_critical = True
            anomalies.append(f"Temperatura crítica: Hipotermia severa ({temperature:.1f} °C < {temp_cfg['critical_low']} °C)")
        elif temperature < temp_cfg["warning_low"]:
            is_warning = True
            anomalies.append(f"Temperatura corporal baja: Hipotermia leve ({temperature:.1f} °C)")
        elif temperature >= temp_cfg["critical_high"]:
            is_critical = True
            anomalies.append(f"Temperatura crítica: Hipertermia severa ({temperature:.1f} °C >= {temp_cfg['critical_high']} °C)")
        elif temperature > temp_cfg["warning_high"]:
            is_warning = True
            anomalies.append(f"Temperatura corporal elevada: Febrícula ({temperature:.1f} °C)")

        if is_critical:
            status = "critical"
        elif is_warning:
            status = "warning"
        else:
            status = "normal"

        return status, anomalies

    def analyze_measurement(
        self,
        heart_rate: float,
        spo2: float,
        temperature: float
    ) -> Dict:
        """Analiza la medición combinando el modelo IsolationForest con las reglas de seguridad clínicas."""
        # 1. Evaluación con reglas deterministas independientes
        rule_status, rule_anomalies = self.evaluate_safety_rules(
            heart_rate=heart_rate,
            spo2=spo2,
            temperature=temperature
        )

        # 2. Evaluación con IsolationForest (scikit-learn)
        is_ai_anomaly = False
        ai_score: Optional[float] = None
        all_anomalies = list(rule_anomalies)

        if self.model is not None:
            try:
                features = np.array([[heart_rate, spo2, temperature]], dtype=float)
                prediction = self.model.predict(features)[0]  # 1: normal, -1: anómalo
                raw_score = self.model.score_samples(features)[0]
                ai_score = round(float(raw_score), 4)

                if prediction == -1:
                    is_ai_anomaly = True
                    # Si las reglas no detectaron nada pero el modelo sí, alertar sobre patrón multidimensional
                    if rule_status == "normal":
                        all_anomalies.append(
                            f"Patrón multivariante atípico detectado por IsolationForest (score: {ai_score})"
                        )
            except Exception as exc:
                logger.warning(f"Error durante inferencia de IsolationForest: {exc}")

        # 3. Determinación del estado final
        if rule_status == "critical":
            final_status = "critical"
        elif rule_status == "warning":
            final_status = "warning"
        elif is_ai_anomaly:
            final_status = "warning"
        else:
            final_status = "normal"

        # 4. Generación de explicación concisa
        if final_status == "normal":
            explanation = "Signos vitales estables y dentro de rangos fisiológicos nominales para la misión espacial."
        elif final_status == "critical":
            explanation = f"Alerta crítica detectada: {'; '.join(all_anomalies)}. Se recomienda atención prioritaria."
        else:
            explanation = f"Precaución preventiva: {'; '.join(all_anomalies)}. Requiere seguimiento continuo."

        if not self.is_custom_trained:
            explanation += " (Modelo operando con perfil de referencia sintético por volumen de datos históricos en consolidación)."

        return {
            "status": final_status,
            "anomalies": all_anomalies,
            "is_ai_anomaly": is_ai_anomaly,
            "ai_score": ai_score,
            "model_trained": self.is_custom_trained,
            "explanation": explanation,
        }


# Instancia singleton del detector de anomalías
telemetry_ai = AstronautTelemetryAI()
