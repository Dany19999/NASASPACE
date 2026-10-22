import React from 'react';
import { AlertCircle, AlertTriangle, Brain, CheckCircle2, Cpu, Info, ShieldAlert, ShieldCheck } from 'lucide-react';

export default function AIAnomalyPanel({ aiAnalysis, isAnalyzing = false }) {
  if (!aiAnalysis) {
    return (
      <div className="card ai-card">
        <div className="ai-header">
          <div className="ai-title-group">
            <Brain className="icon-ai" size={22} />
            <div>
              <h3 className="card-title">Módulo de Inteligencia Artificial</h3>
              <p className="card-subtitle">IsolationForest & Motor de Reglas Clínicas</p>
            </div>
          </div>
        </div>
        <div className="ai-waiting-state">
          <Cpu className="spin-slow" size={32} />
          <p>Esperando datos de telemetría para ejecutar la inferencia de anomalías...</p>
        </div>
      </div>
    );
  }

  const {
    status = 'normal',
    anomalies = [],
    is_ai_anomaly = false,
    ai_score,
    model_trained = false,
    explanation,
    alert_created = false,
    alert_id,
    disclaimer
  } = aiAnalysis;

  const statusConfig = {
    normal: {
      title: 'ESTADO NOMINAL',
      badgeClass: 'pill-normal',
      icon: ShieldCheck,
      color: '#10b981',
      desc: 'Todas las constantes vitales se encuentran dentro de los márgenes seguros.',
    },
    warning: {
      title: 'PRECAUCIÓN / ALERTA',
      badgeClass: 'pill-warning',
      icon: AlertTriangle,
      color: '#f59e0b',
      desc: 'Se han detectado variaciones fisiológicas o patrones atípicos que requieren seguimiento.',
    },
    critical: {
      title: 'ANOMALÍA CRÍTICA',
      badgeClass: 'pill-critical',
      icon: ShieldAlert,
      color: '#ef4444',
      desc: '¡Valores fuera de los límites de tolerancia fisiológica! Intervención inmediata recomendada.',
    },
  };

  const currentStatus = statusConfig[status] || statusConfig.normal;
  const StatusIcon = currentStatus.icon;

  return (
    <div className={`card ai-card ai-card-${status}`}>
      {/* Encabezado del Panel */}
      <div className="ai-header">
        <div className="ai-title-group">
          <Brain className="icon-ai" size={24} />
          <div>
            <div className="ai-title-row">
              <h3 className="card-title">Diagnóstico de Inteligencia Artificial</h3>
              {isAnalyzing && <span className="analyzing-pill">Analizando...</span>}
            </div>
            <p className="card-subtitle">Detección multimodal de anomalías (scikit-learn + Reglas aeroespaciales)</p>
          </div>
        </div>

        {/* Badge de Estado Principal */}
        <div className="ai-status-wrapper">
          <span className={`status-pill ${currentStatus.badgeClass} ai-status-pill`}>
            <StatusIcon size={16} />
            <span>{currentStatus.title}</span>
          </span>
        </div>
      </div>

      {/* Grid de Estado del Modelo */}
      <div className="ai-meta-grid">
        <div className="ai-meta-item">
          <span className="meta-label">Modelo ML:</span>
          <span className="meta-value">IsolationForest</span>
        </div>
        <div className="ai-meta-item">
          <span className="meta-label">Score de Anomalía:</span>
          <span className="meta-value font-mono">
            {ai_score !== null && ai_score !== undefined ? ai_score.toFixed(4) : 'N/A'}
          </span>
        </div>
        <div className="ai-meta-item">
          <span className="meta-label">Clasificación ML:</span>
          <span className={`meta-value ${is_ai_anomaly ? 'text-warning' : 'text-success'}`}>
            {is_ai_anomaly ? 'Atípico (-1)' : 'Nominal (+1)'}
          </span>
        </div>
        <div className="ai-meta-item">
          <span className="meta-label">Base de Entrenamiento:</span>
          <span className="meta-value">
            {model_trained ? 'Historial consolidado' : 'Baseline sintético de referencia'}
          </span>
        </div>
      </div>

      {/* Lista de Anomalías Detectadas */}
      <div className="anomalies-section">
        <h4 className="section-subtitle">
          {anomalies.length > 0 ? 'Anomalías Identificadas:' : 'Comprobación de Seguridad:'}
        </h4>

        {anomalies.length > 0 ? (
          <ul className="anomalies-list">
            {anomalies.map((anomaly, idx) => (
              <li key={idx} className={`anomaly-item anomaly-${status}`}>
                <AlertCircle size={18} className="anomaly-icon" />
                <span>{anomaly}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="anomaly-nominal-box">
            <CheckCircle2 size={18} className="text-success" />
            <span>Sin anomalías detectadas. Signos vitales alineados con el protocolo de misión.</span>
          </div>
        )}
      </div>

      {/* Explicación generada */}
      <div className="ai-explanation-box">
        <div className="explanation-header">
          <Info size={16} />
          <strong>Explicación del Análisis:</strong>
        </div>
        <p className="explanation-text">{explanation}</p>
      </div>

      {/* Notificación de Alerta en Supabase */}
      {alert_created && (
        <div className="supabase-alert-badge">
          <span className="ping-dot" />
          <span>Alerta registrada en la base de datos de Supabase (ID: #{alert_id})</span>
        </div>
      )}

      {/* Disclaimer de alcance educativo */}
      <div className="ai-disclaimer">
        <span>⚠️ {disclaimer}</span>
      </div>
    </div>
  );
}
