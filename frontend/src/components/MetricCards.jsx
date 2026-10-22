import React from 'react';
import { Activity, Droplets, Heart, Radio, Thermometer, UserCheck } from 'lucide-react';

export default function MetricCards({ measurement, aiAnalysis }) {
  if (!measurement) {
    return (
      <div className="metrics-grid">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="card metric-card metric-card-loading">
            <div className="skeleton-line skeleton-title" />
            <div className="skeleton-line skeleton-value" />
            <div className="skeleton-line skeleton-subtitle" />
          </div>
        ))}
      </div>
    );
  }

  const { device_id, heart_rate, spo2, temperature, activity, timestamp } = measurement;

  // Clasificación de métricas
  const getHrStatus = (hr) => {
    if (hr < 45 || hr >= 140) return { label: 'CRÍTICO', type: 'critical' };
    if (hr < 55 || hr > 100) return { label: 'ALERTA', type: 'warning' };
    return { label: 'NOMINAL', type: 'normal' };
  };

  const getSpo2Status = (ox) => {
    if (ox < 90) return { label: 'HIPOXIA CRÍTICA', type: 'critical' };
    if (ox < 95) return { label: 'SUBÓPTIMO', type: 'warning' };
    return { label: 'ÓPTIMO', type: 'normal' };
  };

  const getTempStatus = (temp) => {
    if (temp < 35.0 || temp >= 38.5) return { label: 'CRÍTICO', type: 'critical' };
    if (temp < 36.0 || temp > 37.5) return { label: 'ALERTA', type: 'warning' };
    return { label: 'NORMAL', type: 'normal' };
  };

  const hrStatus = getHrStatus(heart_rate);
  const spo2Status = getSpo2Status(spo2);
  const tempStatus = getTempStatus(temperature);

  return (
    <div className="metrics-grid">
      {/* 1. Frecuencia Cardíaca */}
      <div className={`card metric-card metric-${hrStatus.type}`}>
        <div className="metric-header">
          <div className="metric-icon-box hr-box">
            <Heart className="pulsing-heart" size={24} />
          </div>
          <span className={`status-pill pill-${hrStatus.type}`}>
            {hrStatus.label}
          </span>
        </div>
        <div className="metric-body">
          <span className="metric-label">Frecuencia Cardíaca</span>
          <div className="metric-value-row">
            <span className="metric-number">{Number(heart_rate).toFixed(1)}</span>
            <span className="metric-unit">lpm</span>
          </div>
          <div className="metric-range">
            <span>Rango nominal: 60 - 100 lpm</span>
          </div>
        </div>
      </div>

      {/* 2. Saturación de Oxígeno (SpO2) */}
      <div className={`card metric-card metric-${spo2Status.type}`}>
        <div className="metric-header">
          <div className="metric-icon-box spo2-box">
            <Droplets size={24} />
          </div>
          <span className={`status-pill pill-${spo2Status.type}`}>
            {spo2Status.label}
          </span>
        </div>
        <div className="metric-body">
          <span className="metric-label">Saturación SpO₂</span>
          <div className="metric-value-row">
            <span className="metric-number">{Number(spo2).toFixed(1)}</span>
            <span className="metric-unit">%</span>
          </div>
          <div className="progress-bar-bg">
            <div
              className={`progress-bar-fill fill-${spo2Status.type}`}
              style={{ width: `${Math.min(100, Math.max(0, spo2))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Temperatura Corporal */}
      <div className={`card metric-card metric-${tempStatus.type}`}>
        <div className="metric-header">
          <div className="metric-icon-box temp-box">
            <Thermometer size={24} />
          </div>
          <span className={`status-pill pill-${tempStatus.type}`}>
            {tempStatus.label}
          </span>
        </div>
        <div className="metric-body">
          <span className="metric-label">Temperatura Corporal</span>
          <div className="metric-value-row">
            <span className="metric-number">{Number(temperature).toFixed(1)}</span>
            <span className="metric-unit">°C</span>
          </div>
          <div className="metric-range">
            <span>Rango normal: 36.0 - 37.5 °C</span>
          </div>
        </div>
      </div>

      {/* 4. Actividad & Dispositivo */}
      <div className="card metric-card metric-activity">
        <div className="metric-header">
          <div className="metric-icon-box activity-box">
            <Activity size={24} />
          </div>
          <span className="status-pill pill-cyan">
            <Radio size={12} className="pulse-dot" /> ENLACE ACTIVO
          </span>
        </div>
        <div className="metric-body">
          <span className="metric-label">Actividad del Astronauta</span>
          <div className="metric-value-row">
            <span className="metric-activity-text">{activity?.toUpperCase() || 'REPOSO'}</span>
          </div>
          <div className="metric-device-info">
            <span>Dispositivo: <strong>{device_id || 'ESP32'}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
