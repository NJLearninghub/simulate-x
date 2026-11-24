import React, { useState, useEffect, useRef } from 'react';

// ==========================================
// CUSTOM EMBEDDED INLINE SVG ICONS (CRASH-PROOF)
// ==========================================
const PlayIcon = ({ className = "h-4 w-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = ({ className = "h-4 w-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);

const RotateCcwIcon = ({ className = "h-4 w-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

const ShieldIcon = ({ className = "h-4 w-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const ActivityIcon = ({ className = "h-4 w-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const LayersIcon = ({ className = "h-4 w-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

const SlidersIcon = ({ className = "h-4 w-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" />
    <line x1="9" y1="8" x2="15" y2="8" />
    <line x1="17" y1="16" x2="23" y2="16" />
  </svg>
);

const ZapIcon = ({ className = "h-4 w-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const InfoIcon = ({ className = "h-4 w-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================
const ELEMENT_PRESETS = {
  ALPHA: {
    name: "Uranium-238",
    symbol: "U",
    parentA: 238,
    parentZ: 92,
    daughterA: 234,
    daughterZ: 90,
    daughterSymbol: "Th",
    daughterName: "Thorium-234",
    decayType: "alpha",
    halfLifeText: "4.468 Billion Years",
    decayConstant: 0.05, 
    qValue: "4.27 MeV",
    modeDescription: "Alpha decay occurs in very heavy nuclei. The strong nuclear force cannot overcome the electrostatic repulsion between protons, causing the nucleus to eject a highly stable Helium-4 nucleus (Alpha particle) to increase stability."
  },
  BETA_MINUS: {
    name: "Carbon-14",
    symbol: "C",
    parentA: 14,
    parentZ: 6,
    daughterA: 14,
    daughterZ: 7,
    daughterSymbol: "N",
    daughterName: "Nitrogen-14",
    decayType: "beta_minus",
    halfLifeText: "5,730 Years",
    decayConstant: 0.07,
    qValue: "0.156 MeV",
    modeDescription: "In neutron-rich nuclei, the weak nuclear force converts a neutron into a proton. This process emits a high-energy electron (Beta-minus particle) and an electron antineutrino to conserve lepton number and spin."
  },
  BETA_PLUS: {
    name: "Carbon-11",
    symbol: "C",
    parentA: 11,
    parentZ: 6,
    daughterA: 11,
    daughterZ: 5,
    daughterSymbol: "B",
    daughterName: "Boron-11",
    decayType: "beta_plus",
    halfLifeText: "20.3 Minutes",
    decayConstant: 0.09,
    qValue: "0.96 MeV",
    modeDescription: "In proton-rich nuclei, a proton is converted into a neutron by the weak interaction, ejecting a positron (Beta-plus particle / antimatter electron) and an electron neutrino. Positrons rapidly annihilate upon meeting standard matter."
  },
  GAMMA: {
    name: "Cobalt-60m",
    symbol: "Co",
    parentA: 60,
    parentZ: 27,
    daughterA: 60,
    daughterZ: 27,
    daughterSymbol: "Co",
    daughterName: "Cobalt-60 (Ground)",
    decayType: "gamma",
    halfLifeText: "10.5 Minutes",
    decayConstant: 0.12,
    qValue: "1.33 MeV",
    modeDescription: "Gamma decay occurs when a nucleus is left in an excited, metastable nuclear state (often following a previous alpha or beta decay). The nucleons rearrange into a lower energy ground state, ejecting an extremely energetic electromagnetic photon (Gamma-ray)."
  }
};

// Safe component for rendering isotopes without triggering JSX compilation errors
const IsotopeSymbol = ({ mass, atomic, symbol, color = "text-slate-100", size = "text-lg" }) => (
  <span className="inline-flex items-center mx-1 font-mono">
    <span className="flex flex-col text-[10px] leading-none text-right mr-1 justify-center font-bold text-slate-400 select-none">
      <span className="text-teal-400">{mass}</span>
      <span className="text-indigo-400">{atomic}</span>
    </span>
    <span className={`${size} font-black ${color}`}>{symbol}</span>
  </span>
);

export default function App() {
  const [decayMode, setDecayMode] = useState("ALPHA"); 
  const [isPlaying, setIsPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [chamberFieldType, setChamberFieldType] = useState("magnetic"); 
  const [fieldStrength, setFieldStrength] = useState(4); 
  const [activeTab, setActiveTab] = useState("sim"); 
  
  // Single Nucleus Canvas states
  const [decayTriggered, setDecayTriggered] = useState(false);
  const [isDecayed, setIsDecayed] = useState(false);
  const [decayAnimationProgress, setDecayAnimationProgress] = useState(0);
  
  // Unified Stochastic Bulk state to prevent racing render crashes
  const [bulkState, setBulkState] = useState({
    atoms: [],
    time: 0,
    history: [],
    isRunning: false
  });

  // References for HTML5 Canvas loops
  const mainCanvasRef = useRef(null);
  const chamberCanvasRef = useRef(null);
  const particlesRef = useRef([]); 
  const emittedParticlesRef = useRef([]); 
  const animationFrameRef = useRef(null);
  const chamberAnimationFrameRef = useRef(null);
  
  const currentPreset = ELEMENT_PRESETS[decayMode];

  // Initialize parent cluster configuration
  const initializeNucleus = () => {
    const preset = ELEMENT_PRESETS[decayMode];
    const totalA = preset.parentA;
    const totalZ = preset.parentZ;

    const nucleons = [];
    const displayCount = Math.min(totalA, 90); 
    const protonRatio = totalZ / totalA;

    for (let i = 0; i < displayCount; i++) {
      const isProton = Math.random() < protonRatio;
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.sqrt(Math.random()) * 35; 
      nucleons.push({
        id: i,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        isProton,
        originalColor: isProton ? '#ef4444' : '#64748b', 
        color: isProton ? '#ef4444' : '#64748b',
        radius: isProton ? 5.2 : 5.8, 
        pulsePhase: Math.random() * Math.PI * 2,
        isHighlight: false
      });
    }
    particlesRef.current = nucleons;
    emittedParticlesRef.current = [];
    setDecayTriggered(false);
    setIsDecayed(false);
    setDecayAnimationProgress(0);
  };

  // Initialize bulk stochastic list
  const initializeBulkSim = () => {
    const atoms = Array.from({ length: 100 }, (_, idx) => ({
      id: idx,
      decayed: false,
      decayTime: null,
      x: (idx % 10) * 32 + 20,
      y: Math.floor(idx / 10) * 32 + 20,
    }));
    setBulkState({
      atoms,
      time: 0,
      history: [{ time: 0, active: 100, decayed: 0 }],
      isRunning: false
    });
  };

  // Execution step of statistical decays
  const runBulkStep = () => {
    setBulkState(prev => {
      if (!prev.isRunning) return prev;

      const nextTime = prev.time + 1;
      let activeCount = 0;
      let decayedCount = 0;

      const nextAtoms = prev.atoms.map(atom => {
        if (atom.decayed) {
          decayedCount++;
          return atom;
        }
        const roll = Math.random();
        if (roll < currentPreset.decayConstant * simulationSpeed) {
          decayedCount++;
          return { ...atom, decayed: true, decayTime: nextTime };
        }
        activeCount++;
        return atom;
      });

      const nextHistory = [
        ...prev.history,
        { time: nextTime, active: activeCount, decayed: decayedCount }
      ];

      return {
        atoms: nextAtoms,
        time: nextTime,
        history: nextHistory,
        isRunning: activeCount > 0
      };
    });
  };

  // Safe Bulk Simulation tick interval
  useEffect(() => {
    let interval = null;
    if (bulkState.isRunning) {
      interval = setInterval(() => {
        runBulkStep();
      }, 300 / simulationSpeed);
    }
    return () => clearInterval(interval);
  }, [bulkState.isRunning, simulationSpeed, decayMode]);

  // Initial load
  useEffect(() => {
    initializeNucleus();
    initializeBulkSim();
  }, [decayMode]);

  // Trigger single decay animations
  const handleTriggerDecay = () => {
    if (decayTriggered || isDecayed) return;
    setDecayTriggered(true);

    const nucleons = [...particlesRef.current];
    if (decayMode === "ALPHA") {
      let pFound = 0, nFound = 0;
      nucleons.forEach(n => {
        const dist = Math.hypot(n.x, n.y);
        if (dist > 18) {
          if (n.isProton && pFound < 2) {
            n.isHighlight = true;
            n.color = '#fbbf24'; 
            pFound++;
          } else if (!n.isProton && nFound < 2) {
            n.isHighlight = true;
            n.color = '#fbbf24';
            nFound++;
          }
        }
      });
    } else if (decayMode === "BETA_MINUS") {
      const neutron = nucleons.find(n => !n.isProton);
      if (neutron) {
        neutron.isHighlight = true;
        neutron.color = '#38bdf8'; 
      }
    } else if (decayMode === "BETA_PLUS") {
      const proton = nucleons.find(n => n.isProton);
      if (proton) {
        proton.isHighlight = true;
        proton.color = '#ec4899'; 
      }
    } else if (decayMode === "GAMMA") {
      nucleons.slice(0, 15).forEach(n => {
        n.isHighlight = true;
        n.color = '#a855f7'; 
      });
    }
    particlesRef.current = nucleons;
  };

  // Render loop 1: Single Nucleus Canvas
  useEffect(() => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const handleResize = () => {
      const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
      const parentWidth = canvas.parentElement && canvas.parentElement.clientWidth > 0 
        ? canvas.parentElement.clientWidth 
        : 600;
      canvas.width = parentWidth * dpr;
      canvas.height = 240 * dpr;
      ctx.scale(dpr, dpr);
    };
    handleResize();
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
    }

    const animate = () => {
      if (!isPlaying) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
      const logicalWidth = canvas.width / dpr;
      const logicalHeight = canvas.height / dpr;

      ctx.clearRect(0, 0, logicalWidth, logicalHeight);
      const cx = logicalWidth / 2;
      const cy = logicalHeight / 2;

      // Particle physics inside Nucleus Cluster
      const nucleons = particlesRef.current;
      const kAttract = 0.08; 
      const kRepel = 12.0;   
      const shakeAmp = isDecayed ? 0.3 : (decayTriggered ? 2.5 : 0.8); 

      for (let i = 0; i < nucleons.length; i++) {
        const n1 = nucleons[i];
        let fx = -kAttract * n1.x; 
        let fy = -kAttract * n1.y;

        for (let j = 0; j < nucleons.length; j++) {
          if (i === j) continue;
          const n2 = nucleons[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.hypot(dx, dy) || 0.1;
          
          if (dist < 16) {
            const force = kRepel / (dist * dist);
            fx -= (dx / dist) * force;
            fy -= (dy / dist) * force;
          }
        }

        n1.vx += fx * 0.1 + (Math.random() - 0.5) * shakeAmp;
        n1.vy += fy * 0.1 + (Math.random() - 0.5) * shakeAmp;
        
        // Failsafe bounds check to prevent physics explosions
        const speed = Math.hypot(n1.vx, n1.vy);
        if (speed > 15) {
          n1.vx = (n1.vx / speed) * 15;
          n1.vy = (n1.vy / speed) * 15;
        }

        n1.vx *= 0.85;
        n1.vy *= 0.85;
        n1.x += n1.vx;
        n1.y += n1.vy;
      }

      // Draw background charge glow
      ctx.save();
      ctx.beginPath();
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 55);
      grad.addColorStop(0, 'rgba(99, 102, 241, 0.08)');
      grad.addColorStop(1, 'rgba(99, 102, 241, 0)');
      ctx.fillStyle = grad;
      ctx.arc(cx, cy, 55, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Outer boundary line
      ctx.save();
      ctx.strokeStyle = decayTriggered && !isDecayed ? 'rgba(239, 68, 68, 0.4)' : 'rgba(99, 102, 241, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(cx, cy, 45, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Core mutation & emission launch handler
      if (decayTriggered && !isDecayed) {
        setDecayAnimationProgress(prev => {
          // Slowed down decay phase speed by 0.25x (0.02 to 0.005)
          const next = prev + 0.005 * simulationSpeed;
          if (next >= 1) {
            setIsDecayed(true);
            
            particlesRef.current.forEach(n => {
              n.vx -= decayMode === "ALPHA" ? 1.25 : 0.4;
              n.vy += (Math.random() - 0.5) * 1.5;
            });

            if (decayMode === "ALPHA") {
              const currentLength = particlesRef.current.length;
              particlesRef.current = particlesRef.current.slice(currentLength > 8 ? 4 : 1);
              emittedParticlesRef.current.push({
                type: 'alpha',
                x: cx + 10, y: cy,
                // Reduced particle launch velocities for slower visual processing
                vx: 2.5, vy: -0.25,
                radius: 12,
                label: 'α (Helium Nucleus)'
              });
            } else if (decayMode === "BETA_MINUS") {
              const neutronIndex = particlesRef.current.findIndex(n => !n.isProton);
              if (neutronIndex !== -1) {
                particlesRef.current[neutronIndex].isProton = true;
                particlesRef.current[neutronIndex].color = '#ef4444';
                particlesRef.current[neutronIndex].radius = 5.2;
                particlesRef.current[neutronIndex].isHighlight = false;
              }
              emittedParticlesRef.current.push({
                type: 'beta_minus',
                x: cx + 10, y: cy,
                vx: 4, vy: -0.4,
                radius: 4,
                label: 'β⁻ (Electron)'
              });
              emittedParticlesRef.current.push({
                type: 'antineutrino',
                x: cx + 5, y: cy + 5,
                vx: 4.5, vy: 0.6,
                radius: 2,
                label: 'ν̄ₑ (Antineutrino)'
              });
            } else if (decayMode === "BETA_PLUS") {
              const protonIndex = particlesRef.current.findIndex(n => n.isProton);
              if (protonIndex !== -1) {
                particlesRef.current[protonIndex].isProton = false;
                particlesRef.current[protonIndex].color = '#64748b';
                particlesRef.current[protonIndex].radius = 5.8;
                particlesRef.current[protonIndex].isHighlight = false;
              }
              emittedParticlesRef.current.push({
                type: 'beta_plus',
                x: cx + 10, y: cy,
                vx: 4, vy: -0.4,
                radius: 4,
                label: 'β⁺ (Positron)'
              });
              emittedParticlesRef.current.push({
                type: 'neutrino',
                x: cx + 5, y: cy - 5,
                vx: 4.5, vy: -0.7,
                radius: 2,
                label: 'νₑ (Neutrino)'
              });
            } else if (decayMode === "GAMMA") {
              particlesRef.current.forEach(n => {
                n.color = n.isProton ? '#ef4444' : '#64748b';
                n.isHighlight = false;
              });
              emittedParticlesRef.current.push({
                type: 'gamma',
                x: cx + 10, y: cy,
                vx: 5, vy: 0,
                radius: 8,
                wavePhase: 0,
                label: 'γ (Gamma Ray)'
              });
            }
            return 1;
          }
          return next;
        });
      }

      // Draw Nucleons in Cluster
      nucleons.forEach(n => {
        ctx.save();
        ctx.beginPath();
        
        const radGrad = ctx.createRadialGradient(
          cx + n.x - n.radius * 0.2,
          cy + n.y - n.radius * 0.2,
          1,
          cx + n.x,
          cy + n.y,
          n.radius
        );

        if (n.isHighlight) {
          radGrad.addColorStop(0, '#ffffff');
          radGrad.addColorStop(0.3, n.color);
          radGrad.addColorStop(1, '#0f172a');
          ctx.shadowBlur = 12;
          ctx.shadowColor = n.color;
        } else {
          radGrad.addColorStop(0, n.isProton ? '#fca5a5' : '#94a3b8');
          radGrad.addColorStop(0.4, n.color);
          radGrad.addColorStop(1, '#0f172a');
        }

        ctx.fillStyle = radGrad;
        ctx.arc(cx + n.x, cy + n.y, n.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Update and Draw Ejected Radiation
      const activeEmissions = [];
      emittedParticlesRef.current.forEach(ep => {
        ep.x += ep.vx * simulationSpeed;
        ep.y += ep.vy * simulationSpeed;

        if (ep.x < logicalWidth + 80 && ep.x > -80 && ep.y < logicalHeight + 80 && ep.y > -80) {
          activeEmissions.push(ep);
          ctx.save();
          
          if (ep.type === 'alpha') {
            const offsets = [
              {dx: -5, dy: -3, p: true}, {dx: 5, dy: -3, p: false},
              {dx: 0, dy: 5, p: true}, {dx: -2, dy: 1, p: false}
            ];
            offsets.forEach(offset => {
              const alphaGrad = ctx.createRadialGradient(
                ep.x + offset.dx - 2, ep.y + offset.dy - 2, 1,
                ep.x + offset.dx, ep.y + offset.dy, 5
              );
              alphaGrad.addColorStop(0, offset.p ? '#fca5a5' : '#94a3b8');
              alphaGrad.addColorStop(0.5, offset.p ? '#ef4444' : '#64748b');
              alphaGrad.addColorStop(1, '#000000');
              ctx.beginPath();
              ctx.arc(ep.x + offset.dx, ep.y + offset.dy, 5, 0, Math.PI * 2);
              ctx.fillStyle = alphaGrad;
              ctx.fill();
            });
            ctx.fillStyle = '#f8fafc';
            ctx.font = '10px monospace';
            ctx.fillText(ep.label, ep.x - 40, ep.y - 14);

          } else if (ep.type === 'beta_minus' || ep.type === 'beta_plus') {
            ctx.shadowBlur = 10;
            ctx.shadowColor = ep.type === 'beta_minus' ? '#38bdf8' : '#ec4899';
            ctx.fillStyle = ep.type === 'beta_minus' ? '#38bdf8' : '#ec4899';
            ctx.beginPath();
            ctx.arc(ep.x, ep.y, ep.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#f8fafc';
            ctx.font = '10px monospace';
            ctx.fillText(ep.label, ep.x - 30, ep.y - 10);

          } else if (ep.type === 'neutrino' || ep.type === 'antineutrino') {
            ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 4]);
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(ep.x, ep.y);
            ctx.stroke();

            ctx.fillStyle = 'rgba(251, 191, 36, 0.9)';
            ctx.beginPath();
            ctx.arc(ep.x, ep.y, ep.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#94a3b8';
            ctx.font = '9px monospace';
            ctx.fillText(ep.label, ep.x - 20, ep.y + 12);

          } else if (ep.type === 'gamma') {
            ctx.strokeStyle = '#a855f7';
            ctx.lineWidth = 2.5;
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#a855f7';
            ctx.beginPath();
            ep.wavePhase += 0.4 * simulationSpeed;
            for (let wx = -25; wx < 25; wx++) {
              const wy = Math.sin((wx + ep.x) * 0.4 - ep.wavePhase) * 10 * Math.exp(-(wx*wx)/200);
              if (wx === -25) ctx.moveTo(ep.x + wx, ep.y + wy);
              else ctx.lineTo(ep.x + wx, ep.y + wy);
            }
            ctx.stroke();
            ctx.fillStyle = '#f8fafc';
            ctx.font = '10px monospace';
            ctx.fillText(ep.label, ep.x - 35, ep.y - 16);
          }
          ctx.restore();
        }
      });
      emittedParticlesRef.current = activeEmissions;

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, [decayMode, isPlaying, decayTriggered, isDecayed, simulationSpeed]);

  // Render loop 2: Deflection Chamber
  useEffect(() => {
    const canvas = chamberCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
      const parentWidth = canvas.parentElement && canvas.parentElement.clientWidth > 0 
        ? canvas.parentElement.clientWidth 
        : 600;
      canvas.width = parentWidth * dpr;
      canvas.height = 180 * dpr;
      ctx.scale(dpr, dpr);
    };
    handleResize();
    
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
    }

    let chamberParticles = [];
    let particleSpawnTimer = 0;

    const animateChamber = () => {
      if (!isPlaying) {
        chamberAnimationFrameRef.current = requestAnimationFrame(animateChamber);
        return;
      }

      const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      ctx.clearRect(0, 0, w, h);

      // Render Field Vectors/Plates
      ctx.save();
      if (chamberFieldType === "magnetic") {
        ctx.fillStyle = 'rgba(99, 102, 241, 0.04)';
        ctx.fillRect(0, 0, w, h);
        
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
        ctx.lineWidth = 1;
        for (let x = 40; x < w; x += 60) {
          for (let y = 30; y < h; y += 40) {
            ctx.beginPath();
            ctx.moveTo(x - 4, y - 4); ctx.lineTo(x + 4, y + 4);
            ctx.moveTo(x + 4, y - 4); ctx.lineTo(x - 4, y + 4);
            ctx.stroke();
          }
        }
        ctx.fillStyle = 'rgba(99, 102, 241, 0.4)';
        ctx.font = '10px monospace';
        ctx.fillText(`Magnetic Field B (Into Page, Strength: ${fieldStrength})`, 10, 20);

      } else if (chamberFieldType === "electric") {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.1)'; 
        ctx.fillRect(0, 0, w, 15);
        ctx.fillStyle = 'rgba(59, 130, 246, 0.1)'; 
        ctx.fillRect(0, h - 15, w, 15);

        ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
        ctx.lineWidth = 1.5;
        for (let x = 30; x < w; x += 50) {
          ctx.beginPath();
          ctx.moveTo(x, 25);
          ctx.lineTo(x, h - 25);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x - 3, h - 29);
          ctx.lineTo(x, h - 24);
          ctx.lineTo(x + 3, h - 29);
          ctx.stroke();
        }
        ctx.fillStyle = 'rgba(239, 68, 68, 0.6)';
        ctx.font = '9px monospace';
        ctx.fillText("Positive Anode (+)", 10, 11);
        ctx.fillStyle = 'rgba(59, 130, 246, 0.6)';
        ctx.fillText("Negative Cathode (-)", 10, h - 5);
      } else {
        ctx.fillStyle = 'rgba(148, 163, 184, 0.02)';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(148, 163, 184, 0.3)';
        ctx.font = '10px monospace';
        ctx.fillText("No External Fields Applied (Vacuum Chamber)", 10, 20);
      }
      ctx.restore();

      // Spawn streams
      particleSpawnTimer += 1 * simulationSpeed;
      if (particleSpawnTimer > 35) {
        particleSpawnTimer = 0;
        chamberParticles.push({
          type: 'alpha',
          x: 0, y: h / 2,
          vx: 3, vy: 0,
          color: '#f87171',
          charge: 2,
          mass: 4,
          trail: []
        });
        chamberParticles.push({
          type: 'beta_minus',
          x: 0, y: h / 2,
          vx: 5, vy: 0,
          color: '#38bdf8',
          charge: -1,
          mass: 0.0005,
          trail: []
        });
        chamberParticles.push({
          type: 'beta_plus',
          x: 0, y: h / 2,
          vx: 5, vy: 0,
          color: '#ec4899',
          charge: 1,
          mass: 0.0005,
          trail: []
        });
        chamberParticles.push({
          type: 'gamma',
          x: 0, y: h / 2,
          vx: 4.5, vy: 0,
          color: '#c084fc',
          charge: 0,
          mass: 0,
          wavePhase: 0,
          trail: []
        });
      }

      // Physics Integration
      const remaining = [];
      chamberParticles.forEach(p => {
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 60) p.trail.shift();

        let ay = 0;
        let ax = 0;

        if (chamberFieldType === "magnetic") {
          const B = fieldStrength * 0.012;
          const forceY = -p.charge * p.vx * B;
          const forceX = p.charge * p.vy * B;
          ay = forceY / (p.mass || 0.1);
          ax = forceX / (p.mass || 0.1);
        } else if (chamberFieldType === "electric") {
          const E = fieldStrength * 0.15;
          const forceY = p.charge * E;
          ay = forceY / (p.mass || 0.1);
        }

        p.vx += ax * simulationSpeed;
        p.vy += ay * simulationSpeed;
        
        const speed = Math.hypot(p.vx, p.vy);
        if (speed > 12) {
          p.vx = (p.vx / speed) * 12;
          p.vy = (p.vy / speed) * 12;
        }

        p.x += p.vx * simulationSpeed;
        p.y += p.vy * simulationSpeed;

        if (p.x >= 0 && p.x <= w && p.y >= 0 && p.y <= h) {
          remaining.push(p);

          ctx.save();
          ctx.beginPath();
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = 0.35;
          ctx.lineWidth = p.type === 'alpha' ? 3 : 1.5;
          p.trail.forEach((t, idx) => {
            if (idx === 0) ctx.moveTo(t.x, t.y);
            else ctx.lineTo(t.x, t.y);
          });
          ctx.stroke();
          ctx.restore();

          ctx.save();
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.color;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          if (p.type === 'gamma') {
            p.wavePhase += 0.5;
            ctx.arc(p.x, p.y + Math.sin(p.wavePhase) * 3, 2.5, 0, Math.PI * 2);
          } else {
            ctx.arc(p.x, p.y, p.type === 'alpha' ? 5 : 3, 0, Math.PI * 2);
          }
          ctx.fill();
          ctx.restore();
        }
      });
      chamberParticles = remaining;

      chamberAnimationFrameRef.current = requestAnimationFrame(animateChamber);
    };

    chamberAnimationFrameRef.current = requestAnimationFrame(animateChamber);
    return () => {
      cancelAnimationFrame(chamberAnimationFrameRef.current);
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, [chamberFieldType, fieldStrength, isPlaying, simulationSpeed]);

  return (
    <div className="flex flex-col lg:flex-row min-h-[36rem] bg-slate-950 text-slate-100 font-sans">
      
      {/* SIDEBAR PANEL */}
      <div className="w-full lg:w-[420px] shrink-0 border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between max-h-screen overflow-y-auto">
        <div className="space-y-6">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
              <ZapIcon className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white">Radioactive Decay</h1>
              <p className="text-xs text-slate-400">Ionizing Radiation & Decay Engines</p>
            </div>
          </div>

          {/* DECAY SELECTOR */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center">
              <SlidersIcon className="h-3.5 w-3.5 mr-1.5 text-indigo-400" /> Select Decay Mechanism
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setDecayMode("ALPHA")}
                className={`py-2 px-3 rounded-lg border text-left transition-all ${
                  decayMode === "ALPHA" 
                    ? "bg-red-500/10 border-red-500 text-red-200" 
                    : "bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <div className="font-bold text-sm">Alpha Decay (α)</div>
                <div className="text-[10px] text-slate-400 font-mono">He emission</div>
              </button>
              <button
                onClick={() => setDecayMode("BETA_MINUS")}
                className={`py-2 px-3 rounded-lg border text-left transition-all ${
                  decayMode === "BETA_MINUS" 
                    ? "bg-sky-500/10 border-sky-500 text-sky-200" 
                    : "bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <div className="font-bold text-sm">Beta-Minus (β⁻)</div>
                <div className="text-[10px] text-slate-400 font-mono">Electron emission</div>
              </button>
              <button
                onClick={() => setDecayMode("BETA_PLUS")}
                className={`py-2 px-3 rounded-lg border text-left transition-all ${
                  decayMode === "BETA_PLUS" 
                    ? "bg-pink-500/10 border-pink-500 text-pink-200" 
                    : "bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <div className="font-bold text-sm">Beta-Plus (β⁺)</div>
                <div className="text-[10px] text-slate-400 font-mono">Positron emission</div>
              </button>
              <button
                onClick={() => setDecayMode("GAMMA")}
                className={`py-2 px-3 rounded-lg border text-left transition-all ${
                  decayMode === "GAMMA" 
                    ? "bg-purple-500/10 border-purple-500 text-purple-200" 
                    : "bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <div className="font-bold text-sm">Gamma Decay (γ)</div>
                <div className="text-[10px] text-slate-400 font-mono">Photon emission</div>
              </button>
            </div>
          </div>

          {/* PHYSICAL SUMMARY */}
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2.5">
            <h3 className="text-sm font-bold text-slate-200 flex items-center">
              <InfoIcon className="h-4 w-4 mr-1.5 text-indigo-400" /> Physical Breakdown
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {currentPreset.modeDescription}
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/60 text-[11px]">
              <div>
                <span className="text-slate-500 block">Typical Half-life</span>
                <span className="font-bold text-slate-300">{currentPreset.halfLifeText}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Energy (Q-Value)</span>
                <span className="font-bold text-teal-400">{currentPreset.qValue}</span>
              </div>
            </div>
          </div>

          {/* EQUATION CALCULATIONS */}
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-slate-200 flex items-center">
              <ShieldIcon className="h-4 w-4 mr-1.5 text-emerald-400" /> Conservation of Mass-Energy
            </h3>
            
            <div className="flex flex-col items-center justify-center p-3 bg-slate-900/80 rounded-lg border border-slate-800/50 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Dynamic Transition Equation</span>
              <div className="flex items-center text-sm font-mono text-slate-200 py-1">
                <IsotopeSymbol mass={currentPreset.parentA} atomic={currentPreset.parentZ} symbol={currentPreset.symbol} />
                <span className="mx-2 text-indigo-400 font-bold">➔</span>
                <IsotopeSymbol mass={currentPreset.daughterA} atomic={currentPreset.daughterZ} symbol={currentPreset.daughterSymbol} color="text-teal-300" />
                <span className="mx-1 text-slate-400 font-bold">+</span>
                
                {decayMode === "ALPHA" && (
                  <IsotopeSymbol mass="4" atomic="2" symbol="He" color="text-red-400" />
                )}
                {decayMode === "BETA_MINUS" && (
                  <span className="inline-flex flex-col items-center mx-1">
                    <span className="flex flex-col text-[10px] leading-none text-right font-bold text-sky-400 select-none">
                      <span>0</span>
                      <span>-1</span>
                    </span>
                    <span className="text-md font-bold text-sky-400">e⁻</span>
                  </span>
                )}
                {decayMode === "BETA_PLUS" && (
                  <span className="inline-flex flex-col items-center mx-1">
                    <span className="flex flex-col text-[10px] leading-none text-right font-bold text-pink-400 select-none">
                      <span>0</span>
                      <span>+1</span>
                    </span>
                    <span className="text-md font-bold text-pink-400">e⁺</span>
                  </span>
                )}
                {decayMode === "GAMMA" && (
                  <span className="text-md font-bold text-purple-400 mx-1">γ</span>
                )}

                {decayMode === "BETA_MINUS" && (
                  <>
                    <span className="mx-1 text-slate-400 font-bold">+</span>
                    <span className="font-bold text-yellow-400 text-sm">ν̄ₑ</span>
                  </>
                )}
                {decayMode === "BETA_PLUS" && (
                  <>
                    <span className="mx-1 text-slate-400 font-bold">+</span>
                    <span className="font-bold text-yellow-400 text-sm">νₑ</span>
                  </>
                )}

                <span className="mx-1.5 text-slate-400 font-bold">+</span>
                <span className="text-emerald-400 font-black">Q</span>
              </div>
            </div>

            <div className="space-y-1.5 text-[11px] text-slate-400">
              <div className="flex justify-between">
                <span>Mass Conservation Check:</span>
                <span className="font-mono text-slate-200">
                  {currentPreset.parentA} = {currentPreset.daughterA} + {decayMode === "ALPHA" ? "4" : "0"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Atomic Charge Conservation:</span>
                <span className="font-mono text-slate-200">
                  Z({currentPreset.parentZ}) = Z({currentPreset.daughterZ}) + ({decayMode === "ALPHA" ? "+2" : (decayMode === "BETA_MINUS" ? "-1" : (decayMode === "BETA_PLUS" ? "+1" : "0"))})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* TIME SPEED CONTROLS */}
        <div className="pt-4 border-t border-slate-800 space-y-3 mt-6 lg:mt-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Master Playback</span>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
              >
                {isPlaying ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
              </button>
              <button
                onClick={() => {
                  initializeNucleus();
                  initializeBulkSim();
                }}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
              >
                <RotateCcwIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Time Scale Speed:</span>
              <span className="font-mono font-bold text-indigo-400">{simulationSpeed}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.5"
              value={simulationSpeed}
              onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* CORE CANVAS WORKSPACE */}
      <div className="flex-1 p-4 lg:p-6 flex flex-col space-y-6 max-h-screen overflow-y-auto">
        
        {/* TABS */}
        <div className="flex border-b border-slate-800">
          <button
            onClick={() => setActiveTab("sim")}
            className={`py-2.5 px-4 font-bold text-sm border-b-2 transition-all ${
              activeTab === "sim" 
                ? "border-indigo-500 text-white" 
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Single Nucleus Sandbox
          </button>
          <button
            onClick={() => setActiveTab("bulk")}
            className={`py-2.5 px-4 font-bold text-sm border-b-2 transition-all ${
              activeTab === "bulk" 
                ? "border-indigo-500 text-white" 
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Bulk Half-Life Grid
          </button>
          <button
            onClick={() => setActiveTab("quark")}
            className={`py-2.5 px-4 font-bold text-sm border-b-2 transition-all ${
              activeTab === "quark" 
                ? "border-indigo-500 text-white" 
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Quark Scale Interaction
          </button>
        </div>

        {/* TAB 1: SINGLE ATOM DECAY */}
        {activeTab === "sim" && (
          <div className="space-y-6">
            
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden relative shadow-2xl">
              <div className="absolute top-4 left-4 z-10 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800/80 flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-mono text-slate-200">
                  Isotope: <span className="font-bold text-indigo-400">{currentPreset.name}</span>
                </span>
              </div>

              <div className="absolute top-4 right-4 z-10 hidden sm:flex items-center space-x-3">
                <div className="flex items-center space-x-1.5 text-xs text-slate-400 bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800/80">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                  <span>Protons (Z={currentPreset.parentZ})</span>
                </div>
                <div className="flex items-center space-x-1.5 text-xs text-slate-400 bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800/80">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block" />
                  <span>Neutrons (N={currentPreset.parentA - currentPreset.parentZ})</span>
                </div>
              </div>

              {/* Nuclear Canvas */}
              <div className="w-full bg-slate-950 flex justify-center items-center h-[240px]">
                <canvas ref={mainCanvasRef} className="w-full h-full block" />
              </div>

              <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-xs text-slate-400 text-center md:text-left">
                  {decayTriggered ? (
                    isDecayed ? (
                      <span className="text-emerald-400 font-bold">Decay complete! Daughter formed: {currentPreset.daughterName}.</span>
                    ) : (
                      <span className="text-amber-400 animate-pulse">Nuclear rearrangement active... quantum tunneling occurring.</span>
                    )
                  ) : (
                    <span>Ready to trigger single-atom decay. Observe nucleon clustering & physical core recoil.</span>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={initializeNucleus}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-sm transition"
                  >
                    Reset Atom
                  </button>
                  <button
                    onClick={handleTriggerDecay}
                    disabled={decayTriggered}
                    className={`px-5 py-2 font-black rounded-lg text-sm tracking-wide shadow-lg transition-all ${
                      decayTriggered 
                        ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                        : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-indigo-500/20"
                    }`}
                  >
                    Trigger Decay
                  </button>
                </div>
              </div>
            </div>

            {/* IONIZATION DEFLECTION CHAMBER */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-md font-bold text-white flex items-center">
                    <ActivityIcon className="h-5 w-5 mr-1.5 text-indigo-400" /> Electromagnetic Field Chamber Deflection
                  </h3>
                  <p className="text-xs text-slate-400">
                    Observe how charge and massive nuclear structure causes distinct curved paths through charged environments.
                  </p>
                </div>

                {/* Field selectors */}
                <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setChamberFieldType("magnetic")}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition ${
                      chamberFieldType === "magnetic" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Magnetic (B)
                  </button>
                  <button
                    onClick={() => setChamberFieldType("electric")}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition ${
                      chamberFieldType === "electric" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Electric (E)
                  </button>
                  <button
                    onClick={() => setChamberFieldType("none")}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition ${
                      chamberFieldType === "none" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    No Fields
                  </button>
                </div>
              </div>

              {/* Deflection Canvas */}
              <div className="w-full bg-slate-950 rounded-xl border border-slate-800 h-[180px] overflow-hidden relative">
                <canvas ref={chamberCanvasRef} className="w-full h-full block" />
              </div>

              {/* Slider controls */}
              {chamberFieldType !== "none" && (
                <div className="flex items-center space-x-4 bg-slate-950 p-4 rounded-xl border border-slate-850">
                  <div className="w-full space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400">Configure Field Intensity:</span>
                      <span className="font-mono text-indigo-400">
                        {fieldStrength > 0 ? `+${fieldStrength}` : fieldStrength} kG/kV
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-10"
                      max="10"
                      step="1"
                      value={fieldStrength}
                      onChange={(e) => setFieldStrength(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* Charge analysis info panels */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-red-500/5 rounded-lg border border-red-500/10">
                  <span className="font-bold text-red-400 block mb-1">Alpha Particles (α)</span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Heavy mass (4 amu), charge +2e. Low velocity, extremely high ionization. Deflects slowly in magnetic and electric fields.
                  </p>
                </div>
                <div className="p-3 bg-sky-500/5 rounded-lg border border-sky-500/10">
                  <span className="font-bold text-sky-400 block mb-1">Beta Particles (β⁻/β⁺)</span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Tiny mass (1/1836 amu), charge ±1e. High speed, high penetration. Deflects sharply in opposite directions.
                  </p>
                </div>
                <div className="p-3 bg-purple-500/5 rounded-lg border border-purple-500/10">
                  <span className="font-bold text-purple-400 block mb-1">Gamma Rays (γ)</span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Massless photons, charge 0. High energy, completely unaffected by electromagnetic fields—moves perfectly straight.
                  </p>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: BULK HALF-LIFE SIMULATION GRID */}
        {activeTab === "bulk" && (
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              
              {/* GRID BOARD */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-md font-bold text-white">Radioactive Bulk Core (100 Atoms)</h3>
                    <p className="text-xs text-slate-400">Click individual grid elements to study single decay chance mechanics.</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setBulkState(prev => ({ ...prev, isRunning: !prev.isRunning }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                        bulkState.isRunning 
                          ? "bg-amber-600 hover:bg-amber-700 text-white" 
                          : "bg-emerald-600 hover:bg-emerald-700 text-white"
                      }`}
                    >
                      {bulkState.isRunning ? <PauseIcon className="h-3 w-3" /> : <PlayIcon className="h-3.5 w-3.5" />}
                      <span>{bulkState.isRunning ? "Pause" : "Start"}</span>
                    </button>
                    <button
                      onClick={initializeBulkSim}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition"
                    >
                      Reset Grid
                    </button>
                  </div>
                </div>

                {/* Stochastic Interactive Grid */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex justify-center">
                  <div className="grid grid-cols-10 gap-2">
                    {bulkState.atoms.map(atom => (
                      <button
                        key={atom.id}
                        onClick={() => {
                          if (bulkState.isRunning) return;
                          setBulkState(prev => {
                            const updated = [...prev.atoms];
                            updated[atom.id] = {
                              ...updated[atom.id],
                              decayed: !updated[atom.id].decayed,
                              decayTime: !updated[atom.id].decayed ? prev.time : null
                            };
                            return { ...prev, atoms: updated };
                          });
                        }}
                        className={`w-7 h-7 rounded-lg font-bold text-[9px] transition-all flex items-center justify-center border ${
                          atom.decayed
                            ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-400 shadow-sm"
                            : "bg-indigo-950/60 border-indigo-500/40 text-indigo-300"
                        }`}
                      >
                        {atom.decayed ? "D" : "P"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dashboard stats */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-850">
                    <span className="text-[10px] text-slate-500 uppercase block">Active Parent (P)</span>
                    <span className="text-lg font-black text-indigo-400">
                      {bulkState.atoms.filter(a => !a.decayed).length}%
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-850">
                    <span className="text-[10px] text-slate-500 uppercase block">Decayed Daughter (D)</span>
                    <span className="text-lg font-black text-emerald-400">
                      {bulkState.atoms.filter(a => a.decayed).length}%
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-850">
                    <span className="text-[10px] text-slate-500 uppercase block">Sim Time Elapsed</span>
                    <span className="text-lg font-mono font-black text-slate-300">{bulkState.time}s</span>
                  </div>
                </div>
              </div>

              {/* LIVE CURVE GRAPH */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div>
                  <h3 className="text-md font-bold text-white flex items-center">
                    <ActivityIcon className="h-5 w-5 mr-1.5 text-indigo-400" /> Exponential Radioactive Decay Curve
                  </h3>
                  <p className="text-xs text-slate-400">
                    The half-life represents the time required for half the radioactive nuclei to decay: N(t) = N₀e^(-λt).
                  </p>
                </div>

                <div className="h-[180px] bg-slate-950 rounded-xl border border-slate-850 relative p-4 flex flex-col justify-between">
                  <div className="w-full h-full relative border-l border-b border-slate-800 flex items-end">
                    
                    {/* Native SVG Layout (Fixed view box for responsive calculations) */}
                    <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                      {/* Theoretical Curve */}
                      <path
                        d={Array.from({ length: 100 }, (_, x) => {
                          const time = (x / 100) * 50;
                          const theoryY = 100 * Math.exp(-currentPreset.decayConstant * time);
                          const canvasX = x; 
                          const canvasY = 100 - theoryY; 
                          return `${x === 0 ? 'M' : 'L'} ${canvasX} ${canvasY}`;
                        }).join(' ')}
                        fill="none"
                        stroke="rgba(99, 102, 241, 0.25)"
                        strokeWidth="1.5"
                        strokeDasharray="1, 1"
                      />

                      {/* Actual Decayed Trail */}
                      {bulkState.history.length > 1 && (
                        <path
                          d={bulkState.history.map((h, idx) => {
                            // Safe upper bound limit calculation without exceeding call stack limits
                            const lastTime = bulkState.history.length > 0 ? bulkState.history[bulkState.history.length - 1].time : 0;
                            const maxTime = Math.max(lastTime, 40);
                            const percentX = (h.time / maxTime) * 100;
                            const percentY = 100 - h.active;
                            return `${idx === 0 ? 'M' : 'L'} ${percentX} ${percentY}`;
                          }).join(' ')}
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="2.5"
                        />
                      )}
                    </svg>

                    <span className="absolute top-2 left-2 text-[10px] text-slate-600 font-bold uppercase">Nuclear Count (N)</span>
                    <span className="absolute bottom-2 right-2 text-[10px] text-slate-600 font-bold uppercase">Time Elapsed (t)</span>
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-500 pt-2 font-mono">
                    <span>t=0</span>
                    <span>t=1/2</span>
                    <span>t=3/4</span>
                    <span>Max limit</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-xs leading-relaxed text-slate-400">
                  <span className="font-bold text-slate-200 block mb-1">Mathematical Physics Connection</span>
                  The smooth dotted line represents the theoretical ideal calculus solution. The solid red line represents our actual stochastically calculated discrete events. As sample size N₀ → ∞, statistical fluctuation disappears to perfectly match theoretical curves.
                </div>

              </div>

            </div>

          </div>
        )}

        {/* TAB 3: SUBATOMIC QUARK LEVEL (WEAK FORCE) */}
        {activeTab === "quark" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center">
                <LayersIcon className="h-5 w-5 mr-1.5 text-indigo-400" /> Subatomic Quark Level Mechanics (Beta Decay)
              </h3>
              <p className="text-xs text-slate-400">
                Beta decay is driven by the weak nuclear force operating through exchange bosons (W⁻ and W⁺). Zoom into the nucleons to observe how fundamental quarks change identity.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* BETA MINUS */}
              <div className="p-5 bg-slate-950 border border-slate-850 rounded-xl space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-sky-500/10 px-3 py-1 rounded-bl-xl border-l border-b border-sky-500/20 text-[10px] font-bold text-sky-400 uppercase">
                  Beta-Minus Transition
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-200">Neutron ➔ Proton Conversion</h4>
                  <p className="text-xs text-slate-400">
                    A down quark (d, Charge -1/3) converts to an up quark (u, Charge +2/3) by emitting a virtual W⁻ boson.
                  </p>
                </div>

                {/* Particle Diagram */}
                <div className="bg-slate-900 p-4 h-[160px] rounded-lg border border-slate-800/80 flex justify-around items-center">
                  
                  {/* Neutron quarks */}
                  <div className="flex flex-col items-center space-y-1">
                    <div className="text-[10px] uppercase font-bold text-slate-500">Neutron (u-d-d)</div>
                    <div className="relative w-20 h-20 bg-slate-950 rounded-full border border-slate-800 flex items-center justify-center">
                      <span className="absolute -top-1 px-1.5 bg-slate-800 text-[8px] rounded text-slate-300">Charge: 0</span>
                      <span className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-[10px] font-black text-white absolute top-3">u</span>
                      <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-[10px] font-black text-white absolute bottom-3 left-3">d</span>
                      <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-[10px] font-black text-white absolute bottom-3 right-3 animate-pulse border-2 border-sky-400">d</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center text-slate-500 text-sm font-bold">
                    <span className="animate-pulse text-sky-400 text-xs">W⁻ Boson</span>
                    <span className="text-xl">➔</span>
                  </div>

                  {/* Proton quarks */}
                  <div className="flex flex-col items-center space-y-1">
                    <div className="text-[10px] uppercase font-bold text-slate-500">Proton (u-u-d)</div>
                    <div className="relative w-20 h-20 bg-red-950/20 rounded-full border border-red-900/30 flex items-center justify-center">
                      <span className="absolute -top-1 px-1.5 bg-red-950 text-[8px] rounded text-red-400">Charge: +1e</span>
                      <span className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-[10px] font-black text-white absolute top-3">u</span>
                      <span className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-[10px] font-black text-white absolute bottom-3 left-3">u</span>
                      <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-[10px] font-black text-white absolute bottom-3 right-3">d</span>
                    </div>
                  </div>

                </div>

                <div className="text-[11px] text-slate-500 font-mono space-y-1">
                  <div>Neutron quark structure: <span className="text-slate-300">d (-1/3) + d (-1/3) + u (+2/3) = 0</span></div>
                  <div>Proton quark structure: <span className="text-slate-300">u (+2/3) + u (+2/3) + d (-1/3) = +1</span></div>
                </div>
              </div>

              {/* BETA PLUS */}
              <div className="p-5 bg-slate-950 border border-slate-850 rounded-xl space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-pink-500/10 px-3 py-1 rounded-bl-xl border-l border-b border-pink-500/20 text-[10px] font-bold text-pink-400 uppercase">
                  Beta-Plus Transition
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-200">Proton ➔ Neutron Conversion</h4>
                  <p className="text-xs text-slate-400">
                    An up quark (u, Charge +2/3) converts to a down quark (d, Charge -1/3) by emitting a virtual W⁺ boson.
                  </p>
                </div>

                {/* Particle Diagram */}
                <div className="bg-slate-900 p-4 h-[160px] rounded-lg border border-slate-800/80 flex justify-around items-center">
                  
                  {/* Proton quarks */}
                  <div className="flex flex-col items-center space-y-1">
                    <div className="text-[10px] uppercase font-bold text-slate-500">Proton (u-u-d)</div>
                    <div className="relative w-20 h-20 bg-red-950/20 rounded-full border border-red-900/30 flex items-center justify-center">
                      <span className="absolute -top-1 px-1.5 bg-red-950 text-[8px] rounded text-red-400">Charge: +1e</span>
                      <span className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-[10px] font-black text-white absolute top-3 animate-pulse border-2 border-pink-400">u</span>
                      <span className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-[10px] font-black text-white absolute bottom-3 left-3">u</span>
                      <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-[10px] font-black text-white absolute bottom-3 right-3">d</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center text-slate-500 text-sm font-bold">
                    <span className="animate-pulse text-pink-400 text-xs">W⁺ Boson</span>
                    <span className="text-xl">➔</span>
                  </div>

                  {/* Neutron quarks */}
                  <div className="flex flex-col items-center space-y-1">
                    <div className="text-[10px] uppercase font-bold text-slate-500">Neutron (u-d-d)</div>
                    <div className="relative w-20 h-20 bg-slate-950 rounded-full border border-slate-800 flex items-center justify-center">
                      <span className="absolute -top-1 px-1.5 bg-slate-800 text-[8px] rounded text-slate-300">Charge: 0</span>
                      <span className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-[10px] font-black text-white absolute top-3">u</span>
                      <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-[10px] font-black text-white absolute bottom-3 left-3">d</span>
                      <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-[10px] font-black text-white absolute bottom-3 right-3">d</span>
                    </div>
                  </div>

                </div>

                <div className="text-[11px] text-slate-500 font-mono space-y-1">
                  <div>Quark charge math: <span className="text-slate-300">Up (+2/3) ➔ Down (-1/3) + Positron (+1) + Neutrino (0)</span></div>
                  <div>This mechanism explains the origin of radioactive positron emission.</div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}