import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings2, Info } from 'lucide-react';

export default function App() {
  // --- STATE ---
  const [velocity, setVelocity] = useState(75); // m/s
  const [angle, setAngle] = useState(45); // degrees
  const [gravity, setGravity] = useState(9.81); // m/s^2
  
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const previousTimeRef = useRef(null);

  // --- PHYSICS CALCULATIONS ---
  const angleRad = (angle * Math.PI) / 180;
  const v0x = velocity * Math.cos(angleRad);
  const v0y = velocity * Math.sin(angleRad);
  
  const timeOfFlight = (2 * v0y) / gravity;
  const maxHeight = (v0y * v0y) / (2 * gravity);
  const maxRange = v0x * timeOfFlight;

  const currentX = v0x * time;
  const currentY = (v0y * time) - (0.5 * gravity * time * time);
  
  // Real-time velocities
  const currentVx = v0x;
  const currentVy = v0y - (gravity * time);
  const currentVelocity = Math.sqrt(currentVx**2 + currentVy**2);

  // --- ANIMATION LOOP ---
  const animate = (currTime) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = (currTime - previousTimeRef.current) / 1000; // in seconds
      
      setTime(prevTime => {
        // Simulation speed multiplier (e.g., 2x real-time for better UX)
        const simSpeed = 2; 
        const nextTime = prevTime + (deltaTime * simSpeed);
        
        if (nextTime >= timeOfFlight) {
          setIsPlaying(false);
          return timeOfFlight; // Stop exactly at the ground
        }
        return nextTime;
      });
    }
    previousTimeRef.current = currTime;
    
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(requestRef.current);
      previousTimeRef.current = undefined;
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isPlaying, timeOfFlight]);

  // Reset if parameters change while not playing or at the end
  useEffect(() => {
    if (!isPlaying && time >= timeOfFlight) {
        setTime(0);
    }
  }, [velocity, angle, gravity]);


  // --- CANVAS DRAWING ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Define world coordinate system (fixed to allow comparing different throws)
    const WORLD_WIDTH = 1200; // meters
    const WORLD_HEIGHT = 600; // meters
    
    // Scale factors
    const scaleX = width / WORLD_WIDTH;
    const scaleY = height / WORLD_HEIGHT;

    // Helper to map physics coordinates to canvas coordinates
    const mapX = (x) => 40 + (x * scaleX); // 40px padding on left
    const mapY = (y) => height - 40 - (y * scaleY); // 40px padding on bottom, invert Y

    // 1. Clear Canvas
    ctx.clearRect(0, 0, width, height);

    // 2. Draw Grid & Axes
    ctx.strokeStyle = '#334155'; // slate-700
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    // Vertical grid lines (every 100m)
    for (let x = 0; x <= WORLD_WIDTH; x += 100) {
      ctx.moveTo(mapX(x), 0);
      ctx.lineTo(mapX(x), height - 40);
    }
    // Horizontal grid lines (every 100m)
    for (let y = 0; y <= WORLD_HEIGHT; y += 100) {
      ctx.moveTo(40, mapY(y));
      ctx.lineTo(width, mapY(y));
    }
    ctx.stroke();

    // Axes
    ctx.strokeStyle = '#94a3b8'; // slate-400
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, 0);
    ctx.lineTo(40, height - 40); // Y-axis
    ctx.lineTo(width, height - 40); // X-axis
    ctx.stroke();

    // Axis Labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.fillText('Distance (m)', width / 2, height - 10);
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Height (m)', 0, 0);
    ctx.restore();

    // 3. Draw Ideal Trajectory (Dashed Line)
    ctx.beginPath();
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = '#475569'; // slate-600
    ctx.lineWidth = 2;
    for (let t = 0; t <= timeOfFlight; t += 0.1) {
      const tx = v0x * t;
      const ty = (v0y * t) - (0.5 * gravity * t * t);
      if (t === 0) ctx.moveTo(mapX(tx), mapY(ty));
      else ctx.lineTo(mapX(tx), mapY(ty));
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // 4. Draw Path taken so far
    ctx.beginPath();
    ctx.strokeStyle = '#3b82f6'; // blue-500
    ctx.lineWidth = 3;
    for (let t = 0; t <= time; t += 0.05) {
      const tx = v0x * t;
      const ty = (v0y * t) - (0.5 * gravity * t * t);
      if (t === 0) ctx.moveTo(mapX(tx), mapY(ty));
      else ctx.lineTo(mapX(tx), mapY(ty));
    }
    ctx.stroke();

    // 5. Draw Projectile
    ctx.beginPath();
    ctx.arc(mapX(currentX), mapY(currentY), 8, 0, Math.PI * 2);
    ctx.fillStyle = '#10b981'; // emerald-500
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 6. Draw Velocity Vector (Optional enhancement)
    if (time > 0 && time < timeOfFlight) {
        ctx.beginPath();
        ctx.moveTo(mapX(currentX), mapY(currentY));
        // Scale vector for visibility
        const vectorScale = 0.5;
        ctx.lineTo(mapX(currentX + currentVx * vectorScale), mapY(currentY + currentVy * vectorScale));
        ctx.strokeStyle = '#ef4444'; // red-500
        ctx.lineWidth = 2;
        ctx.stroke();
    }

  }, [velocity, angle, gravity, time, v0x, v0y, timeOfFlight, currentX, currentY, currentVx, currentVy]);

  // --- HANDLERS ---
  const togglePlay = () => {
    if (time >= timeOfFlight) {
        setTime(0); // Auto-reset if it finished
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setTime(0);
  };

  return (
    <div className="min-h-[36rem] bg-slate-950 text-slate-200 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              Projectile Motion
            </h1>
            <p className="text-slate-400 mt-1">Interactive Physics Simulation</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Simulation Area */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Canvas Container */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
              {/* Overlay Live Stats */}
              <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur border border-slate-800 p-3 rounded-xl text-sm space-y-1 font-mono z-10">
                <div className="flex justify-between gap-4 text-emerald-400">
                  <span>Time:</span> <span>{time.toFixed(2)} s</span>
                </div>
                <div className="flex justify-between gap-4 text-blue-400">
                  <span>X Position:</span> <span>{Math.max(0, currentX).toFixed(1)} m</span>
                </div>
                <div className="flex justify-between gap-4 text-purple-400">
                  <span>Y Position:</span> <span>{Math.max(0, currentY).toFixed(1)} m</span>
                </div>
                <div className="flex justify-between gap-4 text-red-400">
                  <span>Velocity:</span> <span>{currentVelocity.toFixed(1)} m/s</span>
                </div>
              </div>

              {/* The Canvas itself */}
              <canvas 
                ref={canvasRef} 
                width={800} 
                height={400} 
                className="w-full h-auto block"
              />
              
              {/* Playback Controls */}
              <div className="bg-slate-800/50 p-4 flex items-center justify-center gap-4">
                <button 
                  onClick={togglePlay}
                  className={`flex items-center gap-2 px-6 py-2 rounded-full font-semibold transition-all ${
                    isPlaying 
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-900' 
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  {isPlaying ? 'Pause' : (time > 0 && time < timeOfFlight ? 'Resume' : 'Launch')}
                </button>
                
                <button 
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-700 hover:bg-slate-600 text-white transition-all font-semibold"
                >
                  <RotateCcw size={20} />
                  Reset
                </button>
              </div>
            </div>

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard title="Initial Velocity (v₀)" value={`${velocity.toFixed(1)} m/s`} />
              <MetricCard title="Max Height (H)" value={`${maxHeight.toFixed(1)} m`} color="text-purple-400" />
              <MetricCard title="Total Range (R)" value={`${maxRange.toFixed(1)} m`} color="text-blue-400" />
              <MetricCard title="Flight Time (T)" value={`${timeOfFlight.toFixed(2)} s`} color="text-emerald-400" />
            </div>
          </div>

          {/* Controls & Math Panel */}
          <div className="space-y-6">
            
            {/* Controls */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Settings2 className="text-blue-500" />
                Parameters
              </h2>

              <div className="space-y-6">
                <ControlSlider 
                  label="Initial Velocity (v₀)" 
                  value={velocity} 
                  min={10} max={150} step={1} unit="m/s"
                  onChange={setVelocity}
                  disabled={isPlaying && time < timeOfFlight}
                />
                <ControlSlider 
                  label="Launch Angle (θ)" 
                  value={angle} 
                  min={0} max={90} step={1} unit="°"
                  onChange={setAngle}
                  disabled={isPlaying && time < timeOfFlight}
                />
                <ControlSlider 
                  label="Gravity (g)" 
                  value={gravity} 
                  min={1.62} max={25} step={0.01} unit="m/s²"
                  onChange={setGravity}
                  disabled={isPlaying && time < timeOfFlight}
                  helperText="Earth: 9.81 | Moon: 1.62 | Mars: 3.71"
                />
              </div>
            </div>

            {/* Educational / Math Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Info className="text-purple-500" />
                The Physics
              </h2>
              
              <div className="space-y-4 text-sm text-slate-300">
                <p>
                  Projectile motion occurs when an object is launched into the air and is subject only to the acceleration of gravity. We ignore air resistance here.
                </p>
                
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs space-y-2">
                  <p className="text-slate-400">// Splitting Velocity into X and Y components</p>
                  <p>v₀ₓ = v₀ · cos(θ)</p>
                  <p>v₀ᵧ = v₀ · sin(θ)</p>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs space-y-2">
                  <p className="text-slate-400">// Maximum Measurements</p>
                  <p>Max Height = (v₀ᵧ)² / 2g</p>
                  <p>Total Range = (v₀² · sin(2θ)) / g</p>
                  <p>Time of Flight = 2v₀ᵧ / g</p>
                </div>

                <p className="text-xs text-slate-500 italic">
                  Notice how an angle of 45° yields the maximum possible range for a given velocity. Try setting it and observe!
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function MetricCard({ title, value, color = "text-white" }) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
      <div className="text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider">{title}</div>
      <div className={`text-2xl font-bold font-mono ${color}`}>{value}</div>
    </div>
  );
}

function ControlSlider({ label, value, min, max, step, unit, onChange, disabled, helperText = "" }) {
  return (
    <div className={`space-y-2 ${disabled ? 'opacity-50' : 'opacity-100'} transition-opacity`}>
      <div className="flex justify-between items-end">
        <label className="text-sm font-medium text-slate-300">{label}</label>
        <span className="font-mono text-blue-400 font-semibold">{value.toFixed(step < 1 ? 2 : 0)} {unit}</span>
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        disabled={disabled}
        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
      />
      {helperText && (
        <div className="text-xs text-slate-500 mt-1">{helperText}</div>
      )}
    </div>
  );
}