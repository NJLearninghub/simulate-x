import React, { useState, useEffect, useMemo } from 'react';

        export default function App() {
            const [shape, setShape] = useState('parabola');
            const [limit, setLimit] = useState(2);
            const [showStrips, setShowStrips] = useState(true);
            
            // Shape Parameters
            const [radius, setRadius] = useState(3);
            const [ellipseA, setEllipseA] = useState(4);
            const [ellipseB, setEllipseB] = useState(2);
            const [parabolaK, setParabolaK] = useState(1);
            
            // Canvas boundaries
            const width = 800;
            const height = 500;
            const scale = 50; // pixels per unit
            const cx = width / 2;
            const cy = height / 2;

            // Mathematical mapping functions
            const mapX = (x) => cx + x * scale;
            const mapY = (y) => cy - y * scale;

            // Generate Path data based on selected shape
            const getCurveData = () => {
                let pts = [];
                let maxDomain = 5;
                let actualLimit = limit;
                let areaValue = 0;
                let formula = "";
                let integralSetup = "";

                if (shape === 'parabola') {
                    // y = kx^2
                    actualLimit = Math.min(Math.max(limit, 0), 4);
                    for (let x = -4; x <= 4; x += 0.05) {
                        pts.push({ x, y: parabolaK * x * x });
                    }
                    areaValue = (parabolaK * Math.pow(actualLimit, 3)) / 3;
                    formula = `A = \\int_{0}^{${actualLimit.toFixed(1)}} ${parabolaK.toFixed(1)}x^2 dx = [\\frac{${parabolaK.toFixed(1)}x^3}{3}]`;
                    integralSetup = "y = kx²";
                } 
                else if (shape === 'circle') {
                    // x^2 + y^2 = r^2 -> y = sqrt(r^2 - x^2)
                    actualLimit = Math.min(Math.max(limit, 0), radius);
                    for (let x = -radius; x <= radius; x += 0.05) {
                        pts.push({ x, y: Math.sqrt(radius * radius - x * x) });
                    }
                    // Exact circle integral from 0 to actualLimit
                    const x = actualLimit;
                    const r = radius;
                    areaValue = 0.5 * (x * Math.sqrt(r * r - x * x) + r * r * Math.asin(x / r));
                    formula = `A = \\int_{0}^{${x.toFixed(1)}} \\sqrt{${(r*r).toFixed(0)} - x^2} dx`;
                    integralSetup = "x² + y² = r²";
                }
                else if (shape === 'ellipse') {
                    // x^2/a^2 + y^2/b^2 = 1 -> y = b * sqrt(1 - (x/a)^2)
                    actualLimit = Math.min(Math.max(limit, 0), ellipseA);
                    for (let x = -ellipseA; x <= ellipseA; x += 0.05) {
                        pts.push({ x, y: ellipseB * Math.sqrt(1 - (x / ellipseA) * (x / ellipseA)) });
                    }
                    const x = actualLimit;
                    const a = ellipseA;
                    const b = ellipseB;
                    areaValue = (b / a) * 0.5 * (x * Math.sqrt(a * a - x * x) + a * a * Math.asin(x / a));
                    formula = `A = \\int_{0}^{${x.toFixed(1)}} ${b.toFixed(1)}\\sqrt{1 - \\frac{x^2}{${(a*a).toFixed(0)}}} dx`;
                    integralSetup = "x²/a² + y²/b² = 1";
                }
                else if (shape === 'trigo') {
                    // y = sin(x)
                    actualLimit = Math.min(Math.max(limit, 0), Math.PI * 2);
                    for (let x = -1; x <= Math.PI * 2 + 1; x += 0.05) {
                        pts.push({ x, y: 2 * Math.sin(x) }); // Scaled amp by 2 for visibility
                    }
                    areaValue = 2 * (1 - Math.cos(actualLimit)); 
                    formula = `A = \\int_{0}^{${actualLimit.toFixed(2)}} 2\\sin(x) dx = [-2\\cos(x)]`;
                    integralSetup = "y = 2sin(x)";
                }

                // Generate SVG Path for the curve
                let dCurve = `M ${mapX(pts[0].x)} ${mapY(pts[0].y)}`;
                pts.forEach(p => {
                    dCurve += ` L ${mapX(p.x)} ${mapY(p.y)}`;
                });

                // Generate Fill Path (Integration Area)
                let fillPts = pts.filter(p => p.x >= 0 && p.x <= actualLimit);
                let dFill = "";
                if (fillPts.length > 0) {
                    dFill = `M ${mapX(0)} ${mapY(0)}`;
                    fillPts.forEach(p => {
                        dFill += ` L ${mapX(p.x)} ${mapY(p.y)}`;
                    });
                    dFill += ` L ${mapX(actualLimit)} ${mapY(0)} Z`;
                }

                return { dCurve, dFill, fillPts, actualLimit, areaValue, formula, integralSetup };
            };

            const data = getCurveData();

            // Generate dx strips
            const renderStrips = () => {
                if (!showStrips || data.actualLimit <= 0) return null;
                const strips = [];
                const n = 15; // Number of strips
                const dx = data.actualLimit / n;
                
                for (let i = 0; i < n; i++) {
                    const x = i * dx;
                    // evaluate y at mid-point or left point
                    let y = 0;
                    if (shape === 'parabola') y = parabolaK * x * x;
                    if (shape === 'circle') y = Math.sqrt(radius * radius - x * x);
                    if (shape === 'ellipse') y = ellipseB * Math.sqrt(1 - (x / ellipseA) * (x / ellipseA));
                    if (shape === 'trigo') y = 2 * Math.sin(x);

                    if (y > 0) {
                        strips.push(
                            <rect 
                                key={i}
                                x={mapX(x)} 
                                y={mapY(y)} 
                                width={dx * scale} 
                                height={y * scale} 
                                fill="rgba(56, 189, 248, 0.4)" 
                                stroke="#38bdf8" 
                                strokeWidth="1"
                            />
                        );
                    } else if (y < 0) {
                        // For sine wave going below x-axis
                         strips.push(
                            <rect 
                                key={i}
                                x={mapX(x)} 
                                y={mapY(0)} 
                                width={dx * scale} 
                                height={-y * scale} 
                                fill="rgba(244, 63, 94, 0.4)" 
                                stroke="#f43f5e" 
                                strokeWidth="1"
                            />
                        );
                    }
                }
                return strips;
            };

            // Grid rendering
            const renderGrid = () => {
                const lines = [];
                for (let i = -10; i <= 10; i++) {
                    // Vertical
                    lines.push(<line key={`v${i}`} x1={mapX(i)} y1={0} x2={mapX(i)} y2={height} stroke="#334155" strokeWidth={i === 0 ? 2 : 0.5} />);
                    // Horizontal
                    lines.push(<line key={`h${i}`} x1={0} y1={mapY(i)} x2={width} y2={mapY(i)} stroke="#334155" strokeWidth={i === 0 ? 2 : 0.5} />);
                }
                return lines;
            };

            // Max slider value based on shape
            const getMaxSlider = () => {
                if (shape === 'circle') return radius;
                if (shape === 'ellipse') return ellipseA;
                if (shape === 'trigo') return Math.PI * 2;
                return 4; // Parabola
            };

            return (
                <div className="flex flex-col h-screen bg-slate-900 text-slate-100 font-sans">
                    {/* Header */}
                    <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center shadow-md z-10">
                        <div>
                            <h1 className="text-2xl font-bold text-sky-400">Application of Integrals</h1>
                            <p className="text-sm text-slate-400">Interactive Visualizer: Area Under the Curve</p>
                        </div>
                        <div className="flex gap-2 bg-slate-900 p-1 rounded-lg border border-slate-700">
                            {['parabola', 'circle', 'ellipse', 'trigo'].map(s => (
                                <button 
                                    key={s}
                                    onClick={() => { setShape(s); setLimit(1); }}
                                    className={`px-4 py-2 rounded capitalize text-sm font-semibold transition-all ${shape === s ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                                >
                                    {s === 'trigo' ? 'Trigonometric' : s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-1 overflow-hidden">
                        {/* Control Panel Sidebar */}
                        <div className="w-80 bg-slate-800 border-r border-slate-700 p-6 flex flex-col gap-6 overflow-y-auto">
                            
                            <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 shadow-inner">
                                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Geometry Controls</h2>
                                
                                {shape === 'circle' && (
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm flex justify-between">Radius (r) <span className="text-sky-400 font-mono">{radius.toFixed(1)}</span></label>
                                        <input type="range" min="1" max="5" step="0.5" value={radius} onChange={(e) => setRadius(parseFloat(e.target.value))} className="w-full slider-thumb accent-sky-500 h-2 bg-slate-700 rounded-lg" />
                                    </div>
                                )}

                                {shape === 'ellipse' && (
                                    <div className="flex flex-col gap-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm flex justify-between">Major Axis (a) <span className="text-sky-400 font-mono">{ellipseA.toFixed(1)}</span></label>
                                            <input type="range" min="2" max="6" step="0.5" value={ellipseA} onChange={(e) => setEllipseA(parseFloat(e.target.value))} className="w-full slider-thumb accent-sky-500 h-2 bg-slate-700 rounded-lg" />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm flex justify-between">Minor Axis (b) <span className="text-sky-400 font-mono">{ellipseB.toFixed(1)}</span></label>
                                            <input type="range" min="1" max="4" step="0.5" value={ellipseB} onChange={(e) => setEllipseB(parseFloat(e.target.value))} className="w-full slider-thumb accent-sky-500 h-2 bg-slate-700 rounded-lg" />
                                        </div>
                                    </div>
                                )}

                                {shape === 'parabola' && (
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm flex justify-between">Coefficient (k) <span className="text-sky-400 font-mono">{parabolaK.toFixed(1)}</span></label>
                                        <input type="range" min="0.2" max="2" step="0.2" value={parabolaK} onChange={(e) => setParabolaK(parseFloat(e.target.value))} className="w-full slider-thumb accent-sky-500 h-2 bg-slate-700 rounded-lg" />
                                    </div>
                                )}

                                {shape === 'trigo' && (
                                    <div className="text-sm text-slate-400 italic">
                                        Standard Sine Wave: <span className="text-white math-font">y = 2sin(x)</span>
                                    </div>
                                )}
                            </div>

                            <div className="bg-sky-950 p-4 rounded-xl border border-sky-800 shadow-inner">
                                <h2 className="text-sm font-bold text-sky-400 uppercase tracking-wider mb-4">Integration Sweep</h2>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm flex justify-between text-slate-200">
                                        Upper Limit (<span className="math-font">b</span>)
                                        <span className="text-emerald-400 font-mono font-bold">x = {data.actualLimit.toFixed(2)}</span>
                                    </label>
                                    <input type="range" min="0" max={getMaxSlider()} step="0.05" value={limit} onChange={(e) => setLimit(parseFloat(e.target.value))} className="w-full slider-thumb accent-emerald-500 h-2 bg-slate-700 rounded-lg" />
                                </div>
                                <div className="mt-4 pt-4 border-t border-sky-800 flex items-center justify-between">
                                    <span className="text-sm text-slate-300">Show <span className="math-font">y&middot;dx</span> Strips</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                      <input type="checkbox" checked={showStrips} onChange={(e) => setShowStrips(e.target.checked)} className="sr-only peer" />
                                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                    </label>
                                </div>
                            </div>

                            {/* Mathematical Result Dashboard */}
                            <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 flex-1 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                                    <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M4 22V2c0 0 4-1 4 4s-4 6-4 6 4 1 4 6-4 5-4 5z"/></svg>
                                </div>
                                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Live Calculus</h2>
                                
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-xs text-slate-500 mb-1">Equation of Curve</div>
                                        <div className="text-lg text-white math-font bg-slate-800 py-2 px-3 rounded text-center border border-slate-700">
                                            {data.integralSetup}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 mb-1">Definite Integral Setup</div>
                                        <div className="text-sm text-white math-font bg-slate-800 py-3 px-3 rounded flex items-center justify-center border border-slate-700 break-all text-center">
                                            {data.formula}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 mb-1">Calculated Area</div>
                                        <div className="text-3xl font-bold text-emerald-400 bg-emerald-950/30 py-3 px-3 rounded text-center border border-emerald-900/50 flex justify-center items-baseline gap-2">
                                            {data.areaValue.toFixed(3)} <span className="text-sm font-normal text-emerald-600">sq units</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Main Graph Canvas */}
                        <div className="flex-1 relative bg-slate-950 flex items-center justify-center overflow-hidden">
                            <svg width={width} height={height} className="w-full h-full drop-shadow-2xl">
                                {/* Grid & Axes */}
                                {renderGrid()}
                                
                                {/* Integration Fill Area (Solid) */}
                                {!showStrips && data.dFill && (
                                    <path d={data.dFill} fill="rgba(16, 185, 129, 0.2)" stroke="none" />
                                )}

                                {/* Integration Strips (dx) */}
                                {showStrips && renderStrips()}

                                {/* The Curve itself */}
                                <path d={data.dCurve} fill="none" stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" />
                                
                                {/* Vertical Integration Boundary Line */}
                                {data.actualLimit > 0 && (
                                    <line 
                                        x1={mapX(data.actualLimit)} 
                                        y1={mapY(0)} 
                                        x2={mapX(data.actualLimit)} 
                                        y2={shape === 'trigo' ? mapY(2 * Math.sin(data.actualLimit)) : 
                                            shape === 'parabola' ? mapY(parabolaK * data.actualLimit * data.actualLimit) :
                                            shape === 'ellipse' ? mapY(ellipseB * Math.sqrt(1 - (data.actualLimit / ellipseA) * (data.actualLimit / ellipseA))) :
                                            mapY(Math.sqrt(radius * radius - data.actualLimit * data.actualLimit))} 
                                        stroke="#10b981" 
                                        strokeWidth="2" 
                                        strokeDasharray="4 4"
                                    />
                                )}
                                
                                {/* Sweeper Dot */}
                                {data.actualLimit > 0 && (
                                    <circle 
                                        cx={mapX(data.actualLimit)} 
                                        cy={shape === 'trigo' ? mapY(2 * Math.sin(data.actualLimit)) : 
                                            shape === 'parabola' ? mapY(parabolaK * data.actualLimit * data.actualLimit) :
                                            shape === 'ellipse' ? mapY(ellipseB * Math.sqrt(1 - (data.actualLimit / ellipseA) * (data.actualLimit / ellipseA))) :
                                            mapY(Math.sqrt(radius * radius - data.actualLimit * data.actualLimit))} 
                                        r="5" 
                                        fill="#10b981" 
                                        className="animate-pulse"
                                    />
                                )}
                                
                                {/* Axis Labels */}
                                <text x={width - 20} y={cy + 20} fill="#64748b" fontSize="14" fontWeight="bold">X</text>
                                <text x={cx + 10} y={20} fill="#64748b" fontSize="14" fontWeight="bold">Y</text>
                                <text x={cx - 15} y={cy + 15} fill="#64748b" fontSize="12">0</text>
                            </svg>

                            {/* "Ah-Ha" Educational Tooltip */}
                            <div className="absolute bottom-6 bg-slate-900/80 backdrop-blur border border-slate-700 text-slate-300 p-4 rounded-xl max-w-2xl text-sm shadow-2xl pointer-events-none">
                                <p>
                                    <strong className="text-sky-400">🧠 The "Ah-Ha!" Moment: </strong> 
                                    {showStrips ? 
                                        <span>Notice the vertical <span className="text-emerald-400 font-mono">dx</span> strips. Integration doesn't magically calculate area—it simply adds up the areas of infinite, paper-thin rectangles (<span className="math-font">y &times; dx</span>) from the origin to your boundary line!</span> 
                                        : 
                                        <span>You are sweeping the upper limit <span className="math-font">b</span> across the curve. The continuous green shaded region is the exact evaluation of the definite integral <span className="math-font">\int f(x) dx</span> calculated above.</span>
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        };
