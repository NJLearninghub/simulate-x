import React, { useState, useMemo } from 'react';

export default function App() {
  // --- Physics State ---
  // Using scaled values for visual intuition
  const [turns, setTurns] = useState(50); // N (turns)
  const [area, setArea] = useState(5); // A (cm^2)
  const [bField, setBField] = useState(0.5); // B (Tesla)
  const [springK, setSpringK] = useState(5); // k (scaled restoring constant)
  const [resistance, setResistance] = useState(50); // R (Ohms)
  const [current, setCurrent] = useState(5); // I (mA)

  // --- Physics Calculations ---
  const { angle, currentSensitivity, voltageSensitivity, deflectingTorque } = useMemo(() => {
    // τ = NIAB in SI. Area is entered in cm² and current in mA.
    // τ (μN·m) = N × (I/1000 A) × (A/10⁴ m²) × B × 10⁶.
    const dTorque = (turns * current * area * bField) / 10;
    // k is the restoring torque per degree, in μN·m/°.
    let calcAngle = dTorque / springK;
    // Current sensitivity in °/mA, voltage sensitivity in °/mV (V_mV = I_mA × R).
    const iSens = (turns * area * bField) / (10 * springK);
    const vSens = iSens / resistance;

    return {
      angle: calcAngle,
      currentSensitivity: iSens,
      voltageSensitivity: vSens,
      deflectingTorque: dTorque
    };
  }, [turns, area, bField, springK, current, resistance]);

  // Clamp visual angle to prevent the needle from snapping off the screen bounds (-80 to 80 max)
  const visualAngle = Math.max(-85, Math.min(85, angle));

  // --- Render Helpers ---
  const tickMarks = [];
  for (let i = -60; i <= 60; i += 10) {
    const rad = (i * Math.PI) / 180;
    const rOuter = 210;
    const rInner = i % 30 === 0 ? 195 : 205;
    tickMarks.push(
      <line
        key={i}
        x1={rInner * Math.sin(rad)}
        y1={-rInner * Math.cos(rad)}
        x2={rOuter * Math.sin(rad)}
        y2={-rOuter * Math.cos(rad)}
        stroke="#475569"
        strokeWidth={i % 30 === 0 ? "3" : "1.5"}
      />
    );
    // Add text labels for major ticks
    if (i % 30 === 0) {
      tickMarks.push(
        <text
          key={`text-${i}`}
          x={(rOuter + 20) * Math.sin(rad)}
          y={-(rOuter + 20) * Math.cos(rad)}
          fill="#64748b"
          fontSize="14"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {i > 0 ? `+${i}°` : `${i}°`}
        </text>
      );
    }
  }

  // Generate Radial Field Lines
  const fieldLines = [];
  for (let i = -45; i <= 45; i += 15) {
    const rad = (i * Math.PI) / 180;
    fieldLines.push(
      <path
        key={`field-${i}`}
        d={`M ${-110 * Math.cos(rad)} ${-110 * Math.sin(rad)} L ${-70 * Math.cos(rad)} ${-70 * Math.sin(rad)} M ${70 * Math.cos(rad)} ${70 * Math.sin(rad)} L ${110 * Math.cos(rad)} ${110 * Math.sin(rad)}`}
        stroke="rgba(34, 197, 94, 0.4)"
        strokeWidth="1.5"
        strokeDasharray="4 4"
      />
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-[36rem] bg-slate-900 text-slate-100 font-sans">
      
      {/* LEFT PANEL: Canvas */}
      <div className="flex-1 p-6 flex flex-col relative overflow-hidden">
        <h1 className="text-3xl font-bold mb-2 text-white">Moving Coil Galvanometer</h1>
        <p className="text-slate-400 mb-6 max-w-2xl">
          Visualizing the torque on a current-carrying loop in a radial magnetic field.
          When the deflecting torque equals the spring's restoring torque, the pointer comes to rest.
        </p>

        <div className="flex-1 bg-slate-800 rounded-2xl border border-slate-700 flex items-center justify-center relative shadow-2xl overflow-hidden min-h-[450px]">
          {/* Status Indicator */}
          {Math.abs(angle) > 85 && (
            <div className="absolute top-4 right-4 bg-red-900/50 border border-red-500 text-red-200 px-4 py-2 rounded-lg font-mono text-sm animate-pulse z-20">
              ⚠️ OVERLOAD: OFF-SCALE
            </div>
          )}

          <svg width="100%" height="100%" viewBox="-300 -300 600 450" className="drop-shadow-lg">
            <g transform="translate(0, 50)">
              {/* Dial Background Arc */}
              <path d="M -220 0 A 220 220 0 0 1 220 0 L 180 0 A 180 180 0 0 0 -180 0 Z" fill="#1e293b" />
              
              {/* Tick Marks */}
              {tickMarks}

              {/* North Pole (Red) */}
              <path d="M -150 -100 Q -110 0 -150 100 L -250 100 L -250 -100 Z" fill="#b91c1c" />
              <text x="-210" y="5" fill="#f87171" fontSize="32" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">N</text>

              {/* South Pole (Blue) */}
              <path d="M 150 -100 Q 110 0 150 100 L 250 100 L 250 -100 Z" fill="#1d4ed8" />
              <text x="210" y="5" fill="#60a5fa" fontSize="32" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">S</text>

              {/* Radial Magnetic Field Lines (Background) */}
              <g opacity="0.6">
                {fieldLines}
              </g>

              {/* Soft Iron Core (Center Cylinder) */}
              <circle cx="0" cy="0" r="60" fill="#475569" stroke="#334155" strokeWidth="2" />
              
              {/* Rotating Assembly (Coil + Pointer) */}
              <g transform={`rotate(${visualAngle})`} style={{ transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                {/* The Copper Coil (Top-down view cross section) */}
                <rect x="-65" y="-15" width="130" height="30" fill="none" stroke="#d97706" strokeWidth="8" rx="4" />
                <rect x="-65" y="-15" width="130" height="30" fill="none" stroke="#f59e0b" strokeWidth="4" rx="4" />
                
                {/* Pointer Needle */}
                <line x1="0" y1="0" x2="0" y2="-230" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
                <polygon points="-4,-220 4,-220 0,-240" fill="#ef4444" />
                
                {/* Center Pivot */}
                <circle cx="0" cy="0" r="8" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
              </g>

              {/* Spring overlay mapping to restoring constant k */}
              <path d={`M 0 0 C 10 -20, 30 -10, 20 10 C 10 30, -10 20, 0 5`} fill="none" stroke="#cbd5e1" strokeWidth={1 + springK * 0.3} opacity="0.8"/>
            </g>
          </svg>
        </div>
      </div>

      {/* RIGHT PANEL: Controls & Dashboard */}
      <div className="w-full lg:w-[450px] bg-slate-800 border-l border-slate-700 p-6 flex flex-col gap-6 overflow-y-auto">
        
        {/* Equations Dashboard */}
        <div className="bg-slate-900 rounded-xl p-5 border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-4 border-b border-slate-700 pb-2">Live Mathematics</h2>
          <div className="space-y-3 font-mono text-sm">
            <div className="flex justify-between items-center text-slate-300">
              <span>Deflecting Torque (<span className="text-emerald-400">τ_d</span>)</span>
              <span>{deflectingTorque.toFixed(1)} μN·m</span>
            </div>
            <div className="text-xs text-slate-500 text-right">τ = NIAB × 0.1 (mA, cm², T → μN·m)</div>
            
            <div className="flex justify-between items-center text-slate-300 mt-2">
              <span>Deflection Angle (<span className="text-blue-400">φ</span>)</span>
              <span className={Math.abs(angle) > 85 ? 'text-red-400' : 'text-blue-400'}>{angle.toFixed(1)}°</span>
            </div>
            <div className="text-xs text-slate-500 text-right">φ = τ_d / k</div>
          </div>
        </div>

        {/* Sensitivities Dashboard (The Core Concept) */}
        <div className="bg-slate-900 rounded-xl p-5 border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-4 border-b border-slate-700 pb-2 flex items-center justify-between">
            <span>Sensitivities</span>
          </h2>
          <div className="space-y-4 font-mono">
            <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
              <div className="flex justify-between text-sm mb-1 text-slate-300">
                <span>Current (I_s)</span>
                <span className="text-amber-400">{currentSensitivity.toFixed(2)} °/mA</span>
              </div>
              <div className="text-xs text-slate-500">I_s = φ / I = (NAB) / k</div>
            </div>
            
            <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
              <div className="flex justify-between text-sm mb-1 text-slate-300">
                <span>Voltage (V_s)</span>
                <span className="text-purple-400">{voltageSensitivity.toFixed(3)} °/mV</span>
              </div>
              <div className="text-xs text-slate-500">V_s = I_s / R = (NAB) / (kR)</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-5 flex-1">
          <h2 className="text-lg font-bold text-white border-b border-slate-700 pb-2">Variables</h2>
          
          <div className="space-y-1">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-emerald-400">Current (I)</span>
              <span className="text-slate-300">{current.toFixed(1)} mA</span>
            </div>
            <input type="range" min="-10" max="10" step="0.1" value={current} onChange={(e) => setCurrent(parseFloat(e.target.value))} className="w-full accent-emerald-500" />
            <div className="flex justify-between text-xs text-slate-500">
              <span>-10 mA</span><span>0</span><span>10 mA</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-amber-400">Turns (N)</span>
              <span className="text-slate-300">{turns}</span>
            </div>
            <input type="range" min="10" max="100" step="10" value={turns} onChange={(e) => setTurns(parseInt(e.target.value))} className="w-full accent-amber-500" />
            <p className="text-xs text-amber-500/70 mt-1">Increasing N increases I_s, but typically increases R too!</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-blue-400">Area (A)</span>
                <span className="text-slate-300">{area} cm²</span>
              </div>
              <input type="range" min="1" max="10" step="1" value={area} onChange={(e) => setArea(parseFloat(e.target.value))} className="w-full accent-blue-500" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-indigo-400">B-Field (B)</span>
                <span className="text-slate-300">{bField.toFixed(1)} T</span>
              </div>
              <input type="range" min="0.1" max="1.0" step="0.1" value={bField} onChange={(e) => setBField(parseFloat(e.target.value))} className="w-full accent-indigo-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-pink-400">Spring (k)</span>
                <span className="text-slate-300">{springK} μN·m/°</span>
              </div>
              <input type="range" min="1" max="10" step="1" value={springK} onChange={(e) => setSpringK(parseFloat(e.target.value))} className="w-full accent-pink-500" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-purple-400">Resist. (R)</span>
                <span className="text-slate-300">{resistance} Ω</span>
              </div>
              <input type="range" min="10" max="100" step="10" value={resistance} onChange={(e) => setResistance(parseFloat(e.target.value))} className="w-full accent-purple-500" />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}