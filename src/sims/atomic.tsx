import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Info, 
  Settings, 
  ShieldAlert, 
  Award, 
  Lightbulb, 
  Radio, 
  Binary, 
  Activity 
} from 'lucide-react';

// Global visual theme configuration
const THEME = {
  bgDark: 'bg-slate-950',
  cardDark: 'bg-slate-900/80 border-slate-800',
};

// Historical atomic models dataset with Native JSX Mathematical Equations
const modelsData = {
  thomson: {
    id: 'thomson',
    name: 'Thomson "Plum Pudding"',
    year: '1904',
    discoverer: 'J.J. Thomson',
    keyDiscovery: 'Discovery of the Electron (1897)',
    equationHTML: (
      <div className="flex flex-col gap-2 font-mono text-xs text-sky-300 bg-slate-950 p-4 rounded-xl border border-slate-800">
        <div className="text-center font-bold text-slate-400 mb-2">Electrostatic Restoring Force</div>
        <div className="flex items-center justify-center gap-2 text-sm">
          <span>F<sub>e</sub>(r) = -k<sub>e</sub></span>
          <div className="flex flex-col items-center">
            <span className="border-b border-sky-400/50 px-1 pb-0.5">e · Q<sub>encl</sub>(r)</span>
            <span className="pt-0.5">r<sup>2</sup></span>
          </div>
          <span>= -</span>
          <span className="text-xl font-light">(</span>
          <div className="flex flex-col items-center">
            <span className="border-b border-sky-400/50 px-1 pb-0.5">e<sup>2</sup></span>
            <span className="pt-0.5">4πε<sub>0</sub>R<sup>3</sup></span>
          </div>
          <span className="text-xl font-light">)</span>
          <span>r</span>
        </div>
        <div className="text-[10px] text-slate-500 mt-2 border-t border-slate-900 pt-2 text-center">
          Where Q<sub>encl</sub>(r) is positive charge enclosed inside radius r, producing simple harmonic oscillations.
        </div>
      </div>
    ),
    description: 'Following his discovery of the cathode ray corpuscle (electron), J.J. Thomson modeled the atom as a uniform cloud of positive charge containing tiny negatively charged corpuscles arranged in stable electrostatic orbits.',
    experiment: 'Cathode Ray Tube experiments: Measured charge-to-mass ratio (e/m) proving electrons are sub-atomic, negatively charged particles.',
    shortcoming: 'Failed to explain large deflection angles observed when alpha particles struck gold foils, as positive charge was too diffused to cause high repulsion.',
  },
  rutherford: {
    id: 'rutherford',
    name: 'Rutherford Nuclear',
    year: '1911',
    discoverer: 'Ernest Rutherford',
    keyDiscovery: 'The Atomic Nucleus',
    equationHTML: (
      <div className="flex flex-col gap-2 font-mono text-xs text-amber-300 bg-slate-950 p-4 rounded-xl border border-slate-800">
        <div className="text-center font-bold text-slate-400 mb-2">Rutherford Scattering Cross-Section</div>
        <div className="flex items-center justify-center gap-2 text-sm">
          <div className="flex flex-col items-center">
            <span className="border-b border-amber-400/50 px-1 pb-0.5">dσ</span>
            <span className="pt-0.5">dΩ</span>
          </div>
          <span>=</span>
          <span className="text-xl font-light">(</span>
          <div className="flex flex-col items-center">
            <span className="border-b border-amber-400/50 px-1 pb-0.5">k<sub>e</sub> z Z e<sup>2</sup></span>
            <span className="pt-0.5">4 E<sub>k</sub></span>
          </div>
          <span className="text-xl font-light">)<sup>2</sup></span>
          <span>·</span>
          <div className="flex flex-col items-center">
            <span className="border-b border-amber-400/50 px-1 pb-0.5">1</span>
            <span className="pt-0.5">sin<sup>4</sup>(θ/2)</span>
          </div>
        </div>
        <div className="text-[10px] text-slate-500 mt-2 border-t border-slate-900 pt-2 text-center">
          Where θ is the scattering angle, Z is nucleus charge, and E<sub>k</sub> is kinetic energy.
        </div>
      </div>
    ),
    description: 'By bombarding thin gold foil with energetic helium nuclei (alpha-particles), Rutherford proved that the atom is mostly empty space with its entire positive charge and mass concentrated in a central, incredibly dense core called the nucleus.',
    experiment: 'The Gold Foil Experiment: Fired 7.7 MeV alpha particles from a radium source at a 4 × 10⁻⁷ m thick foil, tracking deflections via zinc sulfide screen flashes.',
    shortcoming: 'Under classical electromagnetism, an electron accelerating in a circular path must continuously radiate electromagnetic energy and spiral into the nucleus within a fraction of a nanosecond.',
  },
  bohr: {
    id: 'bohr',
    name: 'Bohr Quantized Orbits',
    year: '1913',
    discoverer: 'Niels Bohr',
    keyDiscovery: 'Quantized Angular Momentum & Discrete States',
    equationHTML: (
      <div className="flex flex-col gap-2 font-mono text-xs text-emerald-300 bg-slate-950 p-4 rounded-xl border border-slate-800">
        <div className="text-center font-bold text-slate-400 mb-2">Quantization Postulate & Energy</div>
        <div className="flex flex-col items-center justify-center gap-3 text-sm">
          <div>L = m<sub>e</sub> v r = n(h / 2π)</div>
          <div className="flex items-center gap-2">
            <span>E<sub>n</sub> = −(13.6 eV)</span>
            <span className="text-xl font-light">(</span>
            <div className="flex flex-col items-center">
              <span className="border-b border-emerald-400/50 px-1 pb-0.5">1</span>
              <span className="pt-0.5">n<sup>2</sup></span>
            </div>
            <span className="text-xl font-light">)</span>
            <span>= -</span>
            <div className="flex flex-col items-center">
              <span className="border-b border-emerald-400/50 px-1 pb-0.5">13.6</span>
              <span className="pt-0.5">n<sup>2</sup></span>
            </div>
            <span>eV</span>
          </div>
        </div>
        <div className="text-[10px] text-slate-500 mt-2 border-t border-slate-900 pt-2 text-center">
          Hydrogen. 13.6 eV is the ionisation energy. The Rydberg constant is a different quantity: R = 1.097×10⁷ m⁻¹ in 1/λ = R(1/n₁² − 1/n₂²).
        </div>
      </div>
    ),
    description: 'Bohr resolved Rutherford\'s planetary paradox by postulating that electrons orbit only in specific "stationary states" of quantized angular momentum. Photons are emitted or absorbed only during quantum leaps between states.',
    experiment: 'Hydrogen Emission Spectroscopy: Bohr\'s equations perfectly predicted the spectral wavelengths of the Lyman, Balmer, and Paschen series.',
    shortcoming: 'Failed to predict spectra of multi-electron atoms (even helium), relative intensities of lines, or splitting in magnetic fields (Zeeman effect).',
  },
  quantum: {
    id: 'quantum',
    name: 'Schrödinger Wave Mechanical',
    year: '1926',
    discoverer: 'Schrödinger, Heisenberg & Born',
    keyDiscovery: 'Wave-Particle Duality & Probability Density',
    equationHTML: (
      <div className="flex flex-col gap-2 font-mono text-xs text-purple-300 bg-slate-950 p-4 rounded-xl border border-slate-800">
        <div className="text-center font-bold text-slate-400 mb-2">Schrödinger Wave Equation & Probability</div>
        <div className="flex flex-col items-center justify-center gap-3 text-sm">
          <div>H ψ = E ψ</div>
          <div>P(r) = |ψ<sub>n,l,m</sub>(r)|<sup>2</sup> dV</div>
        </div>
        <div className="text-[10px] text-slate-500 mt-2 border-t border-slate-900 pt-2 text-center">
          Where ψ is the complex wave function, and |ψ|<sup>2</sup> represents the probability density of locating an electron.
        </div>
      </div>
    ),
    description: 'Treats the electron not as a orbiting point mass, but as a three-dimensional standing wave. The position of an electron cannot be defined precisely; instead, three-dimensional probability density clouds (orbitals) map its location.',
    experiment: 'Davisson-Germer Experiment (1927): Proved electron diffraction through nickel lattices, confirming de Broglie\'s matter wave hypothesis (λ = h / p).',
    shortcoming: 'Highly complex mathematical structures requiring numerical approximation techniques for multi-electron atoms; relies entirely on statistical probability rather than classical determinism.',
  }
};

export default function App() {
  const [activeModel, setActiveModel] = useState('bohr');
  const [isPlaying, setIsPlaying] = useState(true);
  const [simSpeed, setSimSpeed] = useState(1);
  const canvasRef = useRef(null);

  // Model Parameter Configurations
  const [plumCount, setPlumCount] = useState(8);
  const [posRadius, setPosRadius] = useState(130);
  const [isDisturbed, setIsDisturbed] = useState(false);

  const [alphaEnergy, setAlphaEnergy] = useState(4.0); 
  const [impactParam, setImpactParam] = useState(30); 
  const [beamWidth, setBeamWidth] = useState(60); 
  const [nucleusZ, setNucleusZ] = useState(79); 
  const [scatteringMode, setScatteringMode] = useState('single'); 

  const [bohrLevel, setBohrLevel] = useState(2);
  const [transitioning, setTransitioning] = useState(false);
  const [photonWave, setPhotonWave] = useState(null); 

  const [selectedOrbital, setSelectedOrbital] = useState('2p'); 
  const [cloudDensity, setCloudDensity] = useState(1500); 

  // Dynamic animation trackers held in refs to prevent unnecessary React renders
  const particlesRef = useRef([]);
  const timeStepRef = useRef(0);

  // Helpers for Bohr model
  function getBohrRadius(n) {
    return n * n * 22 + 25; 
  }
  function getBohrSpeed(n) {
    return 0.12 / n; 
  }

  // Re-initialize physics elements on active model change or key parameter updates
  useEffect(() => {
    // Only completely reset the array when swapping models or changing Thomson properties
    // Bohr level changes are handled gracefully by the render loop to allow smooth radius interpolation!
    setIsDisturbed(false);
    setTransitioning(false);
    setPhotonWave(null);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    if (activeModel === 'thomson') {
      particlesRef.current = [];
      for (let i = 0; i < plumCount; i++) {
        const theta = (i / plumCount) * Math.PI * 2;
        const dist = posRadius * 0.5 * (0.5 + Math.random() * 0.4);
        particlesRef.current.push({
          x: cx + Math.cos(theta) * dist,
          y: cy + Math.sin(theta) * dist,
          vx: 0,
          vy: 0,
          radius: 7,
          id: i
        });
      }
    } else if (activeModel === 'bohr' && particlesRef.current.length === 0) {
      // Setup initial electron if array is empty
      particlesRef.current = [{
        angle: 0,
        radius: getBohrRadius(bohrLevel),
        speed: getBohrSpeed(bohrLevel)
      }];
    } else if (activeModel === 'rutherford' || activeModel === 'quantum') {
      particlesRef.current = [];
    }
  }, [activeModel, plumCount, posRadius]); 

  // Trigger Bohr transition with photon radiation physics
  const initiateTransition = (targetShell) => {
    if (transitioning || targetShell === bohrLevel) return;
    setTransitioning(true);

    const initialShell = bohrLevel;
    const isAbsorption = targetShell > initialShell;
    
    const energyInitial = -13.6 / (initialShell * initialShell);
    const energyFinal = -13.6 / (targetShell * targetShell);
    const deltaE = Math.abs(energyFinal - energyInitial);
    
    const wavelength = Math.round(1240 / deltaE);
    
    let color = '#ec4899'; 
    if (wavelength > 380 && wavelength < 780) {
      if (wavelength >= 620) color = '#f87171'; 
      else if (wavelength >= 590) color = '#fb923c'; 
      else if (wavelength >= 570) color = '#facc15'; 
      else if (wavelength >= 495) color = '#4ade80'; 
      else if (wavelength >= 450) color = '#60a5fa'; 
      else color = '#c084fc'; 
    } else if (wavelength >= 780) {
      color = '#ef4444'; 
    }

    if (isAbsorption) {
      setPhotonWave({
        x: -40,
        y: 0,
        targetX: 0,
        isSinking: true,
        color: color,
        wavelength: wavelength,
        deltaE: deltaE,
        fromShell: initialShell,
        toShell: targetShell
      });
    } else {
      setBohrLevel(targetShell);
      setPhotonWave({
        x: 0,
        y: 0,
        targetX: 320,
        isSinking: false,
        color: color,
        wavelength: wavelength,
        deltaE: deltaE,
        fromShell: initialShell,
        toShell: targetShell
      });
      setTransitioning(false);
    }
  };

  // High performance canvas renderer loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    const renderLoop = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      const targetWidth = rect.width * dpr || 800;
      const targetHeight = rect.height * dpr || 600;

      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      
      const width = rect.width || canvas.width;
      const height = rect.height || canvas.height;
      const cx = width / 2;
      const cy = height / 2;

      // Dark background
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, width, height);

      // Fine physics grid background
      ctx.strokeStyle = '#111827';
      ctx.lineWidth = 1;
      const gridDensity = 40;
      for (let x = 0; x < width; x += gridDensity) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridDensity) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (isPlaying) {
        timeStepRef.current += 0.04 * simSpeed;
      }

      // Route renderer based on active model selection
      switch (activeModel) {
        case 'thomson':
          drawThomson(ctx, cx, cy, width, height);
          break;
        case 'rutherford':
          drawRutherford(ctx, cx, cy, width, height);
          break;
        case 'bohr':
          drawBohr(ctx, cx, cy, width, height);
          break;
        case 'quantum':
          drawQuantum(ctx, cx, cy, width, height);
          break;
        default:
          break;
      }

      ctx.restore();
      animationId = requestAnimationFrame(renderLoop);
    };

    // 1. Thomson "Plum Pudding" Renderer
    const drawThomson = (ctx, cx, cy, width, height) => {
      const radGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, posRadius);
      radGrad.addColorStop(0, 'rgba(239, 68, 68, 0.22)'); 
      radGrad.addColorStop(0.85, 'rgba(239, 68, 68, 0.05)');
      radGrad.addColorStop(1, 'rgba(239, 68, 68, 0.01)');
      
      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, posRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(cx, cy, posRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
      ctx.font = '10px monospace';
      ctx.fillText('+ Positively Charged Substrate', cx - 85, cy - posRadius - 12);

      const corpuscles = particlesRef.current;

      if (isPlaying) {
        corpuscles.forEach((p) => {
          let fx = 0;
          let fy = 0;

          const dx = p.x - cx;
          const dy = p.y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const kRestoring = 0.004;
          if (dist < posRadius) {
            fx -= kRestoring * dx;
            fy -= kRestoring * dy;
          } else {
            fx -= 0.08 * dx;
            fy -= 0.08 * dy;
          }

          corpuscles.forEach((other) => {
            if (p.id === other.id) return;
            const rx = p.x - other.x;
            const ry = p.y - other.y;
            const rDist = Math.sqrt(rx * rx + ry * ry) || 1;
            
            const coulombFactor = 1.4;
            if (rDist < posRadius * 1.5) {
              const repulsion = coulombFactor / (rDist * rDist);
              fx += (rx / rDist) * repulsion;
              fy += (ry / rDist) * repulsion;
            }
          });

          if (isDisturbed) {
            fx += (Math.random() - 0.5) * 1.5;
            fy += (Math.random() - 0.5) * 1.5;
          }

          p.vx += fx * simSpeed;
          p.vy += fy * simSpeed;

          const damping = isDisturbed ? 0.985 : 0.925;
          p.vx *= damping;
          p.vy *= damping;

          p.x += p.vx * simSpeed;
          p.y += p.vy * simSpeed;
        });
      }

      corpuscles.forEach((p) => {
        const eGrad = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, p.radius * 2);
        eGrad.addColorStop(0, 'rgba(14, 165, 233, 1)'); 
        eGrad.addColorStop(1, 'rgba(14, 165, 233, 0)');
        
        ctx.fillStyle = eGrad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 2.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0369a1';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('-', p.x - 3, p.y + 3);
      });
    };

    // 2. Rutherford Scattering Model Renderer
    const drawRutherford = (ctx, cx, cy, width, height) => {
      const nGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 32);
      nGrad.addColorStop(0, 'rgba(245, 158, 11, 1)'); 
      nGrad.addColorStop(0.25, 'rgba(245, 158, 11, 0.45)');
      nGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      
      ctx.fillStyle = nGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 32, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.arc(cx, cy, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(
        nucleusZ === 79 ? `Gold nucleus (+${nucleusZ}e)` : `Nucleus (Z = ${nucleusZ})`,
        cx - 55,
        cy - 15
      );

      if (isPlaying) {
        if (Math.random() < 0.16 * simSpeed) {
          let spawnY = scatteringMode === 'single' 
            ? cy - impactParam 
            : cy + (Math.random() - 0.5) * beamWidth * 3.8;

          particlesRef.current.push({
            x: 0,
            y: spawnY,
            vx: alphaEnergy * 1.3 + 2.5, 
            vy: 0,
            trail: []
          });
        }

        particlesRef.current.forEach((alpha) => {
          const rx = alpha.x - cx;
          const ry = alpha.y - cy;
          const distSq = rx * rx + ry * ry;
          const dist = Math.sqrt(distSq);

          const chargeForceCoefficient = (nucleusZ * 95) / (distSq + 240);
          const ax = (rx / (dist || 1)) * chargeForceCoefficient;
          const ay = (ry / (dist || 1)) * chargeForceCoefficient;

          alpha.vx += ax * 0.15 * simSpeed;
          alpha.vy += ay * 0.15 * simSpeed;

          alpha.x += alpha.vx * simSpeed;
          alpha.y += alpha.vy * simSpeed;

          alpha.trail.push({ x: alpha.x, y: alpha.y });
          if (alpha.trail.length > 40) alpha.trail.shift();
        });

        // Safely filter out off-screen particles
        particlesRef.current = particlesRef.current.filter(alpha => 
          !(alpha.x < -100 || alpha.x > width + 100 || alpha.y < -100 || alpha.y > height + 100)
        );
      }

      particlesRef.current.forEach((alpha) => {
        if (alpha.trail.length > 1) {
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)'; 
          ctx.lineWidth = 1.5;
          ctx.moveTo(alpha.trail[0].x, alpha.trail[0].y);
          for (let k = 1; k < alpha.trail.length; k++) {
            ctx.lineTo(alpha.trail[k].x, alpha.trail[k].y);
          }
          ctx.stroke();
        }

        const aGrad = ctx.createRadialGradient(alpha.x, alpha.y, 1, alpha.x, alpha.y, 7);
        aGrad.addColorStop(0, 'rgba(52, 211, 153, 1)');
        aGrad.addColorStop(1, 'rgba(52, 211, 153, 0)');
        
        ctx.fillStyle = aGrad;
        ctx.beginPath();
        ctx.arc(alpha.x, alpha.y, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#059669';
        ctx.beginPath();
        ctx.arc(alpha.x, alpha.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      if (scatteringMode === 'single') {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.setLineDash([4, 4]);
        
        ctx.beginPath();
        ctx.moveTo(0, cy);
        ctx.lineTo(width, cy);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(14, 165, 233, 0.3)';
        ctx.beginPath();
        ctx.moveTo(0, cy - impactParam);
        ctx.lineTo(cx, cy - impactParam);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#38bdf8';
        ctx.font = '10px monospace';
        ctx.fillText(`Impact Parameter (b) = ${impactParam} px`, 12, cy - impactParam - 6);
      }
    };

    // 3. Bohr Quantized Orbits Renderer
    const drawBohr = (ctx, cx, cy, width, height) => {
      const coreGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 20);
      coreGrad.addColorStop(0, 'rgba(129, 140, 248, 1)'); 
      coreGrad.addColorStop(0.5, 'rgba(129, 140, 248, 0.35)');
      coreGrad.addColorStop(1, 'rgba(129, 140, 248, 0)');
      
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#4f46e5';
      ctx.beginPath();
      ctx.arc(cx, cy, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('+', cx - 2.5, cy + 3.5);

      for (let n = 1; n <= 4; n++) {
        const orbitRad = getBohrRadius(n);
        const isActive = bohrLevel === n;

        ctx.strokeStyle = isActive ? 'rgba(56, 189, 248, 0.85)' : 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = isActive ? 1.5 : 1;
        
        if (isActive) {
          ctx.setLineDash([3, 4]); 
        } else {
          ctx.setLineDash([6, 8]);
        }

        ctx.beginPath();
        ctx.arc(cx, cy, orbitRad, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = isActive ? '#38bdf8' : 'rgba(255, 255, 255, 0.4)';
        ctx.font = '10px monospace';
        ctx.fillText(`n = ${n}`, cx + orbitRad - 5, cy - 8);
      }
      ctx.setLineDash([]);

      const activeElectron = particlesRef.current[0];
      if (activeElectron) {
        if (isPlaying) {
          const targetRad = getBohrRadius(bohrLevel);
          const rDiff = targetRad - activeElectron.radius;
          activeElectron.radius += rDiff * 0.12 * simSpeed;

          const currentSpeed = getBohrSpeed(bohrLevel);
          activeElectron.speed += (currentSpeed - activeElectron.speed) * 0.12;
          activeElectron.angle += activeElectron.speed * simSpeed;
        }

        const ex = cx + Math.cos(activeElectron.angle) * activeElectron.radius;
        const ey = cy + Math.sin(activeElectron.angle) * activeElectron.radius;

        const eGrad = ctx.createRadialGradient(ex, ey, 1, ex, ey, 11);
        eGrad.addColorStop(0, 'rgba(56, 189, 248, 1)');
        eGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
        
        ctx.fillStyle = eGrad;
        ctx.beginPath();
        ctx.arc(ex, ey, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(ex, ey, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      if (photonWave) {
        if (isPlaying) {
          if (photonWave.isSinking) {
            photonWave.x += 4 * simSpeed;
            if (photonWave.x >= cx - getBohrRadius(photonWave.toShell)) {
              setBohrLevel(photonWave.toShell);
              setPhotonWave(null);
              setTransitioning(false);
            }
          } else {
            photonWave.x += 4 * simSpeed;
            if (photonWave.x > cx + 320) {
              setPhotonWave(null);
            }
          }
        }

        if (photonWave) {
          ctx.beginPath();
          ctx.strokeStyle = photonWave.color;
          ctx.lineWidth = 2.5;

          const packetLength = 40;
          const startX = photonWave.isSinking ? photonWave.x : cx + photonWave.x;
          const yCenter = cy - 20;

          for (let d = -packetLength; d <= packetLength; d++) {
            const currentX = startX + d;
            const gaussianEnvelope = Math.exp(-Math.pow(d / (packetLength * 0.45), 2));
            const currentY = yCenter + Math.sin(d * 0.45 - timeStepRef.current * 4.5) * 9 * gaussianEnvelope;

            if (d === -packetLength) {
              ctx.moveTo(currentX, currentY);
            } else {
              ctx.lineTo(currentX, currentY);
            }
          }
          ctx.stroke();

          ctx.fillStyle = photonWave.color;
          ctx.font = 'bold 9px monospace';
          ctx.fillText(`Photon hν (λ = ${photonWave.wavelength}nm)`, startX - 55, cy - 36);
        }
      }
    };

    // 4. Schrödinger Wave Cloud Renderer
    const drawQuantum = (ctx, cx, cy, width, height) => {
      const bohrScale = 40; 
      const timeCoeff = timeStepRef.current * 0.15; 

      for (let i = 0; i < cloudDensity; i++) {
        const randSeed = i * 291.55 + Math.sin(i) * 382.9;
        const u1 = (Math.abs(Math.sin(randSeed)) % 1);
        const u2 = (Math.abs(Math.cos(randSeed * 1.4)) % 1);
        const theta = u2 * Math.PI * 2;

        let radialDist = 0;
        let pDensity = 0;

        if (selectedOrbital === '1s') {
          radialDist = -Math.log(u1 + 0.0001) * bohrScale * 1.1;
          pDensity = 1.0;
        } else if (selectedOrbital === '2s') {
          radialDist = u1 * bohrScale * 4.6;
          const normalizedR = radialDist / bohrScale;
          const radialPart = (2 - normalizedR) * Math.exp(-normalizedR / 2);
          pDensity = radialPart * radialPart;
        } else if (selectedOrbital === '2p') {
          radialDist = u1 * bohrScale * 4.5;
          const normalizedR = radialDist / bohrScale;
          const radialPart = normalizedR * Math.cos(theta) * Math.exp(-normalizedR / 2);
          pDensity = radialPart * radialPart * 2.8;
        } else if (selectedOrbital === '3d') {
          radialDist = u1 * bohrScale * 5.2;
          const normalizedR = radialDist / bohrScale;
          const radialPart = normalizedR * normalizedR * Math.sin(2 * theta) * Math.exp(-normalizedR / 3);
          pDensity = radialPart * radialPart * 4.5;
        }

        const stochasticThreshold = (Math.abs(Math.sin(randSeed * 5.8 + timeCoeff)) % 1);
        if (pDensity > stochasticThreshold * 0.45) {
          const dx = Math.cos(theta) * radialDist;
          const dy = Math.sin(theta) * radialDist;
          
          const shimX = Math.sin(timeCoeff + randSeed) * 1.3;
          const shimY = Math.cos(timeCoeff + randSeed * 1.1) * 1.3;

          const distanceFade = 1 - radialDist / (bohrScale * 6);
          const opacity = Math.min(1, pDensity * 1.8) * Math.max(0, distanceFade);

          ctx.fillStyle = `rgba(168, 85, 247, ${Math.max(0.12, opacity * 0.72)})`;
          ctx.beginPath();
          ctx.arc(cx + dx + shimX, cy + dy + shimY, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      const nucleusLayout = [
        { dx: -4, dy: -3, col: '#f43f5e' }, 
        { dx: 4, dy: -2, col: '#f43f5e' },
        { dx: -1, dy: 4, col: '#f43f5e' },
        { dx: 3, dy: 3, col: '#64748b' },  
        { dx: -5, dy: 2, col: '#64748b' },
        { dx: 0, dy: -6, col: '#64748b' }
      ];

      nucleusLayout.forEach((nuc) => {
        ctx.fillStyle = nuc.col;
        ctx.beginPath();
        ctx.arc(cx + nuc.dx, cy + nuc.dy, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#030712';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.moveTo(width - 95, height - 20);
      ctx.lineTo(width - 25, height - 20);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(width - 95, height - 24); ctx.lineTo(width - 95, height - 16);
      ctx.moveTo(width - 25, height - 24); ctx.lineTo(width - 25, height - 16);
      ctx.stroke();
      
      ctx.fillStyle = '#64748b';
      ctx.font = '10px monospace';
      ctx.fillText('10⁻¹⁰ meters', width - 87, height - 28);
    };

    renderLoop();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [
    activeModel, 
    isPlaying, 
    simSpeed, 
    plumCount, 
    posRadius, 
    isDisturbed, 
    alphaEnergy, 
    impactParam, 
    beamWidth, 
    nucleusZ, 
    scatteringMode, 
    bohrLevel, 
    transitioning, 
    photonWave, 
    selectedOrbital, 
    cloudDensity
  ]);

  const activeData = modelsData[activeModel];

  return (
    <div className={`min-h-[36rem] ${THEME.bgDark} text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 overflow-x-hidden`}>
      {/* Header Panel */}
      <header className="border-b border-slate-900 bg-slate-950/85 backdrop-blur-md sticky top-0 z-50 px-4 py-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
            <Radio className="w-6 h-6 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
              Atomic Models
            </h1>
            <p className="text-xs text-slate-400">Class 12 Physics CBSE Interactive Lab</p>
          </div>
        </div>

        {/* Dynamic Model selectors with historical timestamps */}
        <div className="flex flex-wrap gap-1 bg-slate-900 p-1 border border-slate-800 rounded-2xl w-full md:w-auto overflow-x-auto justify-start">
          {Object.values(modelsData).map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveModel(m.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-300 flex items-center gap-1.5 shrink-0 ${
                activeModel === m.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 scale-105'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span className="opacity-80 font-mono text-[10px] bg-black/35 px-1 py-0.5 rounded">
                {m.year}
              </span>
              {m.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </header>

      {/* Main Sandbox Workspace Layout */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Physics Canvas Simulation (7 Columns) */}
        <section className="lg:col-span-7 flex flex-col gap-4">
          <div className="relative rounded-3xl border border-slate-800 bg-slate-950/50 shadow-2xl overflow-hidden flex-1 min-h-[420px] lg:min-h-[480px] flex flex-col">
            
            {/* Canvas Container */}
            <div className="relative flex-1 bg-gradient-to-b from-slate-950/90 to-slate-950">
              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
              
              {/* Context Tag Overlay */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                <span className="bg-slate-900/95 border border-slate-800 text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                  {activeData.name} Model
                </span>
                <span className="bg-slate-950/80 border border-slate-900 text-slate-400 text-[10px] font-mono px-3 py-1 rounded-full shadow-md w-max">
                  t = {(timeStepRef.current * 10).toFixed(1)} fs
                </span>
              </div>

              {/* Scattering Mode Overlay Indicator */}
              {activeModel === 'rutherford' && scatteringMode === 'foil' && (
                <div className="absolute top-4 right-4 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 animate-pulse" /> Gold Foil Scatter Target
                </div>
              )}
            </div>

            {/* Simulated Time & Playback Controls */}
            <div className="border-t border-slate-900 bg-slate-900/40 p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`p-3 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                    isPlaying 
                      ? 'bg-amber-600 text-white hover:bg-amber-500 shadow-md' 
                      : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md'
                  }`}
                  title={isPlaying ? "Pause Simulation" : "Start Simulation"}
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                </button>
                <button
                  onClick={() => {
                    particlesRef.current = [];
                    timeStepRef.current = 0;
                  }}
                  className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl transition cursor-pointer"
                  title="Clear Tracks & State"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>

              {/* Speed steps */}
              <div className="flex items-center gap-3">
                <label className="text-xs text-slate-400 font-medium">Simulation Warp Time:</label>
                <div className="flex gap-1 bg-slate-950 p-1 border border-slate-800 rounded-xl">
                  {[0.5, 1.0, 1.5, 2.0].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setSimSpeed(speed)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono transition cursor-pointer ${
                        simSpeed === speed
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {speed.toFixed(1)}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Model Specific Control Panels */}
          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-3xl flex flex-col gap-4">
            <h3 className="text-xs font-bold text-slate-300 tracking-wider flex items-center gap-2 uppercase">
              <Settings className="w-4 h-4 text-indigo-400" /> Physical Input Bounds
            </h3>

            {/* Thomson Controls */}
            {activeModel === 'thomson' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Plums (Embedded Electron Count):</span>
                    <span className="font-mono text-indigo-300 font-bold">{plumCount} electrons</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="16"
                    step="1"
                    value={plumCount}
                    onChange={(e) => setPlumCount(parseInt(e.target.value) || 8)}
                    className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Pudding Boundary Radius (R):</span>
                    <span className="font-mono text-indigo-300 font-bold">{posRadius} px</span>
                  </div>
                  <input
                    type="range"
                    min="90"
                    max="170"
                    value={posRadius}
                    onChange={(e) => setPosRadius(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div className="md:col-span-2 pt-2 border-t border-slate-800/60 flex justify-between items-center">
                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    Induce simple harmonic oscillations via shock excitation
                  </div>
                  <button
                    onMouseDown={() => setIsDisturbed(true)}
                    onMouseUp={() => setIsDisturbed(false)}
                    onTouchStart={() => setIsDisturbed(true)}
                    onTouchEnd={() => setIsDisturbed(false)}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-950/20 cursor-pointer"
                  >
                    Disturb Electrons (Thermal Shake)
                  </button>
                </div>
              </div>
            )}

            {/* Rutherford Controls */}
            {activeModel === 'rutherford' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-slate-400">Experimental Assembly Mode:</span>
                  <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 border border-slate-800 rounded-xl">
                    <button
                      onClick={() => setScatteringMode('single')}
                      className={`py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                        scatteringMode === 'single' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400'
                      }`}
                    >
                      Single Target (b Impact)
                    </button>
                    <button
                      onClick={() => setScatteringMode('foil')}
                      className={`py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                        scatteringMode === 'foil' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400'
                      }`}
                    >
                      Gold Foil (Beam)
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Nucleus Charge (Z value):</span>
                    <span className="font-mono text-indigo-300 font-bold">Z = {nucleusZ}</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="92"
                    value={nucleusZ}
                    onChange={(e) => setNucleusZ(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {scatteringMode === 'single' ? (
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Impact Parameter (b):</span>
                      <span className="font-mono text-indigo-300 font-bold">{impactParam} px</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="110"
                      value={impactParam}
                      onChange={(e) => setImpactParam(parseInt(e.target.value))}
                      className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-[10px] text-slate-500 mt-1">
                      {`* Near head-on scattering (b ≈ 0) triggers 180° backscattering. Deflection angle drops as b increases.`}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Alpha Dispersion Beam Spread:</span>
                      <span className="font-mono text-indigo-300 font-bold">{beamWidth} px width</span>
                    </div>
                    <input
                      type="range"
                      min="35"
                      max="90"
                      value={beamWidth}
                      onChange={(e) => setBeamWidth(parseInt(e.target.value))}
                      className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                )}

                <div className="flex flex-col gap-2 md:col-span-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Incident Energy of α-particles (E_k):</span>
                    <span className="font-mono text-indigo-300 font-bold">{alphaEnergy.toFixed(1)} MeV</span>
                  </div>
                  <input
                    type="range"
                    min="1.5"
                    max="6.5"
                    step="0.5"
                    value={alphaEnergy}
                    onChange={(e) => setAlphaEnergy(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Bohr Controls */}
            {activeModel === 'bohr' && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3">
                  <span className="text-xs text-slate-400 font-bold tracking-wider">Trigger Quantized Transitions (Spectral Series)</span>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((n) => {
                      const isActive = bohrLevel === n;
                      return (
                        <button
                          key={n}
                          onClick={() => initiateTransition(n)}
                          disabled={transitioning}
                          className={`py-3 rounded-2xl flex flex-col items-center justify-center border transition-all ${
                            isActive
                              ? 'bg-sky-500/10 border-sky-400/80 text-sky-300 shadow-md shadow-sky-500/5'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                          } ${transitioning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <span className="text-[10px] uppercase tracking-wider opacity-65">Shell</span>
                          <span className="text-lg font-black font-mono">{n === 1 ? 'K' : n === 2 ? 'L' : n === 3 ? 'M' : 'N'} (n={n})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-slate-400">Bohr Angular Momentum:</span>
                    <p className="text-sm font-bold text-sky-300 font-mono mt-0.5">L = {bohrLevel} × 1.05 × 10⁻³⁴ J·s</p>
                  </div>
                  <div className="text-left md:text-right">
                    <span className="text-xs text-slate-400">State Energy:</span>
                    <p className="text-sm font-bold text-rose-400 font-mono mt-0.5">E_{bohrLevel} = -{(13.6 / (bohrLevel * bohrLevel)).toFixed(2)} eV</p>
                  </div>
                </div>
              </div>
            )}

            {/* Quantum Controls */}
            {activeModel === 'quantum' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-xs text-slate-400 font-bold tracking-wider">Atomic Orbital Selection</span>
                  <div className="grid grid-cols-4 gap-1.5 bg-slate-950 p-1 border border-slate-800 rounded-xl">
                    {['1s', '2s', '2p', '3d'].map((orb) => (
                      <button
                        key={orb}
                        onClick={() => setSelectedOrbital(orb)}
                        className={`py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                          selectedOrbital === orb ? 'bg-purple-600 text-white' : 'text-slate-400'
                        }`}
                      >
                        {orb}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Probability Sample Dots:</span>
                    <span className="font-mono text-purple-300 font-bold">{cloudDensity} coordinates</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="2000"
                    step="100"
                    value={cloudDensity}
                    onChange={(e) => setCloudDensity(parseInt(e.target.value))}
                    className="w-full accent-purple-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="md:col-span-2 pt-2 border-t border-slate-800/60 flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Award className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="text-xs text-slate-300">
                    <span className="font-bold text-purple-300 block">Uncertainty Principle Integration:</span>
                    Instead of classical orbits, Born's probability density mathematically maps the standing wave spatial profile.
                  </div>
                </div>
              </div>
            )}

          </div>
        </section>

        {/* Right Side: Textbook Scientific Dashboard (5 Columns) */}
        <section className="lg:col-span-5 flex flex-col gap-5">
          
          {/* Historical context dashboard */}
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl flex flex-col gap-5 flex-1 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono tracking-widest text-indigo-400 uppercase font-bold">Scientific Context</span>
                <h2 className="text-lg font-black text-white mt-0.5">{activeData.name}</h2>
              </div>
              <div className="text-right">
                <span className="text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-md font-mono font-semibold">
                  Era: {activeData.year}
                </span>
              </div>
            </div>

            {/* Discoverer Metadata */}
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex flex-col gap-1.5">
              <span className="text-[10px] tracking-wider text-slate-400 uppercase font-bold flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-indigo-400" /> Key Discoverer & Milestone
              </span>
              <p className="text-sm font-bold text-white">{activeData.discoverer}</p>
              <p className="text-xs text-slate-300 font-medium">{activeData.keyDiscovery}</p>
            </div>

            {/* Core Physics Formulas */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] tracking-wider text-slate-400 uppercase font-bold flex items-center gap-1.5">
                <Binary className="w-3.5 h-3.5 text-indigo-400" /> Core Physical Equation
              </span>
              {activeData.equationHTML}
            </div>

            {/* Historical Details */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] tracking-wider text-slate-400 uppercase font-bold flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-indigo-400" /> Model Description
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeData.description}
              </p>
            </div>

            {/* Empirical Experimentation */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] tracking-wider text-slate-400 uppercase font-bold flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-400" /> Experimental Grounding
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeData.experiment}
              </p>
            </div>

            {/* Crucial Shortcomings (Why the model was replaced) */}
            <div className="mt-auto p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl flex flex-col gap-1.5">
              <span className="text-[10px] tracking-wider text-rose-400 uppercase font-bold flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Structural Limitations
              </span>
              <p className="text-xs text-rose-200/90 leading-relaxed">
                {activeData.shortcoming}
              </p>
            </div>

          </div>

          {/* Suggested Practical Labs */}
          <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-3xl">
            <h4 className="text-xs font-bold tracking-wider text-slate-300 uppercase flex items-center gap-1.5 mb-3">
              <Lightbulb className="w-4 h-4 text-amber-400" /> Suggested Classroom Labs
            </h4>
            <ul className="text-xs text-slate-300 flex flex-col gap-2.5">
              {activeModel === 'thomson' && (
                <>
                  <li className="flex gap-2">
                    <span className="text-indigo-400 font-bold font-mono">1.</span>
                    <span>Tweak <strong>Plums count</strong> to observe symmetrical geometric arrangements (ring configuration).</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-indigo-400 font-bold font-mono">2.</span>
                    <span>Hold down <strong>Disturb Electrons</strong> and observe the harmonic oscillation paths Thomson believed generated discrete optical emissions.</span>
                  </li>
                </>
              )}
              {activeModel === 'rutherford' && (
                <>
                  <li className="flex gap-2">
                    <span className="text-indigo-400 font-bold font-mono">1.</span>
                    <span>Shift to <strong>Single Target</strong> and reduce impact parameter b down to zero. Notice the back-scattering (180° rebound).</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-indigo-400 font-bold font-mono">2.</span>
                    <span>Increase <strong>Alpha Particle Kinetic Energy</strong> to 6.0 MeV. Watch the deflection angle decrease as velocity dominates electrostatic traction.</span>
                  </li>
                </>
              )}
              {activeModel === 'bohr' && (
                <>
                  <li className="flex gap-2">
                    <span className="text-indigo-400 font-bold font-mono">1.</span>
                    <span>Jump from <strong>n=3</strong> down to <strong>n=2</strong>. Notice the emitted red photon wave packet representing the Balmer series (H<sub>α</sub> spectral line).</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-indigo-400 font-bold font-mono">2.</span>
                    <span>Excite the electron back to shell 4 and look at how the photon wave must sink into the nucleus boundaries to drive the quantum leap.</span>
                  </li>
                </>
              )}
              {activeModel === 'quantum' && (
                <>
                  <li className="flex gap-2">
                    <span className="text-indigo-400 font-bold font-mono">1.</span>
                    <span>Toggle between <strong>1s</strong> and <strong>2s</strong>. Notice the distinct zero-density dark ring representing the radial node in the 2s state.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-indigo-400 font-bold font-mono">2.</span>
                    <span>Select <strong>2p</strong> or <strong>3d</strong> to view angular node shapes resulting from quantum orbital angular momentum numbers (l, m).</span>
                  </li>
                </>
              )}
            </ul>
          </div>

        </section>

      </main>
    </div>
  );
}