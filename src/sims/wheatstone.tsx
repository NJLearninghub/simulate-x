import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Activity, Settings, RefreshCw, HelpCircle, CheckCircle, Target } from 'lucide-react';

const WheatstoneBridge = () => {
  // Application State
  const [mode, setMode] = useState('sandbox'); // 'sandbox' or 'mystery'
  const [vin, setVin] = useState(12);
  const [r1, setR1] = useState(100);
  const [r2, setR2] = useState(100);
  const [r3, setR3] = useState(100);
  const [r4, setR4] = useState(200); // Intentionally unbalanced by default
  const rg = 50; // Galvanometer internal resistance
  
  // Mystery Mode State
  const [mysteryValue, setMysteryValue] = useState(0);
  const [userGuess, setUserGuess] = useState('');
  const [guessResult, setGuessResult] = useState(null);

  // Initialize Mystery Mode
  const startMysteryMode = () => {
    const randomR = Math.floor(Math.random() * 20 + 1) * 50; // 50, 100, ..., 1000
    setMysteryValue(randomR);
    setR4(randomR);
    setR1(100);
    setR2(100);
    setR3(100);
    setUserGuess('');
    setGuessResult(null);
    setMode('mystery');
  };

  // --- Physics Engine ---
  // Calculates node voltages and branch currents using Nodal Analysis
  const physics = useMemo(() => {
    const G1 = 1 / r1;
    const G2 = 1 / r2;
    const G3 = 1 / r3;
    const G4 = 1 / r4;
    const Gg = 1 / rg;

    // Node C (left) and Node D (right) equations
    const A = G1 + G3 + Gg;
    const B = -Gg;
    const C = -Gg;
    const D = G2 + G4 + Gg;

    const denom = A * D - B * C;
    
    // Voltages at the middle nodes
    const vc = ((G1 * vin) * D - (G2 * vin) * B) / denom;
    const vd = (A * (G2 * vin) - C * (G1 * vin)) / denom;

    // Currents
    const ig = (vc - vd) / rg; // Positive if C -> D
    const i1 = (vin - vc) / r1;
    const i2 = (vin - vd) / r2;
    const i3 = vc / r3;
    const i4 = vd / r4;

    const isBalanced = Math.abs(ig) < 0.0001;

    return { vc, vd, ig, i1, i2, i3, i4, isBalanced };
  }, [r1, r2, r3, r4, vin, rg]);

  // --- Animation Engine ---
  const requestRef = useRef<any>(null);
  const offsets = useRef({ w1: 0, w2: 0, w3: 0, w4: 0, wg: 0, wmain: 0 });
  const wireRefs = {
    w1: useRef(null),
    w2: useRef(null),
    w3: useRef(null),
    w4: useRef(null),
    wg: useRef(null),
    wmainIn: useRef(null),
    wmainOut: useRef(null)
  };

  const animate = () => {
    // Speed multiplier
    const K = 200; 
    
    // Update offsets based on current magnitude and direction
    offsets.current.w1 -= physics.i1 * K;
    offsets.current.w2 -= physics.i2 * K;
    offsets.current.w3 -= physics.i3 * K;
    offsets.current.w4 -= physics.i4 * K;
    offsets.current.wg -= physics.ig * K; // C to D
    
    const totalCurrent = physics.i1 + physics.i2;
    offsets.current.wmain -= totalCurrent * K;

    // Apply to DOM directly for 60fps performance without React re-renders
    if (wireRefs.w1.current) wireRefs.w1.current.setAttribute('stroke-dashoffset', offsets.current.w1);
    if (wireRefs.w2.current) wireRefs.w2.current.setAttribute('stroke-dashoffset', offsets.current.w2);
    if (wireRefs.w3.current) wireRefs.w3.current.setAttribute('stroke-dashoffset', offsets.current.w3);
    if (wireRefs.w4.current) wireRefs.w4.current.setAttribute('stroke-dashoffset', offsets.current.w4);
    if (wireRefs.wg.current) wireRefs.wg.current.setAttribute('stroke-dashoffset', offsets.current.wg);
    if (wireRefs.wmainIn.current) wireRefs.wmainIn.current.setAttribute('stroke-dashoffset', offsets.current.wmain);
    if (wireRefs.wmainOut.current) wireRefs.wmainOut.current.setAttribute('stroke-dashoffset', offsets.current.wmain);

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [physics]);

  // --- Utilities ---
  // Interpolates between Blue (0V) and Red (Vin) to visualize potential
  const getVoltageColor = (v) => {
    const ratio = Math.max(0, Math.min(1, v / vin));
    const r = Math.round(255 * ratio);
    const b = Math.round(255 * (1 - ratio));
    return `rgb(${r}, 50, ${b})`;
  };

  const handleGuess = () => {
    const guess = parseFloat(userGuess);
    if (Math.abs(guess - mysteryValue) < 1) {
      setGuessResult('correct');
    } else {
      setGuessResult('incorrect');
    }
  };

  // Clamp Galvanometer needle angle (-45 to 45 degrees)
  // Max scale assumed to be around 50mA
  const maxGCurrent = 0.05; 
  let needleAngle = (physics.ig / maxGCurrent) * 45;
  if (needleAngle > 45) needleAngle = 45;
  if (needleAngle < -45) needleAngle = -45;

  return (
    <div className="flex flex-col md:flex-row w-full h-full min-h-[36rem] bg-slate-50 font-sans text-slate-800">
      
      {/* LEFT PANEL - CONTROLS & DASHBOARD */}
      <div className="w-full md:w-1/3 bg-white border-r border-slate-200 p-6 flex flex-col shadow-lg z-10 overflow-y-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-600 text-white rounded-xl shadow-md">
            <Activity size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Wheatstone Bridge</h1>
            <p className="text-sm text-slate-500">Circuit Analysis Visualizer</p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex p-1 bg-slate-100 rounded-lg mb-6">
          <button 
            onClick={() => setMode('sandbox')}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${mode === 'sandbox' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Sandbox Mode
          </button>
          <button 
            onClick={startMysteryMode}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${mode === 'mystery' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Mystery Mode
          </button>
        </div>

        {/* Controls */}
        <div className="space-y-4 mb-8 flex-grow">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
            <Settings size={16} /> Circuit Parameters
          </h2>
          
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-slate-700">Source Voltage (V)</label>
              <span className="text-sm font-bold text-blue-600">{vin} V</span>
            </div>
            <input type="range" min="1" max="24" value={vin} onChange={(e) => setVin(Number(e.target.value))} className="w-full accent-blue-600" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* R1 Control */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex justify-between mb-1">
                <label className="text-xs font-medium text-slate-700">R₁ (Top Left)</label>
                <span className="text-xs font-bold text-slate-900">{r1} Ω</span>
              </div>
              <input type="range" min="10" max="1000" step="10" value={r1} onChange={(e) => setR1(Number(e.target.value))} className="w-full accent-slate-600" />
            </div>

            {/* R2 Control */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex justify-between mb-1">
                <label className="text-xs font-medium text-slate-700">R₂ (Top Right)</label>
                <span className="text-xs font-bold text-slate-900">{r2} Ω</span>
              </div>
              <input type="range" min="10" max="1000" step="10" value={r2} onChange={(e) => setR2(Number(e.target.value))} className="w-full accent-slate-600" />
            </div>

            {/* R3 Control */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex justify-between mb-1">
                <label className="text-xs font-medium text-slate-700">R₃ (Btm Left)</label>
                <span className="text-xs font-bold text-slate-900">{r3} Ω</span>
              </div>
              <input type="range" min="10" max="1000" step="10" value={r3} onChange={(e) => setR3(Number(e.target.value))} className="w-full accent-slate-600" />
            </div>

            {/* R4 Control */}
            <div className={`p-3 rounded-xl border ${mode === 'mystery' ? 'bg-purple-50 border-purple-200' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex justify-between mb-1">
                <label className={`text-xs font-medium ${mode === 'mystery' ? 'text-purple-700' : 'text-slate-700'}`}>R₄ / Rₓ (Btm Right)</label>
                <span className={`text-xs font-bold ${mode === 'mystery' ? 'text-purple-700' : 'text-slate-900'}`}>
                  {mode === 'mystery' ? '??? Ω' : `${r4} Ω`}
                </span>
              </div>
              <input 
                type="range" min="10" max="1000" step="10" 
                value={r4} 
                onChange={(e) => setR4(Number(e.target.value))} 
                disabled={mode === 'mystery'}
                className={`w-full ${mode === 'mystery' ? 'accent-purple-300 opacity-50 cursor-not-allowed' : 'accent-slate-600'}`} 
              />
            </div>
          </div>
        </div>

        {/* Dynamic Data Panel */}
        {mode === 'sandbox' && (
          <div className="bg-slate-800 rounded-2xl p-5 text-slate-100 shadow-inner">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Live Analytics</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                <span className="text-sm font-medium text-slate-300">Node C (Left) Voltage:</span>
                <span className="font-mono text-blue-400">{physics.vc.toFixed(2)} V</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                <span className="text-sm font-medium text-slate-300">Node D (Right) Voltage:</span>
                <span className="font-mono text-blue-400">{physics.vd.toFixed(2)} V</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                <span className="text-sm font-medium text-slate-300">Potential Difference (ΔV):</span>
                <span className="font-mono font-bold text-white">{Math.abs(physics.vc - physics.vd).toFixed(3)} V</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-sm font-medium text-slate-300">Galvanometer Current:</span>
                <span className={`font-mono font-bold ${physics.isBalanced ? 'text-green-400' : 'text-red-400'}`}>
                  {(physics.ig * 1000).toFixed(2)} mA
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Mystery Mode Panel */}
        {mode === 'mystery' && (
          <div className="bg-purple-50 rounded-2xl p-5 border border-purple-200">
            <h3 className="text-sm font-bold text-purple-800 mb-2 flex items-center gap-2">
              <Target size={18} /> Find the Unknown Resistance!
            </h3>
            <p className="text-xs text-purple-600 mb-4">
              1. Adjust R₁, R₂, and R₃ until the Galvanometer reads exactly 0 mA.<br/>
              2. Use the balance equation to calculate R₄.
            </p>
            
            {physics.isBalanced ? (
              <div className="animate-pulse bg-green-100 text-green-800 p-2 rounded text-center text-xs font-bold mb-4 border border-green-300">
                Bridge is Balanced! You can calculate now.
              </div>
            ) : (
              <div className="bg-orange-100 text-orange-800 p-2 rounded text-center text-xs font-bold mb-4 border border-orange-300">
                Bridge Unbalanced. (Ig = {(physics.ig * 1000).toFixed(1)} mA)
              </div>
            )}

            <div className="flex gap-2">
              <input 
                type="number" 
                placeholder="Enter R4 value..." 
                value={userGuess}
                onChange={(e) => setUserGuess(e.target.value)}
                className="flex-1 border border-purple-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button 
                onClick={handleGuess}
                className="bg-purple-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-purple-700 transition-colors"
              >
                Check
              </button>
            </div>
            
            {guessResult === 'correct' && (
              <div className="mt-3 text-green-600 font-bold text-sm flex items-center justify-center gap-2">
                <CheckCircle size={16} /> Brilliant! R₄ is {mysteryValue}Ω.
              </div>
            )}
            {guessResult === 'incorrect' && (
              <div className="mt-3 text-red-500 font-bold text-sm text-center">
                Not quite. Check your math!
              </div>
            )}
          </div>
        )}
      </div>

      {/* RIGHT PANEL - SVG CANVAS */}
      <div className="w-full md:w-2/3 relative bg-slate-100 flex items-center justify-center p-4 overflow-hidden">
        
        {/* Dynamic "Ah-Ha" Tooltip Box when Balanced */}
        {physics.isBalanced && (
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-20 animate-bounce-short">
            <CheckCircle size={24} />
            <div>
              <div className="font-bold">Bridge is Perfectly Balanced!</div>
              <div className="text-xs text-green-100 font-mono">R₁/R₂ = R₃/R₄ &rarr; {r1}/{r2} = {r3}/{r4}</div>
            </div>
          </div>
        )}

        {/* The SVGs */}
        <svg viewBox="0 0 600 500" className="w-full max-w-2xl h-auto drop-shadow-md">
          <defs>
            {/* Flow animation styles */}
            <style>
              {`
                .wire-base { stroke: #cbd5e1; stroke-width: 6; stroke-linecap: round; fill: none; }
                .wire-flow { stroke: #3b82f6; stroke-width: 4; stroke-linecap: round; fill: none; stroke-dasharray: 8 8; }
                .wire-flow-g { stroke: #ef4444; stroke-width: 4; stroke-linecap: round; fill: none; stroke-dasharray: 8 8; }
                
                @keyframes pulse-node {
                  0% { r: 6; opacity: 1; }
                  50% { r: 12; opacity: 0.4; }
                  100% { r: 6; opacity: 1; }
                }
              `}
            </style>
          </defs>

          {/* External Circuit (Battery to Bridge) */}
          <path d="M 300,50 L 300,20 L 50,20 L 50,480 L 300,480 L 300,450" className="wire-base" />
          <path d="M 300,50 L 300,20 L 50,20 L 50,480 L 300,480 L 300,450" className="wire-flow" ref={wireRefs.wmainIn} />
          
          {/* Battery Graphic */}
          <g transform="translate(25, 230)">
            <rect x="0" y="0" width="50" height="40" rx="4" fill="#1e293b" />
            <rect x="15" y="-6" width="20" height="6" fill="#cbd5e1" />
            <text x="25" y="25" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">{vin}V</text>
            <text x="25" y="-12" textAnchor="middle" fill="#ef4444" fontSize="16" fontWeight="bold">+</text>
            <text x="25" y="60" textAnchor="middle" fill="#3b82f6" fontSize="16" fontWeight="bold">-</text>
          </g>

          {/* THE WHEATSTONE DIAMOND */}
          {/* Base Wires */}
          <line x1="300" y1="50" x2="100" y2="250" className="wire-base" />
          <line x1="300" y1="50" x2="500" y2="250" className="wire-base" />
          <line x1="100" y1="250" x2="300" y2="450" className="wire-base" />
          <line x1="500" y1="250" x2="300" y2="450" className="wire-base" />
          
          {/* Galvanometer Base Wire */}
          <line x1="100" y1="250" x2="500" y2="250" className="wire-base" />

          {/* Animated Current Flow Wires */}
          <line x1="300" y1="50" x2="100" y2="250" className="wire-flow" ref={wireRefs.w1} />
          <line x1="300" y1="50" x2="500" y2="250" className="wire-flow" ref={wireRefs.w2} />
          <line x1="100" y1="250" x2="300" y2="450" className="wire-flow" ref={wireRefs.w3} />
          <line x1="500" y1="250" x2="300" y2="450" className="wire-flow" ref={wireRefs.w4} />
          
          {/* Galvanometer Animated Flow (Red when active) */}
          {!physics.isBalanced && (
            <line x1="100" y1="250" x2="500" y2="250" className="wire-flow-g" ref={wireRefs.wg} />
          )}

          {/* VOLTAGE NODES (Colors represent potential) */}
          {/* Node A (Top) - Full Vin */}
          <circle cx="300" cy="50" r="8" fill={getVoltageColor(vin)} stroke="white" strokeWidth="3" />
          <text x="300" y="35" textAnchor="middle" fill="#475569" fontWeight="bold">Node A ({vin}V)</text>

          {/* Node B (Bottom) - 0V (GND) */}
          <circle cx="300" cy="450" r="8" fill={getVoltageColor(0)} stroke="white" strokeWidth="3" />
          <text x="300" y="475" textAnchor="middle" fill="#475569" fontWeight="bold">Node B (0V)</text>

          {/* Node C (Left) */}
          <circle cx="100" cy="250" r="8" fill={getVoltageColor(physics.vc)} stroke="white" strokeWidth="3" />
          <text x="60" y="255" textAnchor="end" fill="#475569" fontWeight="bold">Node C</text>
          <text x="60" y="275" textAnchor="end" fill={getVoltageColor(physics.vc)} fontSize="14" fontWeight="bold">{physics.vc.toFixed(2)}V</text>

          {/* Node D (Right) */}
          <circle cx="500" cy="250" r="8" fill={getVoltageColor(physics.vd)} stroke="white" strokeWidth="3" />
          <text x="540" y="255" textAnchor="start" fill="#475569" fontWeight="bold">Node D</text>
          <text x="540" y="275" textAnchor="start" fill={getVoltageColor(physics.vd)} fontSize="14" fontWeight="bold">{physics.vd.toFixed(2)}V</text>

          {/* RESISTOR COMPONENTS */}
          {/* Helper function to draw resistors */}
          {(() => {
            const drawResistor = (x, y, label, value, isMystery) => (
              <g transform={`translate(${x}, ${y})`}>
                <rect x="-35" y="-15" width="70" height="30" rx="4" fill="white" stroke="#64748b" strokeWidth="2" />
                <text x="0" y="4" textAnchor="middle" fill="#0f172a" fontSize="14" fontWeight="bold">
                  {isMystery ? '???' : `${value}Ω`}
                </text>
                <text x="0" y="-20" textAnchor="middle" fill="#64748b" fontSize="12" fontWeight="bold">{label}</text>
              </g>
            );

            return (
              <>
                {drawResistor(200, 150, 'R₁', r1, false)}
                {drawResistor(400, 150, 'R₂', r2, false)}
                {drawResistor(200, 350, 'R₃', r3, false)}
                {drawResistor(400, 350, 'R₄', r4, mode === 'mystery')}
              </>
            );
          })()}

          {/* GALVANOMETER (CENTER) */}
          <g transform="translate(300, 250)">
            {/* Outer Case */}
            <circle cx="0" cy="0" r="45" fill="white" stroke="#94a3b8" strokeWidth="4" />
            <circle cx="0" cy="0" r="35" fill="#f8fafc" />
            
            {/* Scale Markings */}
            <path d="M -25,-15 A 30,30 0 0,1 25,-15" fill="none" stroke="#cbd5e1" strokeWidth="2" />
            <line x1="0" y1="-30" x2="0" y2="-25" stroke="#94a3b8" strokeWidth="2" />
            <line x1="-21" y1="-21" x2="-18" y2="-18" stroke="#94a3b8" strokeWidth="2" />
            <line x1="21" y1="-21" x2="18" y2="-18" stroke="#94a3b8" strokeWidth="2" />
            
            {/* Needle */}
            <g transform={`rotate(${needleAngle})`}>
              <line x1="0" y1="5" x2="0" y2="-28" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
              <circle cx="0" cy="0" r="4" fill="#0f172a" />
            </g>

            <text x="0" y="20" textAnchor="middle" fill="#0f172a" fontSize="16" fontWeight="bold">G</text>
            <text x="0" y="32" textAnchor="middle" fill="#64748b" fontSize="10 font-mono">
              {(physics.ig * 1000).toFixed(1)} mA
            </text>
          </g>

        </svg>

        {/* Educational Info Overlay */}
        <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur p-4 rounded-xl shadow-lg border border-slate-200 max-w-sm hidden lg:block">
          <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
            <HelpCircle size={16} className="text-blue-500" /> The "Ah-Ha!" Concept
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed mb-2">
            The bridge is "balanced" when the voltage at Node C perfectly equals the voltage at Node D. Since potential difference ($\Delta V$) is zero, no current flows through the center.
          </p>
          <div className="bg-slate-100 p-2 rounded text-center font-mono text-sm font-bold text-slate-700">
            Condition: (R₁ / R₂) = (R₃ / R₄)
          </div>
        </div>

      </div>
    </div>
  );
};

export default WheatstoneBridge;