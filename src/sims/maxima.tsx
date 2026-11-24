import React, { useState, useEffect, useMemo, useRef } from 'react';

        // --- MATHEMATICAL FUNCTIONS DEFINITION ---
        const mathModels = {
            cubic: {
                id: 'cubic',
                label: "Cubic: f(x) = x³/3 - x",
                f: (x) => (Math.pow(x, 3) / 3) - x,
                df: (x) => Math.pow(x, 2) - 1,
                d2f: (x) => 2 * x,
                domain: [-2.8, 2.8],
                range: [-1.8, 1.8],
                criticalPoints: [-1, 1],
                description: "A classic cubic curve with one local maximum and one local minimum."
            },
            quartic: {
                id: 'quartic',
                label: "Quartic: f(x) = x⁴/4 - x²/2",
                f: (x) => (Math.pow(x, 4) / 4) - (Math.pow(x, 2) / 2),
                df: (x) => Math.pow(x, 3) - x,
                d2f: (x) => 3 * Math.pow(x, 2) - 1,
                domain: [-1.8, 1.8],
                range: [-0.6, 0.6],
                criticalPoints: [-1, 0, 1],
                description: "A 'W' shaped curve featuring two local minima and one local maximum."
            },
            wave: {
                id: 'wave',
                label: "Sine Wave: f(x) = 2sin(x)",
                f: (x) => 2 * Math.sin(x),
                df: (x) => 2 * Math.cos(x),
                d2f: (x) => -2 * Math.sin(x),
                domain: [-4, 4],
                range: [-3, 3],
                criticalPoints: [-Math.PI/2, Math.PI/2],
                description: "A continuous wave demonstrating infinitely repeating extrema."
            }
        };

        export default function App() {
            const [activeModelId, setActiveModelId] = useState('cubic');
            const [xValue, setXValue] = useState(-2);
            
            const model = mathModels[activeModelId];
            
            // SVG Canvas Dimensions
            const width = 800;
            const height = 400;
            const padding = 40;
            const innerWidth = width - padding * 2;
            const innerHeight = height - padding * 2;

            // Coordinate Mapping Functions
            const mapX = (x) => padding + ((x - model.domain[0]) / (model.domain[1] - model.domain[0])) * innerWidth;
            const mapY = (y) => padding + innerHeight - ((y - model.range[0]) / (model.range[1] - model.range[0])) * innerHeight;

            // Handle Slider Change with Magnetic Snapping to Critical Points
            const handleSlider = (e) => {
                let val = parseFloat(e.target.value);
                // Magnetic snap feature for educational clarity
                model.criticalPoints.forEach(cp => {
                    if (Math.abs(val - cp) < 0.15) {
                        val = cp; 
                    }
                });
                setXValue(val);
            };

            // Switch Models
            const handleModelSwitch = (id) => {
                setActiveModelId(id);
                setXValue(mathModels[id].domain[0] + 0.5); // Reset X position
            };

            // Telemetry Calculations
            const currentY = model.f(xValue);
            const currentSlope = model.df(xValue);
            const currentConcavity = model.d2f(xValue);

            // Path Generator for the Function Curve (Color coded by slope)
            const curveSegments = useMemo(() => {
                const segments = [];
                const step = (model.domain[1] - model.domain[0]) / 200;
                for (let x = model.domain[0]; x <= model.domain[1]; x += step) {
                    const x1 = x;
                    const y1 = model.f(x1);
                    const slope = model.df(x1);
                    const color = slope > 0.05 ? '#22c55e' : (slope < -0.05 ? '#ef4444' : '#eab308'); // Green, Red, Yellow
                    
                    segments.push({
                        x: mapX(x1),
                        y: mapY(y1),
                        color: color
                    });
                }
                return segments;
            }, [model]);

            // Determine Current State for Dashboard
            let stateTitle = "Function is ";
            let stateColor = "text-slate-400";
            let stateBg = "bg-slate-800/50";
            
            if (Math.abs(currentSlope) < 0.01) {
                if (currentConcavity < 0) {
                    stateTitle = "LOCAL MAXIMA (Peak)";
                    stateColor = "text-yellow-400 font-bold";
                    stateBg = "bg-yellow-900/30 border-yellow-500/50";
                } else if (currentConcavity > 0) {
                    stateTitle = "LOCAL MINIMA (Valley)";
                    stateColor = "text-cyan-400 font-bold";
                    stateBg = "bg-cyan-900/30 border-cyan-500/50";
                } else {
                    stateTitle = "Point of Inflection";
                    stateColor = "text-purple-400 font-bold";
                    stateBg = "bg-purple-900/30 border-purple-500/50";
                }
            } else if (currentSlope > 0) {
                stateTitle = "Increasing Curve";
                stateColor = "text-green-400";
            } else {
                stateTitle = "Decreasing Curve";
                stateColor = "text-red-400";
            }

            return (
                <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6">
                    {/* Header */}
                    <header className="border-b border-slate-800 pb-4">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                            Maxima & Minima Visualizer
                        </h1>
                        <p className="text-slate-400 mt-2 text-sm md:text-base">
                            Explore how the First Derivative f'(x) dictates the slope, and the Second Derivative f''(x) reveals peaks and valleys.
                        </p>
                    </header>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        
                        {/* Left Sidebar: Controls */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
                                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Select Function</h3>
                                <div className="space-y-2">
                                    {Object.values(mathModels).map((m) => (
                                        <button
                                            key={m.id}
                                            onClick={() => handleModelSwitch(m.id)}
                                            className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                                                activeModelId === m.id 
                                                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
                                                : 'bg-slate-800 text-slate-400 border border-transparent hover:bg-slate-700 hover:text-white'
                                            }`}
                                        >
                                            {m.label}
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-4 p-3 bg-slate-850 rounded-lg border border-slate-800/50">
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        {model.description}
                                    </p>
                                </div>
                            </div>

                            {/* Telemetry Dashboard */}
                            <div className={`border rounded-xl p-4 shadow-xl transition-colors duration-300 ${stateBg}`}>
                                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Live Analysis</h3>
                                <div className={`text-lg mb-4 ${stateColor}`}>
                                    {stateTitle}
                                </div>
                                
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center border-b border-slate-700/50 pb-2">
                                        <span className="text-slate-400 text-sm italic">x-Position</span>
                                        <span className="font-mono text-white">{xValue.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-slate-700/50 pb-2">
                                        <span className="text-slate-400 text-sm italic">f(x) (Height)</span>
                                        <span className="font-mono text-white">{currentY.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-slate-700/50 pb-2">
                                        <span className="text-slate-400 text-sm italic">f'(x) (Slope)</span>
                                        <span className={`font-mono ${currentSlope > 0.05 ? 'text-green-400' : currentSlope < -0.05 ? 'text-red-400' : 'text-yellow-400'}`}>
                                            {currentSlope.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400 text-sm italic">f''(x) (Concavity)</span>
                                        <span className="font-mono text-white">{currentConcavity.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Area: Interactive Canvas & Sliders */}
                        <div className="lg:col-span-3 space-y-4">
                            
                            {/* SVG Graph Engine */}
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 md:p-4 shadow-2xl overflow-hidden relative">
                                
                                {/* Status Overlay Badge */}
                                {Math.abs(currentSlope) < 0.01 && (
                                    <div className="absolute top-6 right-6 px-4 py-2 bg-slate-950/80 backdrop-blur-md border border-slate-700 rounded-full flex items-center gap-2 shadow-2xl animate-pulse">
                                        <div className={`w-3 h-3 rounded-full ${currentConcavity < 0 ? 'bg-yellow-400 shadow-[0_0_10px_yellow]' : 'bg-cyan-400 shadow-[0_0_10px_cyan]'}`}></div>
                                        <span className="text-sm font-semibold tracking-wide text-white">
                                            f'(x) = 0 Found!
                                        </span>
                                    </div>
                                )}

                                <svg 
                                    viewBox={`0 0 ${width} ${height}`} 
                                    className="w-full h-auto drop-shadow-lg"
                                >
                                    {/* Grid Lines */}
                                    {[...Array(11)].map((_, i) => (
                                        <line key={`v-${i}`} x1={padding + (innerWidth/10)*i} y1={padding} x2={padding + (innerWidth/10)*i} y2={height-padding} stroke="#1e293b" strokeWidth="1" />
                                    ))}
                                    {[...Array(7)].map((_, i) => (
                                        <line key={`h-${i}`} x1={padding} y1={padding + (innerHeight/6)*i} x2={width-padding} y2={padding + (innerHeight/6)*i} stroke="#1e293b" strokeWidth="1" />
                                    ))}

                                    {/* Main X and Y Axes */}
                                    <line x1={padding} y1={mapY(0)} x2={width-padding} y2={mapY(0)} stroke="#475569" strokeWidth="2" />
                                    <line x1={mapX(0)} y1={padding} x2={mapX(0)} y2={height-padding} stroke="#475569" strokeWidth="2" />
                                    
                                    {/* Axis Labels */}
                                    <text x={width - padding + 10} y={mapY(0) + 5} fill="#64748b" fontSize="14" fontFamily="monospace">X</text>
                                    <text x={mapX(0) - 5} y={padding - 10} fill="#64748b" fontSize="14" fontFamily="monospace" textAnchor="middle">Y</text>

                                    {/* Draw Critical Point Markers */}
                                    {model.criticalPoints.map((cp, idx) => {
                                        const cpY = model.f(cp);
                                        const cpConcavity = model.d2f(cp);
                                        const isMax = cpConcavity < 0;
                                        return (
                                            <g key={`cp-${idx}`}>
                                                <line strokeDasharray="4 4" x1={mapX(cp)} y1={mapY(0)} x2={mapX(cp)} y2={mapY(cpY)} stroke="#475569" strokeWidth="1" />
                                                <circle cx={mapX(cp)} cy={mapY(cpY)} r="6" fill="transparent" stroke={isMax ? '#eab308' : '#22d3ee'} strokeWidth="2" />
                                                <text x={mapX(cp)} y={mapY(cpY) + (isMax ? -15 : 25)} fill={isMax ? '#eab308' : '#22d3ee'} fontSize="12" textAnchor="middle" fontWeight="bold">
                                                    {isMax ? 'MAX' : 'MIN'}
                                                </text>
                                            </g>
                                        )
                                    })}

                                    {/* Render Mathematical Curve */}
                                    {curveSegments.map((seg, idx) => {
                                        if (idx === 0) return null;
                                        const prev = curveSegments[idx-1];
                                        return (
                                            <line 
                                                key={`seg-${idx}`}
                                                x1={prev.x} y1={prev.y} 
                                                x2={seg.x} y2={seg.y} 
                                                stroke={seg.color} 
                                                strokeWidth="4"
                                                strokeLinecap="round"
                                            />
                                        )
                                    })}

                                    {/* Render Tangent Line Tracker */}
                                    <g>
                                        {/* Tangent Line segment spanning X-domain logic */}
                                        <line 
                                            x1={mapX(xValue - 1)} 
                                            y1={mapY(currentY - currentSlope)} 
                                            x2={mapX(xValue + 1)} 
                                            y2={mapY(currentY + currentSlope)} 
                                            stroke="#f8fafc" 
                                            strokeWidth="2"
                                            strokeDasharray="6 4"
                                        />
                                        
                                        {/* The Probe Point */}
                                        <circle cx={mapX(xValue)} cy={mapY(currentY)} r="7" fill="#f8fafc" className="drop-shadow-lg" />
                                        <circle cx={mapX(xValue)} cy={mapY(currentY)} r="3" fill="#020617" />
                                    </g>
                                </svg>
                            </div>

                            {/* Probe Control Slider */}
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
                                <div className="flex justify-between text-sm text-slate-400 font-mono mb-2">
                                    <span>Domain Start ({model.domain[0]})</span>
                                    <span className="text-white font-bold">Drag Tangent Probe (x = {xValue.toFixed(2)})</span>
                                    <span>Domain End ({model.domain[1]})</span>
                                </div>
                                <input 
                                    type="range" 
                                    min={model.domain[0]} 
                                    max={model.domain[1]} 
                                    step="0.01" 
                                    value={xValue}
                                    onChange={handleSlider}
                                    className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400 transition-all"
                                />
                                
                                {/* Educational Sign Chart Replicator */}
                                <div className="mt-8">
                                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-semibold">First Derivative Sign Chart f'(x)</p>
                                    <div className="h-10 flex rounded-lg overflow-hidden border border-slate-700">
                                        {(() => {
                                            // Split domain into intervals based on critical points
                                            const cps = [...model.criticalPoints].sort((a,b)=>a-b);
                                            const intervals = [];
                                            let start = model.domain[0];
                                            
                                            cps.forEach((cp, i) => {
                                                intervals.push({ start: start, end: cp });
                                                start = cp;
                                            });
                                            intervals.push({ start: start, end: model.domain[1] });

                                            return intervals.map((int, i) => {
                                                const midPoint = (int.start + int.end) / 2;
                                                const slope = model.df(midPoint);
                                                const isIncreasing = slope > 0;
                                                // Width percentage
                                                const totalDomain = model.domain[1] - model.domain[0];
                                                const widthPct = ((int.end - int.start) / totalDomain) * 100;
                                                
                                                return (
                                                    <div key={i} style={{ width: `${widthPct}%` }} className={`flex items-center justify-center border-r border-slate-800 last:border-r-0 ${isIncreasing ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                                                        <span className="text-xl font-bold font-mono">{isIncreasing ? '( + )' : '( - )'}</span>
                                                    </div>
                                                )
                                            })
                                        })()}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            );
        };
