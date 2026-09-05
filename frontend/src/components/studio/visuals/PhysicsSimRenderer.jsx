import React, { useState } from "react";
import { Zap, Play, Pause, RefreshCw } from "lucide-react";

export default function PhysicsSimRenderer({
  title = "Physical Circuit & Current Simulation",
  content = "",
}) {
  const [voltage, setVoltage] = useState(12);
  const [resistance, setResistance] = useState(4);
  const [isPlaying, setIsPlaying] = useState(true);

  // Ohm's law: I = V / R
  const current = (voltage / resistance).toFixed(2);
  const flowSpeed = Math.max(0.4, 3 - current * 0.4);

  return (
    <div className="physics-sim-stage">
      <div className="physics-header-tag">
        <Zap size={14} className="tag-icon" />
        <span>PHYSICS SIMULATION • DYNAMIC VECTOR & CURRENT FIELD</span>
      </div>

      <h2 className="physics-title">{title}</h2>

      {/* SVG Circuit Canvas */}
      <div className="circuit-canvas-wrapper">
        <svg viewBox="0 0 540 240" className="circuit-svg">
          {/* Wire Loop */}
          <rect x="70" y="40" width="400" height="160" rx="14" fill="none" stroke="#2D3A5D" strokeWidth="4" />

          {/* Voltage Source (Left Branch) */}
          <g transform="translate(70, 120)">
            <circle cx="0" cy="0" r="22" fill="#17213A" stroke="#4F63C8" strokeWidth="2" />
            <text x="0" y="5" fill="#A5B4FC" fontSize="13" fontWeight="bold" textAnchor="middle">
              {voltage}V
            </text>
            <text x="-32" y="5" fill="#EF4444" fontSize="16" fontWeight="bold">+</text>
            <text x="26" y="5" fill="#3B82F6" fontSize="16" fontWeight="bold">-</text>
          </g>

          {/* Resistor (Top Branch) */}
          <g transform="translate(270, 40)">
            <rect x="-40" y="-14" width="80" height="28" rx="6" fill="#312E81" stroke="#818CF8" strokeWidth="2" />
            <text x="0" y="5" fill="#FFFFFF" fontSize="12" fontWeight="bold" textAnchor="middle">
              {resistance} Ω
            </text>
          </g>

          {/* Current Measurement Ammeter (Bottom Branch) */}
          <g transform="translate(270, 200)">
            <circle cx="0" cy="0" r="20" fill="#065F46" stroke="#34D399" strokeWidth="2" />
            <text x="0" y="5" fill="#ECFDF5" fontSize="12" fontWeight="bold" textAnchor="middle">
              {current}A
            </text>
          </g>

          {/* Animated Electron Flow Particles */}
          {isPlaying && (
            <rect
              x="70"
              y="40"
              width="400"
              height="160"
              rx="14"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="3"
              strokeDasharray="8 24"
              className="circuit-electron-flow"
              style={{ animationDuration: `${flowSpeed}s` }}
            />
          )}
        </svg>
      </div>

      {/* Interactive Sliders */}
      <div className="physics-sliders-grid">
        <div className="slider-card">
          <div className="slider-label-row">
            <span>Voltage (V):</span>
            <strong className="text-indigo-300">{voltage} Volts</strong>
          </div>
          <input
            type="range"
            min="2"
            max="24"
            step="1"
            value={voltage}
            onChange={(e) => setVoltage(Number(e.target.value))}
            className="sim-range-input"
          />
        </div>

        <div className="slider-card">
          <div className="slider-label-row">
            <span>Resistance (R):</span>
            <strong className="text-amber-300">{resistance} Ohms</strong>
          </div>
          <input
            type="range"
            min="1"
            max="12"
            step="1"
            value={resistance}
            onChange={(e) => setResistance(Number(e.target.value))}
            className="sim-range-input"
          />
        </div>

        <div className="slider-result-card">
          <span className="result-caption">Calculated Current (I = V/R):</span>
          <span className="result-value text-emerald-400">{current} Amperes</span>
        </div>
      </div>
    </div>
  );
}
