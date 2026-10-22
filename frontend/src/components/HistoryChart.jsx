import React, { useState } from 'react';
import { Activity, Droplets, Thermometer, TrendingUp } from 'lucide-react';

export default function HistoryChart({ history = [] }) {
  const [selectedMetric, setSelectedMetric] = useState('heart_rate');
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const metricsConfig = {
    heart_rate: {
      label: 'Frecuencia Cardíaca',
      unit: 'bpm',
      color: '#00f2fe',
      gradientId: 'hrGradient',
      minDomain: 40,
      maxDomain: 160,
      icon: Activity,
    },
    spo2: {
      label: 'Saturación SpO₂',
      unit: '%',
      color: '#10b981',
      gradientId: 'spo2Gradient',
      minDomain: 85,
      maxDomain: 100,
      icon: Droplets,
    },
    temperature: {
      label: 'Temperatura Corporal',
      unit: '°C',
      color: '#f59e0b',
      gradientId: 'tempGradient',
      minDomain: 35.0,
      maxDomain: 40.0,
      icon: Thermometer,
    },
  };

  const currentCfg = metricsConfig[selectedMetric];

  if (!history || history.length === 0) {
    return (
      <div className="chart-empty-state">
        <TrendingUp size={36} className="text-muted" />
        <p>No hay datos históricos disponibles aún.</p>
        <span className="text-secondary">Los registros comenzarán a graficarse conforme se reciban telemetrías.</span>
      </div>
    );
  }

  // Dimensiones del SVG
  const width = 800;
  const height = 260;
  const padding = { top: 25, right: 30, bottom: 40, left: 55 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Extraer valores
  const values = history.map(item => Number(item[selectedMetric]));
  const minVal = Math.min(...values, currentCfg.minDomain);
  const maxVal = Math.max(...values, currentCfg.maxDomain);
  const valRange = maxVal - minVal || 1;

  // Calcular coordenadas
  const points = history.map((item, index) => {
    const x = padding.left + (index / (history.length - 1 || 1)) * chartW;
    const y = padding.top + chartH - ((Number(item[selectedMetric]) - minVal) / valRange) * chartH;
    return { x, y, value: item[selectedMetric], time: item.timestamp, item };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`
    : '';

  const hoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <div className="card chart-card">
      <div className="chart-header">
        <div className="chart-title-group">
          <TrendingUp className="icon-highlight" size={20} />
          <div>
            <h3 className="card-title">Historial de Telemetría Fisiológica</h3>
            <p className="card-subtitle">Seguimiento temporal de signos vitales ({history.length} muestras)</p>
          </div>
        </div>

        {/* Selector de métrica */}
        <div className="metric-tabs">
          {Object.entries(metricsConfig).map(([key, cfg]) => {
            const Icon = cfg.icon;
            const isActive = selectedMetric === key;
            return (
              <button
                key={key}
                type="button"
                className={`metric-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setSelectedMetric(key);
                  setHoveredIndex(null);
                }}
              >
                <Icon size={15} />
                <span>{cfg.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Gráfico SVG interactivo */}
      <div className="svg-container">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="telemetry-svg"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={currentCfg.gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={currentCfg.color} stopOpacity="0.45" />
              <stop offset="100%" stopColor={currentCfg.color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Líneas de rejilla horizontales */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = padding.top + chartH * pct;
            const val = maxVal - pct * valRange;
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="svg-axis-label"
                >
                  {val.toFixed(selectedMetric === 'temperature' ? 1 : 0)}
                </text>
              </g>
            );
          })}

          {/* Área sombreada con degradado */}
          {areaD && (
            <path
              d={areaD}
              fill={`url(#${currentCfg.gradientId})`}
            />
          )}

          {/* Línea principal */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke={currentCfg.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Puntos de datos */}
          {points.map((pt, idx) => (
            <circle
              key={idx}
              cx={pt.x}
              cy={pt.y}
              r={hoveredIndex === idx ? 5.5 : 3}
              fill={hoveredIndex === idx ? '#ffffff' : currentCfg.color}
              stroke="#0b1120"
              strokeWidth="2"
              className="chart-dot"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          ))}

          {/* Línea vertical indicadora del cursor */}
          {hoveredPoint && (
            <line
              x1={hoveredPoint.x}
              y1={padding.top}
              x2={hoveredPoint.x}
              y2={padding.top + chartH}
              stroke="#94a3b8"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
          )}
        </svg>

        {/* Tooltip flotante al pasar el mouse */}
        {hoveredPoint && (
          <div
            className="chart-tooltip"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100}%`,
            }}
          >
            <div className="tooltip-value" style={{ color: currentCfg.color }}>
              {hoveredPoint.value} {currentCfg.unit}
            </div>
            <div className="tooltip-time">
              {new Date(hoveredPoint.time).toLocaleTimeString()}
            </div>
            {hoveredPoint.item.activity && (
              <div className="tooltip-activity">
                Estado: {hoveredPoint.item.activity}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Leyenda y rangos de referencia */}
      <div className="chart-footer">
        <div className="chart-legend">
          <span className="legend-dot" style={{ backgroundColor: currentCfg.color }} />
          <span>{currentCfg.label} ({currentCfg.unit})</span>
        </div>
        <div className="chart-timestamps">
          <span>{history[0]?.timestamp ? new Date(history[0].timestamp).toLocaleTimeString() : ''}</span>
          <span>⟶</span>
          <span>{history[history.length - 1]?.timestamp ? new Date(history[history.length - 1].timestamp).toLocaleTimeString() : ''}</span>
        </div>
      </div>
    </div>
  );
}
