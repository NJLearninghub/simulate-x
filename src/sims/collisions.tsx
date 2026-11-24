import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Activity } from 'lucide-react';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;
// 100 px = 1 m, so the arena is 8 m by 5 m and speeds labelled m/s match the motion.
const PX_PER_M = 100;

export default function CollisionSimulator() {
  // --- STATE & CONFIG ---
  const [isPlaying, setIsPlaying] = useState(false);
  
  // User adjustable parameters
  const [params, setParams] = useState({
    m1: 3, v1: 2, a1: 0,       // Mass (kg), speed (m/s), angle for object 1
    m2: 3, v2: 2, a2: 180,     // Mass (kg), speed (m/s), angle for object 2
    e: 1.0                     // Coefficient of Restitution
  });

  // Render state for UI updates
  const [simState, setSimState] = useState(null);
  const [initialStats, setInitialStats] = useState({ ke: 0, pMag: 0 });

  // Physics state (Mutable ref for high-speed calculation without re-rendering issues)
  const stateRef = useRef(null);
  const requestRef = useRef<any>(null);
  const lastTimeRef = useRef<any>(null);

  // --- PHYSICS ENGINE ---

  // Calculate the Initial Stats for the progress bars max values
  const calculateStats = (b1, b2) => {
    const v1x = b1.vx / PX_PER_M, v1y = b1.vy / PX_PER_M;
    const v2x = b2.vx / PX_PER_M, v2y = b2.vy / PX_PER_M;
    const ke = 0.5 * b1.m * (v1x * v1x + v1y * v1y) + 
               0.5 * b2.m * (v2x * v2x + v2y * v2y);
    const px = b1.m * v1x + b2.m * v2x;
    const py = b1.m * v1y + b2.m * v2y;
    const pMag = Math.sqrt(px * px + py * py);
    return { ke, px, py, pMag };
  };

  // Reset the simulation based on current sliders
  const resetSimulation = useCallback(() => {
    setIsPlaying(false);
    cancelAnimationFrame(requestRef.current);

    // Convert angles to radians (SVG y-axis is inverted, so we negate sine)
    const rad1 = (params.a1 * Math.PI) / 180;
    const rad2 = (params.a2 * Math.PI) / 180;

    const b1 = {
      x: CANVAS_WIDTH * 0.25,
      y: CANVAS_HEIGHT / 2,
      vx: params.v1 * PX_PER_M * Math.cos(rad1),
      vy: -params.v1 * PX_PER_M * Math.sin(rad1),
      m: params.m1,
      r: Math.max(15, Math.sqrt(params.m1) * 12) // Visually scale radius by mass
    };

    const b2 = {
      x: CANVAS_WIDTH * 0.75,
      y: CANVAS_HEIGHT / 2,
      vx: params.v2 * PX_PER_M * Math.cos(rad2),
      vy: -params.v2 * PX_PER_M * Math.sin(rad2),
      m: params.m2,
      r: Math.max(15, Math.sqrt(params.m2) * 12)
    };

    stateRef.current = { b1, b2 };
    
    const stats = calculateStats(b1, b2);
    setInitialStats({ ke: stats.ke, pMag: stats.pMag || 100 }); // Provide fallback if pMag is 0
    setSimState({ b1: { ...b1 }, b2: { ...b2 }, stats });
  }, [params]);

  // Main physics loop
  const updatePhysics = useCallback((time) => {
    if (!lastTimeRef.current) lastTimeRef.current = time;
    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;

    // Cap deltaTime to prevent physics explosions on lag spikes
    const dt = Math.min(deltaTime / 1000, 0.05);

    const { b1, b2 } = stateRef.current;
    const { e } = params;

    // 1. Move Objects
    b1.x += b1.vx * dt;
    b1.y += b1.vy * dt;
    b2.x += b2.vx * dt;
    b2.y += b2.vy * dt;

    // 2. Wall Collisions (Perfectly elastic against walls to keep action going)
    [b1, b2].forEach(b => {
      if (b.x - b.r < 0) { b.x = b.r; b.vx *= -1; }
      if (b.x + b.r > CANVAS_WIDTH) { b.x = CANVAS_WIDTH - b.r; b.vx *= -1; }
      if (b.y - b.r < 0) { b.y = b.r; b.vy *= -1; }
      if (b.y + b.r > CANVAS_HEIGHT) { b.y = CANVAS_HEIGHT - b.r; b.vy *= -1; }
    });

    // 3. Object-to-Object Collision Detection
    const dx = b2.x - b1.x;
    const dy = b2.y - b1.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= b1.r + b2.r) {
      // Normal vector
      const nx = dx / dist;
      const ny = dy / dist;

      // Tangent vector
      const tx = -ny;
      const ty = nx;

      // Dot Product Normal (Velocity along the line of collision)
      const dpNorm1 = b1.vx * nx + b1.vy * ny;
      const dpNorm2 = b2.vx * nx + b2.vy * ny;

      // Only resolve if they are moving towards each other
      if (dpNorm1 - dpNorm2 > 0) {
        // Dot Product Tangent (Velocity perpendicular to collision)
        const dpTan1 = b1.vx * tx + b1.vy * ty;
        const dpTan2 = b2.vx * tx + b2.vy * ty;

        // 1D Conservation of Momentum & Energy equations
        const m1 = b1.m;
        const m2 = b2.m;

        const v1n_after = (m1 * dpNorm1 + m2 * dpNorm2 + m2 * e * (dpNorm2 - dpNorm1)) / (m1 + m2);
        const v2n_after = (m1 * dpNorm1 + m2 * dpNorm2 + m1 * e * (dpNorm1 - dpNorm2)) / (m1 + m2);

        // Convert scalar normal and tangent velocities back to vectors
        b1.vx = tx * dpTan1 + nx * v1n_after;
        b1.vy = ty * dpTan1 + ny * v1n_after;
        b2.vx = tx * dpTan2 + nx * v2n_after;
        b2.vy = ty * dpTan2 + ny * v2n_after;

        // Separate objects slightly to prevent sticking inside each other (Overlap resolution)
        const overlap = (b1.r + b2.r) - dist;
        b1.x -= nx * (overlap / 2.01);
        b1.y -= ny * (overlap / 2.01);
        b2.x += nx * (overlap / 2.01);
        b2.y += ny * (overlap / 2.01);
      }
    }

    // 4. Update UI State
    setSimState({
      b1: { ...b1 },
      b2: { ...b2 },
      stats: calculateStats(b1, b2)
    });

    requestRef.current = requestAnimationFrame(updatePhysics);
  }, [params.e]); // We depend on 'e' because it can be changed on the fly

  // --- LIFECYCLE ---
  useEffect(() => {
    resetSimulation();
  }, [resetSimulation]);

  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = performance.now();
      requestRef.current = requestAnimationFrame(updatePhysics);
    } else {
      cancelAnimationFrame(requestRef.current);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isPlaying, updatePhysics]);

  // Handle slider changes safely
  const handleParamChange = (key, value) => {
    setParams(prev => ({ ...prev, [key]: Number(value) }));
  };

  if (!simState) return null;

  // Render helpers
  const vectorScale = 0.2; // Scale down momentum vector length for display
  const { b1, b2, stats } = simState;

  return (
    <div className="min-h-[36rem] bg-slate-100 p-4 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto flex flex-col xl:flex-row gap-6">
        
        {/* LEFT COLUMN: CANVAS & GRAPHS */}
        <div className="flex-grow flex flex-col gap-6">
          
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Activity className="text-blue-600" />
                Two-Dimensional Collisions
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Visualize conservation of momentum and energy. Adjust parameters and watch vectors react in real-time.
              </p>
            </div>
            
            {/* Main Controls */}
            <div className="flex items-center gap-3">
              <button 
                onClick={resetSimulation}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
              >
                <RotateCcw size={18} /> Reset
              </button>
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors text-white shadow-sm ${
                  isPlaying ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isPlaying ? <><Pause size={18} /> Pause</> : <><Play size={18} /> Start</>}
              </button>
            </div>
          </div>

          {/* Canvas Wrapper */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 relative overflow-hidden">
            <svg 
              viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`} 
              className="w-full h-auto rounded-xl bg-slate-900 shadow-inner"
              style={{ maxHeight: '60vh' }}
            >
              <defs>
                {/* Background Grid Pattern */}
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
                </pattern>
                
                {/* Arrowhead Markers */}
                <marker id="arrow-b1" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L6,3 z" fill="#60A5FA" />
                </marker>
                <marker id="arrow-b2" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L6,3 z" fill="#F87171" />
                </marker>
              </defs>

              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Render Momentum Vectors */}
              <line 
                x1={b1.x} y1={b1.y} 
                x2={b1.x + (b1.vx * b1.m * vectorScale)} 
                y2={b1.y + (b1.vy * b1.m * vectorScale)} 
                stroke="#60A5FA" strokeWidth="3" markerEnd="url(#arrow-b1)" 
                opacity="0.8"
              />
              <line 
                x1={b2.x} y1={b2.y} 
                x2={b2.x + (b2.vx * b2.m * vectorScale)} 
                y2={b2.y + (b2.vy * b2.m * vectorScale)} 
                stroke="#F87171" strokeWidth="3" markerEnd="url(#arrow-b2)" 
                opacity="0.8"
              />

              {/* Render Objects */}
              <circle cx={b1.x} cy={b1.y} r={b1.r} fill="#3B82F6" stroke="#FFFFFF" strokeWidth="2" className="drop-shadow-lg" />
              <circle cx={b2.x} cy={b2.y} r={b2.r} fill="#EF4444" stroke="#FFFFFF" strokeWidth="2" className="drop-shadow-lg" />
              
              {/* Labels */}
              <text x={b1.x} y={b1.y + 4} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" className="pointer-events-none">1</text>
              <text x={b2.x} y={b2.y + 4} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" className="pointer-events-none">2</text>
            </svg>
            
            <div className="absolute top-6 left-6 flex items-center gap-2">
              <div className="w-4 h-1 bg-blue-400"></div> <span className="text-xs text-white opacity-70">Momentum Vector 1</span>
            </div>
            <div className="absolute top-12 left-6 flex items-center gap-2">
              <div className="w-4 h-1 bg-red-400"></div> <span className="text-xs text-white opacity-70">Momentum Vector 2</span>
            </div>
          </div>

          {/* Live Data Graphs */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row gap-8">
            {/* Kinetic Energy Bar */}
            <div className="flex-1">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-semibold text-slate-600">Total Kinetic Energy (ΣKE)</span>
                <span className="text-sm font-bold text-amber-500">{stats.ke.toFixed(2)} J</span>
              </div>
              <div className="w-full bg-slate-100 h-6 rounded-full overflow-hidden border border-slate-200 relative">
                <div 
                  className="bg-gradient-to-r from-amber-400 to-amber-500 h-full transition-all duration-75"
                  style={{ width: `${Math.min(100, (stats.ke / (initialStats.ke || 1)) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {params.e < 1 ? "Drops during inelastic collisions (energy lost to heat/deformation)." : "Conserved perfectly in elastic states."}
              </p>
            </div>

            {/* Momentum Bar */}
            <div className="flex-1">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-semibold text-slate-600">Total System Momentum (|P|)</span>
                <span className="text-sm font-bold text-indigo-500">{stats.pMag.toFixed(2)} kg·m/s</span>
              </div>
              <div className="w-full bg-slate-100 h-6 rounded-full overflow-hidden border border-slate-200">
                <div 
                  className="bg-gradient-to-r from-indigo-400 to-indigo-500 h-full transition-all duration-75"
                  style={{ width: `${Math.min(100, (stats.pMag / (initialStats.pMag || 1)) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Conserved during object collisions. (Bouncing off walls applies an external force, changing momentum).
              </p>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: CONTROL PANEL */}
        <div className="w-full xl:w-96 flex flex-col gap-6">
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-lg text-slate-800 mb-4 border-b pb-2">Environment Setup</h3>
            
            <div className="mb-4">
              <label className="flex justify-between text-sm font-medium text-slate-700 mb-1">
                <span>Coefficient of Restitution (e)</span>
                <span className="text-indigo-600 bg-indigo-50 px-2 rounded">{params.e.toFixed(2)}</span>
              </label>
              <input 
                type="range" min="0" max="1" step="0.05" value={params.e}
                onChange={(e) => handleParamChange('e', e.target.value)}
                className="w-full accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Inelastic (Sticky)</span>
                <span>Elastic (Bouncy)</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6">
            <h3 className="font-bold text-lg text-blue-800 mb-4 border-b border-blue-200 pb-2">Object 1 (Blue)</h3>
            
            <div className="flex flex-col gap-4">
              <div>
                <label className="flex justify-between text-sm font-medium text-slate-700 mb-1">
                  <span>Mass (kg)</span>
                  <span>{params.m1}</span>
                </label>
                <input type="range" min="1" max="20" step="1" value={params.m1} onChange={(e) => handleParamChange('m1', e.target.value)} className="w-full accent-blue-600" disabled={isPlaying} />
              </div>
              
              <div>
                <label className="flex justify-between text-sm font-medium text-slate-700 mb-1">
                  <span>Initial Speed (m/s)</span>
                  <span>{Number(params.v1).toFixed(1)}</span>
                </label>
                <input type="range" min="0" max="8" step="0.1" value={params.v1} onChange={(e) => handleParamChange('v1', e.target.value)} className="w-full accent-blue-600" disabled={isPlaying} />
              </div>

              <div>
                <label className="flex justify-between text-sm font-medium text-slate-700 mb-1">
                  <span>Launch Angle (°)</span>
                  <span>{params.a1}°</span>
                </label>
                <input type="range" min="0" max="360" step="5" value={params.a1} onChange={(e) => handleParamChange('a1', e.target.value)} className="w-full accent-blue-600" disabled={isPlaying} />
              </div>
            </div>
          </div>

          <div className="bg-red-50 rounded-2xl border border-red-100 p-6">
            <h3 className="font-bold text-lg text-red-800 mb-4 border-b border-red-200 pb-2">Object 2 (Red)</h3>
            
            <div className="flex flex-col gap-4">
              <div>
                <label className="flex justify-between text-sm font-medium text-slate-700 mb-1">
                  <span>Mass (kg)</span>
                  <span>{params.m2}</span>
                </label>
                <input type="range" min="1" max="20" step="1" value={params.m2} onChange={(e) => handleParamChange('m2', e.target.value)} className="w-full accent-red-600" disabled={isPlaying} />
              </div>
              
              <div>
                <label className="flex justify-between text-sm font-medium text-slate-700 mb-1">
                  <span>Initial Speed (m/s)</span>
                  <span>{Number(params.v2).toFixed(1)}</span>
                </label>
                <input type="range" min="0" max="8" step="0.1" value={params.v2} onChange={(e) => handleParamChange('v2', e.target.value)} className="w-full accent-red-600" disabled={isPlaying} />
              </div>

              <div>
                <label className="flex justify-between text-sm font-medium text-slate-700 mb-1">
                  <span>Launch Angle (°)</span>
                  <span>{params.a2}°</span>
                </label>
                <input type="range" min="0" max="360" step="5" value={params.a2} onChange={(e) => handleParamChange('a2', e.target.value)} className="w-full accent-red-600" disabled={isPlaying} />
              </div>
            </div>
          </div>
          
          <div className="text-center text-xs text-slate-400 mt-2">
            * Adjust initial parameters while the simulation is paused or reset. The Restitution setting can be changed live!
          </div>

        </div>
      </div>
    </div>
  );
}