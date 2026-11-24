import React, { useState, useMemo } from 'react';

        const functionsData = [
            {
                id: 1,
                label: "Quadratic: f(x) = x² - 4x + 3",
                f: (x) => x * x - 4 * x + 3,
                df: (x) => 2 * x - 4,
                dfLabel: "f'(x) = 2x - 4",
                roots: "2x - 4 = 0  ⇒  x = 2",
                criticalPoints: [2],
                domain: [-1, 5],
                range: [-2, 10],
                intervals: [
                    { range: "(-∞, 2)", type: "Decreasing", sign: "-", color: "#ef4444", textClass: "text-red-500" },
                    { range: "(2, ∞)", type: "Increasing", sign: "+", color: "#10b981", textClass: "text-emerald-500" }
                ],
                startProbe: 0
            },
            {
                id: 2,
                label: "Cubic: f(x) = x³ - 3x² - 9x + 5",
                f: (x) => Math.pow(x, 3) - 3 * Math.pow(x, 2) - 9 * x + 5,
                df: (x) => 3 * Math.pow(x, 2) - 6 * x - 9,
                dfLabel: "f'(x) = 3x² - 6x - 9 = 3(x-3)(x+1)",
                roots: "3(x-3)(x+1) = 0  ⇒  x = -1, 3",
                criticalPoints: [-1, 3],
                domain: [-4, 6],
                range: [-25, 20],
                intervals: [
                    { range: "(-∞, -1)", type: "Increasing", sign: "+", color: "#10b981", textClass: "text-emerald-500" },
                    { range: "(-1, 3)", type: "Decreasing", sign: "-", color: "#ef4444", textClass: "text-red-500" },
                    { range: "(3, ∞)", type: "Increasing", sign: "+", color: "#10b981", textClass: "text-emerald-500" }
                ],
                startProbe: -3
            },
            {
                id: 3,
                label: "Trigonometric: f(x) = 2sin(2x)",
                f: (x) => Math.sin(2 * x) * 2, 
                df: (x) => 2 * Math.cos(2 * x) * 2,
                dfLabel: "f'(x) = 4cos(2x)",
                roots: "cos(2x) = 0  ⇒  x = π/4, 3π/4",
                criticalPoints: [Math.PI / 4, 3 * Math.PI / 4],
                domain: [0, Math.PI],
                range: [-3, 3],
                intervals: [
                    { range: "(0, π/4)", type: "Increasing", sign: "+", color: "#10b981", textClass: "text-emerald-500" },
                    { range: "(π/4, 3π/4)", type: "Decreasing", sign: "-", color: "#ef4444", textClass: "text-red-500" },
                    { range: "(3π/4, π)", type: "Increasing", sign: "+", color: "#10b981", textClass: "text-emerald-500" }
                ],
                startProbe: 0.2
            }
        ];

        export default function App() {
            const [funcIndex, setFuncIndex] = useState(1); // Default to Cubic
            const activeFunc = functionsData[funcIndex];
            const [probeX, setProbeX] = useState(activeFunc.startProbe);

            // Handle function change
            const handleFuncChange = (idx) => {
                setFuncIndex(idx);
                setProbeX(functionsData[idx].startProbe);
            };

            // SVG Map utility
            const width = 600;
            const height = 400;
            const padding = 40;
            
            const mapX = (x) => padding + ((x - activeFunc.domain[0]) / (activeFunc.domain[1] - activeFunc.domain[0])) * (width - 2 * padding);
            const mapY = (y) => height - padding - ((y - activeFunc.range[0]) / (activeFunc.range[1] - activeFunc.range[0])) * (height - 2 * padding);

            // Generate Path Segments color-coded by Derivative
            const generatePaths = () => {
                const paths = [];
                const steps = 300;
                const dx = (activeFunc.domain[1] - activeFunc.domain[0]) / steps;
                
                let currentSegment = [];
                let currentSign = activeFunc.df(activeFunc.domain[0]) >= 0;

                for (let i = 0; i <= steps; i++) {
                    const x = activeFunc.domain[0] + i * dx;
                    const y = activeFunc.f(x);
                    const slope = activeFunc.df(x);
                    const isPositive = slope >= 0;

                    currentSegment.push(`${mapX(x)},${mapY(y)}`);

                    if (isPositive !== currentSign || i === steps) {
                        paths.push({
                            points: currentSegment.join(" "),
                            color: currentSign ? "#10b981" : "#ef4444" 
                        });
                        currentSegment = [`${mapX(x)},${mapY(y)}`];
                        currentSign = isPositive;
                    }
                }
                return paths;
            };

            const gridLines = useMemo(() => {
                let lines = [];
                // X grid
                for (let x = Math.ceil(activeFunc.domain[0]); x <= Math.floor(activeFunc.domain[1]); x++) {
                    lines.push(<line key={`gx${x}`} x1={mapX(x)} y1={padding} x2={mapX(x)} y2={height-padding} stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />);
                    lines.push(<text key={`tx${x}`} x={mapX(x)} y={mapY(0) + 15} fill="#94a3b8" fontSize="12" textAnchor="middle">{x}</text>);
                }
                // Y grid
                const yStep = (activeFunc.range[1] - activeFunc.range[0]) > 20 ? 5 : 2;
                for (let y = Math.ceil(activeFunc.range[0]/yStep)*yStep; y <= Math.floor(activeFunc.range[1]/yStep)*yStep; y+=yStep) {
                    lines.push(<line key={`gy${y}`} x1={padding} y1={mapY(y)} x2={width-padding} y2={mapY(y)} stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />);
                    if (y !== 0) lines.push(<text key={`ty${y}`} x={mapX(0) - 10} y={mapY(y) + 4} fill="#94a3b8" fontSize="12" textAnchor="end">{y}</text>);
                }
                return lines;
            }, [activeFunc]);

            // Tangent Line calculations
            const tX = probeX;
            const tY = activeFunc.f(tX);
            const slope = activeFunc.df(tX);
            // Dynamic tangent length based on domain width for consistent visual size
            const tangentLength = (activeFunc.domain[1] - activeFunc.domain[0]) * 0.15; 
            
            const p1x = tX - tangentLength;
            const p1y = tY - slope * tangentLength;
            const p2x = tX + tangentLength;
            const p2y = tY + slope * tangentLength;

            const isIncreasing = slope > 0;
            const isCritical = Math.abs(slope) < 0.05; // Small tolerance for zero

            return (
                <div className="min-h-[36rem] p-3 sm:p-6 lg:p-8 flex flex-col items-center">
                    <div className="max-w-6xl w-full">
                        <header className="mb-6 text-center lg:text-left">
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-2">Calculus: Increasing & Decreasing Intervals</h1>
                            <p className="text-sm sm:text-base text-slate-400">Discover how the First Derivative <span className="math-font text-white">f'(x)</span> dictates the geometric shape of the curve.</p>
                        </header>

                        {/* Responsive Function Selector */}
                        <div className="flex flex-wrap gap-2 sm:gap-4 mb-6 justify-center lg:justify-start">
                            {functionsData.map((fn, idx) => (
                                <button 
                                    key={fn.id} 
                                    onClick={() => handleFuncChange(idx)}
                                    className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base font-medium transition-all ${funcIndex === idx ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30 ring-2 ring-sky-300 ring-offset-2 ring-offset-slate-900' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                                >
                                    {fn.label}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                            
                            {/* Visualizer Canvas Area */}
                            <div className="bg-slate-800 p-3 sm:p-5 rounded-2xl border border-slate-700 shadow-2xl relative flex flex-col">
                                
                                {/* Floating Legend */}
                                <div className="absolute top-4 sm:top-8 left-4 sm:left-8 flex flex-col gap-1.5 bg-slate-900/80 p-2 sm:p-3 rounded-lg border border-slate-700 backdrop-blur-md z-10 text-xs sm:text-sm">
                                    <div className="flex items-center gap-2"><div className="w-3 sm:w-4 h-1.5 bg-emerald-500 rounded-full"></div> <span className="font-medium text-slate-200">f'(x) &gt; 0 (Increasing)</span></div>
                                    <div className="flex items-center gap-2"><div className="w-3 sm:w-4 h-1.5 bg-red-500 rounded-full"></div> <span className="font-medium text-slate-200">f'(x) &lt; 0 (Decreasing)</span></div>
                                </div>
                                
                                {/* SVG Engine */}
                                <div className="w-full aspect-[4/3] sm:aspect-video lg:aspect-[4/3] bg-slate-900 rounded-xl overflow-hidden border border-slate-800 mb-4">
                                    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
                                        {/* Grid & Axes */}
                                        {gridLines}
                                        <line x1={padding} y1={mapY(0)} x2={width - padding} y2={mapY(0)} stroke="#94a3b8" strokeWidth="2.5" />
                                        <line x1={mapX(0)} y1={padding} x2={mapX(0)} y2={height - padding} stroke="#94a3b8" strokeWidth="2.5" />

                                        {/* Colored Path Segments */}
                                        {generatePaths().map((segment, idx) => (
                                            <polyline key={idx} points={segment.points} fill="none" stroke={segment.color} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
                                        ))}

                                        {/* Critical Points */}
                                        {activeFunc.criticalPoints.map((cp, idx) => (
                                            <circle key={idx} cx={mapX(cp)} cy={mapY(activeFunc.f(cp))} r="7" fill="#eab308" stroke="#0f172a" strokeWidth="2.5" />
                                        ))}

                                        {/* Tangent Line */}
                                        <line 
                                            x1={mapX(p1x)} y1={mapY(p1y)} 
                                            x2={mapX(p2x)} y2={mapY(p2y)} 
                                            stroke="#38bdf8" strokeWidth="3" strokeDasharray="6 4"
                                            strokeLinecap="round"
                                        />
                                        
                                        {/* Moving Probe Point */}
                                        <circle cx={mapX(tX)} cy={mapY(tY)} r="8" fill="#38bdf8" stroke="#fff" strokeWidth="2" className="drop-shadow-lg" />
                                    </svg>
                                </div>
                                
                                {/* Touch-Optimized Probe Slider */}
                                <div className="mt-2 px-2 pb-2">
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="text-sm font-semibold text-slate-300">Drag to slide Tangent Probe (x)</label>
                                        <span className="text-xs font-mono bg-sky-900/50 text-sky-300 px-2 py-1 rounded">x = {tX.toFixed(2)}</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min={activeFunc.domain[0]} 
                                        max={activeFunc.domain[1]} 
                                        step="0.05" 
                                        value={probeX} 
                                        onChange={(e) => setProbeX(Number(e.target.value))}
                                    />
                                </div>
                            </div>

                            {/* Math Dashboard Panel */}
                            <div className="flex flex-col gap-4 sm:gap-6">
                                
                                {/* Step 1: Critical Points */}
                                <div className="bg-slate-800 p-4 sm:p-6 rounded-2xl border border-slate-700 shadow-lg">
                                    <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 border-b border-slate-700 pb-2 text-slate-200">1. Find Critical Points</h2>
                                    <p className="text-sm sm:text-base text-slate-300 mb-3">Set the first derivative to zero to find where the curve flatlines (turns).</p>
                                    
                                    <div className="space-y-2">
                                        <div className="bg-slate-900 p-3 sm:p-4 rounded-xl border border-slate-700/50 font-mono text-sm sm:text-lg text-sky-400 math-scroll overflow-x-auto whitespace-nowrap">
                                            {activeFunc.dfLabel}
                                        </div>
                                        <div className="bg-slate-900 p-3 sm:p-4 rounded-xl border border-slate-700/50 font-mono text-sm sm:text-lg text-amber-400 math-scroll overflow-x-auto whitespace-nowrap">
                                            {activeFunc.roots}
                                        </div>
                                    </div>
                                </div>

                                {/* Step 2: Intervals Breakdown */}
                                <div className="bg-slate-800 p-4 sm:p-6 rounded-2xl border border-slate-700 shadow-lg">
                                    <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 border-b border-slate-700 pb-2 text-slate-200">2. Intervals Test</h2>
                                    <p className="text-sm sm:text-base text-slate-300 mb-4">The critical points split the domain into intervals. We test the sign of <span className="math-font text-white">f'(x)</span> in each.</p>
                                    
                                    <div className="grid grid-cols-3 gap-1 sm:gap-2 text-center text-xs sm:text-sm font-semibold mb-2 text-slate-400 px-1">
                                        <div>Interval</div>
                                        <div>Sign of f'(x)</div>
                                        <div>Nature of f(x)</div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        {activeFunc.intervals.map((int, idx) => (
                                            <div key={idx} className="grid grid-cols-3 gap-1 sm:gap-2 text-center items-center bg-slate-900 p-2.5 sm:p-3 rounded-xl border border-slate-700/30">
                                                <div className="font-mono text-xs sm:text-base text-slate-200">{int.range}</div>
                                                <div className={`font-bold text-lg sm:text-2xl ${int.textClass}`}>{int.sign}</div>
                                                <div className={`font-semibold text-xs sm:text-base ${int.textClass}`}>{int.type}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Live Telemetry Dynamic Box */}
                                <div className={`p-4 sm:p-6 rounded-2xl border-2 shadow-lg transition-colors duration-300 ${isCritical ? 'bg-amber-900/20 border-amber-500/50' : (isIncreasing ? 'bg-emerald-900/20 border-emerald-500/50' : 'bg-red-900/20 border-red-500/50')}`}>
                                    <h2 className="text-lg sm:text-xl font-bold mb-4 text-slate-200">Live Probe Telemetry</h2>
                                    
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 items-end">
                                        <div className="bg-slate-900/50 p-2 sm:p-3 rounded-lg border border-slate-700/50">
                                            <div className="text-slate-400 text-xs sm:text-sm font-medium">Position (x)</div>
                                            <div className="text-xl sm:text-2xl font-mono text-white mt-1">{tX.toFixed(2)}</div>
                                        </div>
                                        <div className="bg-slate-900/50 p-2 sm:p-3 rounded-lg border border-slate-700/50">
                                            <div className="text-slate-400 text-xs sm:text-sm font-medium">Value f(x)</div>
                                            <div className="text-xl sm:text-2xl font-mono text-white mt-1">{tY.toFixed(2)}</div>
                                        </div>
                                        <div className="col-span-2 sm:col-span-1 bg-slate-900/50 p-2 sm:p-3 rounded-lg border border-slate-700/50">
                                            <div className="text-slate-400 text-xs sm:text-sm font-medium">Slope f'(x)</div>
                                            <div className={`text-2xl sm:text-3xl font-mono font-bold mt-1 ${isCritical ? 'text-amber-400' : (isIncreasing ? 'text-emerald-400' : 'text-red-400')}`}>
                                                {slope.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-slate-700/50">
                                        {isCritical ? (
                                            <div className="text-amber-400 font-medium sm:font-semibold flex items-start gap-2 sm:gap-3 text-sm sm:text-base">
                                                <svg className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                                <span><strong>Critical Point!</strong> The tangent line is horizontal, meaning the slope is exactly zero.</span>
                                            </div>
                                        ) : isIncreasing ? (
                                            <div className="text-emerald-400 font-medium sm:font-semibold flex items-start gap-2 sm:gap-3 text-sm sm:text-base">
                                                <svg className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                                                <span><strong>Slope is Positive.</strong> The function is Strictly Increasing here, climbing upwards.</span>
                                            </div>
                                        ) : (
                                            <div className="text-red-400 font-medium sm:font-semibold flex items-start gap-2 sm:gap-3 text-sm sm:text-base">
                                                <svg className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path></svg>
                                                <span><strong>Slope is Negative.</strong> The function is Strictly Decreasing here, falling downwards.</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            );
        };
