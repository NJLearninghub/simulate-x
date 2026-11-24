import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Activity, ArrowRight } from 'lucide-react';

const SHMSimulation = () => {
  // System Toggle
  const [system, setSystem] = useState('spring'); // 'spring' or 'pendulum'

  // Physics States
  const [mass, setMass] = useState(2.0); // kg
  const [k, setK] = useState(20); // N/m (Spring Constant)
  const [length, setLength] = useState(2.0); // m (Pendulum Length)
  
  // Amplitudes
  const [springAmp, setSpringAmp] = useState(3.0); // meters
  const [pendulumAmp, setPendulumAmp] = useState(10); // degrees. NCERT uses the small-angle result.

  // Animation States
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Constants
  const g = 9.81;
  const GRAPH_WINDOW = 10; // View 10 seconds of data at a time

  // Physics Calculations
  const omega = system === 'spring' ? Math.sqrt(k / mass) : Math.sqrt(g / length);
  const period = (2 * Math.PI) / omega;
  
  const currentAmp = system === 'spring' ? springAmp : pendulumAmp * (Math.PI / 180);
  
  // Current values
  const displacement = currentAmp * Math.cos(omega * time);
  const velocity = -currentAmp * omega * Math.sin(omega * time);
  const acceleration = -currentAmp * omega * omega * Math.cos(omega * time);

  // Animation Loop
  const requestRef = useRef<any>(null);
  const previousTimeRef = useRef<any>(null);

  const animate = (t) => {
    if (previousTimeRef.current != undefined) {
      const deltaTime = (t - previousTimeRef.current) / 1000;
      setTime((prevTime) => prevTime + deltaTime);
    }
    previousTimeRef.current = t;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(requestRef.current);
      previousTimeRef.current = undefined;
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isPlaying, system, mass, k, length, springAmp, pendulumAmp]);

  // Handlers
  const handleReset = () => {
    setTime(0);
    setIsPlaying(false);
  };

  // Rendering Helpers
  const renderSpring = () => {
    const eqX = 250;
    const scale = 40; // pixels per meter
    const blockX = eqX + displacement * scale;
    const blockY = 120;
    const blockW = 60;
    
    // Generate zig-zag path for spring
    const coils = 12;
    const springStartX = 40;
    const springEndX = blockX - blockW/2;
    const dx = (springEndX - springStartX) / coils;
    
    let path = `M ${springStartX} ${blockY} `;
    for (let i = 0; i < coils; i++) {
      path += `L ${springStartX + dx * i + dx/2} ${blockY + (i%2===0 ? 15 : -15)} `;
    }
    path += `L ${springEndX} ${blockY}`;

    return (
      <svg className="w-full h-full" viewBox="0 0 500 240">
        {/* Background & Markings */}
        <line x1="40" y1="20" x2="40" y2="200" stroke="#475569" strokeWidth="6" />
        <line x1="20" y1="150" x2="480" y2="150" stroke="#94a3b8" strokeWidth="4" />
        <line x1="250" y1="160" x2="250" y2="200" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4" />
        <text x="250" y="215" textAnchor="middle" fill="#64748b" fontSize="14">Equilibrium (x=0)</text>

        {/* Spring */}
        <path d={path} fill="none" stroke="#64748b" strokeWidth="3" strokeLinejoin="round" />
        
        {/* Block */}
        <rect x={blockX - blockW/2} y={blockY - blockW/2} width={blockW} height={blockW} rx="8" fill="#3b82f6" />
        <text x={blockX} y={blockY + 5} textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">{mass}kg</text>

        {/* Vectors */}
        {/* Velocity */}
        <line x1={blockX} y1={blockY - 45} x2={blockX + velocity * 15} y2={blockY - 45} stroke="#22c55e" strokeWidth="4" markerEnd="url(#arrowhead-vel)" />
        {/* Acceleration */}
        <line x1={blockX} y1={blockY + 45} x2={blockX + acceleration * 5} y2={blockY + 45} stroke="#ef4444" strokeWidth="4" markerEnd="url(#arrowhead-acc)" />

        {/* Defs for arrowheads */}
        <defs>
          <marker id="arrowhead-vel" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
            <polygon points="0 0, 8 4, 0 8" fill="#22c55e" />
          </marker>
          <marker id="arrowhead-acc" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
            <polygon points="0 0, 8 4, 0 8" fill="#ef4444" />
          </marker>
        </defs>
      </svg>
    );
  };

  const renderPendulum = () => {
    const pivotX = 250;
    const pivotY = 20;
    const lengthScale = 60; // pixels per meter
    const stringL = length * lengthScale;
    
    // displacement here is angle in radians
    const bobX = pivotX + stringL * Math.sin(displacement);
    const bobY = pivotY + stringL * Math.cos(displacement);
    
    // Tangential vectors
    const vScale = 15;
    const aScale = 5;
    const vX = velocity * Math.cos(displacement) * vScale;
    const vY = -velocity * Math.sin(displacement) * vScale;
    
    const aX = acceleration * Math.cos(displacement) * aScale;
    const aY = -acceleration * Math.sin(displacement) * aScale;

    return (
      <svg className="w-full h-full" viewBox="0 0 500 240">
        {/* Ceiling */}
        <line x1="150" y1="20" x2="350" y2="20" stroke="#475569" strokeWidth="6" />
        
        {/* Equilibrium Line */}
        <line x1={pivotX} y1={pivotY} x2={pivotX} y2={220} stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4" />

        {/* String */}
        <line x1={pivotX} y1={pivotY} x2={bobX} y2={bobY} stroke="#94a3b8" strokeWidth="3" />
        
        {/* Bob */}
        <circle cx={bobX} cy={bobY} r="20" fill="#a855f7" />
        
        {/* Vectors */}
        <line x1={bobX} y1={bobY} x2={bobX + vX} y2={bobY + vY} stroke="#22c55e" strokeWidth="3" markerEnd="url(#arrowhead-vel)" />
        <line x1={bobX} y1={bobY} x2={bobX + aX} y2={bobY + aY} stroke="#ef4444" strokeWidth="3" markerEnd="url(#arrowhead-acc)" />
      </svg>
    );
  };

  const renderGraph = (type) => {
    const width = 600;
    const height = 80;
    const padding = 10;
    const viewTime = time % GRAPH_WINDOW;
    
    let maxVal, fn, color, label, unit, equation;
    
    if (type === 'disp') {
      maxVal = system === 'spring' ? springAmp : pendulumAmp;
      fn = (t) => (system === 'spring' ? springAmp : pendulumAmp) * Math.cos(omega * t);
      color = system === 'spring' ? '#3b82f6' : '#a855f7';
      label = system === 'spring' ? 'Displacement (x)' : 'Angle (θ)';
      unit = system === 'spring' ? 'm' : '°';
      equation = system === 'spring' ? 'x(t) = A cos(ωt)' : 'θ(t) = θ₀ cos(ωt)';
    } else if (type === 'vel') {
      maxVal = currentAmp * omega;
      if (system === 'pendulum') maxVal = maxVal * (180/Math.PI); // show in deg/s
      fn = (t) => {
        let v = -currentAmp * omega * Math.sin(omega * t);
        return system === 'pendulum' ? v * (180/Math.PI) : v;
      };
      color = '#22c55e';
      label = system === 'spring' ? 'Velocity (v)' : 'Angular velocity (θ̇)';
      unit = system === 'spring' ? 'm/s' : '°/s';
      equation = system === 'spring' ? 'v(t) = −Aω sin(ωt)' : 'θ̇(t) = −θ₀ ω sin(ωt)';
    } else {
      maxVal = currentAmp * omega * omega;
      if (system === 'pendulum') maxVal = maxVal * (180/Math.PI);
      fn = (t) => {
        let a = -currentAmp * omega * omega * Math.cos(omega * t);
        return system === 'pendulum' ? a * (180/Math.PI) : a;
      };
      color = '#ef4444';
      label = system === 'spring' ? 'Acceleration (a)' : 'Angular acceleration (θ̈)';
      unit = system === 'spring' ? 'm/s²' : '°/s²';
      equation = system === 'spring' ? 'a(t) = −Aω² cos(ωt)' : 'θ̈(t) = −θ₀ ω² cos(ωt)';
    }

    // Safety fallback for maxVal
    if (maxVal === 0) maxVal = 1;
    const yRange = maxVal * 1.2;

    // Generate Path from t=0 to t=GRAPH_WINDOW
    let path = '';
    const steps = 200;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * GRAPH_WINDOW;
      const val = fn(t);
      const x = (t / GRAPH_WINDOW) * width;
      const y = height/2 - (val / yRange) * (height/2 - padding);
      if (i === 0) path += `M ${x} ${y} `;
      else path += `L ${x} ${y} `;
    }

    const scrubberX = (viewTime / GRAPH_WINDOW) * width;
    const currentVal = fn(time);

    return (
      <div className="mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
        <div className="flex justify-between items-center mb-1 px-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700 uppercase">{label}</span>
            <span className="text-xs font-mono text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded">
              {equation}
            </span>
          </div>
          <span className="text-xs font-mono font-semibold" style={{color: color}}>
            {currentVal.toFixed(2)} {unit}
          </span>
        </div>
        <svg className="w-full h-20 bg-white rounded border border-slate-100" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          {/* Zero Axis */}
          <line x1="0" y1={height/2} x2={width} y2={height/2} stroke="#e2e8f0" strokeWidth="2" strokeDasharray="4" />
          
          {/* Waveform */}
          <path d={path} fill="none" stroke={color} strokeWidth="3" opacity="0.8" />
          
          {/* Scrubber (Current Time Line) */}
          <line x1={scrubberX} y1="0" x2={scrubberX} y2={height} stroke="#334155" strokeWidth="2" />
          <circle cx={scrubberX} cy={height/2 - (currentVal / yRange) * (height/2 - padding)} r="4" fill="#334155" />
        </svg>
      </div>
    );
  };

  return (
    <div className="min-h-[36rem] bg-slate-100 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Activity className="text-indigo-600" />
              Simple Harmonic Motion
            </h1>
            <p className="text-sm text-slate-500 mt-1">Interactive physics simulator for oscillators.</p>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button 
              onClick={() => { setSystem('spring'); handleReset(); }}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${system === 'spring' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Spring-Mass
            </button>
            <button 
              onClick={() => { setSystem('pendulum'); handleReset(); }}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${system === 'pendulum' ? 'bg-white shadow text-purple-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Simple Pendulum
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Control Panel (Left) */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-6">
            <h2 className="text-lg font-bold text-slate-800 border-b pb-2">Environment Controls</h2>
            
            <div className="space-y-5 flex-grow">
              {/* Mass Slider (Common) */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <label className="font-semibold text-slate-700">Mass ($m$)</label>
                  <span className="text-slate-500 font-mono">{mass.toFixed(1)} kg</span>
                </div>
                <input 
                  type="range" min="0.5" max="10" step="0.5" value={mass} 
                  onChange={(e) => setMass(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              {/* System Specific Sliders */}
              {system === 'spring' ? (
                <>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <label className="font-semibold text-slate-700">Spring Constant ($k$)</label>
                      <span className="text-slate-500 font-mono">{k.toFixed(1)} N/m</span>
                    </div>
                    <input 
                      type="range" min="5" max="100" step="1" value={k} 
                      onChange={(e) => setK(parseFloat(e.target.value))}
                      className="w-full accent-blue-600"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <label className="font-semibold text-slate-700">Initial Pull ($A$)</label>
                      <span className="text-slate-500 font-mono">{springAmp.toFixed(1)} m</span>
                    </div>
                    <input 
                      type="range" min="0.5" max="5" step="0.5" value={springAmp} 
                      onChange={(e) => setSpringAmp(parseFloat(e.target.value))}
                      className="w-full accent-blue-600"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <label className="font-semibold text-slate-700">String Length ($L$)</label>
                      <span className="text-slate-500 font-mono">{length.toFixed(1)} m</span>
                    </div>
                    <input 
                      type="range" min="0.5" max="5" step="0.1" value={length} 
                      onChange={(e) => setLength(parseFloat(e.target.value))}
                      className="w-full accent-purple-600"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <label className="font-semibold text-slate-700">Initial Angle ($\theta_0$)</label>
                      <span className="text-slate-500 font-mono">{pendulumAmp.toFixed(0)}°</span>
                    </div>
                    <input 
                      type="range" min="5" max="15" step="1" value={Math.min(pendulumAmp, 15)} 
                      onChange={(e) => setPendulumAmp(parseFloat(e.target.value))}
                      className="w-full accent-purple-600"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      The period is the NCERT small-angle result T = 2π √(L/g), which uses sin θ ≈ θ. The slider stops at 15°.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Readouts */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-slate-500 uppercase font-bold">Angular Freq (ω)</span>
                <span className="font-mono text-sm font-semibold">{omega.toFixed(2)} rad/s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500 uppercase font-bold">Period (T)</span>
                <span className="font-mono text-sm font-semibold">{period.toFixed(2)} s</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-white transition-transform active:scale-95 ${isPlaying ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
              >
                {isPlaying ? <><Pause size={20}/> Pause</> : <><Play size={20}/> Play</>}
              </button>
              <button 
                onClick={handleReset}
                className="px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold transition-transform active:scale-95"
              >
                <RotateCcw size={20} />
              </button>
            </div>
          </div>

          {/* Visualization (Right side - 2 columns wide) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Physical Canvas */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
              <div className="absolute top-4 left-4 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-500 border border-slate-200 z-10 shadow-sm flex items-center gap-2">
                Live Physical View
                <span className="flex items-center gap-1 text-green-600"><ArrowRight size={12}/> Vel</span>
                <span className="flex items-center gap-1 text-red-500"><ArrowRight size={12}/> Acc</span>
              </div>
              <div className="h-64 w-full bg-slate-50 flex items-center justify-center">
                {system === 'spring' ? renderSpring() : renderPendulum()}
              </div>
            </div>

            {/* Synchronized Graphs */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-slate-800">Synchronized Kinematics</h2>
                <div className="text-xs font-mono bg-slate-100 px-3 py-1 rounded-full text-slate-600 border border-slate-200">
                  t = {time.toFixed(2)}s
                </div>
              </div>
              
              <div className="space-y-2">
                {renderGraph('disp')}
                {renderGraph('vel')}
                {renderGraph('acc')}
              </div>
              <p className="text-xs text-center text-slate-400 mt-2">
                The vertical scrubber indicates the current time. Notice the phase shift between the curves!
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SHMSimulation;