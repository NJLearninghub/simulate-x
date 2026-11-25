import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import type { ClassId, SubjectId } from "./chapters";

export interface SimEntry {
  id: string;
  classId: ClassId;
  subject: SubjectId;
  /** NCERT chapter number. Must match an entry in chapters.ts. */
  chapter: number;
  title: string;
  /** One or two sentences shown above the simulation: what to explore. */
  explore: string;
  Component: LazyExoticComponent<ComponentType>;
}

/**
 * Register a simulation here after adding its component under src/sims/.
 * See README → “How to add a simulation”.
 */
export const SIMS: SimEntry[] = [
  {
    id: "reflection",
    classId: 10,
    subject: "physics",
    chapter: 9,
    title: "Reflection of Light",
    explore:
      "Move the angle of incidence and check that it always equals the angle of reflection. Turn the normal, the angle marks and the protractor on and off.",
    Component: lazy(() => import("./sims/reflection")),
  },
  {
    id: "refraction",
    classId: 10,
    subject: "physics",
    chapter: 9,
    title: "Refraction of Light",
    explore:
      "Change the angle and the two refractive indices. Watch the ray bend toward the normal in a denser medium, and look for total internal reflection when it tries to leave a denser medium.",
    Component: lazy(() => import("./sims/refraction")),
  },
  {
    id: "ohms-law",
    classId: 10,
    subject: "physics",
    chapter: 11,
    title: "Ohm’s Law",
    explore:
      "Vary voltage and resistance. Current is I = V/R and power is P = VI. The V–I graph for a fixed resistance is a straight line through the origin.",
    Component: lazy(() => import("./sims/ohms")),
  },
  {
    id: "quadratic",
    classId: 10,
    subject: "maths",
    chapter: 4,
    title: "Quadratic Graphs",
    explore:
      "Slide a, b and c in y = ax² + bx + c. The discriminant b² − 4ac tells you whether the parabola cuts the x-axis twice, once, or not at all.",
    Component: lazy(() => import("./sims/quadratic")),
  },
  {
    id: "photosynthesis",
    classId: 10,
    subject: "biology",
    chapter: 5,
    title: "Photosynthesis",
    explore:
      "Raise the light intensity. The rate of photosynthesis, seen as oxygen bubbles, rises and then levels off when some other factor becomes limiting.",
    Component: lazy(() => import("./sims/photosynthesis")),
  },
  {
    id: "projectile",
    classId: 11,
    subject: "physics",
    chapter: 3,
    title: "Projectile Motion",
    explore:
      "On level ground, compare range, maximum height and time of flight as you change speed, angle and g. Complementary angles (30° and 60°) share the same range.",
    Component: lazy(() => import("./sims/projectile")),
  },
  {
    id: "friction",
    classId: 11,
    subject: "physics",
    chapter: 4,
    title: "Friction on an Inclined Plane",
    explore:
      "Raise the incline until tan θ exceeds μs. The block stays put while friction matches mg sin θ, then slides with a = g (sin θ − μk cos θ).",
    Component: lazy(() => import("./sims/friction")),
  },
  {
    id: "collisions",
    classId: 11,
    subject: "physics",
    chapter: 5,
    title: "Two-Dimensional Collisions",
    explore:
      "Collisions in two dimensions conserve momentum along the line of impact. For smooth spheres the tangential velocities do not change. Set e = 1 for an elastic collision and e < 1 to watch kinetic energy drop.",
    Component: lazy(() => import("./sims/collisions")),
  },
  {
    id: "rolling",
    classId: 11,
    subject: "physics",
    chapter: 6,
    title: "Rolling without Slipping",
    explore:
      "Race a solid sphere, a solid cylinder, a hollow sphere and a thin ring down the same incline. Acceleration is g sin θ / (1 + I/MR²). Larger I means a slower roll.",
    Component: lazy(() => import("./sims/rolling")),
  },
  {
    id: "cycloid",
    classId: 11,
    subject: "physics",
    chapter: 6,
    title: "Cycloid of a Rolling Circle",
    explore:
      "Follow one point on a circle that rolls in a straight line without slipping. Its path is the cycloid x = r(θ − sin θ), y = r(1 − cos θ).",
    Component: lazy(() => import("./sims/cycloid")),
  },
  {
    id: "kepler",
    classId: 11,
    subject: "physics",
    chapter: 7,
    title: "Kepler’s Laws",
    explore:
      "Watch a planet sweep equal areas in equal times, and check that the square of the period grows with the cube of the semi-major axis.",
    Component: lazy(() => import("./sims/kepler")),
  },
  {
    id: "bernoulli",
    classId: 11,
    subject: "physics",
    chapter: 9,
    title: "Bernoulli’s Principle",
    explore:
      "Narrow the pipe and the fluid speeds up, so the pressure falls. Along a streamline, P + ρgh + ½ρv² stays constant for steady, incompressible flow.",
    Component: lazy(() => import("./sims/bernoulli")),
  },
  {
    id: "shm",
    classId: 11,
    subject: "physics",
    chapter: 13,
    title: "Simple Harmonic Motion",
    explore:
      "Compare a spring (ω = √(k/m)) with a pendulum (ω = √(g/L), small angle). Displacement, velocity and acceleration stay a quarter-cycle apart, and a = −ω² x.",
    Component: lazy(() => import("./sims/shm")),
  },
  {
    id: "standing-waves",
    classId: 11,
    subject: "physics",
    chapter: 14,
    title: "Standing Waves and Resonance",
    explore:
      "Drive a string, an open pipe or a closed pipe. Resonance sits at fn = nv/(2L) for the string and the open pipe, and only at the odd harmonics fn = nv/(4L) for the closed pipe.",
    Component: lazy(() => import("./sims/standing-waves")),
  },
  {
    id: "periodic-table",
    classId: 11,
    subject: "chemistry",
    chapter: 3,
    title: "Periodic Table Explorer",
    explore:
      "Pick an element and compare atomic radius, ionisation energy and electronegativity across a period and down a group.",
    Component: lazy(() => import("./sims/periodic")),
  },
  {
    id: "electric-field",
    classId: 12,
    subject: "physics",
    chapter: 1,
    title: "Electric Field of Point Charges",
    explore:
      "Field lines leave positive charges and end on negative charges. The field at a point is the vector sum of kq/r² from every charge.",
    Component: lazy(() => import("./sims/electric-field")),
  },
  {
    id: "dielectric",
    classId: 12,
    subject: "physics",
    chapter: 2,
    title: "Dielectric Insertion",
    explore:
      "Slide a dielectric into part of a parallel-plate capacitor. With the battery connected, V stays fixed and Q rises. With the battery disconnected, Q stays fixed and V falls.",
    Component: lazy(() => import("./sims/dielectric")),
  },
  {
    id: "kirchhoff",
    classId: 12,
    subject: "physics",
    chapter: 3,
    title: "Kirchhoff’s Laws",
    explore:
      "At a junction the signed currents add to zero. Around a closed loop the potential changes add to zero. Check both rules on the circuit you build.",
    Component: lazy(() => import("./sims/kirchhoff")),
  },
  {
    id: "wheatstone",
    classId: 12,
    subject: "physics",
    chapter: 3,
    title: "Wheatstone Bridge",
    explore:
      "Balance the bridge so the galvanometer current is zero. That happens when P/Q = R/S. In mystery mode, find the hidden resistor from the balance condition.",
    Component: lazy(() => import("./sims/wheatstone")),
  },
  {
    id: "magnetic-field",
    classId: 12,
    subject: "physics",
    chapter: 4,
    title: "Magnetic Field Trajectories",
    explore:
      "A charge with velocity perpendicular to B moves in a circle of radius mv/(|q|B). A parallel component of velocity stretches that circle into a helix. Reverse the charge and the sense of rotation flips.",
    Component: lazy(() => import("./sims/magnetic-field")),
  },
  {
    id: "galvanometer",
    classId: 12,
    subject: "physics",
    chapter: 4,
    title: "Moving-Coil Galvanometer",
    explore:
      "In a radial field the deflection is φ = (NBA/k) I. More turns, area or field increase the deflection. A stiffer spring or a larger coil resistance reduces it. Reverse the current and the needle swings the other way.",
    Component: lazy(() => import("./sims/galvanometer")),
  },
  {
    id: "magnetic-materials",
    classId: 12,
    subject: "physics",
    chapter: 5,
    title: "Magnetic Materials",
    explore:
      "Compare diamagnetic (χ slightly negative), paramagnetic (χ slightly positive) and ferromagnetic (χ large) materials. B = μ₀(H + M) and μr = 1 + χ.",
    Component: lazy(() => import("./sims/magnetic-materials")),
  },
  {
    id: "mutual-inductance",
    classId: 12,
    subject: "physics",
    chapter: 6,
    title: "Mutual Inductance",
    explore:
      "A changing current in one coil induces an emf −M dI/dt in the other. Swap which coil is primary and check that M₁₂ = M₂₁.",
    Component: lazy(() => import("./sims/mutual")),
  },
  {
    id: "ac-circuits",
    classId: 12,
    subject: "physics",
    chapter: 7,
    title: "AC Circuits and Phasors",
    explore:
      "In a series LCR circuit, XL = ωL and XC = 1/(ωC). At resonance XL = XC, the phase angle is zero and the current is largest. Voltage leads current in an inductor and lags it in a capacitor.",
    Component: lazy(() => import("./sims/ac")),
  },
  {
    id: "em-waves",
    classId: 12,
    subject: "physics",
    chapter: 8,
    title: "Electromagnetic Waves",
    explore:
      "E, B and the direction of travel are mutually perpendicular, and the wave travels along E × B. The amplitudes are related by E₀ = c B₀.",
    Component: lazy(() => import("./sims/em-waves")),
  },
  {
    id: "displacement-current",
    classId: 12,
    subject: "physics",
    chapter: 8,
    title: "Displacement Current",
    explore:
      "While a capacitor charges, the conduction current in the wires equals the displacement current ε₀ dΦE/dt between the plates. Both fall as e^(−t/RC).",
    Component: lazy(() => import("./sims/displacement")),
  },
  {
    id: "photoelectric",
    classId: 12,
    subject: "physics",
    chapter: 11,
    title: "Photoelectric Effect",
    explore:
      "Kmax = hν − φ. Below the threshold frequency, no electrons leave no matter how bright the light is. Intensity changes the photocurrent, not the stopping potential.",
    Component: lazy(() => import("./sims/photoelectric")),
  },
  {
    id: "atomic-models",
    classId: 12,
    subject: "physics",
    chapter: 12,
    title: "Atomic Models",
    explore:
      "Compare Rutherford’s nucleus with Bohr’s stationary orbits. Energies are En = −13.6 Z²/n² eV, and a jump between levels emits or absorbs a photon of energy |Ei − Ef|.",
    Component: lazy(() => import("./sims/atomic")),
  },
  {
    id: "nuclear-decay",
    classId: 12,
    subject: "physics",
    chapter: 13,
    title: "Radioactive Decay",
    explore:
      "N = N₀ e^(−λt) and the half-life is ln 2 / λ. An α particle drops A by 4 and Z by 2. β⁻ raises Z by 1. A γ ray changes neither.",
    Component: lazy(() => import("./sims/nuclear")),
  },
  {
    id: "rectifier",
    classId: 12,
    subject: "physics",
    chapter: 14,
    title: "Half-wave and Full-wave Rectifier",
    explore:
      "A half-wave rectifier uses one half of the AC cycle (average Vm/π). A full-wave rectifier uses both (average 2Vm/π) and the ripple frequency doubles. A capacitor smooths the output.",
    Component: lazy(() => import("./sims/rectifier")),
  },
  {
    id: "unit-circle",
    classId: 11,
    subject: "maths",
    chapter: 3,
    title: "Unit Circle and Sine, Cosine",
    explore:
      "Move around the unit circle. The x-coordinate is cos θ and the y-coordinate is sin θ. Watch both waves grow as the angle runs from 0° to 360°.",
    Component: lazy(() => import("./sims/unit-circle")),
  },
  {
    id: "galileo-odd-numbers",
    classId: 11,
    subject: "physics",
    chapter: 2,
    title: "Galileo’s Law of Odd Numbers",
    explore:
      "A body falling from rest covers distances in successive equal times in the ratio 1 : 3 : 5 : 7. Predict the next odd multiple of the first distance.",
    Component: lazy(() => import("./sims/galileo")),
  },
  {
    id: "continuity",
    classId: 12,
    subject: "maths",
    chapter: 5,
    title: "Continuity and Differentiability",
    explore:
      "Compare a smooth curve, a sharp corner, a jump and a hole. A function is continuous at c when the left and right limits equal f(c), and differentiable only when the left and right derivatives also match.",
    Component: lazy(() => import("./sims/continuity")),
  },
  {
    id: "derivative-rules",
    classId: 12,
    subject: "maths",
    chapter: 5,
    title: "Product and Quotient Rules",
    explore:
      "Build (uv)' = u'v + uv' and (u/v)' = (u'v − uv')/v² one piece at a time for products and quotients from the Class 12 calculus list.",
    Component: lazy(() => import("./sims/derivative-rules")),
  },
  {
    id: "increasing-decreasing",
    classId: 12,
    subject: "maths",
    chapter: 6,
    title: "Increasing and Decreasing Functions",
    explore:
      "Slide a tangent along the curve. Where f'(x) > 0 the function is increasing, and where f'(x) < 0 it is decreasing. The sign changes at the critical points.",
    Component: lazy(() => import("./sims/increasing")),
  },
  {
    id: "maxima-minima",
    classId: 12,
    subject: "maths",
    chapter: 6,
    title: "Maxima and Minima",
    explore:
      "Find where f'(x) = 0. The second derivative test says f''(x) < 0 is a local maximum and f''(x) > 0 is a local minimum.",
    Component: lazy(() => import("./sims/maxima")),
  },
  {
    id: "gradient-descent",
    classId: 12,
    subject: "maths",
    chapter: 6,
    title: "Gradient Descent",
    explore:
      "Beyond the syllabus: step downhill with w ← w − α L'(w). A small learning rate finds the minimum. Too large a rate overshoots. A non-convex curve can trap the walker in a local minimum.",
    Component: lazy(() => import("./sims/gradient-descent")),
  },
  {
    id: "application-of-integrals",
    classId: 12,
    subject: "maths",
    chapter: 8,
    title: "Area Bounded by Curves",
    explore:
      "Shade the region inside a circle, an ellipse, or a parabola up to a chosen line. Read the integral, its antiderivative, and the value, then compare it with πa², πab, or 8a²/3.",
    Component: lazy(() => import("./sims/integrals")),
  },
  {
    id: "matrices",
    classId: 12,
    subject: "maths",
    chapter: 3,
    title: "Matrix Multiplication",
    explore:
      "Click a cell of C = AB. That entry is the dot product of a row of A with a column of B. Then see the same rule rotate a shape and total a shop’s cost.",
    Component: lazy(() => import("./sims/matrices")),
  },
  {
    id: "vector-resolution",
    classId: 12,
    subject: "maths",
    chapter: 10,
    title: "Resolving a Vector in 3D",
    explore:
      "A vector ai + bj + ck has magnitude √(a²+b²+c²). Its direction cosines are a/r, b/r and c/r, and they satisfy l² + m² + n² = 1.",
    Component: lazy(() => import("./sims/vector-resolution")),
  },
  {
    id: "lines-3d",
    classId: 12,
    subject: "maths",
    chapter: 11,
    title: "Lines in Three Dimensions",
    explore:
      "Drag to orbit the scene. Read direction cosines, the line through two points, the line r = a + λv, and the acute angle between two lines.",
    Component: lazy(() => import("./sims/lines3d")),
  },
];

export function getSim(id: string | undefined): SimEntry | undefined {
  return SIMS.find((s) => s.id === id);
}

export function simsFor(classId: number, subject: string, chapter?: number): SimEntry[] {
  return SIMS.filter(
    (s) =>
      s.classId === classId &&
      s.subject === subject &&
      (chapter === undefined || s.chapter === chapter),
  );
}

export function simCountForClass(classId: number): number {
  return SIMS.filter((s) => s.classId === classId).length;
}

export function searchSims(query: string): SimEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return SIMS.filter((s) => {
    const hay = `${s.title} ${s.explore} class ${s.classId} chapter ${s.chapter} ${s.subject}`.toLowerCase();
    return hay.includes(q);
  });
}
