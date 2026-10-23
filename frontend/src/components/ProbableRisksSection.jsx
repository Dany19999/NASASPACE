import React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Droplets,
  Flame,
  HeartPulse,
  ShieldAlert,
  ShieldCheck,
  Zap
} from 'lucide-react';

export default function ProbableRisksSection({ measurement, aiAnalysis }) {
  if (!measurement) {
    return (
      <div className="card section-card">
        <p className="text-secondary text-center">Esperando telemetría para evaluar riesgos fisiológicos...</p>
      </div>
    );
  }

  const { heart_rate = 72, spo2 = 98, temperature = 36.5, activity = 'resting' } = measurement;

  // 1. Evaluación de Hipoxia
  const getHypoxiaRisk = () => {
    if (spo2 < 90) {
      return {
        level: 'CRÍTICO',
        type: 'critical',
        badge: 'Alerta Roja',
        description: 'Hipoxemia severa detectada. Riesgo inmediato de pérdida de conciencia, visión en túnel y disfunción cognitiva.',
        causes: ['Posible microfuga en la escafandra', 'Presión parcial de O2 deficiente', 'Consumo metabólico desbordado'],
        symptoms: ['Disnea severa', 'Confusión / fatiga mental', 'Cianosis periférica', 'Visión en túnel']
      };
    }
    if (spo2 < 95) {
      return {
        level: 'RIESGO MODERADO',
        type: 'warning',
        badge: 'Precaución',
        description: 'Saturación subóptima. Déficit leve de oxigenación tisular que puede mermar la capacidad de respuesta.',
        causes: ['Demanda física superior al suministro respiratorio', 'Respiración superficial por estrés'],
        symptoms: ['Cefalea frontal incipiente', 'Fatiga respiratoria', 'Disminución de concentración']
      };
    }
    return {
      level: 'NOMINAL / MÍNIMO',
      type: 'normal',
      badge: 'Bajo Riesgo',
      description: 'Oxigenación tisular óptima. El flujo gaseoso y la perfusión capilar se encuentran en niveles ideales.',
      causes: ['Parámetros respiratorios y de presurización perfectamente equilibrados'],
      symptoms: ['Ninguno reportado — Estado fisiológico saludable']
    };
  };

  // 2. Evaluación Cardiovascular
  const getCardioRisk = () => {
    if (heart_rate >= 140) {
      return {
        level: 'CRÍTICO',
        type: 'critical',
        badge: 'Sobrecarga Severa',
        description: 'Taquicardia pronunciada. Peligro de isquemia miocárdica de esfuerzo, arritmias y fallo hemodinámico.',
        causes: ['Sobreesfuerzo extremo durante maniobra EVA', 'Respuesta aguda de estrés / hiperadrenérgica'],
        symptoms: ['Palpitaciones intensas', 'Agotamiento muscular agudo', 'Diaforesis profusa', 'Dolor precordial']
      };
    }
    if (heart_rate > 105) {
      return {
        level: 'ALERTA / ELEVADO',
        type: 'warning',
        badge: 'Carga Elevada',
        description: 'Frecuencia cardíaca acelerada por encima del umbral aeróbico. Puede derivar en agotamiento prematuro.',
        causes: ['Actividad física continua prolongada', 'Termorregulación activa forzada'],
        symptoms: ['Respiración rápida', 'Fatiga muscular progresiva', 'Aumento de tensión arterial']
      };
    }
    if (heart_rate < 50) {
      return {
        level: 'ALERTA / BRADICARDIA',
        type: 'warning',
        badge: 'Frecuencia Baja',
        description: 'Frecuencia cardíaca inusualmente baja para condiciones de misión. Monitorear posibles respuestas vasovagales.',
        causes: ['Desadaptación cardiovascular a microgravedad', 'Respuesta vagal refleja'],
        symptoms: ['Sensación de mareo', 'Lentitud psicomotora', 'Hipoperfusión periférica']
      };
    }
    return {
      level: 'NOMINAL / ESTABLE',
      type: 'normal',
      badge: 'Ritmo Óptimo',
      description: 'Gasto cardíaco y ritmo ventricular completamente estables dentro de los rangos de seguridad.',
      causes: ['Equilibrio neurovegetativo y muscular adecuado'],
      symptoms: ['Tolerancia cardiovascular óptima']
    };
  };

  // 3. Evaluación Térmica
  const getThermalRisk = () => {
    if (temperature >= 38.0) {
      return {
        level: 'CRÍTICO',
        type: 'critical',
        badge: 'Hipertermia Aguda',
        description: 'Retención térmica extrema dentro de la escafandra. Peligro inminente de golpe de calor y síncope térmico.',
        causes: ['Fallo en circuito de refrigeración líquida LCVG', 'Aislamiento térmico excesivo en actividad física'],
        symptoms: ['Visor empañado por transpiración', 'Cefalea pulsátil intensa', 'Desorientación', 'Taquicardia reactiva']
      };
    }
    if (temperature > 37.3) {
      return {
        level: 'ALERTA / CALOR',
        type: 'warning',
        badge: 'Acumulación Térmica',
        description: 'Temperatura corporal por encima del promedio nominal. Incrementa la velocidad de deshidratación.',
        causes: ['Refrigeración de la escafandra en caudal mínimo', 'Carga de trabajo físico sostenida'],
        symptoms: ['Sudoración continua', 'Sensación de bochorno', 'Pérdida acelerada de electrolitos']
      };
    }
    if (temperature < 35.8) {
      return {
        level: 'ALERTA / HIPOTERMIA',
        type: 'warning',
        badge: 'Pérdida de Calor',
        description: 'Hipotermia leve o exposición a sombras orbitales prolongadas sin compensación de calefacción.',
        causes: ['Enfriamiento excesivo por flujo de refrigerante', 'Contacto térmico con superficies frías'],
        symptoms: ['Temblores involuntarios', 'Entumecimiento de extremidades', 'Reducción de destreza motora']
      };
    }
    return {
      level: 'NOMINAL / ESTABLE',
      type: 'normal',
      badge: 'Termorregulado',
      description: 'Equilibrio térmico óptimo. El sistema de refrigeración y la termogénesis del cuerpo se encuentran balanceados.',
      causes: ['Sistema de acondicionamiento de traje operando normalmente'],
      symptoms: ['Confort térmico total']
    };
  };

  // 4. Evaluación de Fatiga Operativa
  const getFatigueRisk = () => {
    const isHighWorkload = activity === 'eva' || heart_rate > 115;
    const isDesaturated = spo2 < 95;
    if (isHighWorkload && isDesaturated) {
      return {
        level: 'ALERTA / FATIGA AGUDA',
        type: 'warning',
        badge: 'Sobreesfuerzo',
        description: 'Combinación simultánea de esfuerzo metabólico alto y saturación reducida. Alto riesgo de agotamiento fulminante.',
        causes: ['Maniobra EVA compleja sin periodos de micro-pausas', 'Demanda muscular continua'],
        symptoms: ['Disminución en precisión manipulativa', 'Tiempo de reacción ralentizado', 'Temblor muscular']
      };
    }
    return {
      level: 'NOMINAL / CONTROLADO',
      type: 'normal',
      badge: 'Capacidad Plena',
      description: 'Nivel de energía metabólica y rendimiento operativo dentro de los estándares de resistencia programados.',
      causes: ['Ritmo de trabajo balanceado'],
      symptoms: ['Capacidad física y cognitiva preservada']
    };
  };

  const hypoxia = getHypoxiaRisk();
  const cardio = getCardioRisk();
  const thermal = getThermalRisk();
  const fatigue = getFatigueRisk();

  const risks = [
    {
      title: 'Hipoxia Tisular y Desaturación de O₂',
      icon: Droplets,
      metricVal: `${Number(spo2).toFixed(1)}% SpO₂`,
      ...hypoxia
    },
    {
      title: 'Sobrecarga Cardiovascular / Taquicardia',
      icon: HeartPulse,
      metricVal: `${Number(heart_rate).toFixed(1)} lpm`,
      ...cardio
    },
    {
      title: 'Sobrecarga Térmica / Hipertermia en Traje',
      icon: Flame,
      metricVal: `${Number(temperature).toFixed(1)} °C`,
      ...thermal
    },
    {
      title: 'Fatiga Operativa y Desbalance de Carga',
      icon: Zap,
      metricVal: `Estado: ${activity.toUpperCase()}`,
      ...fatigue
    }
  ];

  return (
    <div className="section-block">
      <div className="section-header-row">
        <div>
          <h2 className="section-main-title">Evaluación de Problemas Fisiológicos Probables</h2>
          <p className="section-main-subtitle">
            Análisis dinámico de riesgos y complicaciones potenciales evaluado en tiempo real según la telemetría activa
          </p>
        </div>
      </div>

      <div className="risks-grid">
        {risks.map((risk, idx) => {
          const Icon = risk.icon;
          return (
            <div key={idx} className={`card risk-card risk-${risk.type}`}>
              <div className="risk-header">
                <div className="risk-title-box">
                  <div className={`risk-icon-wrapper icon-${risk.type}`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="risk-title">{risk.title}</h3>
                    <span className="risk-metric-tag">{risk.metricVal}</span>
                  </div>
                </div>
                <span className={`status-pill pill-${risk.type}`}>
                  {risk.badge}
                </span>
              </div>

              <p className="risk-description">{risk.description}</p>

              <div className="risk-details-grid">
                <div className="risk-detail-col">
                  <span className="risk-detail-label">Problemas y Síntomas Probables:</span>
                  <ul className="risk-detail-list">
                    {risk.symptoms.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="risk-detail-col">
                  <span className="risk-detail-label">Causas Fisiológicas Desencadenantes:</span>
                  <ul className="risk-detail-list">
                    {risk.causes.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
