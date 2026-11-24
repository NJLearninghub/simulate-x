import React, { useState, useRef, useEffect } from 'react';
import { Settings2, PlusCircle, MinusCircle, Info, Activity } from 'lucide-react';

const SCENARIOS = {
  SINGLE_POS: {
    id: 'single_pos',
    name: 'Single Positive Charge',
    charges: [{ x: 0, y: 0, q: 1 }],
    description: "Field lines radiate uniformly OUTWARD in all directions from a positive charge. The vector field strength drops off inversely with the square of the distance (1/r²)."
  },
  SINGLE_NEG: {
    id: 'single_neg',
    name: 'Single Negative Charge',
    charges: [{ x: 0, y: 0, q: -1 }],
    description: "Field lines point radially INWARD from infinity toward the negative charge. The shape is identical to the positive charge, but the vector direction is exactly reversed."
  },
  UNLIKE: {
    id: 'unlike',
    name: 'Unlike Charges (Dipole)',
    charges: [{ x: -100, y: 0, q: 1 }, { x: 100, y: 0, q: -1 }],
    description: "Lines start at the positive charge and terminate at the negative charge. Notice the strong, nearly uniform field directly between them, and the sweeping arcs on the outside."
  },
  LIKE: {
    id: 'like',
    name: 'Like Charges (+ and +)',
    charges: [{ x: -100, y: 0, q: 1 }, { x: 100, y: 0, q: 1 }],
    description: "Field lines fiercely repel each other! They never cross. Look closely at the exact center between the charges—this is a 'Null Point' where the electric field perfectly cancels out to zero."
  },
  PLATES: {
    id: 'plates',
    name: 'Parallel Plates',
    charges: [
      ...Array.from({ length: 21 }).map((_, i) => ({ x: -120, y: -200 + i * 20, q: 0.3 })),
      ...Array.from({ length: 21 }).map((_, i) => ({ x: 120, y: -200 + i * 20, q: -0.3 }))
    ],
    description: "Between the plates, the field vectors are perfectly parallel, equally spaced, and constant in magnitude. This visualizes a UNIFORM electric field. Notice the 'fringing' (curving) at the edges."
  }
};

export default function ElectricFieldVisualizer() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  
  const [activeScenario, setActiveScenario] = useState('UNLIKE');
  const [probePos, setProbePos] = useState({ x: 0, y: -80 });
  const [isDragging, setIsDragging] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  // Physics Constants
  const K = 120000; // Artificial Coulomb's constant for visualization
  const GRID_SIZE = 28; // Spacing between vector arrows

  // Handle Responsive Canvas Resizing
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setCanvasSize({ width: clientWidth, height: clientHeight });
      }
    };

    handleResize(); // Initial measurement
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent mobile scrolling when dragging the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const preventScroll = (e) => {
      if (isDragging) {
        e.preventDefault();
      }
    };
    
    canvas.addEventListener('touchmove', preventScroll, { passive: false });
    return () => canvas.removeEventListener('touchmove', preventScroll);
  }, [isDragging]);

  // Math Engine: Calculate Electric Field at point (x, y)
  const calculateEField = (x, y, charges) => {
    let Ex = 0;
    let Ey = 0;
    
    for (let c of charges) {
      const dx = x - c.x;
      const dy = y - c.y;
      const r2 = dx * dx + dy * dy;
      
      // Prevent infinite singularity if exactly on a charge
      if (r2 < 40) continue; 
      
      const r = Math.sqrt(r2);
      const E = (K * c.q) / r2;
      
      Ex += E * (dx / r);
      Ey += E * (dy / r);
    }
    
    return { Ex, Ey };
  };

  const drawArrow = (ctx, x, y, angle, magnitude) => {
    // Map physical magnitude to a visual length
    const visualMag = Math.min(magnitude * 0.12, GRID_SIZE * 0.85);
    const minVisualMag = 3;
    const finalLength = Math.max(visualMag, minVisualMag);
    
    // Logarithmic opacity for better visual dynamic range
    const opacity = Math.min(Math.max(Math.log10(magnitude + 1) / 2.5, 0.1), 0.85);

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.moveTo(-finalLength / 2, 0);
    ctx.lineTo(finalLength / 2, 0);
    
    // Arrow head
    ctx.lineTo(finalLength / 2 - 4, -3);
    ctx.moveTo(finalLength / 2, 0);
    ctx.lineTo(finalLength / 2 - 4, 3);
    
    ctx.strokeStyle = `rgba(165, 243, 252, ${opacity})`; // Cyan-200 with dynamic opacity
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    ctx.restore();
  };

  // Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvasSize;
    
    // Ensure actual canvas resolution matches CSS display size
    canvas.width = width;
    canvas.height = height;

    // Clear canvas with dark slate
    ctx.fillStyle = '#020617'; // tailwind slate-950
    ctx.fillRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;
    const charges = SCENARIOS[activeScenario].charges;

    // Draw Vector Field Grid
    const startX = (cx % GRID_SIZE) - GRID_SIZE;
    const startY = (cy % GRID_SIZE) - GRID_SIZE;

    for (let x = startX; x <= width + GRID_SIZE; x += GRID_SIZE) {
      for (let y = startY; y <= height + GRID_SIZE; y += GRID_SIZE) {
        const simX = x - cx;
        const simY = y - cy;
        
        const { Ex, Ey } = calculateEField(simX, simY, charges);
        const magnitude = Math.sqrt(Ex * Ex + Ey * Ey);
        const angle = Math.atan2(Ey, Ex);

        if (magnitude > 0.05) {
          drawArrow(ctx, x, y, angle, magnitude);
        }
      }
    }

    // Draw Source Charges
    charges.forEach(c => {
      // For plates, draw smaller points, for others draw large circles
      const isPlate = activeScenario === 'PLATES';
      const radius = isPlate ? 4 : 14;

      ctx.beginPath();
      ctx.arc(cx + c.x, cy + c.y, radius, 0, Math.PI * 2);
      
      if (c.q > 0) {
        // Positive
        ctx.fillStyle = isPlate ? '#ef4444' : '#f87171'; // Red
        ctx.fill();
        ctx.shadowColor = '#dc2626';
        ctx.shadowBlur = 10;
        ctx.fill();
        
        if (!isPlate) {
          ctx.fillStyle = 'white';
          ctx.font = '16px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('+', cx + c.x, cy + c.y + 1);
        }
      } else {
        // Negative
        ctx.fillStyle = isPlate ? '#3b82f6' : '#60a5fa'; // Blue
        ctx.fill();
        ctx.shadowColor = '#2563eb';
        ctx.shadowBlur = 10;
        ctx.fill();
        
        if (!isPlate) {
          ctx.fillStyle = 'white';
          ctx.font = '20px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('-', cx + c.x, cy + c.y - 1);
        }
      }
      ctx.shadowBlur = 0;
    });

    // Draw Interactive Probe
    const { Ex: pEx, Ey: pEy } = calculateEField(probePos.x, probePos.y, charges);
    const pMag = Math.sqrt(pEx * pEx + pEy * pEy);
    const pAngle = Math.atan2(pEy, pEx);

    // Probe Body
    ctx.beginPath();
    ctx.arc(cx + probePos.x, cy + probePos.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#facc15'; // Yellow-400
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Probe Resultant Vector (E-Net)
    if (pMag > 0.1) {
      const vecLength = Math.min(pMag * 0.15, 120); // Scale the visual vector
      ctx.save();
      ctx.translate(cx + probePos.x, cy + probePos.y);
      ctx.rotate(pAngle);
      
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(vecLength, 0);
      
      // Arrowhead
      ctx.lineTo(vecLength - 10, -6);
      ctx.moveTo(vecLength, 0);
      ctx.lineTo(vecLength - 10, 6);
      
      ctx.strokeStyle = '#fef08a'; // Bright yellow
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
      
      // Net Force Label
      ctx.translate(vecLength + 15, 0);
      ctx.rotate(-pAngle); // keep text upright
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('E-Net', 0, 0);
      
      ctx.restore();
    }
  }, [activeScenario, probePos, canvasSize]);

  // Touch / Mouse Interactions
  const updateProbePos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    
    // Handle both touch and mouse
    let clientX = e.clientX;
    let clientY = e.clientY;
    
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    // Convert screen coordinates to canvas sim coordinates
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    setProbePos({
      x: x - canvas.width / 2,
      y: y - canvas.height / 2
    });
  };

  const handlePointerDown = (e) => {
    // Check if clicked near the probe (larger hit area for mobile)
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    let clientX = e.clientX || (e.touches && e.touches[0].clientX);
    let clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const simX = (clientX - rect.left) * scaleX - canvas.width / 2;
    const simY = (clientY - rect.top) * scaleY - canvas.height / 2;

    const dist = Math.sqrt(Math.pow(simX - probePos.x, 2) + Math.pow(simY - probePos.y, 2));
    
    // 40px hit radius is generous for fat fingers on mobile
    if (dist < 40 || !isDragging) {
      setIsDragging(true);
      updateProbePos(e);
    }
  };

  const handlePointerMove = (e) => {
    if (isDragging) {
      updateProbePos(e);
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="min-h-[36rem] bg-slate-950 text-slate-200 p-3 md:p-6 font-sans flex flex-col lg:flex-row gap-4 md:gap-6 touch-manipulation">
      
      {/* Left Control Panel */}
      <div className="w-full lg:w-80 flex flex-col gap-4 flex-shrink-0">
        
        {/* Header & Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400">
              <Activity size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">Electric Field of Point Charges</h1>
          </div>
          
          <h2 className="text-xs uppercase tracking-wider text-slate-400 mb-3 font-semibold">Select Configuration</h2>
          
          <div className="flex flex-col gap-2">
            {Object.keys(SCENARIOS).map((key) => {
              const scenario = SCENARIOS[key];
              const isActive = activeScenario === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveScenario(key)}
                  className={`w-full px-4 py-3 rounded-xl text-left transition-all duration-200 flex items-center gap-3 border ${
                    isActive 
                      ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                      : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  {scenario.id.includes('pos') || scenario.id === 'unlike' || scenario.id === 'like' || scenario.id === 'plates' ? 
                    <PlusCircle size={18} className={isActive ? "text-red-400" : "text-slate-500"} /> : 
                    <MinusCircle size={18} className={isActive ? "text-blue-400" : "text-slate-500"} />
                  }
                  <span className="font-medium text-sm">{scenario.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Physics Explanation Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex-grow flex flex-col">
          <div className="flex items-center gap-2 mb-3 text-yellow-400">
            <Info size={18} />
            <h2 className="font-bold text-sm">Physics Analysis</h2>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed mb-4">
            {SCENARIOS[activeScenario].description}
          </p>

          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 mt-auto">
             <p className="text-xs uppercase tracking-wider text-slate-400 mb-2 font-semibold">Interactive Sandbox</p>
             <p className="text-sm text-yellow-200/90 leading-relaxed">
                Drag the <span className="font-bold text-yellow-400">Yellow Probe</span> around the canvas to see the resultant net force vector calculate and shift in real-time!
             </p>
          </div>
        </div>
      </div>

      {/* Main Simulation Canvas Area */}
      <div 
        ref={containerRef}
        className="flex-grow bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative min-h-[400px] lg:min-h-full"
      >
        {/* Math overlay safely escaped */}
        <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur border border-slate-800 p-3 rounded-xl shadow-lg pointer-events-none z-10">
          <p className="font-mono text-sm text-cyan-300">
            <span className="opacity-70 text-slate-400">Superposition:</span> <br/>
            E-Net = Σ k·q / r²
          </p>
        </div>

        <canvas
          ref={canvasRef}
          className="block w-full h-full touch-none cursor-crosshair"
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
          onTouchCancel={handlePointerUp}
        />
      </div>

    </div>
  );
}