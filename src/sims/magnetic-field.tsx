import React, { useState, useEffect, useRef, useMemo } from 'react';

export default function App() {
  // --- Physics State ---
  const [mode, setMode] = useState('helical'); // 'circular', 'helical', 'non-uniform'
  const [charge, setCharge] = useState(1); // q (+1 or -1)
  const [mass, setMass] = useState(1); // m (Reduced default for better scale)
  const [bField, setBField] = useState(0.04); // B strength
  const [velocity, setVelocity] = useState(6); // v magnitude
  const [angle, setAngle] = useState(60); // injection angle in degrees

  // --- Camera State ---
  const [camPitch, setCamPitch] = useState(0);
  const [camYaw, setCamYaw] = useState(0);
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  const canvasRef = useRef(null);
  
  // Snap camera to optimal angles when switching modes
  useEffect(() => {
    if (mode === 'circular') {
      setCamPitch(0);
      setCamYaw(0);
    } else {
      setCamPitch(0.35); // Slight tilt down
      setCamYaw(0.6);    // Pan left to see the Z-axis
    }
  }, [mode]);

  // --- Live Math Calculations ---
  const dashboardStats = useMemo(() => {
    const thetaRad = (mode === 'circular' ? 90 : angle) * Math.PI / 180;
    const vPerp = velocity * Math.sin(thetaRad);
    const vPara = velocity * Math.cos(thetaRad);
    
    // r = (m * v_perp) / (|q| * B)
    const radius = (mass * vPerp) / (Math.abs(charge) * bField);
    
    // T = (2 * pi * m) / (|q| * B)
    const period = (2 * Math.PI * mass) / (Math.abs(charge) * bField);
    
    // p = v_para * T
    const pitch = vPara * period;

    return { vPerp, vPara, radius, period, pitch };
  }, [mode, charge, mass, bField, velocity, angle]);

  // --- Main Physics Loop (Boris Algorithm + Canvas Rendering) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Handle high DPI displays for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    const width = rect.width;
    const height = rect.height;

    // 3D to 2D Orthographic Projection mapping
    const project = (x, y, z) => {
      const scale = 1.0; 

      // Apply Yaw (around Y axis)
      let x1 = x * Math.cos(camYaw) - z * Math.sin(camYaw);
      let z1 = x * Math.sin(camYaw) + z * Math.cos(camYaw);
      // Apply Pitch (around X axis)
      let y1 = y * Math.cos(camPitch) - z1 * Math.sin(camPitch);

      return {
        cx: width / 2 + x1 * scale,
        cy: height / 2 + y1 * scale,
        zDepth: z1 
      };
    };

    // Helper: Draw 3D Vector Arrow
    const drawArrow = (start, end, color, label) => {
      const headlen = 12;
      const dx = end.cx - start.cx;
      const dy = end.cy - start.cy;
      const angle = Math.atan2(dy, dx);
      
      ctx.beginPath();
      ctx.moveTo(start.cx, start.cy);
      ctx.lineTo(end.cx, end.cy);
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(end.cx, end.cy);
      ctx.lineTo(end.cx - headlen * Math.cos(angle - Math.PI / 6), end.cy - headlen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(end.cx - headlen * Math.cos(angle + Math.PI / 6), end.cy - headlen * Math.sin(angle + Math.PI / 6));
      ctx.lineTo(end.cx, end.cy);
      ctx.fillStyle = color;
      ctx.fill();
      
      if (label) {
        ctx.fillStyle = color;
        ctx.font = 'bold 18px sans-serif';
        // Offset text slightly
        ctx.fillText(label, end.cx + (dx > 0 ? 12 : -24), end.cy + (dy > 0 ? 20 : -12));
      }
    };

    // --- PHYSICS INITIALIZATION ---
    // B-field is into the screen (Negative Z axis)
    const bzDirection = -1; 
    
    const initialTheta = (mode === 'circular' ? 90 : angle) * Math.PI / 180;
    
    // Velocity splits into X (perp) and Z (parallel)
    let vel = {
      x: velocity * Math.sin(initialTheta),
      y: 0,
      z: velocity * Math.cos(initialTheta)
    };

    // Calculate exact radius to center the circle/helix perfectly on screen
    const r = dashboardStats.radius;
    
    // Calculate the start position so that the orbit revolves EXACTLY around x=0.
    // Right hand rule: V is +X, B is -Z. Force is V x B = +Y.
    // To center the orbit at X=0, we launch from X=0.
    // The force will pull it in the Y direction, so we offset Y by -radius.
    const startY = -r * Math.sign(charge * bzDirection);

    let pos = { 
      x: 0, // Perfectly centered on X-Axis!
      y: startY, 
      z: mode === 'circular' ? 0 : -250 // Brought slightly forward from -350
    };

    let trail = [];
    const maxTrail = 2400; // Increased length for slower speed
    const dt = 0.2; // REDUCED TIME STEP for slower, smoother animation!
    
    let peaks = [];
    let previousVx = vel.x;

    const render = () => {
      // Clear canvas with dark slate background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // 1. Draw Background Magnetic Field
      const isTopDown = Math.abs(camPitch) < 0.05 && Math.abs(camYaw) < 0.05;

      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.25)'; // Emerald green
      
      // Grid points for field lines (centered around 0,0)
      const gridSpacing = 80;
      for (let i = -4; i <= 4; i++) {
        for (let j = -3; j <= 3; j++) {
            const xOffset = i * gridSpacing;
            const yOffset = j * gridSpacing;
            
            if (isTopDown) {
              // Draw "Crosses" (X) indicating B-field going into the page
              const p = project(xOffset, yOffset, 0);
              const s = 4; // size of cross
              ctx.beginPath();
              ctx.moveTo(p.cx - s, p.cy - s); ctx.lineTo(p.cx + s, p.cy + s);
              ctx.moveTo(p.cx - s, p.cy + s); ctx.lineTo(p.cx + s, p.cy - s);
              ctx.stroke();
            } else {
              // Draw 3D Lines along the Z-axis
              ctx.beginPath();
              if (mode === 'non-uniform') {
                  // Draw a pinching "Magnetic Bottle" shape
                  for(let lz = -350; lz <= 350; lz += 20) {
                      const k = 0.000008; 
                      const pinchFactor = 1 / Math.sqrt(1 + k * lz * lz); 
                      const p = project(xOffset * pinchFactor, yOffset * pinchFactor, lz);
                      if (lz === -350) ctx.moveTo(p.cx, p.cy);
                      else ctx.lineTo(p.cx, p.cy);
                  }
              } else {
                  // Uniform straight lines
                  const pStart = project(xOffset, yOffset, -350);
                  const pEnd = project(xOffset, yOffset, 350);
                  ctx.moveTo(pStart.cx, pStart.cy);
                  ctx.lineTo(pEnd.cx, pEnd.cy);
              }
              ctx.stroke();
            }
        }
      }

      // Draw Center Z-Axis (Reference line)
      if (!isTopDown) {
        ctx.beginPath();
        const axisStart = project(0, 0, -350);
        const axisEnd = project(0, 0, 350);
        ctx.moveTo(axisStart.cx, axisStart.cy);
        ctx.lineTo(axisEnd.cx, axisEnd.cy);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.stroke();
      }

      // 2. Physics Step (Boris Push Algorithm)
      for (let step = 0; step < 4; step++) {
        let Bx = 0, By = 0, Bz = bField * bzDirection;
        
        if (mode === 'non-uniform') {
          // Magnetic Bottle Equation adapted for Z-axis
          const k = 0.000008; // Pinch steepness
          Bz = (bField * bzDirection) * (1 + k * pos.z * pos.z);
          Bx = -(bField * bzDirection) * k * pos.x * pos.z;
          By = -(bField * bzDirection) * k * pos.y * pos.z;
        }

        // The Boris Push Math (Exact Energy Conservation)
        const tX = (charge * Bx / mass) * (dt / 2);
        const tY = (charge * By / mass) * (dt / 2);
        const tZ = (charge * Bz / mass) * (dt / 2);
        const tMagSq = tX*tX + tY*tY + tZ*tZ;

        const sX = 2 * tX / (1 + tMagSq);
        const sY = 2 * tY / (1 + tMagSq);
        const sZ = 2 * tZ / (1 + tMagSq);

        const vpX = vel.x + (vel.y * tZ - vel.z * tY);
        const vpY = vel.y + (vel.z * tX - vel.x * tZ);
        const vpZ = vel.z + (vel.x * tY - vel.y * tX);

        vel.x = vel.x + (vpY * sZ - vpZ * sY);
        vel.y = vel.y + (vpZ * sX - vpX * sZ);
        vel.z = vel.z + (vpX * sY - vpY * sX);

        pos.x += vel.x * dt;
        pos.y += vel.y * dt;
        pos.z += vel.z * dt;

        // Helix Peak Detection (for pitch measurement)
        if (previousVx > 0 && vel.x <= 0) {
            peaks.push({ x: pos.x, y: pos.y, z: pos.z });
            if (peaks.length > 4) peaks.shift();
        }
        previousVx = vel.x;

        // Screen Wrap for Helix so it runs infinitely
        if ((mode === 'helical' || mode === 'non-uniform') && pos.z > 350) {
          pos.z = -350; // Wrap back to the start of the visible Z axis
          trail = [];
          peaks = [];
        }

        trail.push({ ...pos });
        if (trail.length > maxTrail) trail.shift();
      }

      // 3. Draw Particle Trail
      if (trail.length > 1) {
        ctx.beginPath();
        const p0 = project(trail[0].x, trail[0].y, trail[0].z);
        ctx.moveTo(p0.cx, p0.cy);
        for (let i = 1; i < trail.length; i++) {
          const p = project(trail[i].x, trail[i].y, trail[i].z);
          ctx.lineTo(p.cx, p.cy);
        }
        const color = charge > 0 ? '6, 182, 212' : '236, 72, 153'; 
        ctx.strokeStyle = `rgba(${color}, 0.85)`; 
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
      }

      const pCurrent = project(pos.x, pos.y, pos.z);

      // 4. Draw Specific Educational Visuals based on Mode
      if (mode === 'circular' || mode === 'helical') {
          // VELOCITY VECTOR (Yellow) - Tangent
          const vScale = 10;
          const pVEnd = project(pos.x + vel.x * vScale, pos.y + vel.y * vScale, pos.z + vel.z * vScale);
          drawArrow(pCurrent, pVEnd, '#facc15', 'v');

          // FORCE VECTOR (Red) - Pointing to center
          // F = q(v x B). 
          const Fx = charge * (vel.y * (bField*bzDirection));
          const Fy = charge * (-vel.x * (bField*bzDirection));
          
          const fMag = Math.sqrt(Fx*Fx + Fy*Fy);
          const fScale = 80 / (fMag || 1); // Fixed visual length
          const pFEnd = project(pos.x + Fx * fScale, pos.y + Fy * fScale, pos.z);
          drawArrow(pCurrent, pFEnd, '#ef4444', 'F');
      }

      if (mode === 'helical' || mode === 'non-uniform') {
          // RADIUS ANNOTATION
          const pAxis = project(0, 0, pos.z);
          ctx.beginPath();
          ctx.setLineDash([4, 4]);
          ctx.moveTo(pAxis.cx, pAxis.cy);
          ctx.lineTo(pCurrent.cx, pCurrent.cy);
          ctx.strokeStyle = '#38bdf8'; // Cyan
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.setLineDash([]);
          
          const rMid = project(pos.x / 2, pos.y / 2, pos.z);
          ctx.fillStyle = '#38bdf8';
          ctx.font = 'italic 16px serif';
          ctx.fillText('r', rMid.cx + 5, rMid.cy - 5);

          // PITCH ANNOTATION (Distance between last two peaks)
          if (peaks.length >= 2) {
              const p1 = peaks[peaks.length - 2];
              const p2 = peaks[peaks.length - 1];
              
              const proj1 = project(p1.x, p1.y, p1.z);
              const proj2 = project(p2.x, p2.y, p2.z);
              
              ctx.beginPath();
              ctx.moveTo(proj1.cx, proj1.cy);
              ctx.lineTo(proj2.cx, proj2.cy);
              
              // Tick marks
              ctx.moveTo(proj1.cx, proj1.cy - 8); ctx.lineTo(proj1.cx, proj1.cy + 8);
              ctx.moveTo(proj2.cx, proj2.cy - 8); ctx.lineTo(proj2.cx, proj2.cy + 8);
              ctx.strokeStyle = '#a78bfa'; // Purple
              ctx.lineWidth = 2;
              ctx.stroke();
              
              const midX = (proj1.cx + proj2.cx) / 2;
              const midY = (proj1.cy + proj2.cy) / 2;
              ctx.fillStyle = '#a78bfa';
              ctx.font = 'bold 14px sans-serif';
              ctx.fillText('Pitch (p)', midX, midY - 15);
          }
      }

      // 5. Draw the Particle
      ctx.beginPath();
      ctx.arc(pCurrent.cx, pCurrent.cy, 8, 0, 2 * Math.PI);
      ctx.fillStyle = charge > 0 ? '#22d3ee' : '#f472b6';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.shadowBlur = 0; 
      
      // Draw +/- sign on particle
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(charge > 0 ? '+' : '-', pCurrent.cx, pCurrent.cy);

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [mode, charge, mass, bField, velocity, angle, camPitch, camYaw]);

  // --- Mouse Handlers for Camera Rotation ---
  const handleMouseDown = (e) => {
    isDragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    
    setCamYaw(prev => prev - dx * 0.008);
    setCamPitch(prev => Math.max(-Math.PI/2, Math.min(Math.PI/2, prev - dy * 0.008)));
    
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[36rem] bg-slate-950 text-slate-100 font-sans select-none">
      
      {/* LEFT PANEL: 3D Canvas */}
      <div className="flex-1 p-6 flex flex-col relative overflow-hidden">
        <h1 className="text-3xl font-bold mb-2 text-white">Magnetic Field Trajectories</h1>
        <p className="text-slate-400 mb-4 max-w-2xl">
          Visualizing Lorentz Force <span className="font-mono text-emerald-400 text-sm bg-slate-900 px-2 py-1 rounded ml-1">F = q(v × B)</span>
        </p>

        {/* Mode Selector Tabs */}
        <div className="flex space-x-2 mb-4 bg-slate-900 p-1 rounded-lg self-start z-10">
          {['circular', 'helical', 'non-uniform'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                mode === m ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {m === 'circular' && "Circular (Uniform)"}
              {m === 'helical' && "Helical (Uniform)"}
              {m === 'non-uniform' && "Magnetic Mirror"}
            </button>
          ))}
        </div>

        <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-2xl relative shadow-2xl overflow-hidden min-h-[500px]"
             onMouseDown={handleMouseDown}
             onMouseMove={handleMouseMove}
             onMouseUp={handleMouseUp}
             onMouseLeave={handleMouseUp}
             style={{ cursor: isDragging.current ? 'grabbing' : 'grab' }}
        >
          {/* Status Overlays */}
          <div className="absolute top-4 left-4 text-emerald-500 font-mono text-xs font-bold tracking-widest opacity-80 bg-slate-950/50 px-2 py-1 rounded">
            B-FIELD: {Math.abs(camPitch) < 0.05 && Math.abs(camYaw) < 0.05 ? "INTO SCREEN (×)" : "ALONG Z-AXIS"}
          </div>
          
          <div className="absolute bottom-4 left-4 text-slate-400 text-xs font-bold flex items-center bg-slate-950/50 px-3 py-1.5 rounded-full pointer-events-none">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path></svg>
            Click and Drag to Rotate Camera
          </div>
          
          <canvas ref={canvasRef} className="w-full h-full block" />
        </div>
      </div>

      {/* RIGHT PANEL: Controls & Dashboard */}
      <div className="w-full lg:w-[450px] bg-slate-900 border-l border-slate-800 p-6 flex flex-col gap-6 overflow-y-auto z-10">
        
        {/* Dynamic Concept Explanation */}
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
          <h2 className="text-lg font-bold text-white mb-2">Physics In Action</h2>
          {mode === 'circular' && (
            <p className="text-sm text-slate-300 leading-relaxed">
              In Circular mode, the <strong>Velocity (<span className="text-yellow-400">v</span>)</strong> is strictly perpendicular to the magnetic field (which goes into the screen). Notice how the <strong>Force (<span className="text-red-400">F</span>)</strong> acts as a centripetal force pointing directly to the center, creating a perfectly flat closed loop in the X-Y plane!
            </p>
          )}
          {mode === 'helical' && (
            <p className="text-sm text-slate-300 leading-relaxed">
              By injecting at an angle, the velocity splits. We can now visually measure the <strong>Radius (<span className="text-cyan-400">r</span>)</strong> generated by perpendicular velocity, and the <strong>Pitch (<span className="text-purple-400">p</span>)</strong> generated by the parallel velocity pushing the loops deeper into the Z-axis.
            </p>
          )}
          {mode === 'non-uniform' && (
            <p className="text-sm text-slate-300 leading-relaxed">
              <span className="text-pink-400 font-bold">The Magnetic Bottle:</span> Watch the <strong>Pitch (<span className="text-purple-400">p</span>)</strong> bracket closely. As the particle spirals deeper into the stronger field, the loops compress until the pitch hits zero, forcing a perfect reflection!
            </p>
          )}
        </div>

        {/* Dashboard */}
        <div className="bg-slate-950 rounded-xl p-5 border border-slate-800">
          <h2 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">Real-Time Trajectory Data</h2>
          
          {mode === 'non-uniform' ? (
             <div className="text-center py-4 text-slate-400 text-sm border border-dashed border-slate-700 rounded bg-slate-900/30">
               ⚠️ Radius & Pitch update dynamically on the 3D Canvas as the field gradients alter the particle's momentum.
             </div>
          ) : (
            <div className="space-y-4 font-mono text-sm">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-slate-400">Radius (r = mv_⊥/qB)</span>
                <span className="text-cyan-400">{dashboardStats.radius.toFixed(1)} units</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-slate-400">Pitch (p = v_|| · T)</span>
                <span className="text-purple-400">{mode === 'circular' ? 0 : dashboardStats.pitch.toFixed(1)} units</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Time Period (T = 2πm/qB)</span>
                <span className="text-indigo-400">{dashboardStats.period.toFixed(1)} s</span>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-6 flex-1">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">Variables</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-slate-300">Charge (q)</div>
              <div className="flex bg-slate-800 rounded-lg p-1">
                <button onClick={() => setCharge(1)} className={`flex-1 py-1 rounded text-sm font-bold ${charge > 0 ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500'}`}>+ Pos</button>
                <button onClick={() => setCharge(-1)} className={`flex-1 py-1 rounded text-sm font-bold ${charge < 0 ? 'bg-pink-500/20 text-pink-400' : 'text-slate-500'}`}>- Neg</button>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-slate-300">Mass (m)</span>
                <span className="text-slate-400">{mass}</span>
              </div>
              <input type="range" min="0.5" max="3" step="0.5" value={mass} onChange={(e) => setMass(parseFloat(e.target.value))} className="w-full accent-slate-400" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-emerald-400">B-Field Strength (B)</span>
              <span className="text-slate-300">{bField.toFixed(3)} T</span>
            </div>
            <input type="range" min="0.02" max="0.1" step="0.01" value={bField} onChange={(e) => setBField(parseFloat(e.target.value))} className="w-full accent-emerald-500" />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-yellow-400">Injection Velocity (v)</span>
              <span className="text-slate-300">{velocity} m/s</span>
            </div>
            <input type="range" min="2" max="15" step="1" value={velocity} onChange={(e) => setVelocity(parseFloat(e.target.value))} className="w-full accent-yellow-400" />
          </div>

          <div className={`space-y-1 transition-opacity duration-300 ${mode === 'circular' ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
            <div className="flex justify-between text-sm font-medium">
              <span className="text-amber-400">Injection Angle (θ)</span>
              <span className="text-slate-300">{mode === 'circular' ? 90 : angle}°</span>
            </div>
            <input type="range" min="15" max="85" step="5" value={angle} onChange={(e) => setAngle(parseInt(e.target.value))} className="w-full accent-amber-500" />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Parallel (0°)</span><span>Perpendicular (90°)</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}