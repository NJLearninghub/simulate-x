import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Zap, Activity } from 'lucide-react';

export default function App() {
  // --- STATE ---
  const [voltage, setVoltage] = useState(12);
  const [resistance, setResistance] = useState(20);
  const [capacitance, setCapacitance] = useState(5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);

  // Derived state for the UI
  const tau = resistance * capacitance; // Time constant
  const maxCurrent = voltage / resistance;
  const maxCharge = voltage * capacitance;
  
  // Current values
  const currentC = isPlaying || time > 0 ? maxCurrent * Math.exp(-time / tau) : 0;
  const currentD = currentC; // Displacement current equals conduction current
  const charge = isPlaying || time > 0 ? maxCharge * (1 - Math.exp(-time / tau)) : 0;

  // Normalized visual intensities (0 to 1)
  const iIntensity = currentC / (maxCurrent || 1);
  const eIntensity = charge / (maxCharge || 1);

  // --- ANIMATION LOOP ---
  const requestRef = useRef<any>(null);
  const lastTimeRef = useRef<any>(null);

  const animate = (timestamp) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const deltaTime = timestamp - lastTimeRef.current;
    
    setTime((prevTime) => {
      // 0.05 scale provides a good visual pace for the charging animation
      const newTime = prevTime + deltaTime * 0.05;
      
      // Stop automatically if fully charged (99.9%)
      if (newTime > tau * 7) {
        setIsPlaying(false);
        return tau * 7;
      }

      return newTime;
    });

    lastTimeRef.current = timestamp;
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      lastTimeRef.current = undefined;
      cancelAnimationFrame(requestRef.current);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isPlaying, tau, maxCurrent, maxCharge]);

  const handleReset = () => {
    setIsPlaying(false);
    setTime(0);
    lastTimeRef.current = undefined;
  };

  // --- MATHEMATICAL SVG DRAWING ---
  // Calculates the exact waveform path mathematically up to the current 'time'
  const getGraphPath = (dataKey, scaleY, height) => {
    if (time === 0) return "";
    const width = 600;
    const maxT = tau * 7 || 1;
    const scaleX = width / maxT; 
    
    const path = [];
    const numPoints = 150; 
    
    for (let i = 0; i <= numPoints; i++) {
      const t = (i / numPoints) * maxT;
      
      // If this mathematical step exceeds our current time, cap it and break
      if (t > time) {
         const finalX = time * scaleX;
         let finalYVal = 0;
         if (dataKey === 'q') finalYVal = maxCharge * (1 - Math.exp(-time / tau));
         if (dataKey === 'ic') finalYVal = maxCurrent * Math.exp(-time / tau);
         const finalY = height - (finalYVal * scaleY);
         path.push(`L ${finalX} ${finalY}`);
         break;
      }
      
      const x = t * scaleX;
      let yVal = 0;
      if (dataKey === 'q') yVal = maxCharge * (1 - Math.exp(-t / tau));
      if (dataKey === 'ic') yVal = maxCurrent * Math.exp(-t / tau);
      
      const y = height - (yVal * scaleY);
      path.push(`${i === 0 ? 'M' : 'L'} ${x} ${y}`);
    }
    return path.join(" ");
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden">
      
      {/* LEFT SIDEBAR: Controls & Theory */}
      <div className="w-full md:w-1/3 lg:w-1/4 bg-slate-800 border-r border-slate-700 p-6 flex flex-col shadow-2xl z-10 overflow-y-auto">
        <div className="flex items-center gap-3 mb-6">
          <Zap className="text-yellow-400 w-8 h-8" />
          <h1 className="text-2xl font-bold tracking-tight text-white">Displacement Current</h1>
        </div>

        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          Explore the charging of a capacitor. Notice how Ampere's Law fails in the gap, and how Maxwell's <span className="text-purple-400 font-semibold">Displacement Current (I<sub>d</sub>)</span> solves the paradox.
        </p>

        {/* Controls */}
        <div className="space-y-6 mb-8 bg-slate-900 p-5 rounded-xl border border-slate-700">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <label className="font-semibold text-slate-300">Battery Voltage (V)</label>
              <span className="text-yellow-400 font-mono">{voltage} V</span>
            </div>
            <input type="range" min="5" max="24" value={voltage} onChange={(e) => setVoltage(Number(e.target.value))} disabled={isPlaying || time > 0} className="w-full accent-yellow-400" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <label className="font-semibold text-slate-300">Resistance (R)</label>
              <span className="text-blue-400 font-mono">{resistance} Ω</span>
            </div>
            <input type="range" min="10" max="50" value={resistance} onChange={(e) => setResistance(Number(e.target.value))} disabled={isPlaying || time > 0} className="w-full accent-blue-400" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <label className="font-semibold text-slate-300">Capacitance (C)</label>
              <span className="text-emerald-400 font-mono">{capacitance} F</span>
            </div>
            <input type="range" min="1" max="10" value={capacitance} onChange={(e) => setCapacitance(Number(e.target.value))} disabled={isPlaying || time > 0} className="w-full accent-emerald-400" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-8">
          <button 
            onClick={() => setIsPlaying(!isPlaying)} 
            className={`flex-1 py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${isPlaying ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-emerald-500 text-slate-900 hover:bg-emerald-400'}`}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            {isPlaying ? 'PAUSE' : time > 0 ? 'RESUME' : 'START CHARGING'}
          </button>
          <button 
            onClick={handleReset} 
            className="py-3 px-4 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-all"
            title="Reset Circuit"
          >
            <RotateCcw size={20} />
          </button>
        </div>

        {/* Live Math Dashboard */}
        <div className="mt-auto bg-slate-900 p-5 rounded-xl border border-slate-700">
          <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider flex items-center gap-2">
            <Activity size={16} /> Live Telemetry
          </h3>
          <div className="space-y-3 font-mono text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Time (t)</span>
              <span className="text-white">{time.toFixed(2)} s</span>
            </div>
            <div className="w-full h-px bg-slate-700/50"></div>
            <div className="flex justify-between items-center">
              <span className="text-blue-400 font-bold flex items-center gap-1">I<sub>c</sub> (Wire)</span>
              <span className="text-blue-400">{currentC.toFixed(2)} A</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-400 font-bold flex items-center gap-1">I<sub>d</sub> (Gap)</span>
              <span className="text-purple-400">{currentD.toFixed(2)} A</span>
            </div>
            <div className="w-full h-px bg-slate-700/50"></div>
            <div className="flex justify-between items-center">
              <span className="text-emerald-400">Charge (Q)</span>
              <span className="text-emerald-400">{charge.toFixed(1)} C</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT MAIN AREA: Canvas & Graphs */}
      <div className="flex-1 flex flex-col bg-slate-950 relative">
        
        {/* Top Floating Theory Bar */}
        <div className="absolute top-6 left-6 right-6 flex justify-between gap-4 z-10 pointer-events-none">
          <div className="bg-slate-800/90 backdrop-blur border border-slate-700 p-4 rounded-xl shadow-lg pointer-events-auto">
             <div className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Maxwell's Correction</div>
             <div className="font-mono text-sm text-white">
                ∮ <span className="text-green-400 font-bold">B</span>·dl = μ<sub>0</sub>( <span className="text-blue-400 font-bold">I<sub>c</sub></span> + <span className="text-purple-400 font-bold">I<sub>d</sub></span> )
             </div>
          </div>
          <div className="bg-slate-800/90 backdrop-blur border border-slate-700 p-4 rounded-xl shadow-lg pointer-events-auto text-right">
             <div className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Displacement Current</div>
             <div className="font-mono text-sm text-purple-400 font-bold">
                I<sub>d</sub> = ε<sub>0</sub> ( d<span className="text-red-400 font-bold">Φ<sub>E</sub></span> / dt )
             </div>
          </div>
        </div>

        {/* MAIN VISUAL CANVAS (Circuit) */}
        <div className="flex-1 relative w-full h-full flex items-center justify-center p-8">
          <svg viewBox="0 0 800 400" className="w-full h-full max-h-[500px] overflow-visible drop-shadow-2xl">
            {/* Defs for gradients & markers */}
            <defs>
              <linearGradient id="wireGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="100%" stopColor="#475569" />
              </linearGradient>
              <marker id="arrowIc" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#60A5FA" />
              </marker>
              <marker id="arrowE" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#F87171" />
              </marker>
            </defs>

            {/* --- STATIC CIRCUIT WIRES --- */}
            <path d="M 400 350 L 150 350 L 150 150 L 300 150" fill="none" stroke="#475569" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 500 150 L 650 150 L 650 350 L 400 350" fill="none" stroke="#475569" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            
            {/* Battery */}
            <g transform="translate(400, 350)">
              <rect x="-30" y="-15" width="60" height="30" fill="#1E293B" stroke="#FBBF24" strokeWidth="3" rx="4" />
              <line x1="-10" y1="-25" x2="-10" y2="25" stroke="#FBBF24" strokeWidth="4" />
              <line x1="10" y1="-15" x2="10" y2="15" stroke="#FBBF24" strokeWidth="4" />
              <text x="-25" y="-30" fill="#FBBF24" fontSize="16" fontWeight="bold">+</text>
              <text x="15" y="-30" fill="#FBBF24" fontSize="16" fontWeight="bold">-</text>
              <text x="0" y="5" fill="#FBBF24" fontSize="14" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">{voltage}V</text>
            </g>

            {/* Resistor */}
            <g transform="translate(150, 250)">
              <path d="M 0 -40 L -15 -30 L 15 -10 L -15 10 L 15 30 L 0 40" fill="none" stroke="#60A5FA" strokeWidth="4" strokeLinejoin="miter" />
              <text x="-30" y="0" fill="#60A5FA" fontSize="16" fontWeight="bold" textAnchor="end" dominantBaseline="middle">{resistance}Ω</text>
            </g>

            {/* --- CAPACITOR PLATES --- */}
            {/* Left Plate (Positive) */}
            <line x1="300" y1="50" x2="300" y2="250" stroke="#94A3B8" strokeWidth="12" strokeLinecap="round" />
            {/* Right Plate (Negative) */}
            <line x1="500" y1="50" x2="500" y2="250" stroke="#94A3B8" strokeWidth="12" strokeLinecap="round" />
            <text x="400" y="30" fill="#34D399" fontSize="18" fontWeight="bold" textAnchor="middle">{capacitance}F</text>

            {/* --- DYNAMIC VISUALS --- */}
            
            {/* 1. Conduction Current (Ic) Indicators */}
            <g style={{ opacity: iIntensity * 2 + 0.1 }}>
              {/* Arrow on left wire */}
              <line x1="200" y1="150" x2="250" y2="150" stroke="#60A5FA" strokeWidth="4" markerEnd="url(#arrowIc)" />
              <text x="225" y="130" fill="#60A5FA" fontSize="16" fontWeight="bold" textAnchor="middle">I c</text>
              {/* Arrow on right wire */}
              <line x1="550" y1="150" x2="600" y2="150" stroke="#60A5FA" strokeWidth="4" markerEnd="url(#arrowIc)" />
              <text x="575" y="130" fill="#60A5FA" fontSize="16" fontWeight="bold" textAnchor="middle">I c</text>
            </g>

            {/* 2. Charge Accumulation (+ and -) */}
            <g style={{ opacity: eIntensity }}>
              {/* Plus signs on Left Plate */}
              {[70, 110, 150, 190, 230].map(y => (
                <text key={`plus-${y}`} x="280" y={y} fill="#F87171" fontSize="24" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">+</text>
              ))}
              {/* Minus signs on Right Plate */}
              {[70, 110, 150, 190, 230].map(y => (
                <text key={`minus-${y}`} x="520" y={y} fill="#60A5FA" fontSize="24" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">-</text>
              ))}
            </g>

            {/* 3. Electric Field (E) lines in the gap */}
            <g style={{ opacity: eIntensity }}>
              {[80, 115, 150, 185, 220].map(y => (
                <line key={`E-${y}`} x1="315" y1={y} x2="485" y2={y} stroke="#F87171" strokeWidth="3" markerEnd="url(#arrowE)" strokeDasharray="6,4" />
              ))}
              <text x="400" y="240" fill="#F87171" fontSize="18" fontWeight="bold" textAnchor="middle">Electric Field (E)</text>
            </g>

            {/* 4. Displacement Current (Id) Visual */}
            <g style={{ opacity: iIntensity * 2 + 0.1 }}>
               <text x="400" y="150" fill="#C084FC" fontSize="24" fontWeight="bold" textAnchor="middle" className="drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]">I d</text>
            </g>

            {/* 5. Magnetic Field (B) Loops */}
            <g style={{ opacity: iIntensity * 2 + 0.1 }}>
              {/* B-field around Wire (Ic) */}
              <ellipse cx="225" cy="150" rx="15" ry="40" fill="none" stroke="#4ADE80" strokeWidth="3" strokeDasharray="5,5" />
              <text x="225" y="210" fill="#4ADE80" fontSize="14" fontWeight="bold" textAnchor="middle">B Field (from Ic)</text>

              {/* B-field in Gap (Id) */}
              <ellipse cx="400" cy="150" rx="15" ry="60" fill="none" stroke="#4ADE80" strokeWidth="3" strokeDasharray="5,5" />
              <text x="400" y="230" fill="#4ADE80" fontSize="14" fontWeight="bold" textAnchor="middle">B Field (from Id)</text>
            </g>

            {/* Ammeters / Ampere's Loops */}
            <circle cx="225" cy="150" r="45" fill="none" stroke="#FDE047" strokeWidth="2" strokeDasharray="8,4" opacity="0.4" />
            <circle cx="400" cy="150" r="65" fill="none" stroke="#FDE047" strokeWidth="2" strokeDasharray="8,4" opacity="0.4" />
            
          </svg>
        </div>

        {/* BOTTOM DASHBOARD: Synchronized Graphs */}
        <div className="h-64 border-t border-slate-800 bg-slate-900/50 flex flex-col p-4 relative z-10">
          <div className="flex justify-between items-center px-4 mb-2">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Synchronized Waveforms</h3>
            <div className="flex gap-6 text-xs font-bold items-center">
               <span className="text-purple-400 flex items-center gap-1">
                 <span className="w-4 h-1 bg-purple-400 rounded-full inline-block"></span> I<sub>d</sub> (Displacement)
               </span>
               <span className="text-blue-400 flex items-center gap-1">
                 <span className="w-4 h-1 bg-transparent border-t-2 border-dashed border-blue-400 inline-block"></span> I<sub>c</sub> (Conduction)
               </span>
               <span className="text-red-400 flex items-center gap-1">
                 <span className="w-4 h-1 bg-transparent border-t-2 border-dotted border-red-400 inline-block"></span> Φ<sub>E</sub> (E-Flux)
               </span>
            </div>
          </div>
          
          <div className="flex-1 relative w-full flex items-end overflow-hidden px-4">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between opacity-10 pointer-events-none px-4 pb-4">
               {[1,2,3,4].map(i => <div key={i} className="w-full h-px bg-white"></div>)}
            </div>
            
            <svg viewBox="0 0 600 150" preserveAspectRatio="none" className="w-full h-full overflow-visible">
               {/* E-Flux (Charge equivalent) Graph */}
               <path 
                 d={getGraphPath('q', 150 / (maxCharge || 1), 150)} 
                 fill="none" stroke="#F87171" strokeWidth="2" strokeDasharray="4,4" opacity="0.7"
               />
               
               {/* Displacement Current Graph (Solid Purple line underneath) */}
               <path 
                 d={getGraphPath('ic', 150 / (maxCurrent || 1), 150)} 
                 fill="none" stroke="#C084FC" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
               />

               {/* Conduction Current Graph (Dashed Blue line on top - proves they are identical!) */}
               <path 
                 d={getGraphPath('ic', 150 / (maxCurrent || 1), 150)} 
                 fill="none" stroke="#60A5FA" strokeWidth="4" strokeDasharray="8,8" strokeLinecap="round" strokeLinejoin="round"
               />
               
               {/* Current Time Scrubber */}
               {time > 0 && (
                 <line 
                   x1={Math.min((time / (tau * 7)) * 600, 600)} y1="0" 
                   x2={Math.min((time / (tau * 7)) * 600, 600)} y2="150" 
                   stroke="#FDE047" strokeWidth="1" strokeDasharray="2,2" 
                 />
               )}
            </svg>

            {/* X-Axis Label */}
            <div className="absolute bottom-0 left-4 text-xs text-slate-500 font-mono">0s</div>
            <div className="absolute bottom-0 right-4 text-xs text-slate-500 font-mono">{(tau * 7).toFixed(1)}s (Fully Charged)</div>
          </div>
        </div>

      </div>
    </div>
  );
}