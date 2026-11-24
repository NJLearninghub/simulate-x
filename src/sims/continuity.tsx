import React, { useState, useEffect, useRef, useMemo } from 'react';

        // --- Math Engine & Function Definitions ---
        const functions = [
            {
                id: 'smooth',
                name: "Smooth Curve (Polynomial)",
                equation: "f(x) = 0.5x² - 2",
                desc: "A standard parabola. Notice how the left and right tangents perfectly align as they approach the center.",
                f: (x) => 0.5 * x * x - 2,
                lhl: (c) => 0.5 * c * c - 2,
                rhl: (c) => 0.5 * c * c - 2,
                fc: (c) => 0.5 * c * c - 2,
                lhd: (c) => c,
                rhd: (c) => c,
                defC: 0
            },
            {
                id: 'corner',
                name: "Sharp Corner (Modulus)",
                equation: "f(x) = |x - 1|",
                desc: "Continuous, but NOT differentiable at the corner. The Left and Right slopes refuse to match at x = 1!",
                f: (x) => Math.abs(x - 1),
                lhl: (c) => Math.abs(c - 1),
                rhl: (c) => Math.abs(c - 1),
                fc: (c) => Math.abs(c - 1),
                lhd: (c) => c <= 1 ? -1 : 1,
                rhd: (c) => c >= 1 ? 1 : -1,
                defC: 1
            },
            {
                id: 'jump',
                name: "Jump Discontinuity",
                equation: "f(x) = |x| / x (with f(0)=1)",
                desc: "The classic jump. The Left Hand Limit and Right Hand Limit aim for completely different destinations.",
                f: (x) => x === 0 ? 1 : (x > 0 ? 1 : -1),
                lhl: (c) => c <= 0 ? -1 : 1,
                rhl: (c) => c >= 0 ? 1 : -1,
                fc: (c) => c === 0 ? 1 : (c > 0 ? 1 : -1),
                lhd: (c) => c === 0 ? Infinity : 0,
                rhd: (c) => c === 0 ? Infinity : 0,
                defC: 0
            },
            {
                id: 'hole',
                name: "Removable Discontinuity",
                equation: "f(x) = x²/2 − 1 (if x≠2), 4 (if x=2)",
                desc: "A hole in the graph. The limits agree with each other, but they totally miss the actual defined point f(c)!",
                f: (x) => x === 2 ? 4 : (x*x)/2 - 1,
                lhl: (c) => (c*c)/2 - 1,
                rhl: (c) => (c*c)/2 - 1,
                fc: (c) => c === 2 ? 4 : (c*c)/2 - 1,
                lhd: (c) => c === 2 ? Infinity : c,
                rhd: (c) => c === 2 ? Infinity : c,
                defC: 2
            }
        ];

        export default function App() {
            const [funcIdx, setFuncIdx] = useState(0);
            const [c, setC] = useState(0); // Target point x=c
            const [h, setH] = useState(1.5); // Proximity (delta)
            
            const activeFunc = functions[funcIdx];

            // Auto-snap 'c' to the interesting point when changing functions
            useEffect(() => {
                setC(activeFunc.defC);
                setH(1.5);
            }, [funcIdx]);

            // --- SVG Coordinate Mapping ---
            const width = 800;
            const height = 400;
            const xMin = -4, xMax = 4;
            const yMin = -3, yMax = 5;

            const mapX = (x) => ((x - xMin) / (xMax - xMin)) * width;
            const mapY = (y) => height - ((y - yMin) / (yMax - yMin)) * height;

            // Generate Path for the Function
            const pathData = useMemo(() => {
                let d = "";
                let prevY = null;
                for (let px = 0; px <= width; px += 2) {
                    const x = xMin + (px / width) * (xMax - xMin);
                    const y = activeFunc.f(x);
                    
                    // Break path if there's a huge vertical jump (Jump discontinuity)
                    if (prevY !== null && Math.abs(y - prevY) > 1.5) {
                        d += ` M ${px} ${mapY(y)}`;
                    } else if (px === 0) {
                        d += `M ${px} ${mapY(y)}`;
                    } else {
                        d += ` L ${px} ${mapY(y)}`;
                    }
                    prevY = y;
                }
                return d;
            }, [activeFunc]);

            // Math State Calculations
            const xLeft = c - h;
            const xRight = c + h;
            const yLeft = activeFunc.f(xLeft);
            const yRight = activeFunc.f(xRight);
            
            // True Mathematical Limits & Values at exactly 'c'
            const exactLHL = activeFunc.lhl(c);
            const exactRHL = activeFunc.rhl(c);
            const exactFC = activeFunc.fc(c);
            const exactLHD = activeFunc.lhd(c);
            const exactRHD = activeFunc.rhd(c);

            // Boolean Checks
            const limitExists = exactLHL === exactRHL;
            const isContinuous = limitExists && exactLHL === exactFC;
            const isDifferentiable = isContinuous && exactLHD === exactRHD && exactLHD !== Infinity;

            // Tangent Line Math (for visualizing slopes at xLeft and xRight)
            const drawTangent = (x, y, slope) => {
                if (slope === Infinity) return null;
                const lineLength = 1.5; // in graph units
                const x1 = x - lineLength;
                const y1 = y - slope * lineLength;
                const x2 = x + lineLength;
                const y2 = y + slope * lineLength;
                return { x1: mapX(x1), y1: mapY(y1), x2: mapX(x2), y2: mapY(y2) };
            };

            const leftTangent = drawTangent(xLeft, yLeft, activeFunc.lhd(xLeft));
            const rightTangent = drawTangent(xRight, yRight, activeFunc.rhd(xRight));

            // UI Helpers
            const formatNum = (num) => {
                if (num === Infinity) return "Undef.";
                return Number.isInteger(num) ? num : num.toFixed(2);
            };

            return (
                <div className="flex flex-col md:flex-row h-screen bg-slate-900 text-slate-200 overflow-hidden">
                    
                    {/* Left Control Panel */}
                    <div className="w-full md:w-1/3 bg-slate-800 p-6 flex flex-col shadow-xl z-10 border-r border-slate-700 overflow-y-auto hide-scrollbar">
                        <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Calculus Visualizer</h1>
                        <p className="text-slate-400 text-sm mb-6">Explore the geometric meaning of Continuity and Differentiability.</p>
                        
                        <div className="space-y-4 mb-8">
                            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Select Function</h2>
                            {functions.map((fn, idx) => (
                                <button 
                                    key={fn.id}
                                    onClick={() => setFuncIdx(idx)}
                                    className={`w-full text-left p-4 rounded-xl border transition-all ${funcIdx === idx ? 'bg-sky-900/40 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.2)]' : 'bg-slate-800 border-slate-700 hover:border-slate-500'}`}
                                >
                                    <div className="font-bold text-white">{fn.name}</div>
                                    <div className="font-mono text-sky-300 text-sm mt-1">{fn.equation}</div>
                                </button>
                            ))}
                        </div>

                        <div className="p-4 bg-slate-900 rounded-xl border border-slate-700 mb-6">
                            <p className="text-sm text-slate-300 leading-relaxed italic border-l-4 border-sky-500 pl-3">
                                "{activeFunc.desc}"
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-bold text-white">Target Point (c)</label>
                                    <span className="font-mono text-sky-400">x = {c.toFixed(1)}</span>
                                </div>
                                <input 
                                    type="range" min="-2" max="2" step="0.5" 
                                    value={c} onChange={(e) => setC(parseFloat(e.target.value))}
                                    className="slider-custom"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-bold text-white">Proximity Limit (h → 0)</label>
                                    <span className="font-mono text-fuchsia-400">h = {h.toFixed(2)}</span>
                                </div>
                                <input 
                                    type="range" min="0.01" max="2" step="0.01" 
                                    value={h} onChange={(e) => setH(parseFloat(e.target.value))}
                                    className="slider-custom"
                                    style={{ background: `linear-gradient(to right, #e879f9 0%, #334155 ${h/2 * 100}%, #334155 100%)`}}
                                />
                                <p className="text-xs text-slate-500 mt-2">Drag to the left to approach the target point c.</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Canvas & Dashboard */}
                    <div className="w-full md:w-2/3 flex flex-col relative bg-[#0B1120]">
                        
                        {/* SVG Graphing Engine */}
                        <div className="flex-grow relative overflow-hidden">
                            {/* Grid Background */}
                            <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                                {/* Axes and Grid */}
                                {Array.from({length: 9}).map((_, i) => (
                                    <g key={`grid-v-${i}`}>
                                        <line x1={mapX(i - 4)} y1="0" x2={mapX(i - 4)} y2={height} stroke="#1e293b" strokeWidth="1" />
                                        <text x={mapX(i - 4) + 4} y={mapY(0) + 14} fill="#475569" fontSize="10">{i - 4}</text>
                                    </g>
                                ))}
                                {Array.from({length: 9}).map((_, i) => (
                                    <line key={`grid-h-${i}`} x1="0" y1={mapY(i - 3)} x2={width} y2={mapY(i - 3)} stroke="#1e293b" strokeWidth="1" />
                                ))}
                                
                                <line x1="0" y1={mapY(0)} x2={width} y2={mapY(0)} stroke="#475569" strokeWidth="2" />
                                <line x1={mapX(0)} y1="0" x2={mapX(0)} y2={height} stroke="#475569" strokeWidth="2" />

                                {/* Main Function Curve */}
                                <path d={pathData} fill="none" stroke="#e2e8f0" strokeWidth="3" />

                                {/* Target Target Line */}
                                <line x1={mapX(c)} y1={0} x2={mapX(c)} y2={height} stroke="#38bdf8" strokeWidth="1" strokeDasharray="5,5" opacity="0.4" />
                                
                                {/* Hole / Point at C */}
                                {activeFunc.id === 'hole' && c === 2 && (
                                    <circle cx={mapX(2)} cy={mapY(1)} r="5" fill="#0B1120" stroke="#e2e8f0" strokeWidth="2" />
                                )}
                                <circle cx={mapX(c)} cy={mapY(exactFC)} r="6" fill="#38bdf8" />

                                {/* --- Left Approach (Orange) --- */}
                                <line x1={mapX(xLeft)} y1={mapY(0)} x2={mapX(xLeft)} y2={mapY(yLeft)} stroke="#fb923c" strokeWidth="1" strokeDasharray="4,4" />
                                {leftTangent && (
                                    <line x1={leftTangent.x1} y1={leftTangent.y1} x2={leftTangent.x2} y2={leftTangent.y2} stroke="#fb923c" strokeWidth="2" strokeDasharray="6,4" opacity="0.7" />
                                )}
                                <circle cx={mapX(xLeft)} cy={mapY(yLeft)} r="5" fill="#fb923c" />

                                {/* --- Right Approach (Fuchsia) --- */}
                                <line x1={mapX(xRight)} y1={mapY(0)} x2={mapX(xRight)} y2={mapY(yRight)} stroke="#e879f9" strokeWidth="1" strokeDasharray="4,4" />
                                {rightTangent && (
                                    <line x1={rightTangent.x1} y1={rightTangent.y1} x2={rightTangent.x2} y2={rightTangent.y2} stroke="#e879f9" strokeWidth="2" strokeDasharray="6,4" opacity="0.7" />
                                )}
                                <circle cx={mapX(xRight)} cy={mapY(yRight)} r="5" fill="#e879f9" />

                                {/* Connecting animated vectors */}
                                {h > 0.05 && (
                                    <>
                                        <path d={`M ${mapX(xLeft)} ${mapY(yLeft)} Q ${mapX(c)} ${mapY(yLeft)} ${mapX(c)-10} ${mapY(exactLHL)}`} fill="none" stroke="#fb923c" strokeWidth="2" markerEnd="url(#arrow-orange)" opacity="0.5"/>
                                        <path d={`M ${mapX(xRight)} ${mapY(yRight)} Q ${mapX(c)} ${mapY(yRight)} ${mapX(c)+10} ${mapY(exactRHL)}`} fill="none" stroke="#e879f9" strokeWidth="2" markerEnd="url(#arrow-fuchsia)" opacity="0.5"/>
                                    </>
                                )}

                                {/* SVG Defs for Arrows */}
                                <defs>
                                    <marker id="arrow-orange" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#fb923c" />
                                    </marker>
                                    <marker id="arrow-fuchsia" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#e879f9" />
                                    </marker>
                                </defs>
                            </svg>
                            
                            {/* Visual Proximity Indicators */}
                            <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur border border-slate-700 p-3 rounded-lg shadow-lg">
                                <div className="flex items-center space-x-2 mb-1">
                                    <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                                    <span className="text-sm font-mono text-slate-300">Left Approach: {formatNum(yLeft)}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 rounded-full bg-fuchsia-400"></div>
                                    <span className="text-sm font-mono text-slate-300">Right Approach: {formatNum(yRight)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Telemetry Dashboard */}
                        <div className="h-64 bg-slate-800 border-t border-slate-700 p-4 flex flex-col sm:flex-row gap-4">
                            
                            {/* Limits & Continuity Panel */}
                            <div className="flex-1 bg-slate-900 rounded-xl border border-slate-700 p-4 flex flex-col justify-between">
                                <div className="text-sm font-bold text-slate-400 uppercase mb-3">Continuity Analysis</div>
                                <div className="grid grid-cols-3 gap-2 text-center mb-4">
                                    <div className="bg-slate-800 p-2 rounded-lg border border-orange-900/50">
                                        <div className="text-xs text-orange-400 mb-1">LHL (x → c⁻)</div>
                                        <div className="text-xl font-mono text-white">{formatNum(exactLHL)}</div>
                                    </div>
                                    <div className="bg-slate-800 p-2 rounded-lg border border-sky-900/50">
                                        <div className="text-xs text-sky-400 mb-1">f(c)</div>
                                        <div className="text-xl font-mono text-white">{formatNum(exactFC)}</div>
                                    </div>
                                    <div className="bg-slate-800 p-2 rounded-lg border border-fuchsia-900/50">
                                        <div className="text-xs text-fuchsia-400 mb-1">RHL (x → c⁺)</div>
                                        <div className="text-xl font-mono text-white">{formatNum(exactRHL)}</div>
                                    </div>
                                </div>
                                <div className={`py-2 px-4 rounded-lg flex items-center justify-between font-bold border ${isContinuous ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50' : 'bg-rose-900/30 text-rose-400 border-rose-800/50'}`}>
                                    <span>Continuous at x = {c}?</span>
                                    <span className="flex items-center gap-2">
                                        {isContinuous ? 'YES ( LHL = RHL = f(c) )' : 'NO'}
                                        {isContinuous ? 
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> : 
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                        }
                                    </span>
                                </div>
                            </div>

                            {/* Derivatives Panel */}
                            <div className="flex-1 bg-slate-900 rounded-xl border border-slate-700 p-4 flex flex-col justify-between">
                                <div className="text-sm font-bold text-slate-400 uppercase mb-3">Differentiability Analysis</div>
                                <div className="grid grid-cols-2 gap-2 text-center mb-4">
                                    <div className="bg-slate-800 p-2 rounded-lg border border-orange-900/50">
                                        <div className="text-xs text-orange-400 mb-1">Left Slope (LHD)</div>
                                        <div className="text-xl font-mono text-white">{formatNum(exactLHD)}</div>
                                    </div>
                                    <div className="bg-slate-800 p-2 rounded-lg border border-fuchsia-900/50">
                                        <div className="text-xs text-fuchsia-400 mb-1">Right Slope (RHD)</div>
                                        <div className="text-xl font-mono text-white">{formatNum(exactRHD)}</div>
                                    </div>
                                </div>
                                <div className={`py-2 px-4 rounded-lg flex items-center justify-between font-bold border ${isDifferentiable ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50' : 'bg-rose-900/30 text-rose-400 border-rose-800/50'}`}>
                                    <span>Differentiable at x = {c}?</span>
                                    <span className="flex items-center gap-2">
                                        {isDifferentiable ? 'YES ( LHD = RHD )' : 'NO'}
                                        {isDifferentiable ? 
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> : 
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                        }
                                    </span>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            );
        };
