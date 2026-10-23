import React from 'react';
import {
  Activity,
  CheckCircle2,
  Cpu,
  Layers,
  PlayCircle,
  Radio,
  Send,
  Sliders,
  Terminal,
  Wifi
} from 'lucide-react';

export default function WokwiGuideSection({ measurement, onSendSample, isSendingSample }) {
  return (
    <div className="section-block">
      <div className="section-header-row">
        <div>
          <h2 className="section-main-title">Enlace de Telemetría ESP32 / Simulador Wokwi</h2>
          <p className="section-main-subtitle">
            Transmisión de datos biométricos en tiempo real desde el microcontrolador virtual hacia la nube
          </p>
        </div>
      </div>

      {/* Estado del Enlace */}
      <div className="card wokwi-status-card">
        <div className="wokwi-status-header">
          <div className="wokwi-brand">
            <Cpu className="text-cyan" size={26} />
            <div>
              <h3 className="wokwi-title">ESP32 DevKit V1 — Telemetría Fisiológica</h3>
              <p className="wokwi-subtitle">Firmware: sketch.ino | Simulación en Wokwi Simulator</p>
            </div>
          </div>
          <div className="status-pill pill-normal">
            <Radio size={14} className="pulse-dot" /> ENLACE LISTO
          </div>
        </div>

        <div className="wokwi-meta-grid">
          <div className="wokwi-meta-col">
            <span className="meta-col-label">Servidor Destino (Render):</span>
            <code className="meta-col-code">https://nasaspace-6rr9.onrender.com/api/v1/measurements</code>
          </div>
          <div className="wokwi-meta-col">
            <span className="meta-col-label">Intervalo de Transmisión:</span>
            <span className="meta-col-val text-cyan">Cada 2.5 segundos (Continuo)</span>
          </div>
          <div className="wokwi-meta-col">
            <span className="meta-col-label">Identificador de Dispositivo:</span>
            <span className="meta-col-val font-mono">ASTRA-ESP32-01</span>
          </div>
          <div className="wokwi-meta-col">
            <span className="meta-col-label">Red WiFi Virtual:</span>
            <span className="meta-col-val text-success">Wokwi-GUEST (Conexión Directa)</span>
          </div>
        </div>
      </div>

      {/* Pasos para Ejecutar en VS Code */}
      <div className="wokwi-steps-container">
        <h3 className="wokwi-guide-title">¿Cómo transmitir datos en vivo desde Wokwi?</h3>

        <div className="wokwi-guide-grid">
          <div className="card guide-step-card">
            <div className="guide-step-num">1</div>
            <Layers className="guide-icon text-cyan" size={24} />
            <h4 className="guide-step-title">Abrir el Archivo del Circuito</h4>
            <p className="guide-step-text">
              En el explorador de archivos de VS Code, abre <code>diagram.json</code> o <code>sketch.ino</code>.
            </p>
          </div>

          <div className="card guide-step-card">
            <div className="guide-step-num">2</div>
            <PlayCircle className="guide-icon text-success" size={24} />
            <h4 className="guide-step-title">Iniciar la Simulación</h4>
            <p className="guide-step-text">
              Presiona el botón verde de <strong>Play (▶️)</strong> en la barra de Wokwi Simulator dentro de VS Code.
            </p>
          </div>

          <div className="card guide-step-card">
            <div className="guide-step-num">3</div>
            <Terminal className="guide-icon text-warning" size={24} />
            <h4 className="guide-step-title">Verificar Transmisión Serial</h4>
            <p className="guide-step-text">
              En la consola verás: <code>[#1] HR: 71.4 lpm | SpO2: 98.2% -&gt; [HTTP 201 OK]</code>. Los datos fluyen cada 2.5 segundos.
            </p>
          </div>

          <div className="card guide-step-card">
            <div className="guide-step-num">4</div>
            <Sliders className="guide-icon text-primary" size={24} />
            <h4 className="guide-step-title">Girar la Perilla del Sensor</h4>
            <p className="guide-step-text">
              Mueve la perilla del potenciómetro en Wokwi para ver cambiar los valores en vivo entre reposo, ejercicio, EVA y alerta en esta web.
            </p>
          </div>
        </div>
      </div>

      {/* Botón de Transmisión Manual */}
      <div className="card sample-action-card">
        <div className="sample-text-group">
          <Activity size={22} className="text-cyan" />
          <div>
            <strong>¿Deseas verificar la recepción web de inmediato?</strong>
            <p>Puedes pulsar este botón para enviar un paquete de prueba al servidor y observar la actualización instantánea.</p>
          </div>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onSendSample}
          disabled={isSendingSample}
        >
          <Send size={16} className={isSendingSample ? 'spin' : ''} />
          <span>Transmitir Paquete de Prueba</span>
        </button>
      </div>
    </div>
  );
}
