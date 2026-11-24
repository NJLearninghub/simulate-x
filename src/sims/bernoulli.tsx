import React, { useState, useEffect, useRef } from 'react';
import { Settings, Info, Activity, Droplet } from 'lucide-react';

const BernoulliSimulation = () => {
  // --- Physics State ---
  const [p1_kPa, setP1_kPa] = useState(150); // Input Pressure 1 in kPa
  const [v1, setV1] = useState(2); // Input Velocity 1 in m/s
  const [h1, setH1] = useState(2); // Height 1 in meters
  const [r1, setR1] = useState(0.4); // Radius 1 in meters

  const [h2, setH2] = useState(4); // Height 2 in meters
  const [r2, setR2] = useState(0.2); // Radius 2 in meters
  
  const rho = 1000; // Density of water (kg/m^3)
  const g = 9.81; // Gravity (m/s^2)

  // --- Derived Physics Calculations ---
  // Continuity Equation: A1 * v1 = A2 * v2  =>  v2 = v1 * (r1^2 / r2^2)
  const v2 = v1 * Math.pow(r1 / r2, 2);

  // Convert P1 to Pascals
  const p1_Pa = p1_kPa * 1000;

  // Calculate Energy Terms (Joules per cubic meter, or Pascals)
  const kinetic1 = 0.5 * rho * Math.pow(v1, 2);
  const potential1 = rho * g * h1;
  const totalEnergy = p1_Pa + kinetic1 + potential1;

  const kinetic2 = 0.5 * rho * Math.pow(v2, 2);
  const potential2 = rho * g * h2;
  
  // Bernoulli's Equation: P1 + K1 + U1 = P2 + K2 + U2
  const p2_Pa = totalEnergy - kinetic2 - potential2;
  const p2_kPa = p2_Pa / 1000;

  // --- Canvas Animation Setup ---
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);

  // Initialize particles
  useEffect(() => {
    const numParticles = 150;
    particlesRef.current = Array.from({ length: numParticles }).map(() => ({
      x: Math.random() * 10, // x position from 0 to 10 (meters)
      yOffset: (Math.random() - 0.5) * 2, // relative radial position from -1 to 1
      speedMultiplier: 0.8 + Math.random() * 0.4, // slight speed variation for realism
    }));
  }, []);

  // Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let lastTime = performance.now();

    const draw = (time) => {
      const dt = (time - lastTime) / 1000; // Delta time in seconds
      lastTime = time;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Simulation Dimensions (0-10 meters X, 0-8 meters Y)
      const scaleX = canvas.width / 10;
      const scaleY = canvas.height / 8;
      
      const getY = (meters) => canvas.height - (meters * scaleY);
      const getX = (meters) => meters * scaleX;

      // Draw Grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 10; i++) {
        ctx.beginPath(); ctx.moveTo(getX(i), 0); ctx.lineTo(getX(i), canvas.height); ctx.stroke();
      }
      for (let i = 0; i <= 8; i++) {
        ctx.beginPath(); ctx.moveTo(0, getY(i)); ctx.lineTo(canvas.width, getY(i)); ctx.stroke();
      }

      // --- Pipe Geometry ---
      // We use a cosine interpolation for a smooth Venturi tube look
      const getPipeRadius = (x) => {
        const t = x / 10;
        const smoothT = (1 - Math.cos(t * Math.PI)) / 2; // 0 to 1 smooth curve
        return r1 + (r2 - r1) * smoothT;
      };
      const getPipeHeight = (x) => {
        const t = x / 10;
        const smoothT = (1 - Math.cos(t * Math.PI)) / 2;
        return h1 + (h2 - h1) * smoothT;
      };

      // Draw Pipe Background
      ctx.beginPath();
      for (let x = 0; x <= 10; x += 0.2) {
        ctx.lineTo(getX(x), getY(getPipeHeight(x) + getPipeRadius(x)));
      }
      for (let x = 10; x >= 0; x -= 0.2) {
        ctx.lineTo(getX(x), getY(getPipeHeight(x) - getPipeRadius(x)));
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(56, 189, 248, 0.15)'; // Light blue fluid
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 3;
      ctx.stroke();

      // --- Particles (Fluid Flow) ---
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      particlesRef.current.forEach(p => {
        // Calculate velocity at current x based on continuity equation
        const currentR = getPipeRadius(p.x);
        const currentA = Math.PI * currentR * currentR;
        const A1 = Math.PI * r1 * r1;
        const currentV = v1 * (A1 / currentA);

        // Move particle
        p.x += currentV * dt * p.speedMultiplier;

        // Reset if it goes off screen
        if (p.x > 10) {
          p.x = 0;
          p.yOffset = (Math.random() - 0.5) * 2;
        }

        // Calculate visual Y position
        const currentH = getPipeHeight(p.x);
        // Distribute particles across the cross-section
        const visualY = currentH + (p.yOffset * currentR * 0.9); 

        ctx.beginPath();
        ctx.arc(getX(p.x), getY(visualY), 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // --- Manometers (Pressure Visualizers) ---
      const drawManometer = (x, pipeH, pipeR, pressurePa) => {
        const pxX = getX(x);
        const pxY_base = getY(pipeH + pipeR);
        // Convert pressure to fluid height (h = P / rho*g)
        const fluidColumnHeight = pressurePa / (rho * g); 
        // Scale down visually so it fits on screen (just for visualization purposes)
        const visualColHeight = fluidColumnHeight * 0.15; 
        const pxY_top = getY(pipeH + pipeR + visualColHeight);
        const pxY_tubeTop = getY(8); // Top of the screen

        // Tube
        ctx.beginPath();
        ctx.moveTo(pxX - 8, pxY_base);
        ctx.lineTo(pxX - 8, pxY_tubeTop);
        ctx.moveTo(pxX + 8, pxY_base);
        ctx.lineTo(pxX + 8, pxY_tubeTop);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Fluid inside
        if (pressurePa > 0) {
          ctx.beginPath();
          ctx.moveTo(pxX - 7, pxY_base);
          ctx.lineTo(pxX - 7, pxY_top);
          ctx.lineTo(pxX + 7, pxY_top);
          ctx.lineTo(pxX + 7, pxY_base);
          ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
          ctx.fill();
        }

        // Label
        ctx.fillStyle = '#fff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`P = ${(pressurePa/1000).toFixed(1)} kPa`, pxX, pxY_tubeTop + 20);
      };

      drawManometer(1.5, getPipeHeight(1.5), getPipeRadius(1.5), p1_Pa);
      drawManometer(8.5, getPipeHeight(8.5), getPipeRadius(8.5), p2_Pa);

      animationFrameId = requestAnimationFrame(draw);
    };

    animationFrameId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationFrameId);
  }, [p1_kPa, v1, h1, r1, h2, r2, p1_Pa, p2_Pa, rho, g]);


  // Helper component for the Energy Bars
  const VerticalEnergyBar = ({ pressure, kinetic, potential }) => {
    // Normalize to percentage of a fixed maximum (e.g., 350,000 Pa) for visual scaling
    const maxScale = 350000; 
    const pPct = Math.max(0, (pressure / maxScale) * 100);
    const kPct = Math.max(0, (kinetic / maxScale) * 100);
    const uPct = Math.max(0, (potential / maxScale) * 100);

    return (
      <div className="w-10 h-32 md:h-48 bg-slate-800/80 backdrop-blur rounded-lg overflow-hidden flex flex-col-reverse shadow-inner border border-slate-700/50">
        <div style={{ height: `${uPct}%` }} className="bg-orange-500 transition-all duration-300 flex items-center justify-center text-xs font-bold text-white overflow-hidden" title="Hydrostatic (Potential)">U</div>
        <div style={{ height: `${pPct}%` }} className="bg-blue-500 transition-all duration-300 flex items-center justify-center text-xs font-bold text-white overflow-hidden" title="Static Pressure">P</div>
        <div style={{ height: `${kPct}%` }} className="bg-green-500 transition-all duration-300 flex items-center justify-center text-xs font-bold text-white overflow-hidden" title="Dynamic (Kinetic)">K</div>
      </div>
    );
  };

  return (
    <div className="min-h-[36rem] bg-slate-950 text-slate-200 font-sans p-6 selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Droplet className="text-blue-400" size={32} />
              Bernoulli's Principle
            </h1>
            <p className="text-slate-400 mt-1">Interact with the terms to see how energy transforms in a flowing fluid.</p>
          </div>
        </div>

        {/* Main Simulation Canvas */}
        <div className="relative bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden aspect-video max-h-[500px]">
          <canvas 
            ref={canvasRef} 
            width={800} 
            height={400} 
            className="w-full h-full object-contain"
          />
          
          {/* Energy Bar Overlays */}
          <div className="absolute top-1/2 left-2 md:left-6 -translate-y-1/2 flex flex-col items-center gap-2 pointer-events-none">
            <span className="text-[10px] md:text-xs font-bold text-slate-300 bg-slate-950/80 px-2 py-1 rounded border border-slate-700 backdrop-blur shadow">Pt 1 Energy</span>
            <VerticalEnergyBar pressure={p1_Pa} kinetic={kinetic1} potential={potential1} />
          </div>

          <div className="absolute top-1/2 right-2 md:right-6 -translate-y-1/2 flex flex-col items-center gap-2 pointer-events-none">
            <span className="text-[10px] md:text-xs font-bold text-slate-300 bg-slate-950/80 px-2 py-1 rounded border border-slate-700 backdrop-blur shadow">Pt 2 Energy</span>
            <VerticalEnergyBar pressure={p2_Pa} kinetic={kinetic2} potential={potential2} />
          </div>

          {p2_kPa < 0 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded-lg font-bold shadow-lg animate-pulse">
              Warning: Negative Pressure (Cavitation)
            </div>
          )}
        </div>

        {/* Dashboards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Controls Panel */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl lg:col-span-1 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <Settings size={20} className="text-slate-400"/> System Controls
            </h2>
            
            <div className="space-y-4">
              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
                <h3 className="text-sm font-semibold text-blue-400 mb-3">Point 1 (Input)</h3>
                
                <div className="space-y-3">
                  <label className="block text-sm">
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Pressure (P₁)</span>
                      <span className="font-mono text-blue-300">{p1_kPa} kPa</span>
                    </div>
                    <input type="range" min="50" max="300" step="5" value={p1_kPa} onChange={(e) => setP1_kPa(Number(e.target.value))} className="w-full accent-blue-500" />
                  </label>

                  <label className="block text-sm">
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Velocity (v₁)</span>
                      <span className="font-mono text-green-300">{v1.toFixed(1)} m/s</span>
                    </div>
                    <input type="range" min="0.5" max="10" step="0.5" value={v1} onChange={(e) => setV1(Number(e.target.value))} className="w-full accent-green-500" />
                  </label>

                  <label className="block text-sm">
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Elevation (h₁)</span>
                      <span className="font-mono text-orange-300">{h1.toFixed(1)} m</span>
                    </div>
                    <input type="range" min="0.5" max="7" step="0.5" value={h1} onChange={(e) => setH1(Number(e.target.value))} className="w-full accent-orange-500" />
                  </label>
                  
                  <label className="block text-sm">
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Pipe Radius (r₁)</span>
                      <span className="font-mono text-slate-300">{r1.toFixed(2)} m</span>
                    </div>
                    <input type="range" min="0.1" max="1.0" step="0.1" value={r1} onChange={(e) => setR1(Number(e.target.value))} className="w-full accent-slate-400" />
                  </label>
                </div>
              </div>

              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
                <h3 className="text-sm font-semibold text-blue-400 mb-3">Point 2 (Output constraints)</h3>
                <div className="space-y-3">
                  <label className="block text-sm">
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Elevation (h₂)</span>
                      <span className="font-mono text-orange-300">{h2.toFixed(1)} m</span>
                    </div>
                    <input type="range" min="0.5" max="7" step="0.5" value={h2} onChange={(e) => setH2(Number(e.target.value))} className="w-full accent-orange-500" />
                  </label>

                  <label className="block text-sm">
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Pipe Radius (r₂)</span>
                      <span className="font-mono text-slate-300">{r2.toFixed(2)} m</span>
                    </div>
                    <input type="range" min="0.1" max="1.0" step="0.1" value={r2} onChange={(e) => setR2(Number(e.target.value))} className="w-full accent-slate-400" />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Equation Breakdown Panel */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl lg:col-span-2 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <Activity size={20} className="text-green-400"/> Conservation of Energy per Unit Volume
            </h2>

            <div className="text-center font-mono text-lg md:text-xl py-4 bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto whitespace-nowrap">
              <span className="text-blue-400">P₁</span> + <span className="text-green-400">½ρv₁²</span> + <span className="text-orange-400">ρgh₁</span> = <span className="text-blue-400">P₂</span> + <span className="text-green-400">½ρv₂²</span> + <span className="text-orange-400">ρgh₂</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Point 1 Breakdown */}
              <div className="space-y-4">
                <h3 className="text-center font-bold text-slate-300">Point 1 (Input)</h3>
                
                <div className="space-y-2 font-mono text-sm">
                  <div className="flex justify-between items-center p-2 rounded bg-slate-950/50 border-l-4 border-blue-500">
                    <span className="text-slate-400">Static Pressure <span className="text-blue-400">(P₁)</span></span>
                    <span className="text-blue-300 font-bold">{p1_Pa.toLocaleString(undefined, {maximumFractionDigits: 0})} Pa</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-slate-950/50 border-l-4 border-green-500">
                    <span className="text-slate-400">Dynamic Pressure <span className="text-green-400">(½ρv₁²)</span></span>
                    <span className="text-green-300 font-bold">{kinetic1.toLocaleString(undefined, {maximumFractionDigits: 0})} Pa</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-slate-950/50 border-l-4 border-orange-500">
                    <span className="text-slate-400">Hydrostatic <span className="text-orange-400">(ρgh₁)</span></span>
                    <span className="text-orange-300 font-bold">{potential1.toLocaleString(undefined, {maximumFractionDigits: 0})} Pa</span>
                  </div>
                  <div className="flex justify-between items-center p-2 mt-2 border-t border-slate-700 pt-3">
                    <span className="text-white font-bold">Total Energy</span>
                    <span className="text-white font-bold">{totalEnergy.toLocaleString(undefined, {maximumFractionDigits: 0})} Pa</span>
                  </div>
                </div>
              </div>

              {/* Point 2 Breakdown */}
              <div className="space-y-4">
                <h3 className="text-center font-bold text-slate-300">Point 2 (Output)</h3>
                
                <div className="space-y-2 font-mono text-sm">
                  <div className="flex justify-between items-center p-2 rounded bg-slate-950/50 border-l-4 border-blue-500 shadow-[inset_0_0_10px_rgba(59,130,246,0.1)]">
                    <span className="text-slate-400">Static Pressure <span className="text-blue-400">(P₂)</span></span>
                    <span className={`font-bold ${p2_Pa < 0 ? 'text-red-400' : 'text-blue-300'}`}>{p2_Pa.toLocaleString(undefined, {maximumFractionDigits: 0})} Pa</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-slate-950/50 border-l-4 border-green-500">
                    <span className="text-slate-400">Dynamic Pressure <span className="text-green-400">(½ρv₂²)</span></span>
                    <span className="text-green-300 font-bold">{kinetic2.toLocaleString(undefined, {maximumFractionDigits: 0})} Pa</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-slate-950/50 border-l-4 border-orange-500">
                    <span className="text-slate-400">Hydrostatic <span className="text-orange-400">(ρgh₂)</span></span>
                    <span className="text-orange-300 font-bold">{potential2.toLocaleString(undefined, {maximumFractionDigits: 0})} Pa</span>
                  </div>
                  <div className="flex justify-between items-center p-2 mt-2 border-t border-slate-700 pt-3">
                    <span className="text-white font-bold">Total Energy</span>
                    <span className="text-white font-bold">{totalEnergy.toLocaleString(undefined, {maximumFractionDigits: 0})} Pa</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Ah-Ha Moment Box */}
            <div className="mt-4 bg-blue-950/30 border border-blue-900/50 p-4 rounded-xl flex items-start gap-3">
              <Info className="text-blue-400 shrink-0 mt-1" size={20} />
              <p className="text-sm text-blue-100/80 leading-relaxed">
                <strong>Try this:</strong> Drastically reduce the Pipe Radius (r₂) while leaving r₁ large. Notice how the fluid must speed up incredibly fast to squeeze through the narrow gap (Continuity Equation). Because the Dynamic Pressure (Green) skyrockets, the Static Pressure (Blue) <em>must</em> drop to conserve total energy. If it drops below zero, the fluid would boil in real life—a phenomenon called cavitation!
              </p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default BernoulliSimulation;