import React from 'react';
import { Activity, Database, RefreshCw, Send, Shield, Wifi, WifiOff } from 'lucide-react';

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
          <Activity className="brand-icon" size={28} />
          <div className="logo-glow" />
        </div>
        <div>
          <div className="brand-title-row">
            <h1 className="brand-title">ASTRAHEALTH-AI</h1>
            <span className="brand-badge">MISSION CONTROL</span>
          </div>
          <p className="brand-subtitle">
            Monitoreo Fisiológico y Detección de Anomalías con IA en Misiones Espaciales
          </p>
        </div>
      </div>

      {/* Acciones y Estado del Sistema */}
      <div className="header-actions">
        {/* Badge de Conexión */}
        <div className="status-group">
          <div className={`connection-pill ${isOnline ? 'pill-online' : 'pill-offline'}`}>
            {isOnline ? <Wifi size={15} /> : <WifiOff size={15} />}
            <span>{isOnline ? 'SISTEMA ONLINE' : 'DESCONECTADO'}</span>
            <span className="live-dot" />
          </div>

          {backendInfo && backendInfo.database && (
            <div className={`db-pill ${backendInfo.database === 'connected' ? 'db-connected' : 'db-warn'}`}>
              <Database size={13} />
              <span>DB: {backendInfo.database === 'connected' ? 'SUPABASE' : backendInfo.database.toUpperCase()}</span>
            </div>
          )}
        </div>

        {/* Última actualización */}
        {lastUpdated && (
          <div className="last-sync-text">
            <span>Última sinc: </span>
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
            title="Activar o desactivar sincronización automática en vivo"
          >
            <span className="toggle-indicator" />
            <span>Auto (3s)</span>
          </button>

          {/* Botón Refrescar */}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onManualRefresh}
            disabled={isRefreshing}
            title="Recargar datos ahora"
          >
            <RefreshCw size={16} className={isRefreshing ? 'spin' : ''} />
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
            <Send size={16} className={isSendingSample ? 'spin' : ''} />
            <span>Transmitir Telemetría</span>
          </button>
        </div>
      </div>
    </header>
  );
}
