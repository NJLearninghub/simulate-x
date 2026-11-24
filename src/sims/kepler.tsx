import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Activity, Move, CircleDashed, Orbit } from 'lucide-react';

export default function App() {
  // --- React State for UI ---
  const [isPlaying, setIsPlaying] = useState(true);
  const [starMass, setStarMass] = useState(1000);
  const [initialVel, setInitialVel] = useState(2.0); // Defaulted to 2.0 to show a clear ellipse
  const [sweepInterval, setSweepInterval] = useState(20);
  const [showWedges, setShowWedges] = useState(true);
  const [showGeometry, setShowGeometry] = useState(true);
  
  const [dashData, setDashData] = useState({ 
    v: 0, r: 0, e: 0, lastArea: 0, peri: 0, aph: 0 as number | null
  });

  // --- Refs for Physics Engine & Canvas ---
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  
  // Mutable physics state
  const stateRef = useRef({
    x: 150, y: 0,
    vx: 0, vy: 2.0,
    ax: 0, ay: 0,
    wedges: [],
    currentWedge: [],
    timeInWedge: 0,
    currentArea: 0,
    lastArea: 0,
    path: [],
    crashed: false,
    escaped: false
  });

  const G = 1; 
  const dt = 0.05; 
  const stepsPerFrame = 10; 

  // --- Physics Reset & Initialization ---
  const resetSimulation = () => {
    const r0 = 150;
    const initial_ax = -G * starMass * r0 / Math.pow(r0, 3);
    
    stateRef.current = {
      x: r0, y: 0,
      vx: 0, vy: initialVel,
      ax: initial_ax, ay: 0,
      wedges: [],
      currentWedge: [{x: r0, y: 0}],
      timeInWedge: 0,
      currentArea: 0,
      lastArea: 0,
      path: [],
      crashed: false,
      escaped: false
    };
    if (!isPlaying) setIsPlaying(true);
  };

  useEffect(() => {
    resetSimulation();
  }, [starMass, initialVel]);

  // --- Main Physics Loop ---
  const updatePhysics = () => {
    const state = stateRef.current;
    if (state.crashed || state.escaped) return;

    for (let i = 0; i < stepsPerFrame; i++) {
      // 1. Velocity Verlet: Update Position
      state.x += state.vx * dt + 0.5 * state.ax * dt * dt;
      state.y += state.vy * dt + 0.5 * state.ay * dt * dt;

      const r2 = state.x * state.x + state.y * state.y;
      const r = Math.sqrt(r2);
      const r3 = r2 * r;

      if (r < Math.pow(starMass, 1/3) * 1.5) { state.crashed = true; break; }
      if (r > 2500) { state.escaped = true; break; }

      // 2. Velocity Verlet: Calculate New Acceleration
      const new_ax = -G * starMass * state.x / r3;
      const new_ay = -G * starMass * state.y / r3;

      // 3. Velocity Verlet: Update Velocity
      state.vx += 0.5 * (state.ax + new_ax) * dt;
      state.vy += 0.5 * (state.ay + new_ay) * dt;

      state.ax = new_ax;
      state.ay = new_ay;

      // --- Kepler's Second Law Area Calculation ---
      const dA = 0.5 * Math.abs(state.x * state.vy - state.y * state.vx) * dt;
      state.currentArea += dA;
      state.timeInWedge += dt;

      if (i % 2 === 0) {
        state.currentWedge.push({x: state.x, y: state.y});
        state.path.push({x: state.x, y: state.y});
        if (state.path.length > 2500) state.path.shift(); 
      }

      if (state.timeInWedge >= sweepInterval) {
        state.lastArea = state.currentArea;
        state.wedges.push({
          points: [...state.currentWedge],
          area: state.currentArea
        });
        
        state.currentWedge = [{x: state.x, y: state.y}];
        state.timeInWedge = 0;
        state.currentArea = 0;
        
        if (state.wedges.length > 30) state.wedges.shift();
      }
    }
  };

  // --- Render & Animation Loop ---
  const animate = () => {
    if (isPlaying) updatePhysics();
    
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;
      const state = stateRef.current;

      ctx.fillStyle = '#0f172a'; 
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.translate(width / 2, height / 2); // Center origin (Star is at 0,0)

      // Background Grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for(let i = -width/2; i < width/2; i+=50) {
        ctx.beginPath(); ctx.moveTo(i, -height/2); ctx.lineTo(i, height/2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-width/2, i); ctx.lineTo(width/2, i); ctx.stroke();
      }

      // --- Analytical Orbital Geometry (Kepler's First Law) ---
      const r = Math.sqrt(state.x*state.x + state.y*state.y);
      const v = Math.sqrt(state.vx*state.vx + state.vy*state.vy);
      
      // Specific angular momentum (h) & Specific orbital energy (epsilon)
      const hz = state.x * state.vy - state.y * state.vx;
      const epsilon = (v * v) / 2 - (G * starMass) / r;
      
      // Eccentricity Vector & Magnitude
      const ex = (state.vy * hz) / (G * starMass) - state.x / r;
      const ey = (-state.vx * hz) / (G * starMass) - state.y / r;
      const e = Math.sqrt(ex*ex + ey*ey);
      const omega = Math.atan2(ey, ex); // Angle of periapsis

      let r_peri = 0, r_aph = Infinity;

      if (epsilon < 0) { // Bound Elliptical Orbit
        const a = -(G * starMass) / (2 * epsilon); // Semi-major axis
        const c = a * e; // Distance from center to focus
        r_peri = a * (1 - e);
        r_aph = a * (1 + e);

        if (showGeometry) {
          // Major Axis Line
          const px = (a-c) * Math.cos(omega); // Perihelion Coordinates
          const py = (a-c) * Math.sin(omega);
          const ax = (-a-c) * Math.cos(omega); // Aphelion Coordinates
          const ay = (-a-c) * Math.sin(omega);
          
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(ax, ay);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 6]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Empty Focus (Focus 2)
          const emptyFx = -2*c * Math.cos(omega);
          const emptyFy = -2*c * Math.sin(omega);
          ctx.beginPath();
          ctx.arc(emptyFx, emptyFy, 5, 0, Math.PI*2);
          ctx.fillStyle = 'rgba(255,255,255,0.2)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.4)';
          ctx.stroke();

          // Markers and Labels
          ctx.font = '11px sans-serif';
          ctx.textAlign = 'center';
          
          // Perihelion Marker
          ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI*2); ctx.fillStyle = '#ef4444'; ctx.fill(); // Red
          ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
          ctx.fillText('Perihelion', px, py - 10);
          
          // Aphelion Marker
          ctx.beginPath(); ctx.arc(ax, ay, 4, 0, Math.PI*2); ctx.fillStyle = '#3b82f6'; ctx.fill(); // Blue
          ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
          ctx.fillText('Aphelion', ax, ay - 10);

          ctx.fillStyle = 'rgba(255,255,255,0.5)';
          ctx.fillText('Empty Focus', emptyFx, emptyFy + 15);
        }
      } else { // Parabolic/Hyperbolic Escape
        r_peri = (hz * hz) / (G * starMass * (1 + e));
      }

      // Draw Wedges (Kepler's Second Law)
      if (showWedges) {
        state.wedges.forEach((wedge, index) => {
          ctx.beginPath();
          ctx.moveTo(0, 0);
          wedge.points.forEach(p => ctx.lineTo(p.x, p.y));
          ctx.lineTo(0, 0);
          ctx.fillStyle = index % 2 === 0 ? 'rgba(56, 189, 248, 0.25)' : 'rgba(167, 139, 250, 0.25)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.1)';
          ctx.lineWidth = 1;
          ctx.stroke();
        });

        ctx.beginPath();
        ctx.moveTo(0, 0);
        state.currentWedge.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.lineTo(state.x, state.y);
        ctx.lineTo(0, 0);
        ctx.fillStyle = state.wedges.length % 2 === 0 ? 'rgba(56, 189, 248, 0.25)' : 'rgba(167, 139, 250, 0.25)';
        ctx.fill();
      }

      // Draw Orbit Trail
      if (state.path.length > 0) {
        ctx.beginPath();
        ctx.moveTo(state.path[0].x, state.path[0].y);
        state.path.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Draw Star (Focus 1)
      const starRadius = Math.pow(starMass, 1/3) * 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, starRadius, 0, 2 * Math.PI);
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, starRadius * 1.5);
      gradient.addColorStop(0, '#fde047'); 
      gradient.addColorStop(0.5, '#fb923c'); 
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 0, starRadius * 0.7, 0, 2 * Math.PI);
      ctx.fillStyle = '#fef08a'; 
      ctx.fill();
      
      if (showGeometry) {
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillText('Star (Focus 1)', 0, starRadius + 12);
      }

      // Draw Planet
      ctx.beginPath();
      ctx.arc(state.x, state.y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = '#60a5fa'; 
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#60a5fa';
      ctx.fill();
      ctx.shadowBlur = 0; 

      // Status Text (Crash/Escape)
      if (state.crashed || state.escaped) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(-150, -30, 300, 60);
        ctx.fillStyle = state.crashed ? '#ef4444' : '#eab308';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(state.crashed ? 'PLANET CRASHED!' : 'ESCAPED ORBIT!', 0, 0);
      }

      ctx.restore();

      // Update Dashboard UI Data (Throttled to visual frames)
      setDashData({
        v: Number(v.toFixed(2)),
        r: Number(r.toFixed(1)),
        e: Number(e.toFixed(3)),
        peri: Number(r_peri.toFixed(1)),
        aph: Number.isFinite(r_aph) ? Number(r_aph.toFixed(1)) : null,
        lastArea: Number(state.lastArea.toFixed(1))
      });
    }

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [isPlaying, showWedges, showGeometry, starMass, sweepInterval]);

  return (
    <div className="min-h-[36rem] bg-slate-950 text-slate-200 p-4 font-sans flex flex-col xl:flex-row gap-6">
      
      {/* LEFT: Main Canvas Area */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-2xl overflow-hidden relative">
          <div className="absolute top-6 left-6 text-xl font-bold text-slate-300 flex items-center gap-2">
            <Orbit className="text-blue-400" />
            Kepler's Simulator
          </div>
          <canvas 
            ref={canvasRef} 
            width={900} 
            height={650} 
            className="w-full h-auto bg-black rounded-xl border border-slate-800/50"
          />
          <div className="absolute bottom-6 left-6 flex gap-3">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-3 bg-blue-600 hover:bg-blue-500 rounded-full text-white transition-colors shadow-lg"
            >
              {isPlaying ? <Pause size={20}/> : <Play size={20}/>}
            </button>
            <button 
              onClick={resetSimulation}
              className="p-3 bg-slate-700 hover:bg-slate-600 rounded-full text-white transition-colors shadow-lg"
            >
              <RotateCcw size={20}/>
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT: Control Panel & Dashboard */}
      <div className="w-full xl:w-96 flex flex-col gap-4">
        
        {/* Control Panel */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col gap-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 border-b border-slate-800 pb-3">
            <Move size={18} className="text-blue-400"/> Interactive Inputs
          </h2>
          
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm text-slate-400">
              <label>Initial Velocity ($v_0$)</label>
              <span className="font-mono font-medium text-blue-400">{initialVel}</span>
            </div>
            <input 
              type="range" min="0.5" max="3.5" step="0.1" 
              value={initialVel} onChange={(e) => setInitialVel(parseFloat(e.target.value))}
              className="accent-blue-500 cursor-pointer"
            />
            <p className="text-xs text-slate-500 mt-1">~2.58 yields a perfectly circular orbit.</p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm text-slate-400">
              <label>Star Mass ($M$)</label>
              <span className="font-mono font-medium text-amber-400">{starMass}</span>
            </div>
            <input 
              type="range" min="500" max="2500" step="100" 
              value={starMass} onChange={(e) => setStarMass(parseInt(e.target.value))}
              className="accent-amber-500 cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-4 pt-2 border-t border-slate-800">
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input 
                type="checkbox" checked={showGeometry} onChange={(e) => setShowGeometry(e.target.checked)}
                className="w-4 h-4 accent-blue-500 rounded"
              />
              Show Ellipse Geometry (Kepler's 1st Law)
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input 
                type="checkbox" checked={showWedges} onChange={(e) => setShowWedges(e.target.checked)}
                className="w-4 h-4 accent-purple-500 rounded"
              />
              Show Area Sweeps (Kepler's 2nd Law)
            </label>
          </div>
        </div>

        {/* Live Data Dashboard */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col gap-4 flex-1">
          <h2 className="text-lg font-semibold flex items-center gap-2 border-b border-slate-800 pb-3">
            <Activity size={18} className="text-green-400"/> Live Orbital Data
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Velocity ($v$)</span>
              <span className="text-xl font-mono text-green-400">{dashData.v}</span>
            </div>
            
            <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Current Radius ($r$)</span>
              <span className="text-xl font-mono text-slate-200">{dashData.r}</span>
            </div>

            <div className="bg-red-950/20 rounded-xl p-3 border border-red-900/30 flex flex-col">
              <span className="text-[10px] text-red-400/80 uppercase tracking-wider mb-1">Perihelion (Closest)</span>
              <span className="text-xl font-mono text-red-400">{dashData.peri}</span>
            </div>

            <div className="bg-blue-950/20 rounded-xl p-3 border border-blue-900/30 flex flex-col">
              <span className="text-[10px] text-blue-400/80 uppercase tracking-wider mb-1">Aphelion (Farthest)</span>
              <span className="text-xl font-mono text-blue-400">{dashData.aph == null ? "unbounded" : dashData.aph}</span>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 flex flex-col col-span-2 relative overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-purple-500/10 to-transparent pointer-events-none"></div>
              <span className="text-xs text-slate-400 uppercase tracking-wider mb-1">Swept Area ($A$)</span>
              <span className="text-3xl font-mono text-purple-400">{dashData.lastArea > 0 ? dashData.lastArea : "---"}</span>
              <span className="text-xs text-slate-500 mt-1">Area per $\Delta t$ remains strictly constant.</span>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 flex flex-col col-span-2">
              <div className="flex justify-between items-end mb-1">
                <span className="text-xs text-slate-400 uppercase tracking-wider">Eccentricity ($e$)</span>
                <span className="text-xs text-blue-400 uppercase">{dashData.e < 0.05 ? "Circular" : dashData.e < 1 ? "Elliptical" : "Escape"}</span>
              </div>
              <span className="text-2xl font-mono text-blue-300">{dashData.e}</span>
              <div className="w-full bg-slate-700 h-1.5 mt-3 rounded-full overflow-hidden relative">
                <div 
                  className={`absolute top-0 left-0 h-full transition-all duration-300 ${dashData.e >= 1 ? 'bg-red-500' : 'bg-blue-500'}`}
                  style={{ width: `${Math.min(dashData.e * 100, 100)}%` }}
                ></div>
                <div className="absolute top-0 bottom-0 left-[100%] w-0.5 bg-red-400 shadow-[0_0_5px_red]"></div>
              </div>
            </div>
          </div>
          
        </div>
      </div>

    </div>
  );
}