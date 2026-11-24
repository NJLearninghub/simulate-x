import React, { useState, useEffect, useRef } from 'react';
import { Settings, Activity, Wind, Waves, Play, Pause, Info } from 'lucide-react';

export default function StandingWavesApp() {
  // --- Simulation State ---
  const [medium, setMedium] = useState('string'); // 'string', 'open_pipe', 'closed_pipe'
  const [f, setF] = useState(25); // Driving Frequency (Hz)
  const [L, setL] = useState(2.0); // Length (m)
  const [T, setT] = useState(100); // Tension (N) - String only
  const [mu, setMu] = useState(0.01); // Linear Density (kg/m) - String only
  const [isPlaying, setIsPlaying] = useState(true);

  // --- Physics Derived Values ---
  // Wave speed: String uses v = sqrt(T/mu), Pipes use speed of sound ~343 m/s
  const v = medium === 'string' ? Math.sqrt(T / mu) : 343;
  
  // Wavelength and Wave Number
  const lambda = v / f;
  const k = (2 * Math.PI) / lambda;
  
  // Maximum theoretical frequency for the sliders and graphs
  const maxF = medium === 'string' ? 150 : 500;

  // Function to calculate resonance and harmonics
  const getResonanceData = (freq, length, velocity, med) => {
    let fn = 0;
    let nearestN = 1;
    
    if (med === 'string' || med === 'open_pipe') {
      // fn = n * v / (2L)
      const fundamental = velocity / (2 * length);
      nearestN = Math.max(1, Math.round(freq / fundamental));
      fn = nearestN * fundamental;
    } else if (med === 'closed_pipe') {
      // fn = n * v / (4L) where n is odd (1, 3, 5...)
      const fundamental = velocity / (4 * length);
      // Map to nearest odd integer
      const floatN = freq / fundamental;
      nearestN = Math.max(1, 2 * Math.round((floatN + 1) / 2) - 1);
      fn = nearestN * fundamental;
    }

    const diff = Math.abs(freq - fn);
    // Lorentzian-style resonance peak for visual amplitude
    const width = med === 'string' ? 2.0 : 8.0; 
    const amplitude = 1 / (1 + Math.pow(diff / width, 2));
    
    return { fn, nearestN, diff, amplitude };
  };

  const resData = getResonanceData(f, L, v, medium);
  const isResonant = resData.diff < (medium === 'string' ? 0.5 : 2.0);

  // --- Canvas Animation Setup ---
  const canvasRef = useRef(null);
  const stateRef = useRef({ f, L, v, medium, isPlaying, amplitude: resData.amplitude, k, nearestN: resData.nearestN });
  const particlesRef = useRef([]);

  // Sync state to ref for the animation loop
  useEffect(() => {
    stateRef.current = { f, L, v, medium, isPlaying, amplitude: resData.amplitude, k, nearestN: resData.nearestN };
  }, [f, L, v, medium, isPlaying, resData.amplitude, k, resData.nearestN]);

  // Initialize Particles for Pipe visuals
  useEffect(() => {
    const particles = [];
    for (let i = 0; i < 600; i++) {
      particles.push({
        x0: Math.random(), // Normalized 0 to 1
        y0: Math.random() * 2 - 1, // Normalized -1 to 1
      });
    }
    particlesRef.current = particles;
  }, []);

  // Main Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;

    const render = () => {
      const { f, L, medium, isPlaying, amplitude, nearestN } = stateRef.current;
      const harmonic = nearestN || 1;
      
      // Clear Canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const margin = 40;
      const drawWidth = width - margin * 2;
      const centerY = height / 2;

      // Update Time (scaled so it's visually pleasing, not true physical time)
      if (isPlaying) {
        time += f * 0.003; 
      }

      // Base visual amplitude in pixels
      const visualAmpMax = 80;
      // We guarantee it shrinks drastically off-resonance
      const currentAmp = Math.max(5, amplitude * visualAmpMax); 

      if (medium === 'string') {
        // Draw String Fixed boundaries
        ctx.fillStyle = '#6b7280';
        ctx.fillRect(margin - 10, centerY - 20, 10, 40);
        ctx.fillRect(margin + drawWidth, centerY - 20, 10, 40);

        // Draw String Waveform
        ctx.beginPath();
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 4;
        
        for (let i = 0; i <= 200; i++) {
          const normX = i / 200;
          const actualX = normX * L;
          
          // Fixed ends are always nodes. Show the nearest harmonic y = A sin(nπx/L) cos(ωt).
          const displacement = currentAmp * Math.sin(harmonic * Math.PI * normX) * Math.cos(time);
          
          const px = margin + normX * drawWidth;
          const py = centerY - displacement;

          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Draw ghost envelope
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        for (let i = 0; i <= 100; i++) {
          const normX = i / 100;
          const actualX = normX * L;
          const displacement = currentAmp * Math.abs(Math.sin(harmonic * Math.PI * normX));
          const px = margin + normX * drawWidth;
          ctx.lineTo(px, centerY - displacement);
        }
        for (let i = 100; i >= 0; i--) {
          const normX = i / 100;
          const displacement = currentAmp * Math.abs(Math.sin(harmonic * Math.PI * normX));
          const px = margin + normX * drawWidth;
          ctx.lineTo(px, centerY + displacement);
        }
        ctx.stroke();
        ctx.setLineDash([]);

      } else {
        // --- Pipe Rendering ---
        const pipeHeight = 120;
        
        // Draw Pipe Shell
        ctx.strokeStyle = '#9ca3af';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(margin, centerY - pipeHeight/2);
        ctx.lineTo(margin + drawWidth, centerY - pipeHeight/2);
        ctx.moveTo(margin, centerY + pipeHeight/2);
        ctx.lineTo(margin + drawWidth, centerY + pipeHeight/2);
        
        if (medium === 'closed_pipe') {
          // Close the right end
          ctx.moveTo(margin + drawWidth, centerY - pipeHeight/2);
          ctx.lineTo(margin + drawWidth, centerY + pipeHeight/2);
        }
        ctx.stroke();

        // Draw Particles (Air Molecules)
        ctx.fillStyle = '#60a5fa';
        particlesRef.current.forEach(p => {
          const actualX = p.x0 * L;
          
          // Open pipe: displacement antinodes at both ends, cos(nπx/L).
          // Closed pipe (closed at x = L): node at the closed end, cos(nπx/2L) with n odd.
          const shapeFn = medium === 'closed_pipe'
            ? Math.cos(harmonic * Math.PI * (actualX / L) / 2)
            : Math.cos(harmonic * Math.PI * (actualX / L)); 
          
          // Longitudinal displacement (added to X)
          const particleMaxShift = 0.15; // Max % of pipe length a particle can shift
          const displacement = currentAmp/visualAmpMax * shapeFn * Math.cos(time) * particleMaxShift;
          
          // Clamp particle so it doesn't wildly exit the pipe boundaries
          let newXNorm = p.x0 + displacement;
          if (newXNorm < 0) newXNorm = 0;
          if (newXNorm > 1) newXNorm = 1;

          const px = margin + newXNorm * drawWidth;
          const py = centerY + p.y0 * (pipeHeight/2 - 5);

          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fill();
        });

        // Draw mathematical envelope overlay (pressure/displacement wave)
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(234, 179, 8, 0.4)'; // Yellowish for pipe waves
        ctx.lineWidth = 3;
        for (let i = 0; i <= 100; i++) {
          const normX = i / 100;
          const actualX = normX * L;
          const shape = medium === 'closed_pipe'
            ? Math.cos(harmonic * Math.PI * normX / 2)
            : Math.cos(harmonic * Math.PI * normX);
          const displacement = currentAmp * shape * Math.cos(time);
          const px = margin + normX * drawWidth;
          const py = centerY - displacement;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // --- Resonance Graph SVG Generation ---
  const generateGraphPath = () => {
    let path = `M 0 100 `;
    const points = 100;
    for (let i = 0; i <= points; i++) {
      const testF = (i / points) * maxF;
      const res = getResonanceData(testF, L, v, medium);
      const y = 100 - (res.amplitude * 90); // Scale height
      path += `L ${((i / points) * 100).toFixed(2)} ${y.toFixed(2)} `;
    }
    return path;
  };

  // --- Node / Antinode Positions ---
  const getNodeAntinodeMarkers = () => {
    if (!isResonant) return [];
    const markers = [];
    const numLoops = medium === 'closed_pipe' ? resData.nearestN : resData.nearestN;
    
    // Wavelength at true resonance
    const resLambda = v / resData.fn; 

    if (medium === 'string') {
      // String: Nodes at 0, λ/2, λ, etc. Antinodes at λ/4, 3λ/4...
      for (let i = 0; i <= numLoops; i++) {
        markers.push({ type: 'N', x: (i * resLambda) / 2 });
        if (i < numLoops) {
          markers.push({ type: 'A', x: (i * resLambda) / 2 + resLambda / 4 });
        }
      }
    } else if (medium === 'open_pipe') {
      // Open pipe: Antinodes at ends. 
      for (let i = 0; i <= numLoops; i++) {
        markers.push({ type: 'A', x: (i * resLambda) / 2 });
        if (i < numLoops) {
          markers.push({ type: 'N', x: (i * resLambda) / 2 + resLambda / 4 });
        }
      }
    } else if (medium === 'closed_pipe') {
      // Closed pipe: Antinode at open end (0), Node at closed end (L)
      const segments = (numLoops - 1) / 2; // For n=1 -> 0, n=3 -> 1, n=5 -> 2
      for (let i = 0; i <= segments + 1; i++) {
        const ax = i * resLambda / 2;
        if (ax <= L + 0.01) markers.push({ type: 'A', x: ax });
        
        const nx = i * resLambda / 2 + resLambda / 4;
        if (nx <= L + 0.01) markers.push({ type: 'N', x: nx });
      }
    }
    return markers;
  };

  return (
    <div className="min-h-[36rem] bg-slate-900 text-slate-100 font-sans p-4 md:p-8 flex flex-col items-center">
      
      {/* Header */}
      <div className="w-full max-w-6xl mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Waves className="text-blue-400" size={32} />
            Standing Waves & Resonance
          </h1>
          <p className="text-slate-400 mt-1">Adjust frequency to discover fundamental and higher harmonics.</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <button 
            onClick={() => setMedium('string')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${medium === 'string' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >
            Vibrating String
          </button>
          <button 
            onClick={() => setMedium('open_pipe')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${medium === 'open_pipe' ? 'bg-yellow-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >
            Open Pipe
          </button>
          <button 
            onClick={() => setMedium('closed_pipe')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${medium === 'closed_pipe' ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >
            Closed Pipe
          </button>
        </div>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Visuals & Graphs */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Main Canvas View */}
          <div className="bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-700 relative">
            <div className="absolute top-4 left-4 bg-slate-900/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-700 text-sm font-mono z-10 flex gap-4">
              <span className="text-blue-300">f = {f.toFixed(1)} Hz</span>
              <span className="text-green-300">v = {v.toFixed(1)} m/s</span>
            </div>
            
            {/* Play/Pause */}
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="absolute top-4 right-4 bg-slate-900/60 hover:bg-slate-800 p-2 rounded-full border border-slate-700 text-white z-10 transition-colors"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>

            {/* Node/Antinode Markers */}
            <div className="absolute top-[80%] left-[40px] right-[40px] h-6 z-10 pointer-events-none">
              {getNodeAntinodeMarkers().map((marker, i) => (
                <div 
                  key={i}
                  className={`absolute -translate-x-1/2 flex flex-col items-center justify-center transition-opacity duration-300 ${isResonant ? 'opacity-100' : 'opacity-0'}`}
                  style={{ left: `${(marker.x / L) * 100}%` }}
                >
                  <span className={`text-xs font-bold px-1.5 rounded-sm ${marker.type === 'N' ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-green-500/20 text-green-400 border border-green-500/50'}`}>
                    {marker.type}
                  </span>
                </div>
              ))}
            </div>

            <canvas 
              ref={canvasRef} 
              width={800} 
              height={350} 
              className="w-full h-auto bg-[#0f172a] block"
            />
            
            {/* Resonance Alert */}
            <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full font-bold text-sm uppercase tracking-wider transition-all duration-300 ${isResonant ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-100' : 'bg-slate-700 text-slate-400 scale-95 opacity-0'}`}>
              Resonance Achieved: Harmonic n={resData.nearestN}
            </div>
          </div>

          {/* Resonance Gauge / Graph */}
          <div className="bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700">
            <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <Activity size={20} className="text-indigo-400" />
              Resonance Spectrum (Amplitude vs Frequency)
            </h3>
            <div className="relative w-full h-32 bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
              {/* Theoretical Resonance Curve */}
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path 
                  d={generateGraphPath()} 
                  fill="none" 
                  stroke="rgba(99, 102, 241, 0.6)" 
                  strokeWidth="2" 
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              
              {/* Current Frequency Indicator */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 transition-all duration-100 ease-linear shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                style={{ left: `${(f / maxF) * 100}%` }}
              >
                <div className="absolute -top-1 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full" />
              </div>

              {/* X-Axis Labels */}
              <div className="absolute bottom-1 left-2 text-xs text-slate-500">0 Hz</div>
              <div className="absolute bottom-1 right-2 text-xs text-slate-500">{maxF} Hz</div>
            </div>
          </div>

        </div>

        {/* Right Column: Controls */}
        <div className="bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700 flex flex-col gap-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-700">
            <Settings className="text-slate-400" />
            <h2 className="text-xl font-bold text-white">Control Panel</h2>
          </div>

          {/* Frequency Slider */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <label className="text-sm font-medium text-slate-300">Driving Frequency ($f$)</label>
              <span className="text-blue-400 font-mono font-bold">{f.toFixed(1)} Hz</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max={maxF} 
              step="0.5"
              value={f}
              onChange={(e) => setF(parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          {/* Length Slider */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <label className="text-sm font-medium text-slate-300">Length ($L$)</label>
              <span className="text-slate-300 font-mono">{L.toFixed(2)} m</span>
            </div>
            <input 
              type="range" 
              min="0.5" 
              max="4.0" 
              step="0.1"
              value={L}
              onChange={(e) => setL(parseFloat(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          {/* Conditional Sliders for String */}
          {medium === 'string' && (
            <>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-slate-300">Tension ($T$)</label>
                  <span className="text-slate-300 font-mono">{T.toFixed(0)} N</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="400" 
                  step="10"
                  value={T}
                  onChange={(e) => setT(parseFloat(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-slate-300">Linear Density ($\mu$)</label>
                  <span className="text-slate-300 font-mono">{mu.toFixed(3)} kg/m</span>
                </div>
                <input 
                  type="range" 
                  min="0.005" 
                  max="0.05" 
                  step="0.005"
                  value={mu}
                  onChange={(e) => setMu(parseFloat(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>
            </>
          )}

          {/* Info Panel */}
          <div className="mt-auto bg-slate-900/50 p-4 rounded-xl border border-slate-700 space-y-3">
            <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Info size={16} /> Math Equations
            </h4>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Wave Speed ($v$)</span>
              <span className="font-mono text-green-300">{v.toFixed(1)} m/s</span>
            </div>
            
            {medium === 'string' && (
              <div className="text-xs font-mono text-slate-500 text-right w-full">
                v = √(T / μ)
              </div>
            )}
            {medium !== 'string' && (
              <div className="text-xs font-mono text-slate-500 text-right w-full">
                v = 343 m/s (Speed of sound)
              </div>
            )}

            <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-700/50">
              <span className="text-slate-400">Target Harmonic ($f_n$)</span>
              <span className="font-mono text-yellow-300">{resData.fn.toFixed(1)} Hz</span>
            </div>
            
            <div className="text-xs font-mono text-slate-500 text-right w-full">
              {medium === 'string' || medium === 'open_pipe' 
                ? 'f_n = (n × v) / 2L' 
                : 'f_n = (n × v) / 4L (n is odd)'}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}