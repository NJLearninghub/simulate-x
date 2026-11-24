import React, { useState, useEffect, useRef, useMemo } from 'react';

        export default function App() {
            // Vector components
            const [vx, setVx] = useState(5);
            const [vy, setVy] = useState(6);
            const [vz, setVz] = useState(4);

            // Camera controls
            const [orbit, setOrbit] = useState(45); // Y-axis rotation (degrees)
            const [tilt, setTilt] = useState(30);   // X-axis rotation (degrees)
            const [isDragging, setIsDragging] = useState(false);
            const dragStart = useRef({ x: 0, y: 0, orbit: 0, tilt: 0 });

            // Mathematical Calculations
            const magnitude = Math.sqrt(vx * vx + vy * vy + vz * vz);
            const magDisplay = magnitude.toFixed(2);
            
            // Handle divide by zero if vector is (0,0,0)
            const safeMag = magnitude === 0 ? 1 : magnitude;
            const cosAlpha = vx / safeMag;
            const cosBeta = vy / safeMag;
            const cosGamma = vz / safeMag;
            
            const alpha = (Math.acos(cosAlpha) * 180 / Math.PI).toFixed(1);
            const beta = (Math.acos(cosBeta) * 180 / Math.PI).toFixed(1);
            const gamma = (Math.acos(cosGamma) * 180 / Math.PI).toFixed(1);

            // 3D Projection Engine
            const project = (x, y, z) => {
                const scale = 20; // Zoom factor
                const radOrbit = orbit * Math.PI / 180;
                const radTilt = tilt * Math.PI / 180;

                // 1. Rotate around Y axis (Orbit)
                const x1 = x * Math.cos(radOrbit) - z * Math.sin(radOrbit);
                const z1 = x * Math.sin(radOrbit) + z * Math.cos(radOrbit);
                const y1 = y;

                // 2. Rotate around X axis (Tilt)
                const x2 = x1;
                const y2 = y1 * Math.cos(radTilt) - z1 * Math.sin(radTilt);
                const z2 = y1 * Math.sin(radTilt) + z1 * Math.cos(radTilt);

                // Map to 2D screen (Center is 0,0)
                return {
                    cx: 250 + x2 * scale, 
                    cy: 250 - y2 * scale, // SVG Y is inverted
                    z: z2 // Keep depth for potential sorting
                };
            };

            // Touch & Mouse Drag Handlers for Camera
            const handlePointerDown = (e) => {
                setIsDragging(true);
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                const clientY = e.touches ? e.touches[0].clientY : e.clientY;
                dragStart.current = { x: clientX, y: clientY, orbit, tilt };
            };

            const handlePointerMove = (e) => {
                if (!isDragging) return;
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                const clientY = e.touches ? e.touches[0].clientY : e.clientY;
                const dx = clientX - dragStart.current.x;
                const dy = clientY - dragStart.current.y;
                
                setOrbit(dragStart.current.orbit + dx * 0.5);
                setTilt(Math.max(-89, Math.min(89, dragStart.current.tilt + dy * 0.5))); // Clamp tilt
            };

            const handlePointerUp = () => {
                setIsDragging(false);
            };

            useEffect(() => {
                window.addEventListener('mouseup', handlePointerUp);
                window.addEventListener('touchend', handlePointerUp);
                return () => {
                    window.removeEventListener('mouseup', handlePointerUp);
                    window.removeEventListener('touchend', handlePointerUp);
                }
            }, []);

            // Generate projected points
            const origin = project(0, 0, 0);
            const ptX = project(vx, 0, 0);
            const ptY = project(0, vy, 0);
            const ptZ = project(0, 0, vz);
            const ptXY = project(vx, vy, 0);
            const ptXZ = project(vx, 0, vz);
            const ptYZ = project(0, vy, vz);
            const ptV = project(vx, vy, vz);

            // Axis endpoints
            const axX = project(12, 0, 0);
            const axY = project(0, 12, 0);
            const axZ = project(0, 0, 12);
            
            const axNX = project(-12, 0, 0);
            const axNY = project(0, -12, 0);
            const axNZ = project(0, 0, -12);

            return (
                <div className="flex flex-col md:flex-row min-h-[36rem] w-full bg-slate-950 font-sans"
                     onMouseMove={handlePointerMove}
                     onTouchMove={handlePointerMove}>
                    
                    {/* Left Panel - Controls & Math */}
                    <div className="w-full md:w-1/3 bg-slate-900 border-r border-slate-700 p-6 flex flex-col gap-6 overflow-y-auto">
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-1">3D Vector Resolution</h1>
                            <p className="text-sm text-slate-400">Interactive Spatial Geometry Simulator</p>
                        </div>

                        {/* Sliders */}
                        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-4">
                            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Components</h2>
                            
                            {/* X Slider */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="text-red-400 font-bold">X Component (<span className="math-font">V_x</span>)</span>
                                    <span className="text-red-300">{vx} i</span>
                                </div>
                                <input type="range" min="-10" max="10" value={vx} onChange={(e) => setVx(parseInt(e.target.value))}
                                       className="w-full accent-red-500" />
                            </div>
                            
                            {/* Y Slider */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="text-green-400 font-bold">Y Component (<span className="math-font">V_y</span>)</span>
                                    <span className="text-green-300">{vy} j</span>
                                </div>
                                <input type="range" min="-10" max="10" value={vy} onChange={(e) => setVy(parseInt(e.target.value))}
                                       className="w-full accent-green-500" />
                            </div>

                            {/* Z Slider */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="text-blue-400 font-bold">Z Component (<span className="math-font">V_z</span>)</span>
                                    <span className="text-blue-300">{vz} k</span>
                                </div>
                                <input type="range" min="-10" max="10" value={vz} onChange={(e) => setVz(parseInt(e.target.value))}
                                       className="w-full accent-blue-500" />
                            </div>
                        </div>

                        {/* Live Math Dashboard */}
                        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-5">
                            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Live Mathematics</h2>
                            
                            {/* Vector Notation */}
                            <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 text-center">
                                <div className="text-slate-400 text-xs mb-1">Vector Notation</div>
                                <div className="text-lg">
                                    <span className="font-bold text-yellow-400">V</span> = 
                                    <span className="text-red-400"> {vx}î </span>
                                    {vy >= 0 ? '+' : '-'} <span className="text-green-400"> {Math.abs(vy)}ĵ </span>
                                    {vz >= 0 ? '+' : '-'} <span className="text-blue-400"> {Math.abs(vz)}k̂ </span>
                                </div>
                            </div>

                            {/* Magnitude */}
                            <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                                <div className="text-slate-400 text-xs mb-2">Magnitude |V| = √(<span className="text-red-400">x²</span> + <span className="text-green-400">y²</span> + <span className="text-blue-400">z²</span>)</div>
                                <div className="text-md font-mono text-slate-300">
                                    |V| = √({vx * vx} + {vy * vy} + {vz * vz})<br/>
                                    |V| = <span className="text-2xl font-bold text-yellow-400">{magDisplay}</span>
                                </div>
                            </div>

                            {/* Direction Cosines */}
                            <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 space-y-2">
                                <div className="text-slate-400 text-xs mb-1">Direction Angles (with Axes)</div>
                                
                                <div className="flex items-center justify-between">
                                    <span className="text-red-400 text-sm">X-Axis (α):</span>
                                    <span className="font-mono text-white text-sm">cos⁻¹({vx}/{magDisplay}) = <span className="font-bold text-red-300">{magnitude===0 ? '-' : alpha}°</span></span>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <span className="text-green-400 text-sm">Y-Axis (β):</span>
                                    <span className="font-mono text-white text-sm">cos⁻¹({vy}/{magDisplay}) = <span className="font-bold text-green-300">{magnitude===0 ? '-' : beta}°</span></span>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <span className="text-blue-400 text-sm">Z-Axis (γ):</span>
                                    <span className="font-mono text-white text-sm">cos⁻¹({vz}/{magDisplay}) = <span className="font-bold text-blue-300">{magnitude===0 ? '-' : gamma}°</span></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - 3D Canvas */}
                    <div className="w-full md:w-2/3 relative flex items-center justify-center bg-slate-950 overflow-hidden">
                        
                        {/* Drag Instructions */}
                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-slate-800/80 backdrop-blur px-4 py-2 rounded-full border border-slate-700 text-sm text-slate-300 pointer-events-none flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path></svg>
                            Drag to rotate 3D Space
                        </div>

                        <svg 
                            width="100%" 
                            height="100%" 
                            viewBox="0 0 500 500" 
                            className={`${isDragging ? 'grabbing-cursor' : 'grab-cursor'} touch-none`}
                            onMouseDown={handlePointerDown}
                            onTouchStart={handlePointerDown}
                        >
                            {/* Negative Axes (Faded) */}
                            <line x1={origin.cx} y1={origin.cy} x2={axNX.cx} y2={axNX.cy} stroke="#ef4444" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="4,4" />
                            <line x1={origin.cx} y1={origin.cy} x2={axNY.cx} y2={axNY.cy} stroke="#22c55e" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="4,4" />
                            <line x1={origin.cx} y1={origin.cy} x2={axNZ.cx} y2={axNZ.cy} stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="4,4" />

                            {/* Positive Axes */}
                            <line x1={origin.cx} y1={origin.cy} x2={axX.cx} y2={axX.cy} stroke="#ef4444" strokeWidth="2" />
                            <line x1={origin.cx} y1={origin.cy} x2={axY.cx} y2={axY.cy} stroke="#22c55e" strokeWidth="2" />
                            <line x1={origin.cx} y1={origin.cy} x2={axZ.cx} y2={axZ.cy} stroke="#3b82f6" strokeWidth="2" />
                            
                            {/* Axis Labels */}
                            <text x={axX.cx + 10} y={axX.cy} fill="#ef4444" fontSize="14" fontWeight="bold">X</text>
                            <text x={axY.cx} y={axY.cy - 10} fill="#22c55e" fontSize="14" fontWeight="bold">Y</text>
                            <text x={axZ.cx - 10} y={axZ.cy - 10} fill="#3b82f6" fontSize="14" fontWeight="bold">Z</text>

                            {magnitude > 0 && (
                                <g>
                                    {/* 3D Cuboid Projections (Dashed lines showing resolution) */}
                                    {/* Bottom plane (XZ) */}
                                    <line x1={ptX.cx} y1={ptX.cy} x2={ptXZ.cx} y2={ptXZ.cy} stroke="#64748b" strokeWidth="1.5" strokeDasharray="4,4" />
                                    <line x1={ptZ.cx} y1={ptZ.cy} x2={ptXZ.cx} y2={ptXZ.cy} stroke="#64748b" strokeWidth="1.5" strokeDasharray="4,4" />
                                    <line x1={origin.cx} y1={origin.cy} x2={ptXZ.cx} y2={ptXZ.cy} stroke="#fbbf24" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="2,4" />

                                    {/* Vertical pillars to top plane */}
                                    <line x1={ptX.cx} y1={ptX.cy} x2={ptXY.cx} y2={ptXY.cy} stroke="#64748b" strokeWidth="1.5" strokeDasharray="4,4" />
                                    <line x1={ptZ.cx} y1={ptZ.cy} x2={ptYZ.cx} y2={ptYZ.cy} stroke="#64748b" strokeWidth="1.5" strokeDasharray="4,4" />
                                    <line x1={ptXZ.cx} y1={ptXZ.cy} x2={ptV.cx} y2={ptV.cy} stroke="#64748b" strokeWidth="1.5" strokeDasharray="4,4" />
                                    
                                    {/* Top plane connections */}
                                    <line x1={ptY.cx} y1={ptY.cy} x2={ptXY.cx} y2={ptXY.cy} stroke="#64748b" strokeWidth="1.5" strokeDasharray="4,4" />
                                    <line x1={ptY.cx} y1={ptY.cy} x2={ptYZ.cx} y2={ptYZ.cy} stroke="#64748b" strokeWidth="1.5" strokeDasharray="4,4" />
                                    <line x1={ptXY.cx} y1={ptXY.cy} x2={ptV.cx} y2={ptV.cy} stroke="#64748b" strokeWidth="1.5" strokeDasharray="4,4" />
                                    <line x1={ptYZ.cx} y1={ptYZ.cy} x2={ptV.cx} y2={ptV.cy} stroke="#64748b" strokeWidth="1.5" strokeDasharray="4,4" />

                                    {/* Core Component Vectors (Thick along axes) */}
                                    <line x1={origin.cx} y1={origin.cy} x2={ptX.cx} y2={ptX.cy} stroke="#f87171" strokeWidth="4" />
                                    <line x1={origin.cx} y1={origin.cy} x2={ptY.cx} y2={ptY.cy} stroke="#4ade80" strokeWidth="4" />
                                    <line x1={origin.cx} y1={origin.cy} x2={ptZ.cx} y2={ptZ.cy} stroke="#60a5fa" strokeWidth="4" />

                                    {/* Nodes for component tips */}
                                    <circle cx={ptX.cx} cy={ptX.cy} r="4" fill="#ef4444" />
                                    <circle cx={ptY.cx} cy={ptY.cy} r="4" fill="#22c55e" />
                                    <circle cx={ptZ.cx} cy={ptZ.cy} r="4" fill="#3b82f6" />

                                    {/* The MAIN Vector V */}
                                    <line x1={origin.cx} y1={origin.cy} x2={ptV.cx} y2={ptV.cy} stroke="#facc15" strokeWidth="5" />
                                    
                                    {/* Arrowhead for Main Vector */}
                                    <circle cx={ptV.cx} cy={ptV.cy} r="5" fill="#facc15" />
                                    
                                    {/* Label for Main Vector */}
                                    <text x={ptV.cx + 10} y={ptV.cy - 10} fill="#facc15" fontSize="16" fontWeight="bold">V</text>
                                </g>
                            )}
                            
                            {/* Origin dot */}
                            <circle cx={origin.cx} cy={origin.cy} r="5" fill="white" />
                        </svg>
                        
                        {/* Camera Angle Dashboard (Bottom Right) */}
                        <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur p-3 rounded-lg border border-slate-700 text-xs text-slate-400 flex flex-col gap-1 text-right pointer-events-none">
                            <div>Camera Orbit (Y): <span className="text-white font-mono">{orbit.toFixed(0)}°</span></div>
                            <div>Camera Tilt (X): <span className="text-white font-mono">{tilt.toFixed(0)}°</span></div>
                        </div>
                    </div>
                </div>
            );
        };
