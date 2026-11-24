import React, { useState, useEffect, useRef } from 'react';
import { Settings2, Activity, Info, Zap } from 'lucide-react';

export default function ACCircuitSimulation() {
  // Simulation State
  const [mode, setMode] = useState('LCR'); // 'R', 'L', 'C', 'LCR'
  const [Vm, setVm] = useState(100); // Peak Voltage (V)
  const [f, setF] = useState(50); // Frequency (Hz)
  const [R, setR] = useState(40); // Resistance (Ohms)
  const [L, setL] = useState(150); // Inductance (mH)
  const [C, setC] = useState(50); // Capacitance (uF)

  // Canvas Ref
  const canvasRef = useRef(null);

  // Physics Calculations
  const omega = 2 * Math.PI * f; // Angular frequency
  const XL = omega * (L / 1000); // Inductive Reactance (Ohms)
  const XC = 1 / (omega * (C / 1000000)); // Capacitive Reactance (Ohms)

  let Z = 0;
  let phi = 0; // Phase angle (radians). Positive means V leads I (I lags V)

  if (mode === 'R') {
    Z = R;
    phi = 0;
  } else if (mode === 'L') {
    Z = XL;
    phi = Math.PI / 2; // I lags V by 90 deg
  } else if (mode === 'C') {
    Z = XC;
    phi = -Math.PI / 2; // I leads V by 90 deg
  } else if (mode === 'LCR') {
    Z = Math.sqrt(R * R + Math.pow(XL - XC, 2));
    phi = Math.atan2(XL - XC, R); // Impedance angle
  }

  const Im = Vm / Z; // Peak Current (A)
  const Irms = Im / Math.SQRT2;
  const Vrms = Vm / Math.SQRT2;
  const Pavg = Vrms * Irms * Math.cos(phi); // Average Power
  const f_res = 1 / (2 * Math.PI * Math.sqrt((L / 1000) * (C / 1000000))); // Resonant frequency

  // Static Rendering Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Canvas dimensions and layout
    const width = canvas.width;
    const height = canvas.height;
    const cx1 = 250; // Phasor center X
    const cx2 = 650; // Circuit center X
    const cy = height / 2; // Common center Y

    // Visual Scaling
    const vScale = 1.2; // Pixels per Volt
    const iScale = 30;  // Pixels per Ampere 

    // Fixed angle for textbook-style diagram (30 degrees)
    const fixedTheta = Math.PI / 6;

    const drawArrow = (fromX, fromY, toX, toY, color, label) => {
      const headlen = 10;
      const dx = toX - fromX;
      const dy = toY - fromY;
      const angle = Math.atan2(dy, dx);
      
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(toX, toY);
      ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
      ctx.lineTo(toX, toY);
      ctx.fillStyle = color;
      ctx.fill();

      if (label) {
        ctx.fillStyle = color;
        ctx.font = 'bold 16px Arial';
        ctx.fillText(label, toX + 15 * Math.cos(angle), toY + 15 * Math.sin(angle));
      }
    };

    // --- Render Logic ---
    // Clear canvas
    ctx.fillStyle = '#0f172a'; // tailwind slate-900
    ctx.fillRect(0, 0, width, height);

    // Draw Grid & Axes for Phasor
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx1, 20); ctx.lineTo(cx1, height - 20); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(20, cy); ctx.lineTo(cx1 + 180, cy); ctx.stroke();
    
    // Calculate current angles (y is inverted in canvas, so we use -sin)
    const theta_V = fixedTheta; 
    const theta_I = theta_V - phi;

    // Voltage Vector
    const V_vis = Vm * vScale;
    const Vx = cx1 + V_vis * Math.cos(theta_V);
    const Vy = cy - V_vis * Math.sin(theta_V);

    // Current Vector
    const I_vis = Im * iScale;
    const Ix = cx1 + I_vis * Math.cos(theta_I);
    const Iy = cy - I_vis * Math.sin(theta_I);

    // Draw Phasor Reference Circle
    ctx.beginPath();
    ctx.arc(cx1, cy, V_vis, 0, 2 * Math.PI);
    ctx.strokeStyle = '#1e293b';
    ctx.stroke();

    // Draw LCR Individual Voltage Vectors (Head-to-Tail)
    if (mode === 'LCR') {
      const VR_vis = Im * R * vScale;
      const VL_vis = Im * XL * vScale;
      const VC_vis = Im * XC * vScale;

      // VR is in phase with I
      const VRx = cx1 + VR_vis * Math.cos(theta_I);
      const VRy = cy - VR_vis * Math.sin(theta_I);
      drawArrow(cx1, cy, VRx, VRy, '#10b981', ''); // Green VR

      // VL leads I by 90
      const VLx = VRx + VL_vis * Math.cos(theta_I + Math.PI/2);
      const VLy = VRy - VL_vis * Math.sin(theta_I + Math.PI/2);
      drawArrow(VRx, VRy, VLx, VLy, '#ef4444', ''); // Red VL

      // VC lags I by 90
      const VCx = VLx + VC_vis * Math.cos(theta_I - Math.PI/2);
      const VCy = VLy - VC_vis * Math.sin(theta_I - Math.PI/2);
      drawArrow(VLx, VLy, VCx, VCy, '#a855f7', ''); // Purple VC
    }

    // Draw Main Phasor Vectors
    drawArrow(cx1, cy, Vx, Vy, '#06b6d4', 'V'); // Cyan Voltage
    drawArrow(cx1, cy, Ix, Iy, '#f59e0b', 'I'); // Yellow Current

    // --- Draw Circuit Diagram ---
    const drawCircuit = () => {
      const left = cx2 - 120;
      const right = cx2 + 120;
      const top = cy - 120;
      const bottom = cy + 120;

      // Draw Main Loop Wires
      ctx.beginPath();
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      ctx.strokeRect(left, top, right - left, bottom - top);

      // Draw AC Source (Left Edge)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(left - 30, cy - 30, 60, 60); // Clear wire line
      ctx.beginPath();
      ctx.arc(left, cy, 25, 0, 2*Math.PI);
      ctx.strokeStyle = '#06b6d4'; // Match V Color
      ctx.stroke();
      ctx.beginPath();
      // Sine wave symbol
      ctx.moveTo(left - 12, cy);
      ctx.bezierCurveTo(left - 6, cy - 15, left + 6, cy + 15, left + 12, cy);
      ctx.stroke();
      ctx.fillStyle = '#06b6d4';
      ctx.font = 'bold 20px Arial';
      ctx.fillText("ε", left - 45, cy + 8);

      // Draw Components based on Mode
      if (mode === 'R') {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(right - 20, cy - 40, 40, 80); // Clear background
        ctx.strokeStyle = '#10b981';
        ctx.beginPath();
        let currY = cy - 30;
        ctx.moveTo(right, currY);
        for(let i=0; i<6; i++) {
            currY += 10;
            ctx.lineTo(right + (i%2===0 ? 15 : -15), currY);
        }
        ctx.lineTo(right, cy + 30);
        ctx.stroke();
        ctx.fillStyle = '#10b981';
        ctx.fillText("R", right + 25, cy + 5);
      } 
      else if (mode === 'L') {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(right - 20, cy - 40, 40, 80); // Clear background
        ctx.strokeStyle = '#ef4444';
        ctx.beginPath();
        for(let i=0; i<4; i++) {
           ctx.arc(right, (cy - 22.5) + i*15, 7.5, -Math.PI/2, Math.PI/2, false);
        }
        ctx.stroke();
        ctx.fillStyle = '#ef4444';
        ctx.fillText("L", right + 25, cy + 5);
      }
      else if (mode === 'C') {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(right - 20, cy - 15, 40, 30); // Clear background
        ctx.strokeStyle = '#a855f7';
        ctx.beginPath();
        ctx.moveTo(right - 15, cy - 5); ctx.lineTo(right + 15, cy - 5);
        ctx.moveTo(right - 15, cy + 5); ctx.lineTo(right + 15, cy + 5);
        ctx.stroke();
        ctx.fillStyle = '#a855f7';
        ctx.fillText("C", right + 25, cy + 5);
      }
      else if (mode === 'LCR') {
        // Resistor on Top
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(cx2 - 40, top - 20, 80, 40);
        ctx.strokeStyle = '#10b981';
        ctx.beginPath();
        let currX = cx2 - 30;
        ctx.moveTo(currX, top);
        for(let i=0; i<6; i++) {
            currX += 10;
            ctx.lineTo(currX, top + (i%2===0 ? -15 : 15));
        }
        ctx.lineTo(cx2 + 30, top);
        ctx.stroke();
        ctx.fillStyle = '#10b981';
        ctx.fillText("R", cx2 - 6, top - 25);

        // Capacitor on Right
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(right - 20, cy - 15, 40, 30);
        ctx.strokeStyle = '#a855f7';
        ctx.beginPath();
        ctx.moveTo(right - 15, cy - 5); ctx.lineTo(right + 15, cy - 5);
        ctx.moveTo(right - 15, cy + 5); ctx.lineTo(right + 15, cy + 5);
        ctx.stroke();
        ctx.fillStyle = '#a855f7';
        ctx.fillText("C", right + 25, cy + 5);

        // Inductor on Bottom
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(cx2 - 40, bottom - 20, 80, 40);
        ctx.strokeStyle = '#ef4444';
        ctx.beginPath();
        for(let i=0; i<4; i++) {
           ctx.arc((cx2 - 22.5) + i*15, bottom, 7.5, Math.PI, 0, false);
        }
        ctx.stroke();
        ctx.fillStyle = '#ef4444';
        ctx.fillText("L", cx2 - 6, bottom - 15); 
      }
    };
    
    drawCircuit();

  }, [mode, Vm, f, R, L, C, phi, Im, XL, XC, Z]);

  return (
    <div className="flex flex-col bg-slate-950 min-h-[36rem] text-slate-200 font-sans p-4 md:p-8">
      
      <header className="mb-6 border-b border-slate-800 pb-4">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Activity className="text-cyan-500" />
          AC Circuits and Phasors
        </h1>
        <p className="text-slate-400 mt-2">
          Explore Phase Relationships (Lead/Lag) directly against their schematic circuit layouts.
        </p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Left Control Panel */}
        <div className="xl:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col gap-6">
          
          <div>
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Settings2 size={18} className="text-slate-400"/> Circuit Mode
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {['R', 'L', 'C', 'LCR'].map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    mode === m 
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/50' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {m === 'LCR' ? 'Series LCR' : `Pure ${m}`}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Zap size={18} className="text-yellow-500"/> Parameters
            </h2>

            {/* Voltage Control */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Peak Voltage (V<sub className="text-[10px]">m</sub>)</span>
                <span className="font-mono text-cyan-400">{Vm} V</span>
              </div>
              <input type="range" min="10" max="200" value={Vm} onChange={(e) => setVm(Number(e.target.value))} className="w-full accent-cyan-500" />
            </div>

            {/* Frequency Control */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Frequency (f)</span>
                <span className="font-mono text-cyan-400">{f} Hz</span>
              </div>
              <input type="range" min="10" max="100" value={f} onChange={(e) => setF(Number(e.target.value))} className="w-full accent-cyan-500" />
            </div>

            {/* Resistor Control */}
            {(mode === 'R' || mode === 'LCR') && (
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Resistance (R)</span>
                  <span className="font-mono text-green-400">{R} Ω</span>
                </div>
                <input type="range" min="5" max="200" value={R} onChange={(e) => setR(Number(e.target.value))} className="w-full accent-green-500" />
              </div>
            )}

            {/* Inductor Control */}
            {(mode === 'L' || mode === 'LCR') && (
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Inductance (L)</span>
                  <span className="font-mono text-red-400">{L} mH</span>
                </div>
                <input type="range" min="10" max="500" value={L} onChange={(e) => setL(Number(e.target.value))} className="w-full accent-red-500" />
              </div>
            )}

            {/* Capacitor Control */}
            {(mode === 'C' || mode === 'LCR') && (
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Capacitance (C)</span>
                  <span className="font-mono text-purple-400">{C} μF</span>
                </div>
                <input type="range" min="10" max="500" value={C} onChange={(e) => setC(Number(e.target.value))} className="w-full accent-purple-500" />
              </div>
            )}
          </div>
        </div>

        {/* Right Main Content */}
        <div className="xl:col-span-3 flex flex-col gap-6">
          
          {/* Canvas Viewport */}
          <div className="bg-[#0f172a] rounded-xl border border-slate-800 shadow-2xl overflow-hidden relative">
            <div className="absolute top-4 left-4 flex gap-4 text-xs font-mono font-bold bg-slate-900/80 px-3 py-2 rounded-lg backdrop-blur-sm">
              <span className="text-cyan-400 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-cyan-400"></div> V (Source)</span>
              <span className="text-yellow-500 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> I (Current)</span>
              {mode === 'LCR' && (
                <>
                  <span className="text-green-500 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> V_R</span>
                  <span className="text-red-500 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> V_L</span>
                  <span className="text-purple-500 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-500"></div> V_C</span>
                </>
              )}
            </div>
            
            <canvas 
              ref={canvasRef} 
              width={900} 
              height={450} 
              className="w-full h-auto block"
            />
          </div>

          {/* Math Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Impedance (Z)" value={`${Z.toFixed(1)} Ω`} color="text-slate-200" />
            <StatCard label="Phase Angle (φ)" value={`${((phi * 180) / Math.PI).toFixed(1)}°`} color="text-slate-200" subtitle={getPhaseText(phi)} />
            <StatCard label="Peak Current (I_m)" value={`${Im.toFixed(2)} A`} color="text-yellow-500" />
            <StatCard label="Avg Power (P)" value={`${Pavg.toFixed(1)} W`} color="text-slate-200" subtitle={`PF: ${Math.cos(phi).toFixed(3)}`} />
            
            {mode === 'LCR' && (
              <>
                <StatCard label="Inductive (X_L)" value={`${XL.toFixed(1)} Ω`} color="text-red-400" />
                <StatCard label="Capacitive (X_C)" value={`${XC.toFixed(1)} Ω`} color="text-purple-400" />
                <StatCard label="Resonant Freq (f_0)" value={`${f_res.toFixed(1)} Hz`} color={Math.abs(f - f_res) < 2 ? 'text-green-400 animate-pulse' : 'text-slate-400'} subtitle={Math.abs(f - f_res) < 2 ? "Resonance!" : ""} />
              </>
            )}
          </div>
          
          {/* Info Block */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 flex gap-4 items-start">
            <Info className="text-cyan-400 shrink-0 mt-1" />
            <div className="text-sm text-slate-300">
              <p className="mb-2"><strong>Static Phasors & Circuits:</strong> This view perfectly mimics textbook diagrams (like NCERT Fig 7.10) where the Source Voltage ($V$) is locked at an arbitrary snapshot angle (30° here) to clearly visualize the static Lead/Lag angle ($\phi$) of the Current ($I$) and individual component voltages.</p>
              {mode === 'LCR' ? (
                <p>In <strong>Series LCR</strong> mode, look at the Circuit Diagram on the right. Because R, L, and C are in series, the same current flows through all of them. Notice the head-to-tail vector addition on the left: <span className="text-green-400 font-bold">V_R</span> (in-phase with I), <span className="text-red-400 font-bold">V_L</span> (leads I by 90°), and <span className="text-purple-400 font-bold">V_C</span> (lags I by 90°) perfectly sum up to equal the total Source Voltage <span className="text-cyan-400 font-bold">V</span>!</p>
              ) : (
                <p>Switch between the modes to see how the single component changes the entire circuit and instantly flips the Current vector $90^\circ$ ahead or behind the voltage.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Sub-components
function StatCard({ label, value, color, subtitle = "" }) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg flex flex-col justify-center">
      <span className="text-xs text-slate-400 font-semibold mb-1 uppercase tracking-wider">{label}</span>
      <span className={`text-2xl font-mono font-bold ${color}`}>{value}</span>
      {subtitle && <span className="text-xs text-slate-500 mt-1">{subtitle}</span>}
    </div>
  );
}

function getPhaseText(phi) {
  if (Math.abs(phi) < 0.05) return "V & I in phase";
  if (phi > 0) return "V leads I (Inductive)";
  return "I leads V (Capacitive)";
}