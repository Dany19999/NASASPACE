import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Cpu,
  Database,
  FileText,
  HelpCircle,
  Layers,
  LineChart,
  RefreshCw,
  Send,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  TrendingUp,
  Wifi
} from 'lucide-react';
import {
  analyzeTelemetryWithAI,
  checkBackendHealth,
  fetchLatestMeasurement,
  fetchMeasurementHistory,
  sendSampleMeasurement,
  BASE_URL
} from './api';
import ClinicalProtocolsSection from './components/ClinicalProtocolsSection';
import Header from './components/Header';
import HistoryChart from './components/HistoryChart';
import MetricCards from './components/MetricCards';
import ProbableRisksSection from './components/ProbableRisksSection';
import WokwiGuideSection from './components/WokwiGuideSection';

export default function App() {
  const [connectionStatus, setConnectionStatus] = useState('checking'); // 'checking' | 'online' | 'offline'
  const [backendInfo, setBackendInfo] = useState(null);
  const [latestMeasurement, setLatestMeasurement] = useState(null);
  const [history, setHistory] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSendingSample, setIsSendingSample] = useState(false);
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('telemetry'); // 'telemetry' | 'risks' | 'protocols' | 'wokwi'
  const [isPulsing, setIsPulsing] = useState(false);

  // Referencias para control de sincronización
  const isFetchingRef = useRef(false);
  const lastMeasurementIdRef = useRef(null);

  // Muestra una notificación temporal
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  /**
   * Carga de telemetría y diagnóstico en tiempo real
   */
  const loadData = useCallback(async (isManual = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    if (isManual) setIsRefreshing(true);

    try {
      // 1. Diagnóstico de Salud
      const health = await checkBackendHealth();
      setBackendInfo(health);
      setConnectionStatus('online');
      setError(null);

      // 2. Consulta de Historial
      try {
        const historyData = await fetchMeasurementHistory(30);
        setHistory(Array.isArray(historyData) ? historyData : []);
      } catch (histErr) {
        console.warn('Historial con retraso:', histErr.message);
      }

      // 3. Consulta de Última Medición
      try {
        const latest = await fetchLatestMeasurement();
        if (latest) {
          // Detectar si llegaron datos nuevos para efecto visual
          if (latest.id !== lastMeasurementIdRef.current) {
            lastMeasurementIdRef.current = latest.id;
            setIsPulsing(true);
            setTimeout(() => setIsPulsing(false), 700);
          }
          setLatestMeasurement(latest);

          // 4. Inferencia con Módulo Clínico
          if (latest.heart_rate !== undefined) {
            setIsAnalyzing(true);
            try {
              const aiResult = await analyzeTelemetryWithAI({
                device_id: latest.device_id,
                heart_rate: latest.heart_rate,
                spo2: latest.spo2,
                temperature: latest.temperature,
                activity: latest.activity || 'resting',
                measurement_id: latest.id,
                save_alert: true,
              });
              setAiAnalysis(aiResult);
            } catch (aiErr) {
              console.warn('Análisis con retraso temporal:', aiErr.message);
            } finally {
              setIsAnalyzing(false);
            }
          }
        }
      } catch (latestErr) {
        // Silencioso si aún no hay mediciones en la BD
      }

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error sincronizando telemetría:', err);
      setConnectionStatus('offline');
      const serverLabel = BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'servidor');
      setError(`No fue posible conectar con el servidor (${serverLabel}). Verifica la disponibilidad.`);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      isFetchingRef.current = false;
    }
  }, []);

  // Carga inicial
  useEffect(() => {
    loadData(false);
  }, [loadData]);

  // Polling continuo en tiempo real (cada 2.5 segundos)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      loadData(false);
    }, 2500);
    return () => clearInterval(interval);
  }, [autoRefresh, loadData]);

  /**
   * Generar y enviar una medición de prueba para verificar el flujo en tiempo real
   */
  const handleSendSample = async () => {
    setIsSendingSample(true);
    try {
      const sample = {
        device_id: 'ASTRA-ESP32-01',
        heart_rate: Number((70 + Math.random() * 25).toFixed(1)),
        spo2: Number((96.0 + Math.random() * 3.8).toFixed(1)),
        temperature: Number((36.4 + Math.random() * 0.8).toFixed(1)),
        activity: Math.random() > 0.5 ? 'resting' : 'exercise',
      };

      await sendSampleMeasurement(sample);
      showNotification('¡Telemetría en tiempo real registrada y transmitida con éxito!', 'success');
      await loadData(true);
    } catch (err) {
      showNotification(`Fallo al enviar medición: ${err.message}`, 'error');
    } finally {
      setIsSendingSample(false);
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Notificación Flotante */}
      {notification && (
        <div className={`toast-notification toast-${notification.type}`}>
          {notification.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header Limpio y Ejecutivo */}
      <Header
        connectionStatus={connectionStatus}
        backendInfo={backendInfo}
        lastUpdated={lastUpdated}
        autoRefresh={autoRefresh}
        setAutoRefresh={setAutoRefresh}
        onManualRefresh={() => loadData(true)}
        onSendSample={handleSendSample}
        isRefreshing={isRefreshing}
        isSendingSample={isSendingSample}
      />

      {/* Banner de Error de Conexión */}
      {error && (
        <div className="alert-banner banner-error">
          <AlertCircle size={22} className="alert-banner-icon" />
          <div className="alert-banner-content">
            <h4>Error de Comunicación con el Servidor</h4>
            <p>{error}</p>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => loadData(true)}
          >
            <RefreshCw size={14} /> Reintentar
          </button>
        </div>
      )}

      {/* Contenido Principal */}
      <main className="dashboard-main">
        {loading && !latestMeasurement ? (
          <div className="loading-state">
            <RefreshCw className="spin text-cyan" size={42} />
            <h2>Sincronizando Centro de Telemetría Fisiológica...</h2>
            <p>Conectando con el enlace en tiempo real y recuperando datos de sensores.</p>
          </div>
        ) : !latestMeasurement && connectionStatus === 'online' ? (
          /* Estado Vacío inicial */
          <div className="empty-measurements-card">
            <div className="empty-icon-wrapper">
              <Database size={48} className="text-cyan" />
              <div className="empty-glow" />
            </div>
            <h2>Canal Listo — Esperando Transmisión de Wokwi</h2>
            <p>
              El servidor y la base de datos están conectados. Inicia el simulador en VS Code (botón Play ▶️ en <code>diagram.json</code>) para transmitir datos en vivo, o envía un paquete de prueba ahora mismo.
            </p>
            <div className="empty-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSendSample}
                disabled={isSendingSample}
              >
                <Sparkles size={16} />
                <span>Transmitir Primera Medición de Prueba</span>
              </button>
            </div>
          </div>
        ) : (
          /* Vista Principal con Apartados y Secciones */
          <>
            {/* Fila Fija Superior: Tarjetas de Signos Vitales en Tiempo Real */}
            <section className="section-metrics">
              <MetricCards
                measurement={latestMeasurement}
                aiAnalysis={aiAnalysis}
                isPulsing={isPulsing}
              />
            </section>

            {/* Barra de Navegación por Apartados / Secciones */}
            <div className="dashboard-nav-tabs">
              <button
                type="button"
                className={`nav-tab-btn ${activeTab === 'telemetry' ? 'active' : ''}`}
                onClick={() => setActiveTab('telemetry')}
              >
                <TrendingUp size={18} />
                <span>1. Tendencias en Vivo</span>
              </button>

              <button
                type="button"
                className={`nav-tab-btn ${activeTab === 'risks' ? 'active' : ''}`}
                onClick={() => setActiveTab('risks')}
              >
                <ShieldAlert size={18} />
                <span>2. Problemas y Riesgos Probables</span>
              </button>

              <button
                type="button"
                className={`nav-tab-btn ${activeTab === 'protocols' ? 'active' : ''}`}
                onClick={() => setActiveTab('protocols')}
              >
                <Stethoscope size={18} />
                <span>3. Diagnóstico y Protocolos de Solución</span>
              </button>

              <button
                type="button"
                className={`nav-tab-btn ${activeTab === 'wokwi' ? 'active' : ''}`}
                onClick={() => setActiveTab('wokwi')}
              >
                <Cpu size={18} />
                <span>4. Simulador Wokwi</span>
              </button>
            </div>

            {/* Apartado Seleccionado */}
            <div className="tab-content-container">
              {activeTab === 'telemetry' && (
                <section className="section-tab-pane">
                  <HistoryChart history={history} />
                </section>
              )}

              {activeTab === 'risks' && (
                <section className="section-tab-pane">
                  <ProbableRisksSection
                    measurement={latestMeasurement}
                    aiAnalysis={aiAnalysis}
                  />
                </section>
              )}

              {activeTab === 'protocols' && (
                <section className="section-tab-pane">
                  <ClinicalProtocolsSection
                    measurement={latestMeasurement}
                    aiAnalysis={aiAnalysis}
                  />
                </section>
              )}

              {activeTab === 'wokwi' && (
                <section className="section-tab-pane">
                  <WokwiGuideSection
                    measurement={latestMeasurement}
                    onSendSample={handleSendSample}
                    isSendingSample={isSendingSample}
                  />
                </section>
              )}
            </div>
          </>
        )}
      </main>

      {/* Footer Limpio y Profesional */}
      <footer className="dashboard-footer">
        <div className="footer-content">
          <span>ASTRAHEALTH-AI &copy; 2026 — Monitoreo Biométrico y Soporte Vital Aeroespacial en Tiempo Real.</span>
          <div className="footer-links">
            <span className="footer-tag">Enlace ESP32 Activo</span>
            <span className="footer-dot">•</span>
            <span className="footer-tag">Transmisión Cada 2.5s</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
