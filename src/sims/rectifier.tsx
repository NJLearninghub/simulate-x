import React, { useState, useEffect, useRef } from 'react';

export default function RectifierSimulation() {
  const canvasRef = useRef(null);
  const [mode, setMode] = useState('full'); // 'half' or 'full'
  const [capacitance, setCapacitance] = useState(0); // 0 to 100 (uF concept)
  const [resistance, setResistance] = useState(50); // Load resistance
  const [isPlaying, setIsPlaying] = useState(true);

  // Physics State Ref for high-speed calculation outside React's render cycle
  const physics = useRef({
    time: 0,
    vCap: 0,
    history: [],
    cycleMetrics: { max: 0, min: 0, avgSum: 0, count: 0 },
    displayMetrics: { vAvg: 0, ripple: 0 }
  });

  const V_PEAK = 10; // 10V peak AC
  const FREQUENCY = 1; // 1 Hz for visual slowness (1 cycle per second)
  const DIODE_DROP = 0.7;

  // Real-time physics loop
  useEffect(() => {
    let animationFrameId;
    let lastTime = performance.now();

    const loop = (timestamp) => {
      if (isPlaying) {
        const dt = (timestamp - lastTime) / 1000; // seconds
        lastTime = timestamp;
        
        // Prevent massive jumps if tab is inactive
        if (dt < 0.1) {
            updatePhysics(dt);
        }
        drawOscilloscope();
      } else {
        lastTime = timestamp; // Keep time synced when paused
      }
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, mode, capacitance, resistance]);

  const updatePhysics = (dt) => {
    const p = physics.current;
    p.time += dt;

    // 1. Calculate raw AC input
    const vin_raw = V_PEAK * Math.sin(2 * Math.PI * FREQUENCY * p.time);

    // 2. Rectification (Idealized with Diode Drop)
    let v_rectified = 0;
    let currentPath = 0; // 1 = positive half, -1 = negative half, 0 = off

    if (mode === 'half') {
      if (vin_raw > DIODE_DROP) {
        v_rectified = vin_raw - DIODE_DROP;
        currentPath = 1;
      }
    } else { // Full Wave Bridge
      if (vin_raw > 2 * DIODE_DROP) {
        v_rectified = vin_raw - 2 * DIODE_DROP;
        currentPath = 1;
      } else if (vin_raw < -2 * DIODE_DROP) {
        v_rectified = Math.abs(vin_raw) - 2 * DIODE_DROP;
        currentPath = -1;
      }
    }

    // 3. Filter Capacitor Dynamics (RC Circuit)
    const C = capacitance * 0.005; // conceptual scaling for visual 1Hz freq
    const R = resistance;

    if (C > 0) {
      if (v_rectified > p.vCap) {
        // Charging instantly (assuming ideal source resistance for simplicity)
        p.vCap = v_rectified;
      } else {
        // Discharging through load resistor: dV/dt = -V / (RC)
        p.vCap = p.vCap - (p.vCap / (R * C)) * dt;
      }
    } else {
      p.vCap = v_rectified; // No capacitor, output perfectly matches rectified wave
    }

    const vout = p.vCap;

    // Record for oscilloscope
    p.history.push({ t: p.time, vin: vin_raw, vout: vout, path: currentPath });
    
    // Keep 5 seconds of history for the graph
    const historyDuration = 5;
    while (p.history.length > 0 && p.history[0].t < p.time - historyDuration) {
      p.history.shift();
    }

    // Metrics Calculation (over the last full cycle)
    p.cycleMetrics.max = Math.max(p.cycleMetrics.max, vout);
    p.cycleMetrics.min = p.cycleMetrics.count === 0 ? vout : Math.min(p.cycleMetrics.min, vout);
    p.cycleMetrics.avgSum += vout;
    p.cycleMetrics.count += 1;

    // Reset metrics every second (1 cycle)
    if (Math.floor(p.time) > Math.floor(p.time - dt)) {
      p.displayMetrics.ripple = p.cycleMetrics.max - p.cycleMetrics.min;
      p.displayMetrics.vAvg = p.cycleMetrics.avgSum / p.cycleMetrics.count;
      
      // Reset
      p.cycleMetrics = { max: 0, min: 100, avgSum: 0, count: 0 };
    }
  };

  const drawOscilloscope = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    const p = physics.current;

    // Clear background
    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.fillRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= 10; i++) {
        ctx.moveTo(0, i * (height/10));
        ctx.lineTo(width, i * (height/10));
    }
    ctx.moveTo(0, height/2);
    ctx.strokeStyle = '#475569';
    ctx.stroke();

    if (p.history.length === 0) return;

    const tMax = p.time;
    const tMin = tMax - 5; // 5 seconds window
    
    const mapX = (t) => ((t - tMin) / 5) * width;
    const mapY = (v) => height/2 - (v / 12) * (height/2); // scaled for 12V max

    // Draw Input Wave (Dotted Blue)
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)'; // light blue, dim
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 2;
    p.history.forEach((pt, i) => {
      const x = mapX(pt.t);
      const y = mapY(pt.vin);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Output Wave (Solid Green)
    ctx.beginPath();
    ctx.strokeStyle = '#22c55e'; // green-500
    ctx.lineWidth = 3;
    p.history.forEach((pt, i) => {
      const x = mapX(pt.t);
      const y = mapY(pt.vout);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  };

  // SVG Components for Circuit
  const DiodeSymbol = ({ x, y, rotation, isOn, label }) => (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
      <path d="M -15 0 L -5 0" stroke={isOn ? "#facc15" : "#64748b"} strokeWidth="3" />
      <path d="M -5 -10 L 10 0 L -5 10 Z" fill={isOn ? "#facc15" : "#64748b"} />
      <path d="M 10 -10 L 10 10" stroke={isOn ? "#facc15" : "#64748b"} strokeWidth="3" />
      <path d="M 10 0 L 20 0" stroke={isOn ? "#facc15" : "#64748b"} strokeWidth="3" />
      {label && <text x="-5" y="-15" fill="#94a3b8" fontSize="12" textAnchor="middle" transform={`rotate(${-rotation})`}>{label}</text>}
    </g>
  );

  const CapacitorSymbol = ({ x, y, isOn }) => (
    <g transform={`translate(${x}, ${y})`}>
      <line x1="0" y1="-20" x2="0" y2="-5" stroke={isOn ? "#22c55e" : "#64748b"} strokeWidth="3" />
      <line x1="-12" y1="-5" x2="12" y2="-5" stroke={isOn ? "#22c55e" : "#64748b"} strokeWidth="4" />
      <line x1="-12" y1="5" x2="12" y2="5" stroke={isOn ? "#22c55e" : "#64748b"} strokeWidth="4" />
      <line x1="0" y1="5" x2="0" y2="20" stroke="#64748b" strokeWidth="3" />
    </g>
  );

  const ResistorSymbol = ({ x, y }) => (
    <g transform={`translate(${x}, ${y})`}>
      <line x1="0" y1="-30" x2="0" y2="-20" stroke="#64748b" strokeWidth="3" />
      <polyline points="0,-20 -10,-15 10,-5 -10,5 10,15 0,20" fill="none" stroke="#64748b" strokeWidth="3" strokeLinejoin="round" />
      <line x1="0" y1="20" x2="0" y2="30" stroke="#64748b" strokeWidth="3" />
    </g>
  );

  // Extract current path state for visual glow
  const currentPath = physics.current.history.length > 0 
    ? physics.current.history[physics.current.history.length - 1].path 
    : 0;

  return (
    <div className="min-h-[36rem] bg-slate-950 text-slate-200 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-white">AC to DC: Rectifier Explorer</h1>
          <p className="text-slate-400">Interact with the physics of diodes and capacitors to smooth out alternating current.</p>
        </div>

        {/* Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Controls Panel */}
          <div className="col-span-1 bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Control Panel</h2>
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className={`px-4 py-2 rounded-lg font-bold transition-colors ${isPlaying ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'}`}
              >
                {isPlaying ? 'Pause' : 'Play'}
              </button>
            </div>

            {/* Toggle Mode */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-400 uppercase tracking-wider">Circuit Type</label>
              <div className="flex bg-slate-800 rounded-lg p-1">
                <button
                  onClick={() => setMode('half')}
                  className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${mode === 'half' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                  Half-Wave
                </button>
                <button
                  onClick={() => setMode('full')}
                  className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${mode === 'full' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                  Full-Wave Bridge
                </button>
              </div>
            </div>

            {/* Capacitance Slider */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-slate-400">Filter Capacitor (C)</label>
                <span className="text-sm text-indigo-400 font-mono">{capacitance} µF</span>
              </div>
              <input 
                type="range" min="0" max="100" value={capacitance} 
                onChange={(e) => setCapacitance(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <p className="text-xs text-slate-500">Adds an energy reservoir. Watch how it "smooths" the output graph by preventing the voltage from dropping to zero.</p>
            </div>

            {/* Resistance Slider */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-slate-400">Load Resistance (R)</label>
                <span className="text-sm text-indigo-400 font-mono">{resistance} Ω</span>
              </div>
              <input 
                type="range" min="10" max="200" value={resistance} 
                onChange={(e) => setResistance(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
               <p className="text-xs text-slate-500">Dictates how fast the capacitor discharges. Lower resistance = faster drain = more ripple.</p>
            </div>

            {/* Live Math Readouts */}
            <div className="mt-8 pt-6 border-t border-slate-800">
               <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Live Analysis</h3>
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950 rounded-lg p-3 border border-slate-800">
                    <div className="text-xs text-slate-500 mb-1">Avg DC Voltage</div>
                    <div className="text-xl font-mono text-green-400">{physics.current.displayMetrics.vAvg.toFixed(2)} V</div>
                  </div>
                  <div className="bg-slate-950 rounded-lg p-3 border border-slate-800">
                    <div className="text-xs text-slate-500 mb-1">Ripple Voltage</div>
                    <div className="text-xl font-mono text-yellow-400">{physics.current.displayMetrics.ripple.toFixed(2)} V</div>
                  </div>
               </div>
            </div>
          </div>

          {/* Visualizers */}
          <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
            
            {/* Oscilloscope */}
            <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-xl flex-1 min-h-[300px] relative overflow-hidden">
               <div className="absolute top-4 left-6 flex items-center gap-4 z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-sky-400/50"></div>
                    <span className="text-xs font-mono text-sky-200">AC Input (Vin)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-xs font-mono text-green-400">DC Output (Vout)</span>
                  </div>
               </div>
               <canvas 
                  ref={canvasRef} 
                  width={800} 
                  height={300} 
                  className="w-full h-full object-cover rounded-xl"
               />
               {/* Center Line Label */}
               <div className="absolute left-2 top-[50%] -translate-y-1/2 text-[10px] text-slate-500 font-mono">0V</div>
               <div className="absolute left-2 top-4 text-[10px] text-slate-500 font-mono">+10V</div>
               <div className="absolute left-2 bottom-4 text-[10px] text-slate-500 font-mono">-10V</div>
            </div>

            {/* Circuit Diagram */}
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl flex items-center justify-center min-h-[300px] relative">
              <svg width="600" height="250" viewBox="0 0 600 250" className="max-w-full h-auto">
                {/* AC Source */}
                <circle cx="50" cy="125" r="25" fill="#1e293b" stroke="#38bdf8" strokeWidth="3" />
                <path d="M 35 125 Q 42 110, 50 125 T 65 125" fill="none" stroke="#38bdf8" strokeWidth="2" />
                <text x="50" y="170" fill="#38bdf8" fontSize="12" textAnchor="middle" className="font-mono">10V AC</text>

                {mode === 'half' ? (
                  // --- HALF WAVE CIRCUIT ---
                  <g>
                    {/* Top Wire */}
                    <path d="M 75 125 L 200 125" fill="none" stroke={currentPath === 1 ? "#facc15" : "#334155"} strokeWidth="3" />
                    <DiodeSymbol x="220" y="125" rotation="0" isOn={currentPath === 1} label="D1" />
                    <path d="M 240 125 L 450 125" fill="none" stroke={currentPath === 1 ? "#22c55e" : "#334155"} strokeWidth="3" />
                    
                    {/* Bottom Wire (Ground/Return) */}
                    <path d="M 50 150 L 50 200 L 450 200" fill="none" stroke="#334155" strokeWidth="3" />

                    {/* Capacitor Branch */}
                    <path d="M 350 125 L 350 160" fill="none" stroke={currentPath === 1 || capacitance > 0 ? "#22c55e" : "#334155"} strokeWidth="3" />
                    <CapacitorSymbol x="350" y="170" isOn={capacitance > 0} />
                    <path d="M 350 180 L 350 200" fill="none" stroke="#334155" strokeWidth="3" />

                    {/* Load Resistor Branch */}
                    <path d="M 450 125 L 450 145" fill="none" stroke={currentPath === 1 || capacitance > 0 ? "#22c55e" : "#334155"} strokeWidth="3" />
                    <ResistorSymbol x="450" y="175" />
                    <path d="M 450 205 L 450 200" fill="none" stroke="#334155" strokeWidth="3" />
                  </g>
                ) : (
                  // --- FULL WAVE BRIDGE CIRCUIT ---
                  <g>
                    {/* Wires from AC to Bridge */}
                    <path d="M 75 125 L 120 125" fill="none" stroke="#334155" strokeWidth="3" />
                    
                    {/* Split AC to Top and Bottom of Bridge */}
                    <path d="M 120 125 L 120 75 L 200 75" fill="none" stroke={currentPath === 1 ? "#facc15" : "#334155"} strokeWidth="3" />
                    <path d="M 50 150 L 50 225 L 200 225" fill="none" stroke={currentPath === -1 ? "#facc15" : "#334155"} strokeWidth="3" />

                    {/* The Bridge Diamond Nodes: Top(200,75), Bottom(200,225), Left(150,150), Right(250,150) */}
                    {/* Actually, let's draw standard square rotated 45deg visually, or just straight lines. */}
                    {/* AC inputs at Left(150,150) and Bottom? Standard: AC to Left/Right, DC out Top/Bottom. Let's do AC Top/Bottom, DC Left/Right for horizontal layout */}
                    
                    {/* D1: Top AC (200,75) -> Right DC (280,150) */}
                    <path d="M 200 75 L 240 112.5" fill="none" stroke={currentPath === 1 ? "#facc15" : "#334155"} strokeWidth="3" />
                    <DiodeSymbol x="240" y="112.5" rotation="45" isOn={currentPath === 1} label="D1" />
                    <path d="M 240 112.5 L 280 150" fill="none" stroke={currentPath === 1 ? "#22c55e" : "#334155"} strokeWidth="3" />

                    {/* D2: Left DC (120,150) -> Top AC (200,75) */}
                    <path d="M 120 150 L 160 112.5" fill="none" stroke={currentPath === -1 ? "#facc15" : "#334155"} strokeWidth="3" />
                    <DiodeSymbol x="160" y="112.5" rotation="-45" isOn={currentPath === -1} label="D2" />
                    <path d="M 160 112.5 L 200 75" fill="none" stroke={currentPath === -1 ? "#facc15" : "#334155"} strokeWidth="3" />

                    {/* D3: Bottom AC (200,225) -> Right DC (280,150) */}
                    <path d="M 200 225 L 240 187.5" fill="none" stroke={currentPath === -1 ? "#facc15" : "#334155"} strokeWidth="3" />
                    <DiodeSymbol x="240" y="187.5" rotation="-45" isOn={currentPath === -1} label="D3" />
                    <path d="M 240 187.5 L 280 150" fill="none" stroke={currentPath === -1 ? "#22c55e" : "#334155"} strokeWidth="3" />

                    {/* D4: Left DC (120,150) -> Bottom AC (200,225) */}
                    <path d="M 120 150 L 160 187.5" fill="none" stroke={currentPath === 1 ? "#facc15" : "#334155"} strokeWidth="3" />
                    <DiodeSymbol x="160" y="187.5" rotation="45" isOn={currentPath === 1} label="D4" />
                    <path d="M 160 187.5 L 200 225" fill="none" stroke={currentPath === 1 ? "#facc15" : "#334155"} strokeWidth="3" />

                    {/* DC Positive Out (Right Node) */}
                    <path d="M 280 150 L 450 150" fill="none" stroke={currentPath !== 0 || capacitance > 0 ? "#22c55e" : "#334155"} strokeWidth="3" />

                    {/* DC Negative / Return (Left Node) -> Route under bridge */}
                    <path d="M 120 150 L 120 240 L 450 240" fill="none" stroke="#334155" strokeWidth="3" />

                    {/* Capacitor Branch */}
                    <path d="M 350 150 L 350 180" fill="none" stroke={currentPath !== 0 || capacitance > 0 ? "#22c55e" : "#334155"} strokeWidth="3" />
                    <CapacitorSymbol x="350" y="190" isOn={capacitance > 0} />
                    <path d="M 350 200 L 350 240" fill="none" stroke="#334155" strokeWidth="3" />

                    {/* Load Resistor Branch */}
                    <path d="M 450 150 L 450 165" fill="none" stroke={currentPath !== 0 || capacitance > 0 ? "#22c55e" : "#334155"} strokeWidth="3" />
                    <ResistorSymbol x="450" y="195" />
                    <path d="M 450 225 L 450 240" fill="none" stroke="#334155" strokeWidth="3" />
                  </g>
                )}
              </svg>
              
              <div className="absolute top-4 left-4 bg-slate-950/80 px-3 py-2 rounded-lg border border-slate-800 backdrop-blur-sm max-w-xs">
                <p className="text-xs text-slate-300">
                  {mode === 'half' 
                    ? "In a Half-Wave Rectifier, the single diode blocks the negative AC cycle, resulting in pulsing DC with large gaps." 
                    : "The Full-Wave Bridge uses 4 diodes. It ingeniously routes the negative AC cycle to flow in the positive direction through the load!"}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Educational Math Equations Section */}
        <div className="bg-indigo-950/30 rounded-2xl p-6 border border-indigo-500/20">
          <h3 className="text-lg font-semibold text-indigo-300 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            The Physics of Rectification
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-300">
            <div>
              <p className="mb-2"><strong className="text-white">Average DC Voltage (without capacitor):</strong></p>
              <ul className="list-disc pl-5 space-y-2">
                <li><span className="font-mono text-indigo-400">Half-Wave:</span> <span className="font-serif italic">V<sub>avg</sub> = V<sub>peak</sub> / π ≈ 0.318 × V<sub>peak</sub></span></li>
                <li><span className="font-mono text-indigo-400">Full-Wave:</span> <span className="font-serif italic">V<sub>avg</sub> = 2V<sub>peak</sub> / π ≈ 0.636 × V<sub>peak</sub></span></li>
              </ul>
            </div>
            <div>
              <p className="mb-2"><strong className="text-white">Ripple Voltage (with capacitor):</strong></p>
              <p className="font-serif italic text-yellow-400 mb-2">
                {mode === 'full'
                  ? <>V<sub>ripple</sub> ≈ V<sub>peak</sub> / (2f × R × C)</>
                  : <>V<sub>ripple</sub> ≈ V<sub>peak</sub> / (f × R × C)</>}
              </p>
              <p className="text-xs text-slate-400">
                The capacitor discharges once per cycle in a half-wave rectifier and twice per cycle in a full-wave rectifier, so the ripple frequency is f or 2f. Raising f, R or C leaves less time or less droop, and the output gets closer to a flat DC line.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}