import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Database, HelpCircle, RefreshCw, Send, Sparkles } from 'lucide-react';
import {
  analyzeTelemetryWithAI,
  checkBackendHealth,
  fetchLatestMeasurement,
  fetchMeasurementHistory,
  sendSampleMeasurement,
  BASE_URL
} from './api';
import AIAnomalyPanel from './components/AIAnomalyPanel';
import Header from './components/Header';
import HistoryChart from './components/HistoryChart';
import MetricCards from './components/MetricCards';

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

  // Referencia para evitar dobles llamadas concurrentes
  const isFetchingRef = useRef(false);

  // Muestra una notificación temporal
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  /**
   * Carga integral de telemetría y diagnóstico del backend
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
      const historyData = await fetchMeasurementHistory(30);
      setHistory(Array.isArray(historyData) ? historyData : []);

      // 3. Consulta de Última Medición
      try {
        const latest = await fetchLatestMeasurement();
        setLatestMeasurement(latest);

        // 4. Inferencia con Módulo de Inteligencia Artificial
        if (latest && latest.heart_rate !== undefined) {
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
            console.warn('Endpoint de IA no disponible o con fallo temporal:', aiErr.message);
          } finally {
            setIsAnalyzing(false);
          }
        }
      } catch (latestErr) {
        // Código 404 significa que la base de datos no tiene mediciones aún
        if (latestErr.status === 404) {
          setLatestMeasurement(null);
          setAiAnalysis(null);
        } else {
          throw latestErr;
        }
      }

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error sincronizando con el backend:', err);
      setConnectionStatus('offline');
      setError(`No fue posible conectar con el backend (${BASE_URL}). Verifica que el servidor FastAPI esté en ejecución.`);
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

  // Polling automático configurable (por defecto cada 3 segundos)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      loadData(false);
    }, 3000);
    return () => clearInterval(interval);
  }, [autoRefresh, loadData]);

  /**
   * Generar y enviar una medición demo para verificar el pipeline en tiempo real
   */
  const handleSendSample = async () => {
    setIsSendingSample(true);
    try {
      // Generar valores realistas pero variados
      const sample = {
        device_id: 'ASTRA-ESP32-01',
        heart_rate: Number((68 + Math.random() * 22).toFixed(1)),
        spo2: Number((96.5 + Math.random() * 3.2).toFixed(1)),
        temperature: Number((36.4 + Math.random() * 0.7).toFixed(1)),
        activity: Math.random() > 0.5 ? 'resting' : 'exercise',
      };

      await sendSampleMeasurement(sample);
      showNotification('¡Telemetría simulada enviada y persistida en Supabase con éxito!', 'success');
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

      {/* Header de Misión */}
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
            <span className="alert-hint">
              Ejecuta el backend desde la carpeta <code>backend/</code> con:{' '}
              <code>python -m uvicorn app.main:app --reload --port 8000</code>
            </span>
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
            <h2>Inicializando Centro de Monitoreo Telegráfico...</h2>
            <p>Conectando con la API de ASTRAHEALTH-AI y recuperando métricas en órbita.</p>
          </div>
        ) : !latestMeasurement && connectionStatus === 'online' ? (
          /* Estado Vacío (Sin mediciones aún en base de datos) */
          <div className="empty-measurements-card">
            <div className="empty-icon-wrapper">
              <Database size={48} className="text-cyan" />
              <div className="empty-glow" />
            </div>
            <h2>Base de Datos Lista — Sin Mediciones Registradas</h2>
            <p>
              El backend y la base de datos de Supabase están conectados correctamente, pero la tabla{' '}
              <code>measurements</code> no contiene telemetría por el momento.
            </p>
            <div className="empty-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSendSample}
                disabled={isSendingSample}
              >
                <Sparkles size={16} />
                <span>Generar Primera Medición de Prueba</span>
              </button>
            </div>
          </div>
        ) : (
          /* Vista Normal con Telemetría Activa */
          <>
            {/* Fila 1: Tarjetas de Signos Vitales */}
            <section className="section-metrics">
              <MetricCards
                measurement={latestMeasurement}
                aiAnalysis={aiAnalysis}
              />
            </section>

            {/* Fila 2: Gráficos de Historial + Panel de IA */}
            <section className="section-analytics-grid">
              <div className="analytics-col-chart">
                <HistoryChart history={history} />
              </div>
              <div className="analytics-col-ai">
                <AIAnomalyPanel
                  aiAnalysis={aiAnalysis}
                  isAnalyzing={isAnalyzing}
                />
              </div>
            </section>
          </>
        )}
      </main>

      {/* Footer de Misión */}
      <footer className="dashboard-footer">
        <div className="footer-content">
          <span>ASTRAHEALTH-AI &copy; 2026 — Desafío NASA Space Apps: Monitoreo de la salud para astronautas en misiones espaciales.</span>
          <div className="footer-links">
            <span className="footer-tag">FastAPI Backend</span>
            <span className="footer-dot">•</span>
            <span className="footer-tag">Supabase PostgreSQL</span>
            <span className="footer-dot">•</span>
            <span className="footer-tag">scikit-learn IsolationForest</span>
            <span className="footer-dot">•</span>
            <span className="footer-tag">React + Vite</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
