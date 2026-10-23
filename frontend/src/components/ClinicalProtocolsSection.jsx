import React, { useState } from 'react';
import {
  AlertCircle,
  AlertOctagon,
  ArrowRight,
  CheckCircle,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  HeartHandshake,
  Play,
  RotateCcw,
  ShieldCheck,
  Stethoscope,
  Volume2,
  Wind,
  Zap
} from 'lucide-react';

export default function ClinicalProtocolsSection({ measurement, aiAnalysis }) {
  const [activeActionMsg, setActiveActionMsg] = useState(null);

  if (!measurement) {
    return (
      <div className="card section-card">
        <p className="text-secondary text-center">Esperando datos para formular diagnóstico y protocolos clínicos...</p>
      </div>
    );
  }

  const { heart_rate = 72, spo2 = 98, temperature = 36.5, activity = 'resting' } = measurement;

  // Diagnóstico Global
  const isCritical = spo2 < 90 || heart_rate >= 140 || temperature >= 38.0;
  const isWarning = !isCritical && (spo2 < 95 || heart_rate > 105 || temperature > 37.3 || heart_rate < 50);

  const getDiagnosisState = () => {
    if (isCritical) {
      return {
        title: 'ESTADO DE ANOMALÍA CRÍTICA — INTERVENCIÓN MÉDICA URGENTE',
        type: 'critical',
        badge: 'Prioridad Máxima',
        summary: 'Se registran parámetros que superan los límites de tolerancia fisiológica segura. Riesgo inminente para la salud del tripulante.',
        recommendation: 'Activar inmediatamente los protocolos de soporte vital de emergencia y suspender cualquier maniobra en curso.'
      };
    }
    if (isWarning) {
      return {
        title: 'VARIACIÓN FISIOLÓGICA SUBÓPTIMA — MEDIDAS CORRECTIVAS',
        type: 'warning',
        badge: 'Atención Médica',
        summary: 'Desviación moderada en uno o más signos vitales respecto a la línea base nominal. Requiere modulación activa antes de evolución desfavorable.',
        recommendation: 'Aplicar protocolos de estabilización preventiva, hidratación asistida y regulación de ventilación.'
      };
    }
    return {
      title: 'CONDICIÓN FISIOLÓGICA NOMINAL — ESTABILIDAD ÓPTIMA',
      type: 'normal',
      badge: 'Parámetros Nominales',
      summary: 'Todos los indicadores biométricos (frecuencia cardíaca, oxigenación y balance térmico) se encuentran en rangos ideales de seguridad.',
      recommendation: 'Continuar con el régimen programado de misión manteniendo el monitoreo continuo de telemetría.'
    };
  };

  const diagnosis = getDiagnosisState();

  // Ejecución interactiva de acciones
  const handleExecuteProtocol = (protocolName, desc) => {
    setActiveActionMsg({
      title: protocolName,
      desc: desc,
      timestamp: new Date().toLocaleTimeString()
    });

    setTimeout(() => {
      setActiveActionMsg(null);
    }, 6000);
  };

  return (
    <div className="section-block">
      <div className="section-header-row">
        <div>
          <h2 className="section-main-title">Diagnóstico Clínico y Protocolos de Solución</h2>
          <p className="section-main-subtitle">
            Guía de intervención médica estandarizada con acciones paso a paso para estabilizar los signos vitales del astronauta
          </p>
        </div>
      </div>

      {/* Banner de Acción Ejecutada */}
      {activeActionMsg && (
        <div className="protocol-alert-banner">
          <CheckCircle size={22} className="text-success" />
          <div className="protocol-alert-content">
            <strong>{activeActionMsg.title}</strong>
            <p>{activeActionMsg.desc} — Transmitido a las {activeActionMsg.timestamp}</p>
          </div>
        </div>
      )}

      {/* 1. Tarjeta de Diagnóstico Principal */}
      <div className={`card diagnosis-hero-card diagnosis-${diagnosis.type}`}>
        <div className="diagnosis-hero-header">
          <div className="diagnosis-title-group">
            <Stethoscope className="icon-diagnosis" size={26} />
            <div>
              <span className={`status-pill pill-${diagnosis.type}`}>
                {diagnosis.badge}
              </span>
              <h3 className="diagnosis-title">{diagnosis.title}</h3>
            </div>
          </div>
        </div>

        <div className="diagnosis-body-grid">
          <div className="diagnosis-col">
            <span className="col-label">Diagnóstico Clínico Actual:</span>
            <p className="diagnosis-text">{diagnosis.summary}</p>
          </div>
          <div className="diagnosis-col">
            <span className="col-label">Directiva Médica de Solución:</span>
            <p className="diagnosis-text text-highlight">{diagnosis.recommendation}</p>
          </div>
        </div>
      </div>

      {/* 2. Pasos Estructurados de Intervención / Solución */}
      <div className="protocols-stepper-container">
        <h3 className="stepper-title">Protocolo de Intervención Operativa Inmediata (Paso a Paso)</h3>

        <div className="protocol-steps-grid">
          {/* Paso 1: Oxigenación */}
          <div className={`card step-card ${spo2 < 95 ? 'step-priority-high' : ''}`}>
            <div className="step-number-badge">1</div>
            <div className="step-content">
              <div className="step-header">
                <Wind className="step-icon text-cyan" size={20} />
                <h4 className="step-name">Regulación de Oxigenación y Vía Aérea</h4>
                <span className={`step-urgency ${spo2 < 95 ? 'urgency-high' : 'urgency-normal'}`}>
                  {spo2 < 95 ? 'PRIORIDAD INMEDIATA' : 'PREVENTIVO'}
                </span>
              </div>
              <p className="step-desc">
                Si la saturación es inferior al 95%, suministrar flujo de O₂ al 100% mediante el selector de demanda en circuito cerrado.
              </p>
              <div className="step-action-box">
                <strong>Acción de Solución:</strong>
                <p>Verificar el manómetro de presión de la escafandra (nominal: 4.3 psi / 29.6 kPa). Descartar despresurización o fugas en el sello del cuello y visor.</p>
              </div>
            </div>
          </div>

          {/* Paso 2: Carga Metabólica */}
          <div className={`card step-card ${heart_rate > 105 ? 'step-priority-high' : ''}`}>
            <div className="step-number-badge">2</div>
            <div className="step-content">
              <div className="step-header">
                <HeartHandshake className="step-icon text-danger" size={20} />
                <h4 className="step-name">Modulación de Carga Cardíaca y Reposo</h4>
                <span className={`step-urgency ${heart_rate > 105 ? 'urgency-high' : 'urgency-normal'}`}>
                  {heart_rate > 105 ? 'PRIORIDAD ALTA' : 'ESTABLE'}
                </span>
              </div>
              <p className="step-desc">
                Si la frecuencia cardíaca excede 100 lpm o el astronauta se encuentra en actividad física pesada, ordenar detención inmediata.
              </p>
              <div className="step-action-box">
                <strong>Acción de Solución:</strong>
                <p>Instruir al astronauta adoptar posición neutral de microgravedad. Indicar ciclos de respiración profunda diafragmática (4s inhalación, 4s exhalación) para activar respuesta parasimpática.</p>
              </div>
            </div>
          </div>

          {/* Paso 3: Termorregulación */}
          <div className={`card step-card ${temperature > 37.3 ? 'step-priority-high' : ''}`}>
            <div className="step-number-badge">3</div>
            <div className="step-content">
              <div className="step-header">
                <Zap className="step-icon text-warning" size={20} />
                <h4 className="step-name">Termorregulación y Enfriamiento de Traje (LCVG)</h4>
                <span className={`step-urgency ${temperature > 37.3 ? 'urgency-high' : 'urgency-normal'}`}>
                  {temperature > 37.3 ? 'PRIORIDAD ALTA' : 'NOMINAL'}
                </span>
              </div>
              <p className="step-desc">
                En caso de elevación térmica sobre 37.3 °C, modular la prenda de refrigeración líquida y ventilación interior.
              </p>
              <div className="step-action-box">
                <strong>Acción de Solución:</strong>
                <p>Subir la válvula de agua fría LCVG a Nivel 3 (caudal 1.8 L/min) y activar la ventilación forzada anti-empañamiento para maximizar la disipación convectiva de calor.</p>
              </div>
            </div>
          </div>

          {/* Paso 4: Rehidratación */}
          <div className="card step-card">
            <div className="step-number-badge">4</div>
            <div className="step-content">
              <div className="step-header">
                <Compass className="step-icon text-primary" size={20} />
                <h4 className="step-name">Rehidratación y Reevaluación Vital</h4>
                <span className="step-urgency urgency-normal">RUTINA CONTINUA</span>
              </div>
              <p className="step-desc">
                Compensar la deshidratación insensible debida al aire seco recirculado del traje espacial.
              </p>
              <div className="step-action-box">
                <strong>Acción de Solución:</strong>
                <p>Administrar 250 a 300 ml de solución oral con electrolitos (sodio/potasio) a través de la boquilla interior del casco. Registrar telemetría de control a los 3 minutos.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Panel de Órdenes y Acciones Rápidas */}
      <div className="card quick-actions-panel">
        <div className="actions-header">
          <FileText size={20} className="text-cyan" />
          <div>
            <h4 className="actions-title">Panel de Intervención Rápida (Comandos de Soporte Vital)</h4>
            <p className="actions-subtitle">Ejecuta protocolos estandarizados con confirmación en tiempo real</p>
          </div>
        </div>

        <div className="action-buttons-grid">
          <button
            type="button"
            className="btn btn-action btn-action-o2"
            onClick={() => handleExecuteProtocol(
              'Protocolo de Emergencia O₂ al 100% Activado',
              'Comando enviado al regulador de flujo: Suministro de oxígeno al 100% en circuito cerrado establecido.'
            )}
          >
            <Wind size={18} />
            <span>Aplicar O₂ al 100%</span>
          </button>

          <button
            type="button"
            className="btn btn-action btn-action-cool"
            onClick={() => handleExecuteProtocol(
              'Enfriamiento LCVG Nivel 3 Forzado',
              'Válvula de caudal de líquido refrigerante ajustada a flujo máximo de 1.8 L/min para extracción térmica.'
            )}
          >
            <Zap size={18} />
            <span>Forzar Enfriamiento Traje</span>
          </button>

          <button
            type="button"
            className="btn btn-action btn-action-pause"
            onClick={() => handleExecuteProtocol(
              'Orden de Reposo Operativo Transmitida',
              'Alerta de voz emitida al astronauta: Detener actividades físicas y adoptar reposo en flotación neutra.'
            )}
          >
            <AlertOctagon size={18} />
            <span>Ordenar Pausa Operativa</span>
          </button>

          <button
            type="button"
            className="btn btn-action btn-action-reset"
            onClick={() => handleExecuteProtocol(
              'Parámetros Nominales Restablecidos',
              'Sistemas de soporte vital regresados a la configuración automática de balance dinámico.'
            )}
          >
            <RotateCcw size={18} />
            <span>Restablecer Modo Nominal</span>
          </button>
        </div>
      </div>
    </div>
  );
}
