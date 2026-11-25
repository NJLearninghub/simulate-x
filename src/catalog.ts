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
  {
    id: "vernier-caliper",
    classId: 11,
    subject: "physics",
    chapter: 1,
    title: "Vernier Caliper",
    explore:
      "Drag the movable jaw and read the division that lines up. The least count is the absolute error, so a longer object has a smaller relative error.",
    Component: lazy(() => import("./sims/units")),
  },
  {
    id: "work-energy-power",
    classId: 11,
    subject: "physics",
    chapter: 5,
    title: "Work, Energy and Power",
    explore:
      "Turn the force arrow and slide the block. Work is Fs cos θ, so a perpendicular force does none, and the work that is done becomes kinetic energy.",
    Component: lazy(() => import("./sims/work-energy")),
  },
  {
    id: "youngs-modulus",
    classId: 11,
    subject: "physics",
    chapter: 8,
    title: "Young’s Modulus",
    explore:
      "Hang a load on a metal wire and drag its thickness. Stress is force per area, strain is the fractional stretch, and their ratio is Young’s modulus.",
    Component: lazy(() => import("./sims/solids")),
  },
  {
    id: "thermal-expansion",
    classId: 11,
    subject: "physics",
    chapter: 10,
    title: "Thermal Expansion",
    explore:
      "Drag the thermometer. A rod grows by L₀αΔT, and the hole in a plate grows by the same factor. Aluminium expands more than steel.",
    Component: lazy(() => import("./sims/thermal")),
  },
  {
    id: "thermodynamic-processes",
    classId: 11,
    subject: "physics",
    chapter: 11,
    title: "Thermodynamic Processes",
    explore:
      "Drag the piston on a P–V diagram. Compare isothermal, isobaric, isochoric and adiabatic paths, and check ΔU = Q − W.",
    Component: lazy(() => import("./sims/thermo")),
  },
  {
    id: "maxwell-distribution",
    classId: 11,
    subject: "physics",
    chapter: 12,
    title: "Maxwell Speed Distribution",
    explore:
      "Drag the temperature and switch the gas. Most probable, average and rms speeds stay in that order, and they scale with the square root of T/M.",
    Component: lazy(() => import("./sims/kinetic")),
  },
  {
    id: "ray-diagrams",
    classId: 12,
    subject: "physics",
    chapter: 9,
    title: "Ray Diagrams",
    explore:
      "Drag the object and the focus for a mirror or a lens. The signed formula 1/v ± 1/u = 1/f tells you whether the image is real or virtual.",
    Component: lazy(() => import("./sims/ray-optics")),
  },
  {
    id: "youngs-double-slit",
    classId: 12,
    subject: "physics",
    chapter: 10,
    title: "Young’s Double Slit",
    explore:
      "Drag the slits, the colour and a point on the screen. Fringe width is λD/d, and a path difference of λ/2 is a dark band.",
    Component: lazy(() => import("./sims/young")),
  },
  {
    id: "venn-sets",
    classId: 11,
    subject: "maths",
    chapter: 1,
    title: "Sets and Venn Diagrams",
    explore:
      "Drag numbers into the circles. The overlap is counted twice if you add n(A) and n(B), so n(A ∪ B) subtracts it once.",
    Component: lazy(() => import("./sims/sets")),
  },
  {
    id: "arrow-diagrams",
    classId: 11,
    subject: "maths",
    chapter: 2,
    title: "Relations and Functions",
    explore:
      "Drag arrows from each input to an output. A function needs exactly one arrow per input. One-one and onto means a perfect matching.",
    Component: lazy(() => import("./sims/relations")),
  },
  {
    id: "argand-plane",
    classId: 11,
    subject: "maths",
    chapter: 4,
    title: "Argand Plane",
    explore:
      "Drag z = x + iy. The modulus is its distance from the origin, the conjugate is its mirror image, and multiplying by i turns it by 90°.",
    Component: lazy(() => import("./sims/argand")),
  },
  {
    id: "linear-half-plane",
    classId: 11,
    subject: "maths",
    chapter: 5,
    title: "Linear Inequalities",
    explore:
      "Drag the boundary and a test point. One side of x + y = c satisfies the inequality; the origin is the quickest point to check.",
    Component: lazy(() => import("./sims/inequalities")),
  },
  {
    id: "permutations-combinations",
    classId: 11,
    subject: "maths",
    chapter: 6,
    title: "Permutations and Combinations",
    explore:
      "Drag people into seats. Arrangements count order, so there are nPr of them. A committee ignores order, so divide by r!.",
    Component: lazy(() => import("./sims/permutations")),
  },
  {
    id: "binomial-expansion",
    classId: 11,
    subject: "maths",
    chapter: 7,
    title: "Binomial Theorem",
    explore:
      "Drag n and watch Pascal’s row. The bars are the terms of (a + b)ⁿ, and they add up to (a + b)ⁿ exactly.",
    Component: lazy(() => import("./sims/binomial")),
  },
  {
    id: "sequences-series",
    classId: 11,
    subject: "maths",
    chapter: 8,
    title: "Sequences and Series",
    explore:
      "Drag the first two bars to set an AP or a GP. The nth term and the sum update from the closed formulas, not from adding by hand.",
    Component: lazy(() => import("./sims/sequences")),
  },
  {
    id: "straight-line",
    classId: 11,
    subject: "maths",
    chapter: 9,
    title: "Straight Lines",
    explore:
      "Drag two points to fix a line and a third point to measure the perpendicular distance. A horizontal line has slope 0; a vertical line has none.",
    Component: lazy(() => import("./sims/straight-lines")),
  },
  {
    id: "conic-sections",
    classId: 11,
    subject: "maths",
    chapter: 10,
    title: "Conic Sections",
    explore:
      "Drag the eccentricity through 1. A circle, ellipse, parabola and hyperbola are the same rule: distance to the focus over distance to the directrix.",
    Component: lazy(() => import("./sims/conics")),
  },
  {
    id: "points-in-space",
    classId: 11,
    subject: "maths",
    chapter: 11,
    title: "Points in Space",
    explore:
      "Drag two points and the height of one of them. Distance is √(Δx² + Δy² + Δz²), and a ratio m:n marks the section point.",
    Component: lazy(() => import("./sims/intro-3d")),
  },
  {
    id: "secant-to-tangent",
    classId: 11,
    subject: "maths",
    chapter: 12,
    title: "Limits and Derivatives",
    explore:
      "Drag the second point toward the first. The secant slope of x² at x = 2 approaches 4, which is the derivative.",
    Component: lazy(() => import("./sims/limits")),
  },
  {
    id: "mean-and-spread",
    classId: 11,
    subject: "maths",
    chapter: 13,
    title: "Mean and Standard Deviation",
    explore:
      "Drag the data points. The mean is their balance point. Adding 2 to every value moves the mean and leaves the standard deviation alone.",
    Component: lazy(() => import("./sims/statistics")),
  },
  {
    id: "two-dice",
    classId: 11,
    subject: "maths",
    chapter: 14,
    title: "Classical Probability",
    explore:
      "Paint outcomes on the 6×6 board of two dice. Probability is the number you painted divided by 36. Sum 7 has six cells.",
    Component: lazy(() => import("./sims/probability-11")),
  },
  {
    id: "inverse-and-composition",
    classId: 12,
    subject: "maths",
    chapter: 1,
    title: "Inverse and Composition",
    explore:
      "Drag x along f(x) = 2x + 3 and its reflection in y = x. Then compose with x² and see that f∘g and g∘f disagree.",
    Component: lazy(() => import("./sims/functions-12")),
  },
  {
    id: "inverse-sine",
    classId: 12,
    subject: "maths",
    chapter: 2,
    title: "Inverse Trigonometric Functions",
    explore:
      "Drag the angle on the principal arc. sin⁻¹(1/2) is 30°, and sin⁻¹ x + cos⁻¹ x stays 90° wherever you stop.",
    Component: lazy(() => import("./sims/inverse-trig")),
  },
  {
    id: "parallelogram-area",
    classId: 12,
    subject: "maths",
    chapter: 4,
    title: "Determinants as Area",
    explore:
      "Drag two vectors. The determinant is the signed area of their parallelogram. Parallel vectors give 0, and swapping them flips the sign.",
    Component: lazy(() => import("./sims/determinants")),
  },
  {
    id: "riemann-sums",
    classId: 12,
    subject: "maths",
    chapter: 7,
    title: "Riemann Sums",
    explore:
      "Drag the number of slices and the upper limit. The right sum for x² from 0 to 2 sits above 8/3 and closes in as the slices thin.",
    Component: lazy(() => import("./sims/riemann")),
  },
  {
    id: "slope-field",
    classId: 12,
    subject: "maths",
    chapter: 9,
    title: "Slope Fields",
    explore:
      "Drag a starting point through a field of slopes. dy/dx = y grows like eˣ, dy/dx = 2x follows a parabola, and dy/dx = −x/y stays on a circle.",
    Component: lazy(() => import("./sims/differential")),
  },
  {
    id: "feasible-region",
    classId: 12,
    subject: "maths",
    chapter: 12,
    title: "Linear Programming",
    explore:
      "Drag a point inside the feasible polygon. 3x + 4y is largest at a corner, and an interior point never beats that vertex.",
    Component: lazy(() => import("./sims/linear-programming")),
  },
  {
    id: "bayes-bags",
    classId: 12,
    subject: "maths",
    chapter: 13,
    title: "Bayes’ Theorem",
    explore:
      "Drag red and blue balls between two bags, then say which colour you drew. The bag with more of that colour becomes the more likely source.",
    Component: lazy(() => import("./sims/bayes")),
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
