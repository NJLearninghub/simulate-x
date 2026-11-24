import React, { useState, useEffect, useRef, useMemo } from 'react';

        // Constants in eV and nm
        const h_eV_s = 4.135667696e-15; // Planck's constant in eV*s
        const c_nm_s = 299792458e9;      // Speed of light in nm/s
        const hc = 1239.84193;           // hc in eV*nm

        // Target Metal Presets
        const METALS = {
            Cesium: { name: 'Cesium', symbol: 'Cs', phi: 2.14, color: '#e5c158', desc: 'Highly reactive alkali metal. Ejects electrons easily under blue and green light.' },
            Sodium: { name: 'Sodium', symbol: 'Na', phi: 2.36, color: '#f39c12', desc: 'Alkali metal. Responds to green/blue visible light and ultraviolet.' },
            Zinc: { name: 'Zinc', symbol: 'Zn', phi: 4.30, color: '#95a5a6', desc: 'Transition metal. Requires high-energy Ultraviolet (UV) light to eject electrons.' },
            Copper: { name: 'Copper', symbol: 'Cu', phi: 4.70, color: '#d35400', desc: 'Robust transition metal. Very high work function; requires mid-to-deep UV.' },
            Platinum: { name: 'Platinum', symbol: 'Pt', phi: 5.63, color: '#bdc3c7', desc: 'Noble metal. Extreme work function; requires high-frequency vacuum UV.' }
        };

        // Wavelength to RGB approximation
        function wavelengthToRGB(wl) {
            let r, g, b, alpha = 1;
            if (wl >= 380 && wl < 440) {
                r = -((wl - 440) / (440 - 380));
                g = 0;
                b = 1;
            } else if (wl >= 440 && wl < 490) {
                r = 0;
                g = (wl - 440) / (490 - 440);
                b = 1;
            } else if (wl >= 490 && wl < 510) {
                r = 0;
                g = 1;
                b = -((wl - 510) / (510 - 490));
            } else if (wl >= 510 && wl < 580) {
                r = (wl - 510) / (580 - 510);
                g = 1;
                b = 0;
            } else if (wl >= 580 && wl < 645) {
                r = 1;
                g = -((wl - 645) / (645 - 580));
                b = 0;
            } else if (wl >= 645 && wl <= 780) {
                r = 1;
                g = 0;
                b = 0;
            } else if (wl > 780) { // Infrared
                let factor = Math.max(0, 1 - (wl - 780) / 120);
                r = 0.5 * factor;
                g = 0;
                b = 0;
            } else { // Ultraviolet (< 380)
                let factor = Math.max(0.3, wl / 380);
                r = 0.6 * factor;
                g = 0.1 * factor;
                b = 0.9;
            }

            const to255 = (val) => Math.round(val * 255);
            return `rgba(${to255(r || 0)}, ${to255(g || 0)}, ${to255(b || 0)}, ${alpha})`;
        }

        export default function App() {
            // State variables
            const [wavelength, setWavelength] = useState(320); // in nm
            const [intensity, setIntensity] = useState(50);     // in %
            const [voltage, setVoltage] = useState(0.0);        // in V
            const [selectedMetal, setSelectedMetal] = useState('Sodium');
            const [activeMission, setActiveMission] = useState(null);
            const [customAlert, setCustomAlert] = useState(null);
            const [showTheory, setShowTheory] = useState(false);

            const canvasRef = useRef(null);

            // Physics Calculations
            const metal = METALS[selectedMetal];
            const workFunction = metal.phi;
            
            // Incident Photon Energy: E = hc / \lambda
            const photonEnergy = useMemo(() => hc / wavelength, [wavelength]);
            
            // Incident Frequency: f = c / \lambda
            const frequency = useMemo(() => (c_nm_s / wavelength) / 1e14, [wavelength]); // in 10^14 Hz
            
            // Threshold Frequency: f_0 = \Phi / h
            const thresholdFreq = useMemo(() => (workFunction / h_eV_s) / 1e14, [workFunction]); // in 10^14 Hz
            
            // Max Kinetic Energy: K_max = hf - \Phi
            const kMax = useMemo(() => Math.max(0, photonEnergy - workFunction), [photonEnergy, workFunction]);

            // Stopping Potential: V_0 = K_max / e
            const stoppingPotential = useMemo(() => kMax, [kMax]);

            // Real-time calculated current based on formula and environmental voltage
            const calculatedCurrent = useMemo(() => {
                if (photonEnergy < workFunction || intensity === 0) return 0;
                
                const maxCurrent = (intensity / 100) * 15.0; // max saturation current scale in microamps
                
                if (voltage <= -stoppingPotential) {
                    return 0;
                }
                
                if (voltage >= 1.5) {
                    return maxCurrent;
                }

                const range = 1.5 - (-stoppingPotential);
                const norm = (voltage - (-stoppingPotential)) / range;
                return maxCurrent * Math.pow(norm, 1.8);
            }, [photonEnergy, workFunction, intensity, voltage, stoppingPotential]);

            const triggerAlert = (message, type = 'info') => {
                setCustomAlert({ message, type });
                setTimeout(() => setCustomAlert(null), 5000);
            };

            const missions = [
                {
                    id: 'wave-failure',
                    title: 'Mission 1: Disproving Wave Theory 🚫🌊',
                    description: 'Classical wave theory claims that increasing light intensity should provide enough energy to eject electrons eventually. Let\'s prove this is false!',
                    steps: 'Select the Zinc plate. Dial light Intensity to 100% and Wavelength to Red (650 nm). Note that the Photocurrent remains exactly 0.00 µA! Now, drop Intensity to a tiny 5% but shift Wavelength to Ultraviolet (220 nm). You\'ll see instant electron emission!',
                    setup: () => {
                        setSelectedMetal('Zinc');
                        setIntensity(100);
                        setWavelength(650);
                        setVoltage(0.0);
                        triggerAlert("Mission 1 Loaded: High Intensity Red Light set on Zinc. Notice there is no emission!", "warning");
                    }
                },
                {
                    id: 'stopping-potential',
                    title: 'Mission 2: Dynamic Stopping Potential 🛑🔋',
                    description: 'Observe how retarding potential repels electrons, and find the exact negative potential that halts current.',
                    steps: 'Select Sodium plate and set Wavelength to 300 nm (UV). Watch fast electrons hit the collector. Now, drag the battery Voltage slider negative. Notice the electrons slowing down mid-flight and reversing direction! They will completely turn around exactly at the stopping potential -V₀.',
                    setup: () => {
                        setSelectedMetal('Sodium');
                        setWavelength(300);
                        setIntensity(60);
                        setVoltage(0.0);
                        triggerAlert("Mission 2 Loaded: Fast UV electrons active. Try sliding voltage negative to block them!", "info");
                    }
                },
                {
                    id: 'plancks-slope',
                    title: 'Mission 3: Slope of Planck\'s Constant 📐✨',
                    description: 'Discover why Einstein\'s line of K_max vs Frequency has the same slope (h) for all metals.',
                    steps: 'Click through different metals (Cesium, Sodium, Zinc) and watch the Kinetic Energy graph. The threshold intercept (f₀) shifts horizontally based on the metal\'s work function, but the slope remains perfectly parallel! This universal slope equals Planck\'s Constant.',
                    setup: () => {
                        setSelectedMetal('Cesium');
                        setWavelength(350);
                        setIntensity(50);
                        setVoltage(0.0);
                        triggerAlert("Mission 3 Loaded: Toggle between metals and observe the parallel linear slopes on the right plot!", "success");
                    }
                }
            ];

            // Real-time Canvas Animation
            useEffect(() => {
                const canvas = canvasRef.current;
                if (!canvas) return;
                const ctx = canvas.getContext('2d');
                
                const photons = [];
                const electrons = [];
                let animationFrameId;

                const emitterX = 140;
                const collectorX = 360;
                const tubeYMin = 60;
                const tubeYMax = 180;
                const centerY = (tubeYMin + tubeYMax) / 2;

                const dpr = window.devicePixelRatio || 1;
                canvas.width = 500 * dpr;
                canvas.height = 240 * dpr;
                canvas.style.width = '100%';
                canvas.style.height = '240px';
                ctx.scale(dpr, dpr);

                const render = () => {
                    ctx.clearRect(0, 0, 500, 240);

                    // 1. Draw Evacuated Quartz Tube
                    ctx.save();
                    ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
                    ctx.lineWidth = 2;
                    ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
                    ctx.beginPath();
                    ctx.roundRect(100, 50, 300, 140, 70);
                    ctx.fill();
                    ctx.stroke();

                    ctx.fillStyle = 'rgba(56, 189, 248, 0.1)';
                    ctx.beginPath();
                    ctx.arc(200, 50, 30, Math.PI, 0);
                    ctx.fill();
                    ctx.restore();

                    // 2. Draw Plates
                    const metalColor = metal.color;
                    ctx.save();
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = metalColor;
                    ctx.fillStyle = metalColor;
                    ctx.fillRect(emitterX - 10, tubeYMin + 15, 10, (tubeYMax - tubeYMin) - 30);
                    ctx.restore();

                    ctx.save();
                    ctx.fillStyle = '#64748b';
                    ctx.fillRect(collectorX, tubeYMin + 15, 10, (tubeYMax - tubeYMin) - 30);
                    ctx.restore();

                    ctx.fillStyle = '#94a3b8';
                    ctx.font = 'bold 11px sans-serif';
                    ctx.fillText("Emitter (-)", emitterX - 70, centerY + 4);
                    ctx.fillText("Collector (+)", collectorX + 20, centerY + 4);

                    // 3. Photon Logic
                    const photonColor = wavelengthToRGB(wavelength);
                    const isEmitting = photonEnergy >= workFunction;
                    
                    if (intensity > 0 && Math.random() < (intensity / 100) * 0.15) {
                        photons.push({
                            x: 100,
                            y: 20,
                            targetX: emitterX - 5,
                            targetY: tubeYMin + 20 + Math.random() * ((tubeYMax - tubeYMin) - 40),
                            progress: 0,
                            speed: 0.02 + (frequency * 0.001),
                            amplitude: 4,
                            frequency: frequency * 1.5
                        });
                    }

                    for (let i = photons.length - 1; i >= 0; i--) {
                        const p = photons[i];
                        p.progress += p.speed;

                        if (p.progress >= 1.0) {
                            if (isEmitting) {
                                const baseSpeed = Math.sqrt(kMax) * 1.2 + 0.3;
                                electrons.push({
                                    x: emitterX,
                                    y: p.targetY,
                                    vx: baseSpeed,
                                    vy: (Math.random() - 0.5) * 0.4,
                                    originalVx: baseSpeed,
                                    active: true
                                });
                            }
                            photons.splice(i, 1);
                        } else {
                            const curX = p.x + (p.targetX - p.x) * p.progress;
                            const curY = p.y + (p.targetY - p.y) * p.progress;

                            ctx.save();
                            ctx.strokeStyle = photonColor;
                            ctx.lineWidth = 1.8;
                            ctx.beginPath();
                            
                            const dx = p.targetX - p.x;
                            const dy = p.targetY - p.y;
                            const angle = Math.atan2(dy, dx);
                            
                            ctx.translate(curX, curY);
                            ctx.rotate(angle);

                            for (let xOffset = -15; xOffset <= 15; xOffset += 1) {
                                const yOffset = Math.sin(xOffset * (p.frequency * 0.2) - (Date.now() * 0.02)) * p.amplitude * Math.cos(xOffset / 15);
                                if (xOffset === -15) ctx.moveTo(xOffset, yOffset);
                                else ctx.lineTo(xOffset, yOffset);
                            }
                            ctx.stroke();
                            ctx.restore();
                        }
                    }

                    // 4. Electron Logic
                    const electricFieldAccel = voltage * 0.03; 

                    for (let i = electrons.length - 1; i >= 0; i--) {
                        const e = electrons[i];
                        
                        e.vx += electricFieldAccel;
                        e.x += e.vx;
                        e.y += e.vy;

                        if (e.x >= collectorX) {
                            ctx.save();
                            ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
                            ctx.beginPath();
                            ctx.arc(collectorX, e.y, 8, 0, Math.PI * 2);
                            ctx.fill();
                            ctx.restore();
                            
                            electrons.splice(i, 1);
                        } else if (e.x < emitterX) {
                            electrons.splice(i, 1);
                        } else if (e.y < tubeYMin + 10 || e.y > tubeYMax - 10) {
                            e.vy = -e.vy;
                        } else {
                            ctx.save();
                            ctx.fillStyle = '#38bdf8';
                            ctx.shadowBlur = 8;
                            ctx.shadowColor = '#0EA5E9';
                            ctx.beginPath();
                            ctx.arc(e.x, e.y, 4, 0, Math.PI * 2);
                            ctx.fill();
                            ctx.restore();

                            ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
                            ctx.lineWidth = 1;
                            ctx.beginPath();
                            ctx.moveTo(e.x, e.y);
                            ctx.lineTo(e.x - e.vx * 3, e.y - e.vy * 3);
                            ctx.stroke();
                        }
                    }

                    // 5. Draw Circuitry
                    ctx.save();
                    ctx.strokeStyle = '#334155';
                    ctx.lineWidth = 2;

                    ctx.beginPath();
                    ctx.moveTo(emitterX - 5, centerY);
                    ctx.lineTo(50, centerY);
                    ctx.lineTo(50, 220);
                    ctx.lineTo(180, 220);
                    ctx.moveTo(collectorX + 5, centerY);
                    ctx.lineTo(450, centerY);
                    ctx.lineTo(450, 220);
                    ctx.lineTo(320, 220);
                    ctx.stroke();

                    ctx.fillStyle = '#1e293b';
                    ctx.strokeStyle = '#475569';
                    ctx.beginPath();
                    ctx.roundRect(180, 205, 140, 30, 6);
                    ctx.fill();
                    ctx.stroke();

                    ctx.fillStyle = '#94a3b8';
                    ctx.font = '10px monospace';
                    ctx.fillText(voltage < 0 ? "[ + ]" : "[ - ]", 190, 224);
                    ctx.fillText(voltage < 0 ? "[ - ]" : "[ + ]", 290, 224);
                    ctx.fillText("BATTERY", 232, 224);

                    ctx.beginPath();
                    ctx.arc(50, 160, 12, 0, Math.PI * 2);
                    ctx.fillStyle = '#1e293b';
                    ctx.fill();
                    ctx.stroke();
                    ctx.fillStyle = '#38bdf8';
                    ctx.font = 'bold 10px sans-serif';
                    ctx.fillText("A", 46, 163);

                    ctx.beginPath();
                    ctx.arc(450, 160, 12, 0, Math.PI * 2);
                    ctx.fillStyle = '#1e293b';
                    ctx.fill();
                    ctx.stroke();
                    ctx.fillStyle = '#38bdf8';
                    ctx.fillText("V", 446, 163);

                    if (calculatedCurrent > 0) {
                        const wireSpeed = calculatedCurrent * 0.3;
                        const tick = (Date.now() * 0.05 * wireSpeed) % 100;
                        ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
                        const wirePts = [
                            { x: 50 + (130 * (tick/100)), y: 220 },
                            { x: 320 + (130 * ((100 - tick)/100)), y: 220 }
                        ];
                        wirePts.forEach(pt => {
                            ctx.beginPath();
                            ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
                            ctx.fill();
                        });
                    }
                    ctx.restore();

                    animationFrameId = requestAnimationFrame(render);
                };

                render();

                return () => cancelAnimationFrame(animationFrameId);
            }, [wavelength, intensity, voltage, selectedMetal, calculatedCurrent, kMax, frequency, workFunction, photonEnergy, metal]);

            return (
                <div className="flex-1 flex flex-col min-h-[36rem]">
                    {/* Header Banner */}
                    <header className="bg-slate-900 border-b border-slate-800 py-3 px-4 md:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center space-x-3">
                            <div className="bg-indigo-600 text-white p-2 rounded-lg shadow-lg shadow-indigo-500/20">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                            </div>
                            <div>
                                <h1 className="text-xl md:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent">Photoelectric Effect</h1>
                                <p className="text-xs text-slate-400">Class 12 CBSE & International Physics Sandbox Model</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3 self-start md:self-auto text-xs font-mono-custom">
                            <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded border border-slate-700">CBSE Physics Chapter 11</span>
                            <span className="bg-indigo-950 text-indigo-400 px-2.5 py-1 rounded border border-indigo-900">Dual Nature of Matter</span>
                            <button 
                                onClick={() => setShowTheory(!showTheory)}
                                className="bg-emerald-950 text-emerald-400 px-3 py-1 rounded border border-emerald-900 hover:bg-emerald-900 hover:text-white transition flex items-center gap-1"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                                {showTheory ? "Hide Theory" : "Show Theory Summary"}
                            </button>
                        </div>
                    </header>

                    {/* Alert Banner */}
                    {customAlert && (
                        <div className={`px-6 py-2.5 text-sm font-medium flex items-center justify-between transition-all duration-300 ${
                            customAlert.type === 'success' ? 'bg-emerald-900/80 border-b border-emerald-700 text-emerald-200' :
                            customAlert.type === 'warning' ? 'bg-amber-950/80 border-b border-amber-700 text-amber-200' :
                            'bg-indigo-950/80 border-b border-indigo-700 text-indigo-200'
                        }`}>
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                <span>{customAlert.message}</span>
                            </div>
                            <button onClick={() => setCustomAlert(null)} className="text-slate-400 hover:text-white">&times;</button>
                        </div>
                    )}

                    {/* Quick Theory Panel */}
                    {showTheory && (
                        <div className="bg-slate-900 border-b border-indigo-950 p-6 transition-all duration-300 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                                <h3 className="text-indigo-400 font-bold mb-2">1. The Particle Nature of Light</h3>
                                <p className="text-xs text-slate-300 leading-relaxed">
                                    Light consists of packet-like bundles of energy called <strong>photons</strong>. The energy of each photon depends only on frequency <span className="font-mono text-indigo-300">{"(E=hf)"}</span>, not on intensity. 
                                    Increasing intensity only increases the quantity of photons, not their energy. Thus, below a threshold frequency, even highly bright light fails to trigger emission.
                                </p>
                            </div>
                            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                                <h3 className="text-emerald-400 font-bold mb-2">2. Einstein's Photoelectric Equation</h3>
                                <p className="text-xs text-slate-300 leading-relaxed">
                                    Einstein formulated: <strong className="text-emerald-300 font-mono">{"K_max = hf - Φ"}</strong>. When a photon strikes, its energy is divided: first, to overcome the metal's electron-binding forces (the Work Function Φ), and the remainder becomes the electron's Maximum Kinetic Energy <span className="font-mono text-emerald-300">{"(K_max)"}</span>.
                                </p>
                            </div>
                            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                                <h3 className="text-sky-400 font-bold mb-2">3. Stopping/Retarding Potential</h3>
                                <p className="text-xs text-slate-300 leading-relaxed">
                                    A negative voltage on the collector plate creates an electric field that opposes electron flow. The precise potential that halts even the most energetic electrons is the <strong>Stopping Potential (V₀)</strong>, related directly via: <strong className="text-sky-300 font-mono">{"K_max = e V₀"}</strong>.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 p-4 md:p-6">
                        
                        {/* LEFT COLUMN: Controls Panel */}
                        <div className="lg:col-span-4 bg-slate-900 rounded-xl p-5 border border-slate-800 flex flex-col justify-between shadow-md">
                            <div>
                                <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
                                    <h2 className="font-bold text-slate-200 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
                                        Control Deck
                                    </h2>
                                    <span className="text-[10px] bg-indigo-950 text-indigo-400 font-semibold px-2 py-0.5 rounded border border-indigo-800 uppercase">Input parameters</span>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">1. Target Metal Preset (Φ)</label>
                                    <div className="grid grid-cols-5 gap-2 mb-2">
                                        {Object.values(METALS).map(m => (
                                            <button
                                                key={m.name}
                                                onClick={() => {
                                                    setSelectedMetal(m.name);
                                                    triggerAlert(`Target Metal changed to ${m.name} (Work Function Φ = ${m.phi} eV)`, "info");
                                                }}
                                                className={`py-2 rounded text-xs font-bold transition-all border ${
                                                    selectedMetal === m.name 
                                                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/20 scale-105' 
                                                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                                                }`}
                                            >
                                                {m.symbol}
                                                <span className="block text-[9px] font-normal opacity-75">{m.phi}eV</span>
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-[11px] text-slate-400 italic font-medium">{metal.desc}</p>
                                </div>

                                <div className="mb-5">
                                    <div className="flex justify-between text-xs font-semibold tracking-wider text-slate-400 uppercase mb-2">
                                        <span>2. Light Wavelength (λ)</span>
                                        <span className="font-mono-custom text-indigo-400 text-sm font-bold">{wavelength} nm</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="100" 
                                        max="800" 
                                        value={wavelength}
                                        onChange={(e) => setWavelength(parseInt(e.target.value))}
                                        className="w-full h-2 rounded-lg appearance-none cursor-pointer mb-2"
                                        style={{
                                            background: 'linear-gradient(to right, #bc3ffa 0%, #7000FF 15%, #0055FF 35%, #00E5FF 50%, #00FF33 65%, #FFCC00 75%, #FF0000 90%, #8B0000 100%)'
                                        }}
                                    />
                                    <div className="flex justify-between text-[10px] text-slate-500 font-bold px-1 font-mono-custom">
                                        <span>100nm (UV)</span>
                                        <span className="text-indigo-400">Violet (400nm)</span>
                                        <span className="text-red-500">Red (700nm)</span>
                                        <span>800nm (IR)</span>
                                    </div>
                                </div>

                                <div className="mb-5">
                                    <div className="flex justify-between text-xs font-semibold tracking-wider text-slate-400 uppercase mb-2">
                                        <span>3. Light Intensity (I)</span>
                                        <span className="font-mono-custom text-sky-400 text-sm font-bold">{intensity}%</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="100" 
                                        value={intensity}
                                        onChange={(e) => setIntensity(parseInt(e.target.value))}
                                        className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-sky-400"
                                    />
                                    <div className="flex justify-between text-[10px] text-slate-500 font-bold px-1">
                                        <span>Off (0%)</span>
                                        <span>Medium Brightness</span>
                                        <span>Full Power (100%)</span>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <div className="flex justify-between text-xs font-semibold tracking-wider text-slate-400 uppercase mb-2">
                                        <span>4. Retarding / Accelerating Voltage (V)</span>
                                        <span className={`font-mono-custom text-sm font-bold ${voltage < 0 ? 'text-rose-400' : voltage > 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
                                            {voltage > 0 ? `+${voltage.toFixed(2)}` : voltage.toFixed(2)} V
                                        </span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="-6.0" 
                                        max="4.0" 
                                        step="0.05"
                                        value={voltage}
                                        onChange={(e) => setVoltage(parseFloat(e.target.value))}
                                        className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                    />
                                    <div className="flex justify-between text-[10px] text-slate-500 font-bold px-1">
                                        <span className="text-rose-500">Retarding (-6.0V)</span>
                                        <span>0.0V (Neutral)</span>
                                        <span className="text-emerald-500">Accelerating (+4.0V)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 mt-4">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Quick presets</span>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <button 
                                        onClick={() => { setWavelength(250); setVoltage(0.0); setIntensity(50); }}
                                        className="bg-slate-900 border border-slate-700 rounded py-1 px-2 hover:bg-slate-800 hover:text-white transition"
                                    >
                                        Shine Ultraviolet
                                    </button>
                                    <button 
                                        onClick={() => { setWavelength(650); setVoltage(0.0); setIntensity(100); }}
                                        className="bg-slate-900 border border-slate-700 rounded py-1 px-2 hover:bg-slate-800 hover:text-white transition"
                                    >
                                        Shine Red Light
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* CENTER COLUMN: Vacuum Tube */}
                        <div className="lg:col-span-5 flex flex-col space-y-4">
                            
                            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 shadow-md flex-1 flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-2">
                                    <h2 className="font-bold text-slate-200 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
                                        Main Vacuum Chamber
                                    </h2>
                                    <span className="text-[10px] bg-sky-950 text-sky-400 font-semibold px-2 py-0.5 rounded border border-sky-800 uppercase">Live Renderer</span>
                                </div>

                                <div className="relative bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex-1 flex items-center justify-center">
                                    <canvas ref={canvasRef} className="block w-full h-[240px]"></canvas>

                                    {photonEnergy < workFunction && intensity > 0 && (
                                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-rose-950/90 border border-rose-800 text-rose-300 text-[10px] px-3 py-1 rounded-full font-bold shadow-lg animate-pulse tracking-wide flex items-center gap-1">
                                            <span className="inline-block w-2 h-2 rounded-full bg-rose-500"></span>
                                            E_photon ({photonEnergy.toFixed(2)}eV) &lt; Φ ({workFunction.toFixed(2)}eV) : NO ELECTRON EJECTION
                                        </div>
                                    )}
                                    {photonEnergy >= workFunction && intensity > 0 && (
                                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-emerald-950/90 border border-emerald-800 text-emerald-300 text-[10px] px-3 py-1 rounded-full font-bold shadow-lg tracking-wide flex items-center gap-1">
                                            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                                            E_photon ({photonEnergy.toFixed(2)}eV) &ge; Φ ({workFunction.toFixed(2)}eV) : ACTIVE PHOTOEMISSION
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-3">
                                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                                        <div>
                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Photocurrent (I_photo)</span>
                                            <span className="text-xl font-bold font-mono-custom text-sky-400">
                                                {calculatedCurrent.toFixed(2)} <span className="text-xs font-normal">µA</span>
                                            </span>
                                        </div>
                                        <div className="bg-sky-950/50 p-2 rounded border border-sky-900">
                                            <svg className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                                        </div>
                                    </div>

                                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                                        <div>
                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Terminal Potential</span>
                                            <span className={`text-xl font-bold font-mono-custom ${voltage < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                                {voltage > 0 ? `+${voltage.toFixed(2)}` : voltage.toFixed(2)} <span className="text-xs font-normal">V</span>
                                            </span>
                                        </div>
                                        <div className="bg-slate-900 p-2 rounded border border-slate-800">
                                            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* Lab Assistant */}
                            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 shadow-md flex flex-col h-56">
                                <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-800">
                                    <h3 className="font-bold text-slate-300 flex items-center gap-1.5 text-sm">
                                        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
                                        Guided Interactive Lab Assistant
                                    </h3>
                                    <span className="text-[9px] bg-emerald-950 text-emerald-400 font-semibold px-2 py-0.5 rounded">Grade 12 Practical Aligned</span>
                                </div>
                                <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                                    {activeMission ? (
                                        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-xs">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <h4 className="font-bold text-indigo-300">{activeMission.title}</h4>
                                                <button 
                                                    onClick={() => { setActiveMission(null); triggerAlert("Mission Exited", "info"); }}
                                                    className="text-[10px] text-slate-500 hover:text-slate-300 underline"
                                                >
                                                    Reset Sandbox
                                                </button>
                                            </div>
                                            <p className="text-slate-300 mb-2 font-medium">{activeMission.description}</p>
                                            <div className="bg-slate-900 p-2 rounded text-slate-400 font-mono-custom text-[11px] leading-relaxed border border-slate-800">
                                                <strong className="text-emerald-400 uppercase tracking-wide block mb-1">Interactive Steps:</strong>
                                                {activeMission.steps}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-2">
                                            <p className="text-[11px] text-slate-400 mb-1">Click a mission setup to load live experimental parameters directly into the sandbox:</p>
                                            {missions.map(mission => (
                                                <button
                                                    key={mission.id}
                                                    onClick={() => {
                                                        setActiveMission(mission);
                                                        mission.setup();
                                                    }}
                                                    className="w-full text-left bg-slate-950 hover:bg-slate-800/80 p-2 rounded-lg border border-slate-800 text-xs flex items-center justify-between transition group"
                                                >
                                                    <div>
                                                        <span className="font-bold text-slate-200 group-hover:text-indigo-400 block transition">{mission.title}</span>
                                                        <span className="text-[10px] text-slate-400 line-clamp-1">{mission.description}</span>
                                                    </div>
                                                    <svg className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>

                        {/* RIGHT COLUMN: Math Dashboard */}
                        <div className="lg:col-span-3 flex flex-col space-y-4">
                            
                            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 shadow-md">
                                <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-1.5">
                                    <h2 className="font-bold text-slate-200 flex items-center gap-1.5 text-sm">
                                        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                                        Live Equations & Math
                                    </h2>
                                    <span className="text-[9px] bg-slate-800 text-slate-400 font-semibold px-2 py-0.5 rounded">Quantum Rules</span>
                                </div>

                                <div className="space-y-3 text-xs">
                                    <div className="bg-slate-950 p-2.5 rounded border border-slate-800 group hover:border-indigo-500 transition">
                                        <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase mb-1">
                                            <span>Incident Energy</span>
                                            <span className="text-indigo-400 font-mono-custom">E = hf = hc / λ</span>
                                        </div>
                                        <div className="text-slate-300 font-semibold flex items-center gap-1">
                                            <span>E =</span>
                                            <span className="text-sm font-bold font-mono-custom text-slate-100">{photonEnergy.toFixed(2)} eV</span>
                                            <span className="text-slate-500 text-[10px] font-normal font-mono-custom">({frequency.toFixed(2)} &times; 10¹⁴ Hz)</span>
                                        </div>
                                    </div>

                                    <div className="bg-slate-950 p-2.5 rounded border border-slate-800 group hover:border-emerald-500 transition">
                                        <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase mb-1">
                                            <span>Einstein's Eq.</span>
                                            <span className="text-emerald-400 font-mono-custom">{"K_max = hf - Φ"}</span>
                                        </div>
                                        <div className="text-slate-300 font-semibold flex items-center gap-1">
                                            <span>K_max =</span>
                                            <span className="text-sm font-bold font-mono-custom text-emerald-400">{kMax.toFixed(2)} eV</span>
                                            <span className="text-slate-500 text-[10px] font-normal">
                                                {kMax > 0 ? " (Ejected!)" : " (No Energy)"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-slate-950 p-2.5 rounded border border-slate-800 group hover:border-sky-500 transition">
                                        <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase mb-1">
                                            <span>Stopping Volt</span>
                                            <span className="text-sky-400 font-mono-custom">e V₀ = K_max</span>
                                        </div>
                                        <div className="text-slate-300 font-semibold flex items-center gap-1">
                                            <span>V₀ =</span>
                                            <span className="text-sm font-bold font-mono-custom text-sky-400">-{stoppingPotential.toFixed(2)} V</span>
                                            <span className="text-slate-500 text-[10px] font-normal"> (Cut-off point)</span>
                                        </div>
                                    </div>

                                    <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Energy Ratio (E vs Φ)</span>
                                        <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden flex">
                                            <div className="bg-indigo-500 h-full" style={{ width: `${Math.min(100, (workFunction / Math.max(0.1, photonEnergy)) * 100)}%` }}></div>
                                            <div className="bg-emerald-500 h-full" style={{ width: `${Math.max(0, 100 - (workFunction / Math.max(0.1, photonEnergy)) * 100)}%` }}></div>
                                        </div>
                                        <div className="flex justify-between text-[9px] text-slate-500 mt-1 font-mono-custom">
                                            <span>Work Function: {workFunction.toFixed(1)}eV</span>
                                            <span className="text-emerald-400">Excess K_max: {kMax.toFixed(1)}eV</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900 rounded-xl p-3 border border-slate-800">
                                <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Physical Constants Reference</span>
                                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono-custom text-slate-400 leading-normal">
                                    <div>Planck Constant (h):<span className="block text-slate-200">4.136 &times; 10⁻¹⁵ eV&middot;s</span></div>
                                    <div>Speed of Light (c):<span className="block text-slate-200">3 &times; 10¹⁷ nm/s</span></div>
                                    <div className="col-span-2 border-t border-slate-800 pt-1 mt-1">
                                        hc product ≈ 1240 eV&middot;nm
                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>

                    {/* DUAL PLOT OSCILLOSCOPE ROW */}
                    <div className="bg-slate-950 border-t border-slate-800 p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* GRAPH 1: I vs V Graph */}
                        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex flex-col">
                            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                                <div>
                                    <h3 className="font-bold text-slate-200 text-sm">Photocurrent (I) vs. Collector Potential (V)</h3>
                                    <p className="text-[10px] text-slate-400">Shows saturated current plateau and negative stopping potential cut-off</p>
                                </div>
                                <span className="text-[10px] bg-indigo-950 text-indigo-400 border border-indigo-800 px-2 py-0.5 rounded font-bold">I-V Plot</span>
                            </div>

                            <div className="relative flex-1 min-h-[160px] bg-slate-950 rounded-lg p-2 border border-slate-850">
                                <svg viewBox="0 0 400 180" className="w-full h-full overflow-visible">
                                    <line x1="40" y1="150" x2="380" y2="150" stroke="#1e293b" strokeWidth="1.5" /> 
                                    <line x1="210" y1="10" x2="210" y2="160" stroke="#1e293b" strokeWidth="1" strokeDasharray="2,2" /> 
                                    <line x1="40" y1="10" x2="40" y2="150" stroke="#1e293b" strokeWidth="1.5" /> 

                                    <text x="375" y="165" fill="#64748b" fontSize="10" textAnchor="end" fontWeight="bold">V (Volts)</text>
                                    <text x="15" y="20" fill="#64748b" fontSize="10" transform="rotate(-90 15 20)" textAnchor="end" fontWeight="bold">I (µA)</text>
                                    <text x="210" y="165" fill="#64748b" fontSize="9" textAnchor="middle">0V</text>

                                    {(() => {
                                        if (photonEnergy < workFunction || intensity === 0) {
                                            return <line x1="40" y1="150" x2="380" y2="150" stroke="#334155" strokeWidth="2" />;
                                        }

                                        const mapX = (v) => 40 + ((v - (-6.0)) / 10.0) * 340;
                                        const maxCurrentVal = (intensity / 100) * 15.0;
                                        const mapY = (i) => 150 - (i / 15.0) * 120; 

                                        let pathD = "";
                                        for (let v = -6.0; v <= 4.0; v += 0.1) {
                                            let cur = 0;
                                            if (v > -stoppingPotential) {
                                                if (v >= 1.5) {
                                                    cur = maxCurrentVal;
                                                } else {
                                                    const range = 1.5 - (-stoppingPotential);
                                                    const norm = (v - (-stoppingPotential)) / range;
                                                    cur = maxCurrentVal * Math.pow(norm, 1.8);
                                                }
                                            }
                                            const px = mapX(v);
                                            const py = mapY(cur);
                                            if (v === -6.0) pathD += `M ${px} ${py}`;
                                            else pathD += ` L ${px} ${py}`;
                                        }

                                        const stopX = mapX(-stoppingPotential);

                                        return (
                                            <g>
                                                <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="2.5" />
                                                
                                                {stoppingPotential > 0 && (
                                                    <g>
                                                        <line x1={stopX} y1="10" x2={stopX} y2="150" stroke="#f43f5e" strokeDasharray="3,3" />
                                                        <text x={stopX} y="165" fill="#f43f5e" fontSize="9" textAnchor="middle" fontWeight="bold">
                                                            -V₀ (-{stoppingPotential.toFixed(2)}V)
                                                        </text>
                                                    </g>
                                                )}

                                                {(() => {
                                                    const activeX = mapX(voltage);
                                                    const activeY = mapY(calculatedCurrent);
                                                    return (
                                                        <g>
                                                            <circle cx={activeX} cy={activeY} r="5" fill="#38bdf8" />
                                                            <circle cx={activeX} cy={activeY} r="9" fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.6" className="animate-ping" style={{ transformOrigin: `${activeX}px ${activeY}px` }} />
                                                        </g>
                                                    );
                                                })()}
                                            </g>
                                        );
                                    })()}
                                </svg>
                            </div>
                        </div>

                        {/* GRAPH 2: K_max vs f Graph */}
                        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex flex-col">
                            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                                <div>
                                    <h3 className="font-bold text-slate-200 text-sm">Max Kinetic Energy (K_max) vs. Frequency (f)</h3>
                                    <p className="text-[10px] text-slate-400">Slope equals Planck's Constant (h). Intercept on X-axis is threshold frequency (f₀)</p>
                                </div>
                                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-bold">Planck's Slope</span>
                            </div>

                            <div className="relative flex-1 min-h-[160px] bg-slate-950 rounded-lg p-2 border border-slate-850">
                                <svg viewBox="0 0 400 180" className="w-full h-full overflow-visible">
                                    <line x1="40" y1="90" x2="380" y2="90" stroke="#1e293b" strokeWidth="1.5" /> 
                                    <line x1="40" y1="10" x2="40" y2="170" stroke="#1e293b" strokeWidth="1.5" /> 
                                    
                                    <text x="375" y="105" fill="#64748b" fontSize="10" textAnchor="end" fontWeight="bold">f (10¹⁴ Hz)</text>
                                    <text x="15" y="20" fill="#64748b" fontSize="10" transform="rotate(-90 15 20)" textAnchor="end" fontWeight="bold">K_max (eV)</text>

                                    {(() => {
                                        const mapX = (f) => 40 + (f / 25.0) * 340;
                                        const mapY = (k) => 90 - (k / 6.0) * 80;

                                        const threshX = mapX(thresholdFreq);
                                        const yInterceptY = mapY(-workFunction);

                                        const startX = mapX(0);
                                        const startY = mapY(-workFunction);
                                        const endX = mapX(25.0);
                                        const endY = mapY(25.0 * h_eV_s * 1e14 - workFunction);

                                        return (
                                            <g>
                                                <line x1={startX} y1={startY} x2={threshX} y2="90" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3,3" />
                                                
                                                <line x1={threshX} y1="90" x2={endX} y2={endY} stroke="#10b981" strokeWidth="2.5" />

                                                <circle cx={threshX} cy="90" r="4" fill="#10b981" />
                                                <text x={threshX} y="80" fill="#10b981" fontSize="9" textAnchor="middle" fontWeight="bold">
                                                    f₀ ({thresholdFreq.toFixed(1)})
                                                </text>

                                                <circle cx="40" cy={yInterceptY} r="3" fill="#ef4444" />
                                                <text x="48" y={yInterceptY + 3} fill="#ef4444" fontSize="9" textAnchor="start" fontWeight="bold">
                                                    -Φ (-{workFunction.toFixed(2)} eV)
                                                </text>

                                                {(() => {
                                                    const activeX = mapX(frequency);
                                                    const activeY = mapY(kMax);
                                                    return (
                                                        <g>
                                                            <circle cx={activeX} cy={activeY} r="5" fill="#38bdf8" />
                                                            <circle cx={activeX} cy={activeY} r="9" fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.6" className="animate-ping" style={{ transformOrigin: `${activeX}px ${activeY}px` }} />
                                                        </g>
                                                    );
                                                })()}
                                            </g>
                                        );
                                    })()}
                                </svg>
                            </div>
                        </div>

                    </div>

                    <footer className="bg-slate-900 border-t border-slate-800 p-4 text-xs text-slate-400 text-center font-medium flex flex-col md:flex-row justify-between items-center gap-3">
                        <div className="flex items-center space-x-2">
                            <span className="bg-indigo-950 text-indigo-400 border border-indigo-900 text-[10px] uppercase font-bold px-2 py-0.5 rounded">Core Board Takeaways</span>
                            <span>Photocurrent is directly proportional to intensity. Max kinetic energy depends linearly on frequency.</span>
                        </div>
                        <div className="text-slate-500 text-[11px]">
                            &copy; 2026 High-Fidelity Physics Sandbox Series
                        </div>
                    </footer>
                </div>
            );
        }
