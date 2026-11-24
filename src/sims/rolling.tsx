import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Info, Activity } from 'lucide-react';

// Physical Constants
const G = 9.81; // Gravity (m/s^2)
const L_PHYSICAL = 10; // Length of the ramp (meters)

// UI & Scaling Constants
const L_PX = 650; // Pixel length of the ramp on screen
const SCALE = L_PX / L_PHYSICAL; // Pixels per meter
const PIVOT_X = 900;
const PIVOT_Y = 480;

// Shape Definitions with their specific Moment of Inertia factor (k where I = k * M * R^2)
const SHAPES = {
  solidSphere: { 
    id: 'solidSphere', 
    name: 'Solid Sphere', 
    k: 2/5,
    iLabel: '2/5 MR²',
    color: 'bg-cyan-500', 
    fill: 'fill-cyan-500',
    stroke: 'stroke-cyan-400',
    vectorColor: '#22d3ee'
  },
  solidCylinder: { 
    id: 'solidCylinder', 
    name: 'Solid Cylinder', 
    k: 1/2,
    iLabel: '1/2 MR²',
    color: 'bg-emerald-500', 
    fill: 'fill-emerald-500',
    stroke: 'stroke-emerald-400',
    vectorColor: '#34d399'
  },
  hollowSphere: { 
    id: 'hollowSphere', 
    name: 'Hollow Sphere', 
    k: 2/3, 
    iLabel: '2/3 MR²',
    color: 'bg-rose-500', 
    fill: 'fill-rose-500',
    stroke: 'stroke-rose-400',
    vectorColor: '#fb7185'
  },
  thinRing: {
    id: 'thinRing',
    name: 'Thin Ring',
    k: 1,
    iLabel: 'MR²',
    color: 'bg-amber-500',
    fill: 'fill-amber-500',
    stroke: 'stroke-amber-400',
    vectorColor: '#fbbf24'
  }
};

export default function RollingMotionSimulation() {
  // State variables for inputs
  const [angleDeg, setAngleDeg] = useState(30);
  const [mass, setMass] = useState(5); // kg
  const [radius, setRadius] = useState(0.5); // meters
  
  const [mode, setMode] = useState('race'); // 'race' | 'individual'
  const [selectedShape, setSelectedShape] = useState('solidSphere'); // used for individual mode
  
  // Simulation state
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const requestRef = useRef<any>(null);
  const previousTimeRef = useRef<any>(null);

  const angleRad = (angleDeg * Math.PI) / 180;
  
  // Reset simulation when properties change
  useEffect(() => {
    setTime(0);
    setIsPlaying(false);
  }, [angleDeg, mass, radius, mode, selectedShape]);

  // The core physics engine calculating state for a given time
  const calculatePhysics = (shapeKey, t) => {
    const shape = SHAPES[shapeKey];
    // a = g*sin(theta) / (1 + k)
    const acceleration = (G * Math.sin(angleRad)) / (1 + shape.k);
    
    // Kinematics
    let d = 0.5 * acceleration * t * t;
    let v = acceleration * t;
    
    // Cap at the end of the ramp
    if (d > L_PHYSICAL) {
      d = L_PHYSICAL;
      v = Math.sqrt(2 * acceleration * L_PHYSICAL);
    }
    
    const omega = v / radius;
    const alpha = d / radius; // Rotation angle
    
    // Energy Calculations (Joules)
    const totalEnergy = mass * G * L_PHYSICAL * Math.sin(angleRad);
    const heightFromBottom = (L_PHYSICAL - d) * Math.sin(angleRad);
    const PE = mass * G * heightFromBottom;
    const KE_trans = 0.5 * mass * v * v;
    const KE_rot = 0.5 * (shape.k * mass * radius * radius) * omega * omega;
    
    return { d, v, omega, alpha, a: acceleration, PE, KE_trans, KE_rot, totalEnergy };
  };

  // Animation Loop
  const animate = (timestamp) => {
    if (previousTimeRef.current != undefined) {
      const deltaTime = (timestamp - previousTimeRef.current) / 1000;
      setTime(prevTime => {
        const newTime = prevTime + deltaTime;
        
        // Find if all active objects have reached the bottom
        const activeShapes = mode === 'race' ? Object.keys(SHAPES) : [selectedShape];
        let allFinished = true;
        
        activeShapes.forEach(key => {
          const phys = calculatePhysics(key, newTime);
          if (phys.d < L_PHYSICAL) allFinished = false;
        });

        if (allFinished) {
          setIsPlaying(false);
          // Clamp time to exact finish time of the slowest object
          const slowestK = Math.max(...activeShapes.map(k => SHAPES[k].k));
          const slowestA = (G * Math.sin(angleRad)) / (1 + slowestK);
          return Math.sqrt((2 * L_PHYSICAL) / slowestA);
        }
        
        return newTime;
      });
    }
    previousTimeRef.current = timestamp;
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(requestRef.current);
      previousTimeRef.current = undefined;
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isPlaying, angleDeg, mode, selectedShape, radius, mass]); // Re-bind if deps change

  const togglePlay = () => setIsPlaying(!isPlaying);
  const reset = () => { setIsPlaying(false); setTime(0); };

  // UI Rendering Helpers
  const renderRamp = () => {
    const xTop = PIVOT_X - L_PX * Math.cos(angleRad);
    const yTop = PIVOT_Y - L_PX * Math.sin(angleRad);
    return (
      <polygon 
        points={`${xTop},${yTop} ${PIVOT_X},${PIVOT_Y} ${PIVOT_X},${PIVOT_Y + 40} ${xTop},${PIVOT_Y + 40}`} 
        className="fill-slate-700 stroke-slate-500"
        strokeWidth="2"
      />
    );
  };

  const renderShape = (shapeKey, offsetIndex, totalShapes) => {
    const shape = SHAPES[shapeKey];
    const phys = calculatePhysics(shapeKey, time);
    
    // Geometric position of the point on the ramp
    const xSurface = (PIVOT_X - L_PX * Math.cos(angleRad)) + (phys.d * SCALE) * Math.cos(angleRad);
    const ySurface = (PIVOT_Y - L_PX * Math.sin(angleRad)) + (phys.d * SCALE) * Math.sin(angleRad);
    
    // Offset perpendicularly from the ramp by the radius
    const R_PX = radius * SCALE;
    // Normal vector points UP-LEFT relative to the standard XY
    const nx = Math.sin(angleRad);
    const ny = -Math.cos(angleRad);
    
    // Add visual lane separation in race mode
    const laneOffset = totalShapes > 1 ? (offsetIndex - (totalShapes - 1) / 2) * (R_PX * 0.35) : 0;
    
    const cx = xSurface + (R_PX + laneOffset) * nx;
    const cy = ySurface + (R_PX + laneOffset) * ny;
    
    // Dynamic vector lengths
    const vLen = phys.v * 15; // Visual scale for linear velocity
    const omegaAngle = Math.min(Math.PI * 1.5, phys.omega * 0.15); // Sweep of angular velocity arc
    
    const arcX = (R_PX * 1.3) * Math.cos(omegaAngle);
    const arcY = (R_PX * 1.3) * Math.sin(omegaAngle);
    const largeArcFlag = omegaAngle > Math.PI ? 1 : 0;
    
    return (
      <g key={shapeKey} transform={`translate(${cx}, ${cy})`} opacity={totalShapes > 1 ? 0.9 : 1}>
        {/* The Rolling Object */}
        <g transform={`rotate(${(phys.alpha * 180 / Math.PI)})`}>
          {shapeKey === 'solidSphere' && (
            <circle cx="0" cy="0" r={R_PX} className={`${shape.fill} opacity-80`} stroke="white" strokeWidth="2" />
          )}
          {shapeKey === 'solidCylinder' && (
            <>
              <circle cx="0" cy="0" r={R_PX} className={`${shape.fill} opacity-80`} stroke="white" strokeWidth="2" />
              <line x1={-R_PX} y1="0" x2={R_PX} y2="0" stroke="white" strokeWidth="2" opacity="0.5"/>
              <line x1="0" y1={-R_PX} x2="0" y2={R_PX} stroke="white" strokeWidth="2" opacity="0.5"/>
            </>
          )}
          {shapeKey === 'hollowSphere' && (
            <>
              <circle cx="0" cy="0" r={R_PX} className="fill-transparent" stroke={shape.vectorColor} strokeWidth={R_PX * 0.3} />
              <circle cx="0" cy="0" r={R_PX} className="fill-transparent stroke-white" strokeWidth="1" />
            </>
          )}
          {shapeKey === 'thinRing' && (
            <circle cx="0" cy="0" r={R_PX} className="fill-transparent" stroke={shape.vectorColor} strokeWidth="3" />
          )}
          {/* Center Dot */}
          <circle cx="0" cy="0" r="3" fill="white" />
          {/* Tracking Marker to see rotation clearly */}
          <circle cx="0" cy={-R_PX * 0.8} r={R_PX * 0.15} fill="white" />
        </g>

        {/* Vectors (Only show if moving, and simplify if in race mode) */}
        {phys.v > 0.1 && (
          <g transform={`rotate(${angleDeg})`}>
            {/* Linear Velocity Vector (v) */}
            <line x1="0" y1="0" x2={vLen} y2="0" stroke={shape.vectorColor} strokeWidth="3" markerEnd="url(#arrowhead)" />
            <text x={vLen + 10} y="5" fill={shape.vectorColor} className="text-sm font-bold shadow-black">v</text>
            
            {/* Angular Velocity Vector (omega) */}
            <path 
              d={`M ${R_PX * 1.3},0 A ${R_PX * 1.3},${R_PX * 1.3} 0 ${largeArcFlag},1 ${arcX},${arcY}`} 
              fill="none" 
              stroke="white" 
              strokeWidth="2" 
              strokeDasharray="4 4"
              markerEnd="url(#arrowhead-white)"
            />
            <text x={arcX + 10} y={arcY + 10} fill="white" className="text-sm font-bold">ω</text>
          </g>
        )}
      </g>
    );
  };

  const renderEnergyBar = (shapeKey) => {
    const shape = SHAPES[shapeKey];
    const phys = calculatePhysics(shapeKey, time);
    
    const pePct = (phys.PE / phys.totalEnergy) * 100;
    const transPct = (phys.KE_trans / phys.totalEnergy) * 100;
    const rotPct = (phys.KE_rot / phys.totalEnergy) * 100;

    return (
      <div key={shapeKey} className="flex flex-col items-center flex-1 mx-2 p-3 bg-slate-800 rounded-xl shadow-inner border border-slate-700">
        <span className="text-slate-300 font-semibold mb-2 text-sm text-center h-10">{shape.name} <br/> <span className="text-xs text-slate-500">(I = {shape.iLabel})</span></span>
        
        {/* The Live Bar */}
        <div className="w-16 h-48 bg-slate-900 rounded-lg overflow-hidden flex flex-col justify-end border border-slate-700 relative">
          
          {/* Labels that only appear when segments are large enough */}
          {pePct > 10 && <div className="absolute top-2 w-full text-center text-xs font-bold text-slate-400 z-10 drop-shadow-md">PE</div>}
          {rotPct > 10 && <div className="absolute w-full text-center text-xs font-bold text-orange-100 z-10 drop-shadow-md" style={{ bottom: `${transPct + (rotPct/2) - 3}%` }}>KE(rot)</div>}
          {transPct > 10 && <div className="absolute w-full text-center text-xs font-bold text-blue-100 z-10 drop-shadow-md" style={{ bottom: `${transPct/2 - 3}%` }}>KE(trans)</div>}

          <div 
            className="w-full bg-slate-600 transition-all duration-75"
            style={{ height: `${pePct}%` }}
            title={`Potential Energy: ${phys.PE.toFixed(1)} J`}
          />
          <div 
            className="w-full bg-orange-500 transition-all duration-75 border-t border-slate-900"
            style={{ height: `${rotPct}%` }}
            title={`Rotational Kinetic Energy: ${phys.KE_rot.toFixed(1)} J`}
          />
          <div 
            className={`w-full ${shape.color} transition-all duration-75 border-t border-slate-900`}
            style={{ height: `${transPct}%` }}
            title={`Translational Kinetic Energy: ${phys.KE_trans.toFixed(1)} J`}
          />
        </div>
        
        <div className="mt-3 text-center">
          <div className="text-xs text-slate-400">Total Energy</div>
          <div className="text-sm font-bold text-white">{phys.totalEnergy.toFixed(1)} J</div>
        </div>
      </div>
    );
  };

  const activeShapes = mode === 'race' ? Object.keys(SHAPES) : [selectedShape];

  return (
    <div className="min-h-[36rem] bg-slate-900 text-slate-100 font-sans p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-slate-800 p-4 rounded-2xl shadow-lg border border-slate-700">
          <div>
            <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400">
              Rolling without Slipping
            </h1>
            <p className="text-slate-400 text-sm">Compare how inertia splits kinetic energy during rolling motion</p>
          </div>
          
          <div className="flex space-x-3">
            <button 
              onClick={togglePlay}
              className={`flex items-center px-6 py-2 rounded-lg font-bold transition-colors ${isPlaying ? 'bg-amber-500 hover:bg-amber-400 text-amber-950' : 'bg-emerald-500 hover:bg-emerald-400 text-emerald-950'}`}
            >
              {isPlaying ? <><Pause className="w-5 h-5 mr-2"/> Pause</> : <><Play className="w-5 h-5 mr-2"/> Run Simulation</>}
            </button>
            <button 
              onClick={reset}
              className="flex items-center px-4 py-2 rounded-lg font-bold bg-slate-700 hover:bg-slate-600 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Simulation Canvas */}
          <div className="lg:col-span-2 bg-slate-800 rounded-2xl shadow-lg border border-slate-700 overflow-hidden relative">
            <div className="absolute top-4 left-4 bg-slate-900/80 p-2 rounded-lg border border-slate-700 flex space-x-4 text-xs font-mono">
              <span className="text-emerald-400">Time: {time.toFixed(2)}s</span>
              <span className="text-cyan-400">
                {mode === 'race'
                  ? `Accel: ${((G * Math.sin(angleRad)) / (1 + SHAPES.solidSphere.k)).toFixed(2)} m/s² (fastest, solid sphere)`
                  : `${SHAPES[selectedShape].name}: ${((G * Math.sin(angleRad)) / (1 + SHAPES[selectedShape].k)).toFixed(2)} m/s²`}
              </span>
            </div>

            <svg viewBox="0 0 1000 550" className="w-full h-full">
              <defs>
                <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <polygon points="0 0, 6 3, 0 6" fill="currentColor" />
                </marker>
                <marker id="arrowhead-white" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <polygon points="0 0, 6 3, 0 6" fill="white" />
                </marker>
              </defs>
              
              {/* Background Grid */}
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {renderRamp()}
              
              {/* Render Active Shapes */}
              {activeShapes.map((key, i) => renderShape(key, i, activeShapes.length))}

            </svg>
          </div>

          {/* Control Panel */}
          <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-cyan-400" />
                Simulation Modes
              </h2>
              <div className="flex bg-slate-900 p-1 rounded-lg">
                <button
                  className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${mode === 'race' ? 'bg-cyan-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                  onClick={() => setMode('race')}
                >
                  Race Mode
                </button>
                <button
                  className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${mode === 'individual' ? 'bg-cyan-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                  onClick={() => setMode('individual')}
                >
                  Individual
                </button>
              </div>
            </div>

            {mode === 'individual' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Object</label>
                <div className="grid grid-cols-1 gap-2">
                  {Object.values(SHAPES).map(shape => (
                    <button
                      key={shape.id}
                      onClick={() => setSelectedShape(shape.id)}
                      className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-all ${selectedShape === shape.id ? `border-${shape.color.split('-')[1]}-500 bg-slate-700` : 'border-slate-700 hover:border-slate-500'}`}
                    >
                      <span className="font-semibold">{shape.name}</span>
                      <div className={`w-4 h-4 rounded-full ${shape.color}`}></div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-6 pt-4 border-t border-slate-700">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Physical Properties</label>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300">Incline Angle (θ)</span>
                  <span className="text-emerald-400 font-mono">{angleDeg}°</span>
                </div>
                <input 
                  type="range" min="10" max="45" value={angleDeg} 
                  onChange={(e) => setAngleDeg(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300">Object Mass (M)</span>
                  <span className="text-cyan-400 font-mono">{mass} kg</span>
                </div>
                <input 
                  type="range" min="1" max="10" step="0.5" value={mass} 
                  onChange={(e) => setMass(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300">Object Radius (R)</span>
                  <span className="text-rose-400 font-mono">{radius} m</span>
                </div>
                <input 
                  type="range" min="0.2" max="1.0" step="0.1" value={radius} 
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="w-full accent-rose-500"
                />
                <p className="text-xs text-slate-500 mt-2 italic flex items-start">
                  <Info className="w-3 h-3 inline mr-1 flex-shrink-0 mt-0.5" />
                  Pure rolling needs enough static friction: μ at least (k/(1+k)) tan θ. That friction does no work, so mass and radius change the energy but not who wins the race. A thin ring (k = 1) is slowest.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Energy Dashboard */}
        <div className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700 p-6">
          <h2 className="text-xl font-bold text-white mb-6">Real-Time Energy Split Visualization</h2>
          
          <div className="flex flex-col md:flex-row justify-around gap-4">
            {activeShapes.map(key => renderEnergyBar(key))}
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-300 bg-slate-900 p-4 rounded-xl border border-slate-700">
             <div className="flex items-center">
               <div className="w-3 h-3 rounded bg-slate-600 mr-2"></div>
               <strong>Potential Energy:</strong> &nbsp; mgh
             </div>
             <div className="flex items-center">
               <div className="w-3 h-3 rounded bg-cyan-500 mr-2"></div>
               <strong>Translational KE:</strong> &nbsp; ½mv²
             </div>
             <div className="flex items-center">
               <div className="w-3 h-3 rounded bg-orange-500 mr-2"></div>
               <strong>Rotational KE:</strong> &nbsp; ½Iω²
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}