import React, { useState, useEffect } from 'react';
import { Settings, Battery, BatteryWarning, Zap, Info, ArrowRight } from 'lucide-react';

const MATERIALS = [
  { name: 'Vacuum / Air', kappa: 1.0, color: '#e2e8f0', desc: 'Baseline reference.' },
  { name: 'Teflon', kappa: 2.1, color: '#cbd5e1', desc: 'Excellent insulator, low polarization.' },
  { name: 'Paper', kappa: 3.7, color: '#fcd34d', desc: 'Common in early capacitors.' },
  { name: 'Glass', kappa: 7.0, color: '#93c5fd', desc: 'Strong polarization effect.' },
  { name: 'Pure Water', kappa: 80.0, color: '#3b82f6', desc: 'Extreme polarization (theoretical demo).' }
];

// Base values for the simulation (arbitrary but realistic scale)
const C0 = 10; // Base Capacitance (uF)
const V0 = 10; // Battery Voltage (V)

export default function App() {
  const [batteryConnected, setBatteryConnected] = useState(true);
  const [insertion, setInsertion] = useState(0); // 0.0 to 1.0
  const [material, setMaterial] = useState(MATERIALS[3]); // Default: Glass
  const [lockedQ, setLockedQ] = useState(C0 * V0);

  // Physics Calculations
  const kappa = material.kappa;
  // C = C0 * (Area_air + kappa * Area_dielectric) / Total_Area
  const C = C0 * ((1 - insertion) + kappa * insertion);
  
  // If battery is connected, V is constant. If disconnected, Q is constant (locked).
  const Q = batteryConnected ? C * V0 : lockedQ;
  const V = batteryConnected ? V0 : Q / C;
  const U = 0.5 * Q * V;

  // Dynamic Reference Values (What an empty capacitor would look like under CURRENT circuit conditions)
  const emptyC = C0;
  const emptyQ = batteryConnected ? emptyC * V0 : lockedQ;
  const emptyV = batteryConnected ? V0 : emptyQ / emptyC;
  const emptyU = 0.5 * emptyQ * emptyV;

  // Handle Battery Disconnection/Connection
  const toggleBattery = () => {
    if (batteryConnected) {
      // Disconnecting: Trap the current charge!
      setLockedQ(Q);
    }
    setBatteryConnected(!batteryConnected);
  };

  // Charge Densities for visualization
  // V is constant across the entire parallel plate.
  // E = V/d is constant across both air and dielectric regions!
  // However, Charge density Sigma = epsilon * E. 
  // So Sigma_dielectric = kappa * Sigma_air
  const densityAir = V; 
  const densityDielectric = kappa * V;
  
  // Normalize visual opacities (max expected V is 10, max kappa is 80)
  // We use a logarithmic/clamped scale to keep visuals clean
  const getOpacity = (density) => {
    return Math.min(1.0, Math.max(0.1, density / 100));
  };

  const airOpacity = getOpacity(densityAir);
  const dielectricOpacity = getOpacity(densityDielectric);

  return (
    <div className="min-h-[36rem] bg-slate-950 text-slate-100 p-4 md:p-8 font-sans selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <Zap className="w-8 h-8 text-yellow-400" />
          <h1 className="text-3xl font-bold tracking-tight">Dielectric Insertion Simulator</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Visualizer Canvas */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
            <svg viewBox="0 0 800 450" className="w-full h-full">
              {/* Background Grid */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="1"/>
                </pattern>
                {/* Glow filter for active circuits */}
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <rect width="800" height="450" fill="url(#grid)" />

              {/* Circuit Wiring */}
              <g stroke={batteryConnected ? "#fbbf24" : "#475569"} strokeWidth="4" fill="none" className="transition-all duration-300">
                {/* Bottom Wire */}
                <path d="M 150 320 L 150 350 L 350 350" />
                {/* Top Wire */}
                <path d="M 150 180 L 150 150 L 350 150" />
              </g>

              {/* Battery */}
              <g transform="translate(110, 210)">
                <rect x="0" y="0" width="80" height="80" rx="8" fill="#0f172a" stroke={batteryConnected ? "#fbbf24" : "#475569"} strokeWidth="4" />
                {batteryConnected ? (
                  <>
                    <text x="40" y="35" fill="#fbbf24" fontSize="24" fontWeight="bold" textAnchor="middle">+</text>
                    <text x="40" y="65" fill="#fbbf24" fontSize="24" fontWeight="bold" textAnchor="middle">-</text>
                    <text x="40" y="110" fill="#fbbf24" fontSize="16" textAnchor="middle">10V</text>
                  </>
                ) : (
                  <text x="40" y="48" fill="#475569" fontSize="14" fontWeight="bold" textAnchor="middle">DISC.</text>
                )}
              </g>

              {/* Switch */}
              <g transform="translate(150, 210)">
                <circle cx="0" cy="-30" r="6" fill={batteryConnected ? "#fbbf24" : "#475569"} />
                <circle cx="0" cy="110" r="6" fill={batteryConnected ? "#fbbf24" : "#475569"} />
                {/* Switch Blade */}
                <line 
                  x1="0" y1="-30" 
                  x2={batteryConnected ? "0" : "-40"} 
                  y2={batteryConnected ? "110" : "40"} 
                  stroke={batteryConnected ? "#fbbf24" : "#94a3b8"} 
                  strokeWidth="6" strokeLinecap="round" 
                  className="transition-all duration-500 ease-in-out"
                />
              </g>

              {/* Capacitor Plates Structure */}
              <g transform="translate(350, 150)">
                {/* Dielectric Block (Slides from right) */}
                {/* width is 350. Max insertion = 350 */}
                <g transform={`translate(${350 * (1 - insertion)}, 20)`}>
                  <rect 
                    x="0" y="0" 
                    width="400" height="160" 
                    fill={material.color} 
                    opacity="0.8"
                    rx="4"
                    className="transition-all duration-200 ease-out"
                  />
                  <text x="20" y="85" fill="#0f172a" fontSize="18" fontWeight="bold" opacity="0.6">
                    {material.name} (κ={material.kappa})
                  </text>
                </g>

                {/* Electric Field Lines (Drawn conditionally to show V) */}
                <g stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 4" opacity={Math.min(1, V/10)} className="transition-opacity duration-300">
                  {Array.from({length: 12}).map((_, i) => (
                    <line key={`efield-${i}`} x1={15 + i*30} y1="20" x2={15 + i*30} y2="180" />
                  ))}
                </g>

                {/* Base Metal Plates */}
                <rect x="0" y="-10" width="350" height="20" fill="#94a3b8" rx="4" />
                <rect x="0" y="190" width="350" height="20" fill="#94a3b8" rx="4" />

                {/* Charge Visualization overlays */}
                {/* Air Region Charges */}
                {insertion < 1 && (
                  <g>
                    <rect x="0" y="-10" width={350 * (1 - insertion)} height="20" fill="#ef4444" opacity={airOpacity} rx="4" className="transition-all duration-200" />
                    <rect x="0" y="190" width={350 * (1 - insertion)} height="20" fill="#3b82f6" opacity={airOpacity} rx="4" className="transition-all duration-200" />
                  </g>
                )}
                {/* Dielectric Region Charges */}
                {insertion > 0 && (
                  <g>
                    <rect x={350 * (1 - insertion)} y="-10" width={350 * insertion} height="20" fill="#ef4444" opacity={dielectricOpacity} rx="4" className="transition-all duration-200" />
                    <rect x={350 * (1 - insertion)} y="190" width={350 * insertion} height="20" fill="#3b82f6" opacity={dielectricOpacity} rx="4" className="transition-all duration-200" />
                  </g>
                )}

                {/* Plus / Minus labels */}
                {Array.from({length: 10}).map((_, i) => (
                  <g key={`signs-${i}`}>
                    <text x={17 + i*35} y="5" fill="white" fontSize="18" fontWeight="bold" textAnchor="middle">+</text>
                    <text x={17 + i*35} y="206" fill="white" fontSize="22" fontWeight="bold" textAnchor="middle">-</text>
                  </g>
                ))}
              </g>
            </svg>
            
            {/* Visualizer Legend overlay */}
            <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md border border-slate-700 p-3 rounded-lg text-xs space-y-2">
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-sm"></div> Positive Charge Density</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-sm"></div> Negative Charge Density</div>
              <div className="flex items-center gap-2"><div className="w-3 h-0 border-t-2 border-dashed border-sky-400"></div> Electric Field (E)</div>
            </div>
          </div>

          {/* Controls Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6 shadow-xl">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-blue-400" />
                Experiment Controls
              </h2>
            </div>

            {/* Battery Toggle */}
            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
              <div className="flex justify-between items-center mb-2">
                <label className="font-semibold text-slate-200">Power Source</label>
                <button 
                  onClick={toggleBattery}
                  className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${batteryConnected ? 'bg-yellow-500 text-yellow-950 hover:bg-yellow-400' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                >
                  {batteryConnected ? 'CONNECTED' : 'DISCONNECTED'}
                </button>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {batteryConnected 
                  ? "Battery maintains a constant Voltage (V). Charge (Q) will flow to accommodate capacitance changes." 
                  : "Circuit is open. Charge (Q) is trapped on the plates. Voltage (V) will shift as capacitance changes."}
              </p>
            </div>

            {/* Material Selection */}
            <div className="space-y-2">
              <label className="font-semibold text-slate-200">Dielectric Material</label>
              <select 
                value={material.name}
                onChange={(e) => setMaterial(MATERIALS.find(m => m.name === e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              >
                {MATERIALS.map(m => (
                  <option key={m.name} value={m.name}>{m.name} (κ = {m.kappa})</option>
                ))}
              </select>
              <p className="text-xs text-slate-400 pl-1">{material.desc}</p>
            </div>

            {/* Insertion Slider */}
            <div className="space-y-4 pt-2">
              <div className="flex justify-between">
                <label className="font-semibold text-slate-200">Insert Dielectric</label>
                <span className="text-blue-400 font-mono">{(insertion * 100).toFixed(0)}%</span>
              </div>
              <input 
                type="range" 
                min="0" max="1" step="0.01" 
                value={insertion} 
                onChange={(e) => setInsertion(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-xs text-slate-500 font-medium px-1">
                <span>Empty (Air)</span>
                <span>Fully Inserted</span>
              </div>
            </div>
            
          </div>
        </div>

        {/* Data Analytics & Table */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Analysis Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl overflow-x-auto">
            <h3 className="text-lg font-bold mb-4 text-slate-200">Physics Data Table</h3>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-sm">
                  <th className="pb-3 pl-2">Parameter</th>
                  <th className="pb-3">Empty Reference</th>
                  <th className="pb-3 text-blue-400">Current State</th>
                  <th className="pb-3 text-right pr-2">Multiplier</th>
                </tr>
              </thead>
              <tbody className="text-sm font-mono">
                <tr className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                  <td className="py-3 pl-2 font-sans font-medium text-slate-300">Capacitance (C)</td>
                  <td className="py-3">{emptyC.toFixed(1)} µF</td>
                  <td className="py-3 text-blue-300">{C.toFixed(1)} µF</td>
                  <td className="py-3 text-right pr-2">×{(C/emptyC).toFixed(2)}</td>
                </tr>
                <tr className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                  <td className="py-3 pl-2 font-sans font-medium text-slate-300">Charge (Q)</td>
                  <td className="py-3">{emptyQ.toFixed(0)} µC</td>
                  <td className="py-3 text-blue-300">{Q.toFixed(0)} µC</td>
                  <td className="py-3 text-right pr-2">×{(Q/emptyQ).toFixed(2)}</td>
                </tr>
                <tr className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                  <td className="py-3 pl-2 font-sans font-medium text-slate-300">Voltage (V)</td>
                  <td className="py-3">{emptyV.toFixed(1)} V</td>
                  <td className="py-3 text-blue-300">{V.toFixed(1)} V</td>
                  <td className="py-3 text-right pr-2">×{(V/emptyV).toFixed(2)}</td>
                </tr>
                <tr className="hover:bg-slate-800/20 transition-colors">
                  <td className="py-3 pl-2 font-sans font-medium text-slate-300">Energy (U)</td>
                  <td className="py-3">{emptyU.toFixed(0)} µJ</td>
                  <td className="py-3 text-blue-300">{U.toFixed(0)} µJ</td>
                  <td className="py-3 text-right pr-2">×{(U/emptyU).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Educational Ah-Ha Panel */}
          <div className="bg-blue-950/30 border border-blue-900/50 rounded-2xl p-6 shadow-xl flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Info className="w-32 h-32" />
            </div>
            <h3 className="text-lg font-bold mb-3 text-blue-300 flex items-center gap-2">
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-md font-bold tracking-wider">AH-HA!</span>
              The Physics Explained
            </h3>
            
            {batteryConnected ? (
              <div className="space-y-4 text-slate-300 leading-relaxed z-10">
                <p>
                  Because the <strong className="text-yellow-400">Battery is Connected</strong>, the Voltage (V) across the plates is forced to remain perfectly constant. 
                </p>
                <p>
                  As you insert the dielectric, its molecules polarize. This increases the total Capacitance (C). To maintain the constant voltage, the battery must <strong>pump more charge (Q)</strong> onto the plates. Notice how the red/blue charge colors get significantly brighter over the dielectric material!
                </p>
              </div>
            ) : (
              <div className="space-y-4 text-slate-300 leading-relaxed z-10">
                <p>
                  Because the <strong className="text-slate-400">Battery is Disconnected</strong>, the electrons have nowhere to go! The total Charge (Q) is physically trapped and must remain constant.
                </p>
                <p>
                  As you insert the dielectric, its molecules polarize and create their own opposing electric field. This cancels out some of the original field, causing the <strong>overall Voltage (V) to drop</strong>. You can see the electric field dashed lines fade out as insertion increases!
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}