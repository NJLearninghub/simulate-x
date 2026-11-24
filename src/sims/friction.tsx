import React, { useState, useEffect, useRef } from 'react';
import { Settings2, RotateCcw, Activity, ArrowRight, TrendingUp } from 'lucide-react';

export default function App() {
  // Physics Constants (Moved up so state can use them)
  const g = 9.81; // Gravity (m/s^2)
  const rampLength = 360; // Pixels
  const blockWidth = 60;
  const blockHeight = 40;
  // The block can travel 2.5 m down the face of the incline (pixel length minus the block).
  const travelM = 2.5;
  const travelPx = rampLength - blockWidth;
  const pxPerM = travelPx / travelM;

  // Physics Parameters State
  const [angle, setAngle] = useState(20);
  const [mass, setMass] = useState(10); // kg
  const [muS, setMuS] = useState(0.60); // Static friction coefficient
  const [muK, setMuK] = useState(0.40); // Kinetic friction coefficient

  // Simulation State (Start at the top of the ramp)
  const [blockPos, setBlockPos] = useState(rampLength - blockWidth);
  const [velocity, setVelocity] = useState(0); // m/s down the plane
  const [isSliding, setIsSliding] = useState(false);
  const [atBottom, setAtBottom] = useState(false);
  const [fActual, setFActual] = useState(0); // For rendering the active friction vector

  // Refs for requestAnimationFrame Loop. sRef is metres travelled down from the top.
  const sRef = useRef(0);
  const velRef = useRef(0);
  const animationRef = useRef(null);

  // Derived Physics Calculations
  const theta = (angle * Math.PI) / 180;
  const fGravity = mass * g;
  const fParallel = fGravity * Math.sin(theta);
  const fNormal = fGravity * Math.cos(theta);
  const fStaticMax = muS * fNormal;
  const fKinetic = muK * fNormal;
  const criticalAngleDeg = Math.atan(muS) * (180 / Math.PI);

  // Safety handler for friction inputs
  const handleMuSChange = (val) => {
    setMuS(val);
    if (val < muK) setMuK(val);
  };
  const handleMuKChange = (val) => {
    setMuK(val);
    if (val > muS) setMuS(val);
  };

  // Main Physics Engine Loop
  useEffect(() => {
    let lastTime = performance.now();

    const gameLoop = (time) => {
      // Delta time capped at 0.1s to prevent massive jumps if tab is inactive
      const dt = Math.min((time - lastTime) / 1000, 0.1); 
      lastTime = time;

      let currentIsSliding = velRef.current > 0.001;
      let currentFActual = fParallel;
      let reachedBottom = sRef.current >= travelM - 1e-4;

      if (reachedBottom) {
        sRef.current = travelM;
        velRef.current = 0;
        currentIsSliding = false;
        currentFActual = 0;
      } else if (!currentIsSliding) {
        if (fParallel > fStaticMax + 1e-6) {
          currentIsSliding = true;
          currentFActual = fKinetic;
        } else {
          currentFActual = fParallel;
        }
      } else {
        currentFActual = fKinetic;
      }

      // a = g (sin θ − μk cos θ), down the plane, only while kinetic friction acts.
      if (currentIsSliding) {
        const acceleration = (fParallel - fKinetic) / mass;
        velRef.current += acceleration * dt;
        if (velRef.current <= 0) {
          velRef.current = 0;
          currentIsSliding = false;
          currentFActual = fParallel <= fStaticMax ? fParallel : fKinetic;
        }
        sRef.current += velRef.current * dt;
        if (sRef.current >= travelM) {
          sRef.current = travelM;
          velRef.current = 0;
          currentIsSliding = false;
          currentFActual = 0;
          reachedBottom = true;
        }
      }

      setBlockPos(travelPx - sRef.current * pxPerM);
      setVelocity(velRef.current);
      setIsSliding(currentIsSliding);
      setAtBottom(reachedBottom);
      setFActual(currentFActual);

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationRef.current);
  }, [fParallel, fStaticMax, fKinetic, mass]);

  // Reset function
  const handleReset = () => {
    sRef.current = 0;
    velRef.current = 0;
    setBlockPos(travelPx);
    setVelocity(0);
    setIsSliding(false);
    setAtBottom(false);
  };

  const vec = (force: number) => (force / (mass * g)) * 78;

  // --- Graph Generation Logic ---
  const graphWidth = 350;
  const graphHeight = 160;
  const maxForceGraph = 20 * g * 1.1; // Max possible mass * g with headroom

  const getGraphX = (ang) => (ang / 90) * graphWidth;
  const getGraphY = (force) => graphHeight - (force / maxForceGraph) * graphHeight;

  let appliedPath = "";
  let staticMaxPath = "";
  let kineticPath = "";
  let actualPath = "";

  for (let a = 0; a <= 90; a += 2) {
    const t = (a * Math.PI) / 180;
    const fa = mass * g * Math.sin(t);
    const fsm = muS * mass * g * Math.cos(t);
    const fk = muK * mass * g * Math.cos(t);
    const act = fa <= fsm ? fa : fk;

    const x = getGraphX(a);
    appliedPath += `${a === 0 ? 'M' : 'L'} ${x} ${getGraphY(fa)} `;
    staticMaxPath += `${a === 0 ? 'M' : 'L'} ${x} ${getGraphY(fsm)} `;
    kineticPath += `${a === 0 ? 'M' : 'L'} ${x} ${getGraphY(fk)} `;
    actualPath += `${a === 0 ? 'M' : 'L'} ${x} ${getGraphY(act)} `;
  }

  return (
    <div className="min-h-[36rem] bg-slate-900 text-slate-100 font-sans p-4 md:p-6 flex flex-col">
      <header className="mb-6 flex items-center justify-between border-b border-slate-700 pb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="text-blue-400" />
            Friction on an Inclined Plane
          </h1>
          <p className="text-slate-400 text-sm mt-1">Interactive simulation of forces on an inclined plane.</p>
        </div>
        <button 
          onClick={handleReset}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors border border-slate-600"
        >
          <RotateCcw size={16} /> Reset Block
        </button>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 flex-1">
        {/* --- Main Simulation Canvas --- */}
        <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden relative min-h-[400px] flex items-center justify-center">
          
          {/* Status Indicator Overlay */}
          <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur border border-slate-700 p-3 rounded-lg shadow-lg">
            <div className="text-xs uppercase tracking-wider text-slate-400 mb-1">State</div>
            <div className={`text-xl font-bold flex items-center gap-2 ${isSliding ? 'text-emerald-400' : 'text-amber-400'}`}>
              <div className={`w-3 h-3 rounded-full ${isSliding ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></div>
              {atBottom ? 'AT THE BOTTOM' : isSliding ? 'SLIDING (Kinetic)' : 'STATIC (Locked)'}
            </div>
            {isSliding && (
              <div className="text-sm text-slate-300 mt-2 font-mono">
                v = {velocity.toFixed(2)} m/s down the plane
              </div>
            )}
          </div>

          <svg viewBox="0 0 600 450" className="w-full h-full max-w-2xl mx-auto drop-shadow-2xl">
            <defs>
              {/* Arrowhead Markers for Vectors */}
              <marker id="arrow-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
              </marker>
              <marker id="arrow-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
              </marker>
              <marker id="arrow-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
              </marker>
              <marker id="arrow-orange" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
              </marker>
            </defs>

            {/* Pivot Point at X=100, Y=350 */}
            <g transform={`translate(100, 350)`}>
              
              {/* The "Frame Rotation Trick" - Entire ramp coordinate system is rotated */}
              <g transform={`rotate(${-angle})`}>
                
                {/* The Ramp */}
                <rect x="0" y="0" width={rampLength} height="12" fill="#475569" rx="4" />
                <rect x="0" y="0" width={rampLength} height="4" fill="#94a3b8" rx="2" /> {/* highlight */}
                
                {/* The Block */}
                <g transform={`translate(${blockPos}, ${-blockHeight})`}>
                  <rect x="0" y="0" width={blockWidth} height={blockHeight} fill="#8b5cf6" rx="4" className="drop-shadow-md" />
                  
                  {/* --- Vectors Rendered in Local Coordinates --- */}
                  
                  {/* Center of the block for vector origins */}
                  <g transform={`translate(${blockWidth/2}, ${blockHeight/2})`}>
                    
                    {/* Normal Force (Straight Up locally) */}
                    <line x1="0" y1="0" x2="0" y2={-vec(fNormal)} stroke="#10b981" strokeWidth="3" markerEnd="url(#arrow-green)" />
                    
                    {/* Friction acts up the plane, opposing the tendency to slide down. */}
                    <line x1="0" y1={blockHeight/2} x2={vec(fActual)} y2={blockHeight/2} stroke="#ef4444" strokeWidth="4" markerEnd="url(#arrow-red)" />
                    
                    {/* Component of weight down the plane. */}
                    <line x1="0" y1="0" x2={-vec(fParallel)} y2="0" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 2" markerEnd="url(#arrow-orange)" />

                    {/* True weight, counter-rotated so it points straight down. Length is mg, scaled to one weight. */}
                    <g transform={`rotate(${angle})`}>
                      <line x1="0" y1="0" x2="0" y2={vec(fGravity)} stroke="#3b82f6" strokeWidth="3" markerEnd="url(#arrow-blue)" />
                    </g>
                  </g>
                </g>
              </g>

              {/* Angle Arc Indicator */}
              <path 
                d={`M 60 0 A 60 60 0 0 0 ${60 * Math.cos(-theta)} ${60 * Math.sin(-theta)}`} 
                fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="4 4" 
              />
              <text x="75" y="-20" fill="#94a3b8" fontSize="14" fontFamily="sans-serif">θ</text>
              
              {/* Ground Line */}
              <line x1="-50" y1="6" x2="400" y2="6" stroke="#334155" strokeWidth="4" />
              <circle cx="0" cy="6" r="6" fill="#cbd5e1" />
            </g>
          </svg>
        </div>

        {/* --- Side Panel: Controls & Live Graph --- */}
        <div className="w-full lg:w-96 flex flex-col gap-6">
          
          {/* Controls Panel */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 shadow-lg">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Settings2 size={18} className="text-blue-400" />
              System Parameters
            </h2>

            <div className="space-y-5">
              {/* Angle Slider */}
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm font-medium text-slate-300">Ramp Angle (θ)</label>
                  <span className="text-sm font-mono text-blue-400">{angle}°</span>
                </div>
                <input 
                  type="range" min="0" max="90" step="1" 
                  value={angle} onChange={(e) => setAngle(parseFloat(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              {/* Mass Slider */}
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm font-medium text-slate-300">Block Mass (m)</label>
                  <span className="text-sm font-mono text-purple-400">{mass} kg</span>
                </div>
                <input 
                  type="range" min="1" max="20" step="1" 
                  value={mass} onChange={(e) => setMass(parseFloat(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>

              {/* Static Friction Slider */}
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm font-medium text-slate-300">Static Friction (μ_s)</label>
                  <span className="text-sm font-mono text-red-400">{muS.toFixed(2)}</span>
                </div>
                <input 
                  type="range" min="0" max="1" step="0.01" 
                  value={muS} onChange={(e) => handleMuSChange(parseFloat(e.target.value))}
                  className="w-full accent-red-500"
                />
              </div>

              {/* Kinetic Friction Slider */}
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm font-medium text-slate-300">Kinetic Friction (μ_k)</label>
                  <span className="text-sm font-mono text-red-400">{muK.toFixed(2)}</span>
                </div>
                <input 
                  type="range" min="0" max="1" step="0.01" 
                  value={muK} onChange={(e) => handleMuKChange(parseFloat(e.target.value))}
                  className="w-full accent-red-500"
                />
              </div>
            </div>

            {/* Realtime Outputs Box */}
            <div className="mt-6 bg-slate-900 rounded-lg p-3 border border-slate-700">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-slate-400">Critical Angle:</div>
                <div className="text-right font-mono font-bold text-slate-200">{criticalAngleDeg.toFixed(1)}°</div>
                
                <div className="text-slate-400">Parallel Force:</div>
                <div className="text-right font-mono text-orange-400">{fParallel.toFixed(1)} N</div>
                
                <div className="text-slate-400">Max Static Fr.:</div>
                <div className="text-right font-mono text-red-400">{fStaticMax.toFixed(1)} N</div>
              </div>
            </div>
          </div>

          {/* Force Graph Panel */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5 shadow-lg flex-1">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-emerald-400" />
              Force vs. Angle Graph
            </h2>
            
            <div className="relative w-full h-[180px] bg-slate-900 rounded border border-slate-700 p-2">
              <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} className="w-full h-full overflow-visible">
                {/* Gridlines */}
                <line x1="0" y1={graphHeight} x2={graphWidth} y2={graphHeight} stroke="#475569" />
                <line x1="0" y1="0" x2="0" y2={graphHeight} stroke="#475569" />

                {/* Graph Paths */}
                <path d={appliedPath} fill="none" stroke="#f59e0b" strokeWidth="2" opacity="0.6" strokeDasharray="4 4" />
                <path d={staticMaxPath} fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
                <path d={kineticPath} fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
                
                {/* The Core Friction Profile Curve */}
                <path d={actualPath} fill="none" stroke="#ef4444" strokeWidth="3" />

                {/* Current Angle Indicator (Vertical Line) */}
                <g transform={`translate(${getGraphX(angle)}, 0)`}>
                  <line x1="0" y1="0" x2="0" y2={graphHeight} stroke="#3b82f6" strokeWidth="2" />
                  <circle cx="0" cy={getGraphY(fActual)} r="4" fill="#3b82f6" />
                </g>
              </svg>

              {/* Graph Legend */}
              <div className="absolute top-2 left-4 text-[10px] space-y-1 bg-slate-900/80 p-1 rounded">
                <div className="flex items-center gap-1"><div className="w-3 h-1 bg-red-500"></div> Friction Curve</div>
                <div className="flex items-center gap-1"><div className="w-3 h-1 border-b border-dashed border-orange-500"></div> Applied Force</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-blue-500 scale-50"></div> Current State</div>
              </div>
            </div>
            
            <p className="text-xs text-slate-400 mt-3 leading-relaxed">
              Watch the red friction line match the applied force exactly, until it hits the static "peak" and instantly drops to kinetic friction as sliding begins.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}