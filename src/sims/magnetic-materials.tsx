import React, { useState, useEffect, useMemo } from 'react';
import { Settings2, Info, Activity } from 'lucide-react';

        // Material Definitions based on NCERT Chapter 5
        const MATERIALS = {
            vacuum: {
                id: 'vacuum',
                name: 'Vacuum',
                chiVis: 0, 
                chiText: '0',
                muRText: '1',
                desc: 'Empty space. No internal magnetisation occurs (M = 0). The total field is purely the external field.',
                color: 'text-slate-400',
                bgColor: 'bg-slate-800'
            },
            diamagnetic: {
                id: 'diamagnetic',
                name: 'Diamagnetic (e.g., Bismuth)',
                chiVis: -0.3, // Exaggerated for visualization
                chiText: '-10⁻⁵',
                muRText: '< 1',
                desc: 'Develops a weak net magnetic moment in the OPPOSITE direction of the applied field. Repels field lines slightly.',
                color: 'text-rose-400',
                bgColor: 'bg-rose-900/30'
            },
            superconductor: {
                id: 'superconductor',
                name: 'Superconductor',
                chiVis: -1.0, 
                chiText: '-1',
                muRText: '0',
                desc: 'Perfect diamagnetism (Meissner effect). Completely expels all magnetic field lines. Inside the material, B = 0.',
                color: 'text-purple-400',
                bgColor: 'bg-purple-900/30'
            },
            paramagnetic: {
                id: 'paramagnetic',
                name: 'Paramagnetic (e.g., Aluminum)',
                chiVis: 0.3, // Exaggerated for visualization
                chiText: '+10⁻⁵',
                muRText: '> 1',
                desc: 'Individual atomic dipoles weakly align WITH the applied field. Slightly concentrates field lines inside.',
                color: 'text-emerald-400',
                bgColor: 'bg-emerald-900/30'
            },
            ferromagnetic: {
                id: 'ferromagnetic',
                name: 'Ferromagnetic (e.g., Iron)',
                chiVis: 2.5, // Exaggerated for visualization
                chiText: '>> 1 (e.g., 1000)',
                muRText: '>> 1',
                desc: 'Domains strongly and spontaneously align with the applied field. Highly concentrates field lines, creating a massive total B field.',
                color: 'text-amber-400',
                bgColor: 'bg-amber-900/30'
            }
        };

        export default function App() {
            const [materialId, setMaterialId] = useState('vacuum');
            const [hField, setHField] = useState(50); // External Magnetic Intensity (H)
            
            const material = MATERIALS[materialId];
            
            // Mathematical calculations for visualization
            const M = material.chiVis * hField; // Magnetisation, schematic χ
            const B = hField + M; // Proportional to μ0(H + M)
            const Bmax = 100 * (1 + 2.5); // full scale is ferromagnetic B at H = 100
            const hWidth = (hField / Bmax) * 100;
            const bWidth = (Math.max(0, B) / Bmax) * 100;
            const mMag = Math.min(50, Math.abs(M) / 5); // |M| = 250 fills half the centred track

            // Generate SVG Field Lines
            const generateFieldLines = () => {
                const lines = [];
                const numLines = 15;
                const canvasWidth = 600;
                const canvasHeight = 350;
                const centerY = canvasHeight / 2;
                
                for (let i = 0; i <= numLines; i++) {
                    const yOffset = (i / numLines) * canvasHeight;
                    const distFromCenter = centerY - yOffset;
                    
                    let path = '';
                    
                    if (hField === 0) {
                        // No field
                        path = `M 0,${yOffset} L ${canvasWidth},${yOffset}`;
                    } else if (materialId === 'superconductor') {
                        // Meissner Effect - Perfect Expulsion
                        const repelForce = 60 * (hField/100);
                        const push = distFromCenter > 0 ? -repelForce : repelForce;
                        const blockTop = centerY - 60;
                        const blockBot = centerY + 60;
                        
                        if (yOffset > blockTop - 20 && yOffset < blockBot + 20) {
                            // Lines hitting the block bend around it
                            const edgeY = distFromCenter >= 0 ? blockTop - 10 : blockBot + 10;
                            path = `M 0,${yOffset} C 150,${yOffset} 200,${edgeY} 300,${edgeY} C 400,${edgeY} 450,${yOffset} ${canvasWidth},${yOffset}`;
                        } else {
                            // Outer lines are pushed slightly
                            path = `M 0,${yOffset} C 200,${yOffset} 300,${yOffset - push} ${canvasWidth},${yOffset}`;
                        }
                    } else {
                        // Para, Dia, Ferro bending
                        // Force is proportional to M, pulls lines toward center (para/ferro) or pushes away (dia)
                        const bendStrength = material.chiVis * (hField / 100) * 40;
                        
                        // Only bend lines that are somewhat near the block
                        const bendAmount = Math.sign(distFromCenter) * bendStrength * Math.exp(-Math.abs(distFromCenter)/100);
                        
                        // SVG y grows downward. Adding bendAmount pulls para/ferro lines
                        // toward the slab and pushes diamagnetic lines away.
                        const midY = yOffset + bendAmount;
                        
                        path = `M 0,${yOffset} C 150,${yOffset} 250,${midY} 300,${midY} C 350,${midY} 450,${yOffset} ${canvasWidth},${yOffset}`;
                    }
                    
                    lines.push(
                        <path 
                            key={i} 
                            d={path} 
                            fill="transparent" 
                            stroke={hField === 0 ? "rgba(255,255,255,0.05)" : "rgba(59, 130, 246, 0.4)"} 
                            strokeWidth={hField === 0 ? "1" : "2"}
                            className="transition-all duration-500 ease-in-out"
                        />
                    );
                }
                return lines;
            };

            // Generate Atomic Dipoles / Domains inside the material
            const generateDipoles = () => {
                if (materialId === 'vacuum' || materialId === 'superconductor') return null;

                const dipoles = [];
                const cols = 5;
                const rows = 5;
                const startX = 220;
                const startY = 95;
                const spacingX = 35;
                const spacingY = 35;

                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < cols; c++) {
                        let angle = 0;
                        const randomWobble = (Math.random() - 0.5) * 180; // Random angle for thermal agitation

                        if (hField === 0) {
                            if (materialId === 'ferromagnetic') {
                                // Ferromagnetic domains are aligned locally, but we'll show random for demagnetized state
                                angle = randomWobble;
                            } else {
                                angle = randomWobble;
                            }
                        } else {
                            if (materialId === 'diamagnetic') {
                                // Diamagnetic opposes the field (points left, 180 deg)
                                angle = 180 + (randomWobble * (1 - hField/200)); 
                            } else if (materialId === 'paramagnetic') {
                                // Paramagnetic weakly aligns (points right, 0 deg)
                                const alignment = hField / 100; // 0 to 1
                                angle = randomWobble * (1 - alignment); 
                            } else if (materialId === 'ferromagnetic') {
                                // Ferromagnetic strongly aligns
                                const alignment = Math.min(1, hField / 20); // Aligns very quickly
                                angle = randomWobble * (1 - alignment);
                            }
                        }

                        const x = startX + c * spacingX + (Math.random()*10 - 5);
                        const y = startY + r * spacingY + (Math.random()*10 - 5);

                        dipoles.push(
                            <g key={`${r}-${c}`} transform={`translate(${x}, ${y}) rotate(${angle})`} className="transition-all duration-500">
                                <line x1="-10" y1="0" x2="10" y2="0" stroke="white" strokeWidth="2" />
                                <polygon points="10,0 4,-4 4,4" fill="white" />
                            </g>
                        );
                    }
                }
                return dipoles;
            };

            return (
                <div className="min-h-[36rem] p-4 md:p-8 flex flex-col items-center">
                    
                    {/* Header */}
                    <div className="max-w-6xl w-full mb-8 text-center">
                        <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                            Magnetisation & Magnetic Materials
                        </h1>
                        <p className="text-slate-400 text-lg">
                            Visualize how different materials respond to an external Magnetic Intensity (H).
                        </p>
                    </div>

                    <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Control Panel */}
                        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-6 h-fit">
                            <div>
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <Settings2 className="w-5 h-5 text-blue-400" />
                                    System Controls
                                </h2>
                                
                                {/* Material Selector */}
                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-slate-300 mb-2">Select Material Core</label>
                                    <div className="flex flex-col gap-2">
                                        {Object.values(MATERIALS).map(mat => (
                                            <button 
                                                key={mat.id}
                                                onClick={() => setMaterialId(mat.id)}
                                                className={`px-4 py-2 rounded-lg text-left transition-all ${
                                                    materialId === mat.id 
                                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                                                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                                }`}
                                            >
                                                {mat.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* H Field Slider */}
                                <div>
                                    <label className="flex justify-between text-sm font-semibold text-slate-300 mb-2">
                                        <span>External Magnetic Intensity (H)</span>
                                        <span className="text-blue-400 font-mono">{hField}%</span>
                                    </label>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="100" 
                                        value={hField}
                                        onChange={(e) => setHField(parseInt(e.target.value))}
                                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none slider-thumb outline-none"
                                    />
                                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                                        <span>0 (Off)</span>
                                        <span>Max Field</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Visualizer */}
                        <div className="lg:col-span-2 flex flex-col gap-6">
                            
                            {/* Canvas */}
                            <div className="glass-panel rounded-2xl overflow-hidden relative svg-container h-[350px] flex items-center justify-center bg-black/40">
                                <svg width="100%" height="100%" viewBox="0 0 600 350" preserveAspectRatio="xMidYMid slice" className="absolute inset-0">
                                    {/* Field Lines */}
                                    {generateFieldLines()}
                                    
                                    {/* Material Block */}
                                    <rect 
                                        x="200" y="75" width="200" height="200" 
                                        rx="8"
                                        fill={materialId === 'vacuum' ? 'transparent' : 'rgba(255,255,255,0.05)'}
                                        stroke={materialId === 'vacuum' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.4)'}
                                        strokeWidth="2"
                                        strokeDasharray={materialId === 'vacuum' ? '4 4' : 'none'}
                                        className="transition-all duration-300"
                                    />

                                    {/* Dipoles */}
                                    {generateDipoles()}

                                </svg>
                                
                                {/* Labels */}
                                <div className="absolute top-4 left-4 text-blue-400 font-mono font-bold text-sm bg-slate-900/80 px-2 py-1 rounded">
                                    External Field (H) &rarr;
                                </div>
                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white font-bold text-lg drop-shadow-md">
                                    {material.name} Core
                                </div>
                            </div>

                            {/* Dashboard & Math */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                
                                {/* Theory Box */}
                                <div className={`glass-panel p-5 rounded-2xl border-l-4 ${material.color.replace('text', 'border')}`}>
                                    <h3 className={`font-bold mb-2 flex items-center gap-2 ${material.color}`}>
                                        <Info className="w-5 h-5" />
                                        Properties
                                    </h3>
                                    <p className="text-sm text-slate-300 mb-4 h-16">{material.desc}</p>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-800 p-3 rounded-lg text-center">
                                            <div className="text-xs text-slate-400 mb-1">Susceptibility (χ)</div>
                                            <div className={`font-mono font-bold text-lg ${material.color}`}>{material.chiText}</div>
                                        </div>
                                        <div className="bg-slate-800 p-3 rounded-lg text-center">
                                            <div className="text-xs text-slate-400 mb-1">Rel. Permeability (μᵣ)</div>
                                            <div className={`font-mono font-bold text-lg ${material.color}`}>{material.muRText}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Live Math Engine */}
                                <div className="glass-panel p-5 rounded-2xl">
                                    <h3 className="font-bold mb-4 text-white flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-emerald-400" />
                                        Live Field Vectors
                                    </h3>
                                    
                                    <div className="flex flex-col gap-4">
                                        {/* H Bar */}
                                        <div>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-blue-400 font-bold">H (External Intensity)</span>
                                            </div>
                                            <div className="h-4 bg-slate-800 rounded-full overflow-hidden flex">
                                                <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${hWidth}%` }}></div>
                                            </div>
                                        </div>

                                        {/* M Bar */}
                                        <div>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className={`${material.color} font-bold`}>M (Magnetisation = χH)</span>
                                                <span className="text-slate-400 text-[10px]">
                                                    {materialId === 'diamagnetic' || materialId === 'superconductor' ? 'Opposing' : 'Aligned'}
                                                    {' '}· schematic χ = {material.chiVis}
                                                </span>
                                            </div>
                                            <div className="h-4 bg-slate-800 rounded-full overflow-hidden flex relative">
                                                {/* Center line for M because it can be negative */}
                                                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-600 z-10"></div>
                                                <div className="h-full absolute transition-all duration-300 z-0" 
                                                     style={{ 
                                                         width: `${mMag}%`, 
                                                         backgroundColor: M < 0 ? '#f43f5e' : (materialId==='ferromagnetic' ? '#fbbf24' : '#34d399'),
                                                         left: M < 0 ? `calc(50% - ${mMag}%)` : '50%',
                                                     }}>
                                                </div>
                                            </div>
                                        </div>

                                        {/* B Bar */}
                                        <div>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-white font-bold">B (Total Field = μ₀(H + M))</span>
                                            </div>
                                            <div className="h-4 bg-slate-800 rounded-full overflow-hidden flex relative">
                                                <div className="h-full bg-white transition-all duration-300" 
                                                     style={{ width: `${bWidth}%` }}>
                                                </div>
                                                {materialId === 'superconductor' && hField > 0 && (
                                                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-black bg-white">
                                                        B = 0 (Expelled)
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            );
        };
