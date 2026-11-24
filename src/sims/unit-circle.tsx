import React, { useState, useEffect, useRef, useMemo } from 'react';

        export default function UnitCircleSimulation() {
          const [theta, setTheta] = useState(45); // Angle in degrees
          const [isPlaying, setIsPlaying] = useState(false);
          const [speed, setSpeed] = useState(1);
          const [showSine, setShowSine] = useState(true);
          const [showCosine, setShowCosine] = useState(true);
          
          const requestRef = useRef<any>(null);

          // Animation Loop
          const animate = () => {
            setTheta((prevTheta) => {
              let nextTheta = prevTheta + speed;
              if (nextTheta >= 360) nextTheta -= 360;
              return nextTheta;
            });
            requestRef.current = requestAnimationFrame(animate);
          };

          useEffect(() => {
            if (isPlaying) {
              requestRef.current = requestAnimationFrame(animate);
            } else {
              cancelAnimationFrame(requestRef.current);
            }
            return () => cancelAnimationFrame(requestRef.current);
          }, [isPlaying, speed]);

          // Mathematical Calculations
          const rad = (theta * Math.PI) / 180;
          const sinVal = Math.sin(rad);
          const cosVal = Math.cos(rad);

          // SVG Coordinate System Setup
          const CX = 180; // Circle Center X
          const CY = 200; // Circle Center Y
          const R = 120;  // Radius
          
          const GX = 360; // Graph Start X
          const GY = 200; // Graph Center Y (X-axis)
          const GW = 360; // Graph Width (1 degree = 1 pixel)

          // Current Point on Circle
          const px = CX + R * cosVal;
          const py = CY - R * sinVal; // Subtract because SVG Y goes down

          // Current Point on Graphs
          const gx_current = GX + theta;
          const gy_sin = GY - R * sinVal;
          const gy_cos = GY - R * cosVal;

          // Pre-calculate full waveform paths for the background tracks
          const { fullSinePath, fullCosinePath } = useMemo(() => {
            let sPath = `M ${GX} ${GY} `;
            let cPath = `M ${GX} ${GY - R} `;
            for (let i = 0; i <= 360; i += 2) {
              const r = (i * Math.PI) / 180;
              sPath += `L ${GX + i} ${GY - R * Math.sin(r)} `;
              cPath += `L ${GX + i} ${GY - R * Math.cos(r)} `;
            }
            return { fullSinePath: sPath, fullCosinePath: cPath };
          }, []);

          // Calculate active waveform paths (from 0 to current theta)
          const { activeSinePath, activeCosinePath } = useMemo(() => {
            if (theta === 0) return { activeSinePath: `M ${GX} ${GY}`, activeCosinePath: `M ${GX} ${GY - R}` };
            
            let sPath = `M ${GX} ${GY} `;
            let cPath = `M ${GX} ${GY - R} `;
            for (let i = 0; i <= theta; i += 2) {
              const r = (i * Math.PI) / 180;
              sPath += `L ${GX + i} ${GY - R * Math.sin(r)} `;
              cPath += `L ${GX + i} ${GY - R * Math.cos(r)} `;
            }
            // Connect to exact current point
            sPath += `L ${gx_current} ${gy_sin}`;
            cPath += `L ${gx_current} ${gy_cos}`;
            
            return { activeSinePath: sPath, activeCosinePath: cPath };
          }, [theta, gx_current, gy_sin, gy_cos]);

          // Helper for fraction radians
          const getRadianFraction = (degrees) => {
            const gcd = (a, b) => b ? gcd(b, a % b) : a;
            const divisor = gcd(Math.round(degrees), 180);
            const num = Math.round(degrees) / divisor;
            const den = 180 / divisor;
            
            if (degrees === 0) return "0";
            if (num === 1 && den === 1) return "π";
            if (den === 1) return `${num}π`;
            if (num === 1) return `π/${den}`;
            return `${num}π/${den}`;
          };

          return (
            <div className="min-h-[36rem] bg-slate-950 text-slate-200 font-sans p-4 md:p-8 flex flex-col items-center">
              
              {/* Header */}
              <div className="max-w-5xl w-full mb-6">
                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Unit Circle Trigonometric Projections</h1>
                <p className="text-slate-400">
                  Visualize exactly how the geometric right triangle rotating around the unit circle mathematically unrolls to create the Sine and Cosine waves in real-time.
                </p>
              </div>

              {/* Main Simulation Engine */}
              <div className="max-w-5xl w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                
                {/* SVG Canvas Container */}
                <div className="w-full relative bg-slate-950 p-4 overflow-x-auto">
                  <svg viewBox="0 0 760 400" className="w-full h-auto drop-shadow-lg">
                    
                    {/* Grid & Axes */}
                    <g stroke="#334155" strokeWidth="1" strokeDasharray="4 4">
                      {/* Circle Axes */}
                      <line x1={CX - R - 20} y1={CY} x2={CX + R + 20} y2={CY} />
                      <line x1={CX} y1={CY - R - 20} x2={CX} y2={CY + R + 20} />
                      {/* Graph Axes */}
                      <line x1={GX} y1={CY} x2={GX + GW + 20} y2={CY} strokeDasharray="none" stroke="#475569" />
                      <line x1={GX} y1={CY - R - 20} x2={GX} y2={CY + R + 20} strokeDasharray="none" stroke="#475569" />
                      
                      {/* Graph Amplitude Guides */}
                      <line x1={GX} y1={CY - R} x2={GX + GW} y2={CY - R} />
                      <line x1={GX} y1={CY + R} x2={GX + GW} y2={CY + R} />
                    </g>

                    {/* Labels */}
                    <g fill="#94a3b8" fontSize="10" fontFamily="monospace">
                      <text x={CX + R + 5} y={CY - 5}>X</text>
                      <text x={CX + 5} y={CY - R - 5}>Y</text>
                      <text x={GX - 15} y={CY - R + 4}> 1</text>
                      <text x={GX - 20} y={CY + R + 4}>-1</text>
                      
                      {/* Degree markers on Graph */}
                      {[90, 180, 270, 360].map(deg => (
                        <g key={deg}>
                          <line x1={GX + deg} y1={CY - 4} x2={GX + deg} y2={CY + 4} stroke="#94a3b8" strokeWidth="2" />
                          <text x={GX + deg} y={CY + 16} textAnchor="middle">{deg}°</text>
                        </g>
                      ))}
                    </g>

                    {/* Unit Circle Background */}
                    <circle cx={CX} cy={CY} r={R} fill="none" stroke="#475569" strokeWidth="2" />

                    {/* --- COSINE RENDERING (Blue/Cyan) --- */}
                    {showCosine && (
                      <g>
                        {/* Graph Background Track */}
                        <path d={fullCosinePath} fill="none" stroke="#0891b2" strokeWidth="2" strokeOpacity="0.3" />
                        {/* Active Graph Track */}
                        <path d={activeCosinePath} fill="none" stroke="#06b6d4" strokeWidth="3" />
                        
                        {/* Cosine Geometry on Circle (Adjacent Side) */}
                        <line x1={CX} y1={CY} x2={px} y2={CY} stroke="#06b6d4" strokeWidth="4" strokeLinecap="round" />
                        
                        {/* Cosine Value on Graph (Vertical Bar linking X-axis to curve to show amplitude) */}
                        <line x1={gx_current} y1={GY} x2={gx_current} y2={gy_cos} stroke="#06b6d4" strokeWidth="4" strokeLinecap="round" />
                        
                        {/* Cosine Dot on Graph */}
                        <circle cx={gx_current} cy={gy_cos} r="4" fill="#06b6d4" />
                      </g>
                    )}

                    {/* --- SINE RENDERING (Red/Rose) --- */}
                    {showSine && (
                      <g>
                        {/* Graph Background Track */}
                        <path d={fullSinePath} fill="none" stroke="#e11d48" strokeWidth="2" strokeOpacity="0.3" />
                        {/* Active Graph Track */}
                        <path d={activeSinePath} fill="none" stroke="#f43f5e" strokeWidth="3" />
                        
                        {/* Sine Geometry on Circle (Opposite Side) */}
                        <line x1={px} y1={CY} x2={px} y2={py} stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
                        
                        {/* Projection Ray (The "Ah-Ha" visual connecting circle to graph) */}
                        <line x1={px} y1={py} x2={gx_current} y2={gy_sin} stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="5 5" />
                        
                        {/* Sine Value on Graph (Vertical Bar) */}
                        <line x1={gx_current} y1={GY} x2={gx_current} y2={gy_sin} stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
                        
                        {/* Sine Dot on Graph */}
                        <circle cx={gx_current} cy={gy_sin} r="4" fill="#f43f5e" />
                      </g>
                    )}

                    {/* Moving Point & Radius on Unit Circle */}
                    <line x1={CX} y1={CY} x2={px} y2={py} stroke="#eab308" strokeWidth="2" />
                    <circle cx={px} cy={py} r="5" fill="#facc15" />
                    <circle cx={CX} cy={CY} r="3" fill="#ffffff" />
                    
                    {/* Angle Arc */}
                    <path 
                      d={`M ${CX + 25} ${CY} A 25 25 0 ${theta > 180 ? 1 : 0} 0 ${CX + 25 * cosVal} ${CY - 25 * sinVal}`} 
                      fill="none" 
                      stroke="#eab308" 
                      strokeWidth="2" 
                    />
                  </svg>
                </div>

                {/* Control Panel & Dashboard */}
                <div className="w-full bg-slate-900 border-t border-slate-800 p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Section 1: Playback & Toggles */}
                  <div className="flex flex-col gap-4">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Engine Controls</h3>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all ${isPlaying ? 'bg-red-500/10 text-red-400 border border-red-500/50 hover:bg-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500/20'}`}
                      >
                        {isPlaying ? 'Pause Simulation' : 'Play Simulation'}
                      </button>
                    </div>
                    
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={showSine} 
                          onChange={(e) => setShowSine(e.target.checked)}
                          className="w-5 h-5 rounded border-slate-600 text-rose-500 bg-slate-800 focus:ring-rose-500 focus:ring-offset-slate-900" 
                        />
                        <span className="text-rose-400 font-medium group-hover:text-rose-300">Show Sine (y)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={showCosine} 
                          onChange={(e) => setShowCosine(e.target.checked)}
                          className="w-5 h-5 rounded border-slate-600 text-cyan-500 bg-slate-800 focus:ring-cyan-500 focus:ring-offset-slate-900" 
                        />
                        <span className="text-cyan-400 font-medium group-hover:text-cyan-300">Show Cosine (x)</span>
                      </label>
                    </div>
                  </div>

                  {/* Section 2: Interactive Sliders */}
                  <div className="flex flex-col gap-4">
                     <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Parameters</h3>
                     
                     <div className="flex flex-col gap-1">
                       <div className="flex justify-between text-sm">
                         <span className="text-slate-300">Angle (θ)</span>
                         <span className="text-yellow-400 font-mono font-bold">{Math.round(theta)}°</span>
                       </div>
                       <input 
                          type="range" 
                          min="0" max="360" step="1"
                          value={theta}
                          onChange={(e) => {
                            setTheta(Number(e.target.value));
                            setIsPlaying(false);
                          }}
                          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                       />
                     </div>

                     <div className="flex flex-col gap-1 mt-2">
                       <div className="flex justify-between text-sm">
                         <span className="text-slate-300">Animation Speed</span>
                         <span className="text-slate-400 font-mono">{speed.toFixed(1)}x</span>
                       </div>
                       <input 
                          type="range" 
                          min="0.5" max="5" step="0.5"
                          value={speed}
                          onChange={(e) => setSpeed(Number(e.target.value))}
                          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-slate-400"
                       />
                     </div>
                  </div>

                  {/* Section 3: Live Mathematics Dashboard */}
                  <div className="flex flex-col gap-4">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Live Analysis</h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex flex-col items-center justify-center">
                        <span className="text-xs text-slate-500 font-medium mb-1">Radians</span>
                        <span className="text-xl font-mono text-yellow-400">{getRadianFraction(theta)}</span>
                      </div>
                      <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex flex-col items-center justify-center">
                        <span className="text-xs text-slate-500 font-medium mb-1">Degrees</span>
                        <span className="text-xl font-mono text-yellow-400">{Math.round(theta)}°</span>
                      </div>
                      
                      <div className="bg-rose-950/20 border border-rose-900/50 rounded-lg p-3 flex flex-col items-center justify-center">
                        <span className="text-xs text-rose-500/70 font-medium mb-1">sin(θ)</span>
                        <span className="text-xl font-mono text-rose-400">
                          {sinVal >= 0 ? '+' : ''}{sinVal.toFixed(2)}
                        </span>
                      </div>
                      <div className="bg-cyan-950/20 border border-cyan-900/50 rounded-lg p-3 flex flex-col items-center justify-center">
                        <span className="text-xs text-cyan-500/70 font-medium mb-1">cos(θ)</span>
                        <span className="text-xl font-mono text-cyan-400">
                          {cosVal >= 0 ? '+' : ''}{cosVal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          );
        }
