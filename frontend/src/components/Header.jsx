import React from 'react';
import { Activity, RefreshCw, Send, Wifi, WifiOff } from 'lucide-react';

export default function Header({
  connectionStatus,
  backendInfo,
  lastUpdated,
  autoRefresh,
  setAutoRefresh,
  onManualRefresh,
  onSendSample,
  isRefreshing,
  isSendingSample,
}) {
  const isOnline = connectionStatus === 'online';

  return (
    <header className="dashboard-header">
      {/* Brand y Título */}
      <div className="header-brand">
        <div className="brand-logo-wrapper">
          <Activity className="brand-icon pulsing-heart" size={28} />
          <div className="logo-glow" />
        </div>
        <div>
          <div className="brand-title-row">
            <h1 className="brand-title">ASTRAHEALTH-AI</h1>
            <span className="live-telemetry-badge">
              <span className="live-ping-dot" />
              <span>EN VIVO</span>
            </span>
          </div>
          <p className="brand-subtitle">
            Monitoreo Biométrico y Diagnóstico Fisiológico en Tiempo Real
          </p>
        </div>
      </div>

      {/* Acciones y Estado del Sistema */}
      <div className="header-actions">
        {/* Badge de Conexión en Tiempo Real */}
        <div className="status-group">
          <div className={`connection-pill ${isOnline ? 'pill-online' : 'pill-offline'}`}>
            {isOnline ? <Wifi size={15} /> : <WifiOff size={15} />}
            <span>{isOnline ? 'ENLACE ACTIVO' : 'SIN CONEXIÓN'}</span>
          </div>
        </div>

        {/* Última actualización */}
        {lastUpdated && (
          <div className="last-sync-text">
            <span>Último dato: </span>
            <strong>{new Date(lastUpdated).toLocaleTimeString()}</strong>
          </div>
        )}

        {/* Botones de acción */}
        <div className="action-buttons">
          {/* Toggle Auto-refresh */}
          <button
            type="button"
            className={`btn-toggle ${autoRefresh ? 'active' : ''}`}
            onClick={() => setAutoRefresh(!autoRefresh)}
            title="Sincronización automática de telemetría en tiempo real"
          >
            <span className="toggle-indicator" />
            <span>Tiempo Real (2.5s)</span>
          </button>

          {/* Botón Refrescar */}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onManualRefresh}
            disabled={isRefreshing}
            title="Recargar datos ahora"
          >
            <RefreshCw size={15} className={isRefreshing ? 'spin' : ''} />
            <span>Sincronizar</span>
          </button>

          {/* Botón Transmitir Telemetría */}
          <button
            type="button"
            className="btn btn-primary"
            onClick={onSendSample}
            disabled={isSendingSample || !isOnline}
            title="Registrar y transmitir una lectura de telemetría médica al sistema"
          >
            <Send size={15} className={isSendingSample ? 'spin' : ''} />
            <span>Transmitir Paquete</span>
          </button>
        </div>
      </div>
    </header>
  );
}
