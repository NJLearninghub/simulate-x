import React, { useState, useEffect, useMemo } from 'react';

const KirchhoffSimulation = () => {
  const [activeTab, setActiveTab] = useState('KCL');

  // KCL (Junction Rule) State
  // Positive = entering junction, Negative = leaving junction
  const [i1, setI1] = useState(5);
  const [i2, setI2] = useState(-3);
  const [i3, setI3] = useState(2);
  const i4 = -(i1 + i2 + i3); // Calculated to ensure sum = 0

  // KVL (Loop Rule) State
  const [v1, setV1] = useState(12);
  const [v2, setV2] = useState(9);
  const [r1, setR1] = useState(4);
  const [r2, setR2] = useState(2);
  const [r3, setR3] = useState(6);
  const [activeLoop, setActiveLoop] = useState('left'); // 'left', 'right', 'outer'

  // KVL Math Engine
  const kvlData = useMemo(() => {
    // 2-Loop Circuit: 
    // Left loop (clockwise): I1
    // Right loop (counter-clockwise): I2
    // Middle branch (downwards): I3 = I1 + I2
    // Equations:
    // 1) V1 - I1*R1 - (I1+I2)*R3 = 0  =>  (R1+R3)I1 + R3*I2 = V1
    // 2) V2 - I2*R2 - (I1+I2)*R3 = 0  =>  R3*I1 + (R2+R3)I2 = V2

    const D = (r1 + r3) * (r2 + r3) - r3 * r3; // Determinant (R1R2 + R1R3 + R2R3)
    const current1 = (v1 * (r2 + r3) - v2 * r3) / D;
    const current2 = (v2 * (r1 + r3) - v1 * r3) / D;
    const current3 = current1 + current2;

    return { I1: current1, I2: current2, I3: current3 };
  }, [v1, v2, r1, r2, r3]);

  // Animation Timer for KCL particles
  const [time, setTime] = useState(0);
  useEffect(() => {
    if (activeTab !== 'KCL') return;
    let animationFrame;
    const animate = () => {
      setTime(prev => prev + 1);
      animationFrame = requestAnimationFrame(animate);
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [activeTab]);

  return (
    <div className="min-h-[36rem] bg-slate-900 text-slate-100 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700">
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-2">
            Kirchhoff's Laws Explorer
          </h1>
          <p className="text-slate-400">Class 12 Physics: Current Electricity. Interactive visualization of Conservation of Charge and Energy.</p>
          
          <div className="flex space-x-4 mt-6">
            <button 
              onClick={() => setActiveTab('KCL')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${activeTab === 'KCL' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
            >
              First Law (Junction Rule)
            </button>
            <button 
              onClick={() => setActiveTab('KVL')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${activeTab === 'KVL' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
            >
              Second Law (Loop Rule)
            </button>
          </div>
        </div>

        {/* Module Render */}
        {activeTab === 'KCL' ? (
          <KCLModule i1={i1} i2={i2} i3={i3} i4={i4} setI1={setI1} setI2={setI2} setI3={setI3} time={time} />
        ) : (
          <KVLModule v1={v1} v2={v2} r1={r1} r2={r2} r3={r3} setV1={setV1} setV2={setV2} setR1={setR1} setR2={setR2} setR3={setR3} data={kvlData} activeLoop={activeLoop} setActiveLoop={setActiveLoop} />
        )}

      </div>
    </div>
  );
};

// --- KCL MODULE (Junction Rule) ---
const KCLModule = ({ i1, i2, i3, i4, setI1, setI2, setI3, time }) => {
  const branches = [
    { id: 1, current: i1, angle: 225, label: 'I₁', color: 'text-blue-400', stroke: '#60A5FA' },
    { id: 2, current: i2, angle: -45, label: 'I₂', color: 'text-emerald-400', stroke: '#34D399' },
    { id: 3, current: i3, angle: 135, label: 'I₃', color: 'text-amber-400', stroke: '#FBBF24' },
    { id: 4, current: i4, angle: 45, label: 'I₄', color: 'text-purple-400', stroke: '#C084FC', readOnly: true },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Simulation Canvas */}
      <div className="lg:col-span-2 bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700 flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden">
        <h2 className="absolute top-6 left-6 text-xl font-bold text-slate-200">The Junction (Node)</h2>
        <p className="absolute top-14 left-6 text-sm text-slate-400">Conservation of Charge: $\sum I = 0$</p>
        
        <svg viewBox="-200 -200 400 400" className="w-full max-w-[400px] h-auto">
          {/* Central Node */}
          <circle cx="0" cy="0" r="12" fill="#F8FAFC" className="shadow-lg" />
          
          {/* Branches */}
          {branches.map(b => {
            const rad = b.angle * (Math.PI / 180);
            const x2 = Math.cos(rad) * 180;
            const y2 = Math.sin(rad) * 180;
            
            // Current flow logic for animation
            // If current > 0, flows towards center (from outer to inner)
            // If current < 0, flows away from center (from inner to outer)
            const magnitude = Math.abs(b.current);
            const speedMultiplier = magnitude * 0.5;
            const isEntering = b.current > 0;
            
            // Generate particles
            const particles = [];
            if (magnitude > 0) {
              for (let j = 0; j < 5; j++) {
                // Base offset + time factor. 
                // Modulo 1 to loop from 0 to 1 along the line
                let progress = ((j * 0.2) + (time * 0.005 * speedMultiplier * (isEntering ? 1 : -1))) % 1;
                if (progress < 0) progress += 1; // fix negative modulo
                
                // If entering, progress 0 = outer (x2,y2), 1 = center (0,0)
                // Actually, let's always map 0 -> center, 1 -> outer.
                // If entering, particles move from 1 to 0.
                const px = x2 * progress;
                const py = y2 * progress;
                
                particles.push(
                  <circle key={j} cx={px} cy={py} r="4" fill={b.stroke} opacity={1 - Math.abs(progress - 0.5)*1.5} />
                );
              }
            }

            return (
              <g key={b.id}>
                {/* Wire */}
                <line x1="0" y1="0" x2={x2} y2={y2} stroke="#334155" strokeWidth="6" strokeLinecap="round" />
                {/* Arrow indicator */}
                {magnitude > 0 && (
                  <polygon 
                    points="-6,-6 6,0 -6,6" 
                    fill={b.stroke}
                    transform={`translate(${x2 * 0.6}, ${y2 * 0.6}) rotate(${b.angle + (isEntering ? 180 : 0)})`}
                  />
                )}
                {/* Particles */}
                {particles}
                {/* Labels */}
                <text x={x2 * 1.15} y={y2 * 1.15} fill={b.stroke} fontSize="20" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">
                  {b.label}
                </text>
                <text x={x2 * 1.15} y={y2 * 1.15 + 24} fill="#94A3B8" fontSize="14" textAnchor="middle" dominantBaseline="middle">
                  {b.current > 0 ? '+' : ''}{b.current.toFixed(1)} A
                </text>
              </g>
            );
          })}
        </svg>

        <div className="absolute bottom-6 w-full text-center px-4">
          <div className="inline-block bg-slate-900 border border-slate-700 py-3 px-6 rounded-xl">
            <span className="text-xl font-mono tracking-wider">
              <span className="text-blue-400">({i1 > 0 ? '+':''}{i1})</span> + 
              <span className="text-emerald-400"> ({i2 > 0 ? '+':''}{i2})</span> + 
              <span className="text-amber-400"> ({i3 > 0 ? '+':''}{i3})</span> + 
              <span className="text-purple-400"> ({i4 > 0 ? '+':''}{i4})</span> = 0
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700 flex flex-col space-y-6">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">Junction Controls</h3>
          <p className="text-sm text-slate-400">Set the currents entering (+) or leaving (-) the junction.</p>
        </div>

        <div className="space-y-6 flex-1">
          <SliderControl label="Branch 1 (I₁)" value={i1} set={setI1} min={-10} max={10} color="blue" />
          <SliderControl label="Branch 2 (I₂)" value={i2} set={setI2} min={-10} max={10} color="emerald" />
          <SliderControl label="Branch 3 (I₃)" value={i3} set={setI3} min={-10} max={10} color="amber" />
          
          <div className="pt-4 border-t border-slate-700">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-slate-300">Resulting Branch 4 (I₄)</label>
              <span className={`text-lg font-bold text-purple-400`}>{i4.toFixed(1)} A</span>
            </div>
            <p className="text-xs text-slate-500">Automatically balanced to ensure total charge entering equals total charge leaving.</p>
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl text-sm text-blue-200">
          <strong>Ah-Ha Moment:</strong> Notice that you cannot change all 4 currents independently. The 4th current is strictly dictated by the others. This is because charge cannot be created or destroyed at the junction point!
        </div>
      </div>
    </div>
  );
};

// --- KVL MODULE (Loop Rule) ---
const KVLModule = ({ v1, v2, r1, r2, r3, setV1, setV2, setR1, setR2, setR3, data, activeLoop, setActiveLoop }) => {
  const { I1, I2, I3 } = data;

  // Elevation Graph Data calculation based on active loop
  const getElevationData = () => {
    let points = [];
    if (activeLoop === 'left') {
      // Clockwise from bottom center
      // Start -> Up to V1 -> Right across R1 -> Down across R3 -> Back to start
      points.push({ label: 'Start', v: 0 });
      points.push({ label: 'Battery 1', v: v1, isGain: true });
      points.push({ label: 'Resistor 1', v: v1 - (I1 * r1), isGain: false });
      points.push({ label: 'Resistor 3', v: v1 - (I1 * r1) - (I3 * r3), isGain: false }); // Should equal 0
    } else if (activeLoop === 'right') {
      // Counter-Clockwise from bottom center
      // Start -> Up to V2 -> Left across R2 -> Down across R3 -> Back to start
      points.push({ label: 'Start', v: 0 });
      points.push({ label: 'Battery 2', v: v2, isGain: true });
      points.push({ label: 'Resistor 2', v: v2 - (I2 * r2), isGain: false });
      points.push({ label: 'Resistor 3', v: v2 - (I2 * r2) - (I3 * r3), isGain: false }); // Should equal 0
    } else if (activeLoop === 'outer') {
      // Clockwise outer rim from bottom left
      // Start -> Up to V1 -> Right across R1 -> Right across R2 (against I2) -> Down V2 (against V2) -> Left to start
      points.push({ label: 'Start', v: 0 });
      points.push({ label: 'Battery 1', v: v1, isGain: true });
      points.push({ label: 'Resistor 1', v: v1 - (I1 * r1), isGain: false });
      // Traversing R2 against current I2, so it's a potential GAIN
      points.push({ label: 'Resistor 2', v: v1 - (I1 * r1) + (I2 * r2), isGain: true });
      // Traversing V2 backwards, so it's a potential DROP
      points.push({ label: 'Battery 2', v: v1 - (I1 * r1) + (I2 * r2) - v2, isGain: false }); // Should equal 0
    }
    return points;
  };

  const elevData = getElevationData();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Circuit Diagram Canvas */}
        <div className="lg:col-span-2 bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700 min-h-[400px] flex flex-col items-center relative">
          <h2 className="absolute top-6 left-6 text-xl font-bold text-slate-200">The 2-Loop Circuit</h2>
          <p className="absolute top-14 left-6 text-sm text-slate-400 text-left max-w-sm">Conservation of Energy: $\sum \Delta V = 0$<br/>Click the loops below to trace the voltage.</p>
          
          <div className="absolute top-6 right-6 flex space-x-2">
            <button onClick={() => setActiveLoop('left')} className={`px-3 py-1 rounded text-sm font-bold ${activeLoop === 'left' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'}`}>Left Loop</button>
            <button onClick={() => setActiveLoop('right')} className={`px-3 py-1 rounded text-sm font-bold ${activeLoop === 'right' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'}`}>Right Loop</button>
            <button onClick={() => setActiveLoop('outer')} className={`px-3 py-1 rounded text-sm font-bold ${activeLoop === 'outer' ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-300'}`}>Outer Loop</button>
          </div>

          <div className="w-full h-full flex items-center justify-center mt-12">
            <svg viewBox="0 0 600 400" className="w-full max-w-[500px]">
              <defs>
                <marker id="arrow-emerald" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
                  <path d="M0,0 L10,5 L0,10 Z" fill="#34D399" />
                </marker>
                <marker id="arrow-blue" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
                  <path d="M0,0 L10,5 L0,10 Z" fill="#60A5FA" />
                </marker>
                <marker id="arrow-amber" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
                  <path d="M0,0 L10,5 L0,10 Z" fill="#FBBF24" />
                </marker>
              </defs>

              {/* Loop Highlights */}
              {activeLoop === 'left' && <path d="M 100 300 L 100 100 L 300 100 L 300 300 Z" fill="none" stroke="#34D399" strokeWidth="15" opacity="0.2" className="animate-pulse" />}
              {activeLoop === 'right' && <path d="M 300 300 L 300 100 L 500 100 L 500 300 Z" fill="none" stroke="#60A5FA" strokeWidth="15" opacity="0.2" className="animate-pulse" />}
              {activeLoop === 'outer' && <path d="M 100 300 L 100 100 L 500 100 L 500 300 Z" fill="none" stroke="#C084FC" strokeWidth="15" opacity="0.2" className="animate-pulse" />}

              {/* --- Wires --- */}
              {/* Left Loop Wires */}
              <path d="M 100 300 L 100 220 M 100 180 L 100 100 L 180 100 M 220 100 L 300 100 L 300 160 M 300 240 L 300 300 L 100 300" stroke="#94A3B8" strokeWidth="4" fill="none" />
              {/* Right Loop Wires */}
              <path d="M 500 300 L 500 220 M 500 180 L 500 100 L 420 100 M 380 100 L 300 100 M 300 300 L 500 300" stroke="#94A3B8" strokeWidth="4" fill="none" />

              {/* --- Components --- */}
              {/* V1 (Left Battery) */}
              <g transform="translate(100, 200)">
                <line x1="-15" y1="20" x2="15" y2="20" stroke="#F1F5F9" strokeWidth="4" />
                <line x1="-25" y1="-20" x2="25" y2="-20" stroke="#F1F5F9" strokeWidth="4" />
                <text x="-35" y="-15" fill="#F1F5F9" fontSize="16" fontWeight="bold">+</text>
                <text x="-40" y="0" fill="#34D399" fontSize="18" fontWeight="bold">V₁</text>
                <text x="-40" y="15" fill="#94A3B8" fontSize="12">{v1}V</text>
              </g>

              {/* V2 (Right Battery) */}
              <g transform="translate(500, 200)">
                <line x1="-15" y1="20" x2="15" y2="20" stroke="#F1F5F9" strokeWidth="4" />
                <line x1="-25" y1="-20" x2="25" y2="-20" stroke="#F1F5F9" strokeWidth="4" />
                <text x="25" y="-15" fill="#F1F5F9" fontSize="16" fontWeight="bold">+</text>
                <text x="35" y="0" fill="#60A5FA" fontSize="18" fontWeight="bold">V₂</text>
                <text x="35" y="15" fill="#94A3B8" fontSize="12">{v2}V</text>
              </g>

              {/* R1 (Top Left Resistor) */}
              <g transform="translate(200, 100)">
                <path d="M -20 0 L -15 -15 L -5 15 L 5 -15 L 15 15 L 20 0" fill="none" stroke="#F1F5F9" strokeWidth="4" strokeLinejoin="bevel" />
                <text x="0" y="-25" fill="#34D399" fontSize="18" fontWeight="bold" textAnchor="middle">R₁</text>
                <text x="0" y="-40" fill="#94A3B8" fontSize="12" textAnchor="middle">{r1}Ω</text>
              </g>

              {/* R2 (Top Right Resistor) */}
              <g transform="translate(400, 100)">
                <path d="M -20 0 L -15 -15 L -5 15 L 5 -15 L 15 15 L 20 0" fill="none" stroke="#F1F5F9" strokeWidth="4" strokeLinejoin="bevel" />
                <text x="0" y="-25" fill="#60A5FA" fontSize="18" fontWeight="bold" textAnchor="middle">R₂</text>
                <text x="0" y="-40" fill="#94A3B8" fontSize="12" textAnchor="middle">{r2}Ω</text>
              </g>

              {/* R3 (Middle Resistor) */}
              <g transform="translate(300, 200) rotate(90)">
                <path d="M -20 0 L -15 -15 L -5 15 L 5 -15 L 15 15 L 20 0" fill="none" stroke="#F1F5F9" strokeWidth="4" strokeLinejoin="bevel" />
                <text x="0" y="-25" fill="#FBBF24" fontSize="18" fontWeight="bold" textAnchor="middle" transform="rotate(-90) translate(-35, -10)">R₃</text>
                <text x="0" y="-40" fill="#94A3B8" fontSize="12" textAnchor="middle" transform="rotate(-90) translate(-35, 5)">{r3}Ω</text>
              </g>

              {/* --- Current Arrows --- */}
              {/* I1 (Left Loop - top wire) */}
              <g transform="translate(140, 100)">
                <line x1="0" y1="0" x2={I1 >= 0 ? 30 : -30} y2="0" stroke="#34D399" strokeWidth="3" markerEnd="url(#arrow-emerald)" />
                <text x="15" y="20" fill="#34D399" fontSize="14" fontWeight="bold" textAnchor="middle">I₁ = {Math.abs(I1).toFixed(2)}A</text>
              </g>

              {/* I2 (Right Loop - top wire) - Draw arrow pointing left if I2 is positive (counter-clockwise) */}
              <g transform="translate(460, 100)">
                <line x1="0" y1="0" x2={I2 >= 0 ? -30 : 30} y2="0" stroke="#60A5FA" strokeWidth="3" markerEnd="url(#arrow-blue)" />
                <text x="-15" y="20" fill="#60A5FA" fontSize="14" fontWeight="bold" textAnchor="middle">I₂ = {Math.abs(I2).toFixed(2)}A</text>
              </g>

              {/* I3 (Middle wire) */}
              <g transform="translate(300, 270)">
                <line x1="0" y1="0" x2="0" y2={I3 >= 0 ? 25 : -25} stroke="#FBBF24" strokeWidth="3" markerEnd="url(#arrow-amber)" />
                <text x="15" y="15" fill="#FBBF24" fontSize="14" fontWeight="bold">I₃ = {Math.abs(I3).toFixed(2)}A</text>
              </g>
            </svg>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700 flex flex-col space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Circuit Parameters</h3>
            <p className="text-sm text-slate-400">Adjust batteries & resistors.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SliderControl label="V₁ (Volts)" value={v1} set={setV1} min={0} max={24} color="emerald" small />
            <SliderControl label="V₂ (Volts)" value={v2} set={setV2} min={0} max={24} color="blue" small />
            <SliderControl label="R₁ (Ohms)" value={r1} set={setV1} min={1} max={20} color="emerald" actualSet={setR1} small />
            <SliderControl label="R₂ (Ohms)" value={r2} set={setV2} min={1} max={20} color="blue" actualSet={setR2} small />
            <div className="col-span-2">
               <SliderControl label="R₃ (Shared Ohms)" value={r3} set={setR3} min={1} max={20} color="amber" small />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl mt-2">
             <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Live Math (Cramer's Rule)</h4>
             <div className="font-mono text-sm space-y-1">
                <p className="text-emerald-400">I₁ = {I1.toFixed(3)} A</p>
                <p className="text-blue-400">I₂ = {I2.toFixed(3)} A</p>
                <p className="text-amber-400">I₃ = I₁ + I₂ = {I3.toFixed(3)} A</p>
             </div>
          </div>
        </div>
      </div>

      {/* The Breakthrough Elevation Graph */}
      <div className="bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
           <div>
             <h3 className="text-xl font-bold text-white mb-1">Potential Elevation Graph (KVL Visualized)</h3>
             <p className="text-sm text-slate-400">Tracing the <strong className="text-white">{activeLoop}</strong> loop. Watch the voltage step up and slope down. It MUST return to zero!</p>
           </div>
        </div>

        <div className="relative w-full h-[250px] bg-slate-900 rounded-xl border border-slate-700 p-4 pt-10">
           {/* Graph Y-Axis Lines */}
           <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-between py-4 pointer-events-none opacity-20">
              <div className="border-b border-slate-500 w-full h-0"></div>
              <div className="border-b border-slate-500 w-full h-0"></div>
              <div className="border-b border-slate-500 w-full h-0"></div>
              <div className="border-b border-dashed border-white w-full h-0 opacity-50"></div> {/* 0 Line */}
           </div>

           {/* Dynamic SVG Graph */}
           <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
             {/* Map the elevation data to SVG coordinates */}
             {(() => {
                const maxV = Math.max(...elevData.map(d => d.v), 24);
                const minV = Math.min(...elevData.map(d => d.v), -10);
                const range = maxV - minV;
                // Helper to map voltage to Y coordinate (inverted because SVG Y goes down)
                const mapY = (v) => 200 - ((v - minV) / range) * 160; 
                const stepX = 100 / (elevData.length - 1);

                return (
                  <>
                    {/* Draw the Zero Line explicitly */}
                    <line x1="0%" y1={mapY(0)} x2="100%" y2={mapY(0)} stroke="#FFFFFF" strokeWidth="2" strokeDasharray="5,5" opacity="0.3" />
                    <text x="0%" y={mapY(0) - 5} fill="#94A3B8" fontSize="12">0 Volts</text>

                    {/* Draw the lines and points */}
                    {elevData.map((pt, i) => {
                      if (i === 0) return null;
                      const prevPt = elevData[i-1];
                      const x1 = `${(i-1) * stepX}%`;
                      const x2 = `${i * stepX}%`;
                      const y1 = mapY(prevPt.v);
                      const y2 = mapY(pt.v);
                      
                      // Color based on if it was a gain or drop
                      const strokeColor = pt.v > prevPt.v ? '#34D399' : '#EF4444';

                      return (
                        <g key={i}>
                          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={strokeColor} strokeWidth="4" strokeLinecap="round" />
                          <circle cx={x2} cy={y2} r="5" fill="#F8FAFC" />
                          
                          {/* Label above/below point */}
                          <text x={x2} y={y2 < mapY(0) ? y2 - 15 : y2 + 25} fill="#F8FAFC" fontSize="12" textAnchor="middle" className="font-mono">
                            {pt.v.toFixed(1)}V
                          </text>
                          {/* Component Label */}
                          <text x={`${((i-0.5) * stepX)}%`} y={mapY(0) + 40} fill="#94A3B8" fontSize="12" textAnchor="middle">
                            {pt.label}
                          </text>
                          {/* Value change */}
                          <text x={`${((i-0.5) * stepX)}%`} y={(y1+y2)/2 - 10} fill={strokeColor} fontSize="12" textAnchor="middle" className="font-bold">
                            {pt.v > prevPt.v ? '+' : ''}{(pt.v - prevPt.v).toFixed(1)}V
                          </text>
                        </g>
                      );
                    })}
                    <circle cx="0%" cy={mapY(0)} r="5" fill="#F8FAFC" />
                  </>
                )
             })()}
           </svg>
        </div>
        
        <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
           <p className="text-sm text-purple-200">
             <strong>Ah-Ha Moment:</strong> Look at the graph above. No matter which loop you trace, or how you alter the resistors and batteries, the line <strong>always returns perfectly to 0 Volts</strong> at the end. This is Kirchhoff's Voltage Law physically visualizing the Conservation of Energy! You cannot gain or lose energy in a complete cycle.
           </p>
        </div>
      </div>
    </div>
  );
};

// --- Helper UI Components ---
const SliderControl = ({ label, value, set, min, max, color, actualSet = undefined, small = false }) => {
  const setter = actualSet || set;
  const colorMap = {
    blue: 'accent-blue-500',
    emerald: 'accent-emerald-500',
    amber: 'accent-amber-500',
    purple: 'accent-purple-500'
  };
  
  return (
    <div className={`flex flex-col ${small ? 'space-y-1' : 'space-y-2'}`}>
      <div className="flex justify-between items-center">
        <label className={`font-semibold text-slate-300 ${small ? 'text-xs' : 'text-sm'}`}>{label}</label>
        <span className={`font-mono font-bold ${small ? 'text-sm' : 'text-base'} text-${color}-400`}>{value}</span>
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        value={value} 
        onChange={(e) => setter(parseFloat(e.target.value))}
        className={`w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer ${colorMap[color]}`}
      />
    </div>
  );
};

export default KirchhoffSimulation;