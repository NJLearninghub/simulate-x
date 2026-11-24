import React, { useState, useEffect, useRef } from 'react';
import { Activity, Zap, Play, Pause, RotateCcw, Info, Waves, Radio } from 'lucide-react';

export default function App() {
  const [mode, setMode] = useState('properties'); // 'generation' or 'properties'
  const [isPlaying, setIsPlaying] = useState(true);
  const [frequency, setFrequency] = useState(1.5);
  const [amplitude, setAmplitude] = useState(80);
  
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const timeRef = useRef(0);

  // High-performance canvas rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Handle DPI scaling for crisp rendering
    const handleResize = () => {
      const container = canvas.parentElement;
      canvas.width = container.clientWidth * window.devicePixelRatio;
      canvas.height = container.clientHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      canvas.style.width = `${container.clientWidth}px`;
      canvas.style.height = `${container.clientHeight}px`;
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();

    const drawArrow = (fromX, fromY, toX, toY, color) => {
      const headlen = 6;
      const dx = toX - fromX;
      const dy = toY - fromY;
      const angle = Math.atan2(dy, dx);
      
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 1.5;
      
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(toX, toY);
      ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
      ctx.lineTo(toX, toY);
      ctx.fill();
    };

    const drawBFieldMarker = (x, y, magnitude, isOutward, color) => {
      if (Math.abs(magnitude) < 2) return; // Don't draw if too small
      
      const radius = Math.min(Math.abs(magnitude) / 4, 12);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      
      // Draw outer circle
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.stroke();
      
      // Draw inside (Dot for Outward, X for Inward)
      if (isOutward) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius / 3, 0, 2 * Math.PI);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(x - radius/1.5, y - radius/1.5);
        ctx.lineTo(x + radius/1.5, y + radius/1.5);
        ctx.moveTo(x + radius/1.5, y - radius/1.5);
        ctx.lineTo(x - radius/1.5, y + radius/1.5);
        ctx.stroke();
      }
    };

    const render = () => {
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;
      
      ctx.clearRect(0, 0, width, height);
      
      // Physics Constants
      const waveSpeed = 2.0; // Constant speed of light (c) in simulation
      const w = 0.05 * frequency; // Angular frequency
      const k = w / waveSpeed; // Wave number (k = w/c). Visually proves shorter lambda at higher freq.

      if (mode === 'properties') {
        // --- 3D WAVE PROPERTIES RENDERER ---
        const cx = 50;
        const cy = height / 2;
        
        // Draw 3D Axes
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        
        // X-Axis (Propagation)
        drawArrow(cx, cy, width - 20, cy, '#64748b');
        ctx.fillStyle = '#64748b';
        ctx.font = '14px Arial';
        ctx.fillText('Velocity (c)', width - 80, cy - 10);
        
        // Y-Axis (Electric Field)
        drawArrow(cx, cy, cx, 40, '#ef4444');
        ctx.fillStyle = '#ef4444';
        ctx.fillText('Electric Field (E)', cx + 10, 50);
        
        // Z-Axis (Magnetic Field - Isometric projection)
        drawArrow(cx, cy, cx - 60, cy + 60, '#3b82f6');
        ctx.fillStyle = '#3b82f6';
        ctx.fillText('Magnetic Field (B)', cx - 120, cy + 80);

        const ePoints = [];
        const bPoints = [];
        
        // Calculate points for the continuous sine wave envelopes
        for(let x = 0; x < width - 100; x += 2) {
          const phase = k * x - timeRef.current * w;
          const E = amplitude * Math.sin(phase);
          const B = amplitude * Math.sin(phase); // E and B are in phase!
          
          const sx = cx + x;
          const sy_E = cy - E;
          
          // Isometric projection for Z axis (Magnetic field)
          const sx_B = cx + x - B * 0.5;
          const sy_B = cy + B * 0.5;
          
          ePoints.push({x: sx, y: sy_E});
          bPoints.push({x: sx_B, y: sy_B});
        }

        // Draw discrete Field Vectors
        for(let x = 0; x < width - 100; x += 30) {
          const phase = k * x - timeRef.current * w;
          const E = amplitude * Math.sin(phase);
          const B = amplitude * Math.sin(phase);
          const sx = cx + x;
          
          if (Math.abs(E) > 1) {
            // E Vector
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
            ctx.moveTo(sx, cy);
            ctx.lineTo(sx, cy - E);
            ctx.stroke();
            
            // B Vector
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
            ctx.moveTo(sx, cy);
            ctx.lineTo(sx - B * 0.5, cy + B * 0.5);
            ctx.stroke();
          }
        }

        // Draw E-Wave Envelope
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ePoints.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
        ctx.stroke();

        // Draw B-Wave Envelope
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.beginPath();
        bPoints.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
        ctx.stroke();

      } else {
        // --- WAVE GENERATION (ANTENNA) RENDERER ---
        const cx = width / 2;
        const cy = height / 2;
        
        // Draw Antenna Wire
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 120);
        ctx.lineTo(cx, cy + 120);
        ctx.stroke();
        
        // Calculate oscillating electron position
        const electronY = cy + (amplitude) * Math.sin(timeRef.current * w);
        
        // Draw Electron
        ctx.fillStyle = '#facc15'; // Yellow glowing charge
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#facc15';
        ctx.beginPath();
        ctx.arc(cx, electronY, 8, 0, 2 * Math.PI);
        ctx.fill();
        ctx.shadowBlur = 0; // reset

        // Draw Propagating EM Field
        for (let r = 40; r < width/2 - 20; r += 40) {
          // Phase calculation for outward propagation: sin(w*t - k*r)
          const phase = timeRef.current * w - k * r; 
          
          // The radiated E-field depends on acceleration, which is -sin(w*t).
          // We map this into an amplitude propagating outwards.
          const E_mag = (amplitude * 0.8) * Math.sin(phase);
          
          // Right Side Propagation (+x)
          const rx = cx + r;
          if (Math.abs(E_mag) > 5) {
            drawArrow(rx, cy, rx, cy - E_mag, '#ef4444');
            // If E is UP (+y), B is OUT (+z) to ensure E x B = +x direction
            const isRightOutward = E_mag > 0; 
            drawBFieldMarker(rx, cy + 25, E_mag, isRightOutward, '#3b82f6');
          }
          
          // Left Side Propagation (-x)
          const lx = cx - r;
          if (Math.abs(E_mag) > 5) {
            drawArrow(lx, cy, lx, cy - E_mag, '#ef4444');
            // If E is UP (+y), B is IN (-z) to ensure E x B = -x direction
            const isLeftOutward = E_mag < 0;
            drawBFieldMarker(lx, cy + 25, E_mag, isLeftOutward, '#3b82f6');
          }
        }
        
        // Labels for Generation Mode
        ctx.fillStyle = '#ef4444';
        ctx.font = '12px Arial';
        ctx.fillText('E-Field (Red Arrows)', 20, 30);
        ctx.fillStyle = '#3b82f6';
        ctx.fillText('B-Field (Blue Dots = Out, X = In)', 20, 50);
      }

      if (isPlaying) {
        timeRef.current += 1;
      }
      requestRef.current = requestAnimationFrame(render);
    };

    requestRef.current = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(requestRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [mode, isPlaying, frequency, amplitude]);

  return (
    <div className="flex flex-col min-h-[36rem] bg-slate-950 text-slate-200 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800 shadow-md">
        <div className="flex items-center space-x-3">
          <Waves className="w-6 h-6 text-blue-400" />
          <h1 className="text-xl font-bold tracking-wide text-white">Electromagnetic Waves Simulator</h1>
        </div>
        <div className="text-sm font-medium text-slate-400 px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
          CBSE Class 12 Physics
        </div>
      </header>

      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
        {/* Main Canvas Area */}
        <main className="flex-1 flex flex-col relative overflow-hidden bg-slate-950">
          
          {/* Mode Switcher */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 flex space-x-2 bg-slate-800/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-700 z-10">
            <button
              onClick={() => setMode('generation')}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                mode === 'generation' 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <Radio className="w-4 h-4 mr-2" />
              Wave Generation
            </button>
            <button
              onClick={() => setMode('properties')}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                mode === 'properties' 
                  ? 'bg-purple-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <Activity className="w-4 h-4 mr-2" />
              Wave Properties (3D)
            </button>
          </div>

          <div className="flex-1 w-full relative">
            <canvas 
              ref={canvasRef}
              className="absolute inset-0 w-full h-full block"
            />
          </div>
        </main>

        {/* Right Dashboard */}
        <aside className="w-full lg:w-96 bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl z-20 overflow-y-auto">
          
          {/* Control Panel */}
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-6 flex items-center">
              <Zap className="w-4 h-4 mr-2 text-yellow-500" />
              Simulation Controls
            </h2>
            
            <div className="space-y-6">
              {/* Play / Pause */}
              <div className="flex space-x-3">
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex-1 flex justify-center items-center py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition-colors font-medium"
                >
                  {isPlaying ? (
                    <><Pause className="w-4 h-4 mr-2" /> Pause</>
                  ) : (
                    <><Play className="w-4 h-4 mr-2" /> Play</>
                  )}
                </button>
                <button 
                  onClick={() => { timeRef.current = 0; setIsPlaying(true); }}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition-colors"
                  title="Reset Time"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Frequency Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-slate-300">Frequency (f)</span>
                  <span className="text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">
                    {frequency.toFixed(1)}x
                  </span>
                </div>
                <input 
                  type="range" 
                  min="0.5" 
                  max="3.0" 
                  step="0.1"
                  value={frequency}
                  onChange={(e) => setFrequency(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <p className="text-xs text-slate-500">
                  Notice: As Frequency (f) increases, Wavelength (λ) compresses because wave speed (c) is constant.
                </p>
              </div>

              {/* Amplitude Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-slate-300">Amplitude (E₀ & B₀)</span>
                  <span className="text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded">
                    {amplitude}
                  </span>
                </div>
                <input 
                  type="range" 
                  min="20" 
                  max="120" 
                  step="5"
                  value={amplitude}
                  onChange={(e) => setAmplitude(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Theory Panel */}
          <div className="p-6 flex-1 bg-slate-900/50">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center">
              <Info className="w-4 h-4 mr-2" />
              Core Concepts
            </h2>

            {mode === 'generation' ? (
              <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700">
                  <h3 className="font-semibold text-white mb-2">Hertz's Experiment</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    An accelerating or oscillating charge produces oscillating electric (<span className="text-red-400 font-bold">E</span>) and magnetic (<span className="text-blue-400 font-bold">B</span>) fields. 
                    These regenerating fields propagate through space as an Electromagnetic Wave.
                  </p>
                </div>
                <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700">
                  <h3 className="font-semibold text-white mb-2 text-sm">Right Hand Rule (Direction)</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    The direction of propagation is given by the Poynting vector: <br/>
                    <span className="font-mono text-center block mt-2 p-2 bg-slate-900 rounded-lg">S = E × B</span>
                    <br/>
                    Observe the left vs. right side of the antenna. The B-field flips (Into screen vs Out of screen) to ensure the wave pushes outward!
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700">
                  <h3 className="font-semibold text-white mb-2">Transverse Nature</h3>
                  <p className="text-sm text-slate-300 leading-relaxed mb-3">
                    The Electric Field (<span className="text-red-400 font-bold">Red</span>) and Magnetic Field (<span className="text-blue-400 font-bold">Blue</span>) are perpendicular to each other, and perpendicular to the velocity of the wave.
                  </p>
                  <div className="font-mono text-xs text-slate-400 space-y-1 bg-slate-900 p-2 rounded-lg">
                    <p>E(x,t) = E₀ sin(kx - ωt) ĵ</p>
                    <p>B(x,t) = B₀ sin(kx - ωt) k̂</p>
                  </div>
                </div>
                
                <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700">
                  <h3 className="font-semibold text-white mb-2 text-sm">Key Relationships</h3>
                  <ul className="text-sm text-slate-300 space-y-2 list-disc list-inside">
                    <li><span className="font-medium text-white">In Phase:</span> Both fields reach their maximum and zero at the exact same time.</li>
                    <li><span className="font-medium text-white">Speed of Light:</span> c = 1 / √(μ₀ε₀)</li>
                    <li><span className="font-medium text-white">Amplitude Ratio:</span> E₀ / B₀ = c</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}