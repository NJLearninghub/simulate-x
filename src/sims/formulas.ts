/** NCERT formulas shared by the chapter simulations. Plain numbers, checked in scripts/check-gaps.mts. */

export const R = 8.314;

export function num(value: number, digits = 2) {
  if (!Number.isFinite(value)) return "—";
  const sign = value < 0 ? "−" : "";
  const fixed = Math.abs(value).toFixed(digits);
  const text = digits === 0 ? fixed : fixed.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
  return sign + (text || "0");
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function vernier(lengthCm: number, divisions = 10) {
  const msd = 0.1;
  const lc = msd / divisions;
  const snapped = Math.round(lengthCm / lc) * lc;
  const mainSteps = Math.floor(snapped / msd + 1e-8);
  const main = mainSteps * msd;
  let coinciding = Math.round((snapped - main) / lc);
  if (coinciding >= divisions) coinciding = 0;
  return { lc, msd, main, coinciding, reading: main + coinciding * lc };
}

export function work(force: number, displacement: number, degrees: number) {
  const radians = (degrees * Math.PI) / 180;
  return force * displacement * Math.cos(radians);
}

export function youngExtension(force: number, length: number, radius: number, modulus: number) {
  const area = Math.PI * radius * radius;
  const extension = (force * length) / (area * modulus);
  const stress = force / area;
  const strain = extension / length;
  return { area, extension, stress, strain };
}

export function expandedLength(length0: number, alpha: number, deltaT: number) {
  return length0 * (1 + alpha * deltaT);
}

export type Process = "isothermal" | "isobaric" | "isochoric" | "adiabatic";

/** First law as in NCERT: ΔU = Q − W, with W the work done by the gas. One mole unless n is set. */
export function thermo(process: Process, V1: number, V2: number, T1: number, gamma = 1.4, n = 1, tEnd = T1) {
  const Cv = R / (gamma - 1);
  const Cp = Cv + R;
  if (process === "isochoric") {
    const T2 = tEnd;
    const P1 = (n * R * T1) / V1;
    const P2 = (n * R * T2) / V1;
    const W = 0;
    const dU = n * Cv * (T2 - T1);
    return { T2, P1, P2, V2: V1, W, dU, Q: dU, Cv, Cp };
  }
  if (process === "isothermal") {
    const T2 = T1;
    const P1 = (n * R * T1) / V1;
    const P2 = (n * R * T2) / V2;
    const W = n * R * T1 * Math.log(V2 / V1);
    return { T2, P1, P2, V2, W, dU: 0, Q: W, Cv, Cp };
  }
  if (process === "isobaric") {
    const P1 = (n * R * T1) / V1;
    const T2 = (P1 * V2) / (n * R);
    const W = P1 * (V2 - V1);
    const dU = n * Cv * (T2 - T1);
    return { T2, P1, P2: P1, V2, W, dU, Q: n * Cp * (T2 - T1), Cv, Cp };
  }
  const T2 = T1 * Math.pow(V1 / V2, gamma - 1);
  const P1 = (n * R * T1) / V1;
  const P2 = (n * R * T2) / V2;
  const dU = n * Cv * (T2 - T1);
  return { T2, P1, P2, V2, W: -dU, dU, Q: 0, Cv, Cp };
}

export function speeds(temperature: number, molarMass: number) {
  const vrms = Math.sqrt((3 * R * temperature) / molarMass);
  const vavg = Math.sqrt((8 * R * temperature) / (Math.PI * molarMass));
  const vmp = Math.sqrt((2 * R * temperature) / molarMass);
  return { vrms, vavg, vmp };
}

export function maxwell(speed: number, temperature: number, molarMass: number) {
  const factor = molarMass / (2 * Math.PI * R * temperature);
  return 4 * Math.PI * speed * speed * Math.pow(factor, 1.5) * Math.exp((-molarMass * speed * speed) / (2 * R * temperature));
}

export type Optic = "mirror" | "lens";

/** NCERT sign convention: incident light travels toward +x, object distance u is negative. */
export function locateImage(kind: Optic, u: number, f: number) {
  const inv = kind === "mirror" ? 1 / f - 1 / u : 1 / f + 1 / u;
  if (!Number.isFinite(inv) || Math.abs(inv) < 1e-6) {
    return { v: Number.POSITIVE_INFINITY, m: Number.NaN };
  }
  const v = 1 / inv;
  const m = kind === "mirror" ? -v / u : v / u;
  return { v, m };
}

export function imageNature(kind: Optic, v: number, m: number) {
  if (!Number.isFinite(v)) return { real: false, inverted: false, atInfinity: true };
  const real = kind === "mirror" ? v < 0 : v > 0;
  return { real, inverted: m < 0, atInfinity: false };
}

export function fringeSpacing(lambda: number, distance: number, separation: number) {
  return (lambda * distance) / separation;
}

export function factorial(n: number) {
  let value = 1;
  for (let i = 2; i <= n; i++) value *= i;
  return value;
}

export function nPr(n: number, r: number) {
  if (r < 0 || r > n) return 0;
  return factorial(n) / factorial(n - r);
}

export function nCr(n: number, r: number) {
  if (r < 0 || r > n) return 0;
  return factorial(n) / (factorial(r) * factorial(n - r));
}

export function binomialRow(n: number) {
  const row = [1];
  for (let k = 1; k <= n; k++) row.push((row[k - 1] * (n - k + 1)) / k);
  return row;
}

export function apTerm(first: number, difference: number, n: number) {
  return first + (n - 1) * difference;
}

export function apSum(first: number, difference: number, n: number) {
  return (n / 2) * (2 * first + (n - 1) * difference);
}

export function gpTerm(first: number, ratio: number, n: number) {
  return first * Math.pow(ratio, n - 1);
}

export function gpSum(first: number, ratio: number, n: number) {
  if (Math.abs(ratio - 1) < 1e-9) return n * first;
  return (first * (Math.pow(ratio, n) - 1)) / (ratio - 1);
}

export function lineThrough(x1: number, y1: number, x2: number, y2: number) {
  const a = y1 - y2;
  const b = x2 - x1;
  const c = x1 * y2 - x2 * y1;
  const vertical = Math.abs(x2 - x1) < 1e-9;
  const slope = vertical ? null : (y2 - y1) / (x2 - x1);
  return { a, b, c, slope };
}

export function pointLineDistance(a: number, b: number, c: number, x: number, y: number) {
  return Math.abs(a * x + b * y + c) / Math.hypot(a, b);
}

export function conicPoint(eccentricity: number, a: number, t: number) {
  if (eccentricity <= 0.02) {
    return { x: a * Math.cos(t), y: a * Math.sin(t), focusX: 0, directrix: null as number | null };
  }
  if (eccentricity < 0.98) {
    const b = a * Math.sqrt(1 - eccentricity * eccentricity);
    return { x: a * Math.cos(t), y: b * Math.sin(t), focusX: a * eccentricity, directrix: a / eccentricity };
  }
  if (eccentricity < 1.05) {
    const y = t;
    return { x: (y * y) / (4 * a), y, focusX: a, directrix: -a };
  }
  const b = a * Math.sqrt(eccentricity * eccentricity - 1);
  return { x: a / Math.cos(t), y: b * Math.tan(t), focusX: a * eccentricity, directrix: a / eccentricity };
}

export function dist3(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

/** Point dividing the join of A and B in the ratio m:n (AM:MB = m:n). */
export function section(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }, m: number, n: number) {
  const d = m + n;
  return { x: (m * b.x + n * a.x) / d, y: (m * b.y + n * a.y) / d, z: (m * b.z + n * a.z) / d };
}

export function secantSlope(f: (x: number) => number, a: number, h: number) {
  return (f(a + h) - f(a)) / h;
}

export function meanOf(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function sdOf(values: number[]) {
  const mean = meanOf(values);
  return Math.sqrt(values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length);
}

export function det2(x1: number, y1: number, x2: number, y2: number) {
  return x1 * y2 - x2 * y1;
}

export function riemann(f: (x: number) => number, a: number, b: number, n: number, side: "left" | "right" | "mid") {
  const dx = (b - a) / n;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const x = side === "left" ? a + i * dx : side === "right" ? a + (i + 1) * dx : a + (i + 0.5) * dx;
    sum += f(x) * dx;
  }
  return sum;
}

export function euler(f: (x: number, y: number) => number, x0: number, y0: number, x1: number, h: number) {
  const steps = Math.max(1, Math.ceil(Math.abs(x1 - x0) / h));
  const step = (x1 - x0) / steps;
  const points = [{ x: x0, y: y0 }];
  let x = x0;
  let y = y0;
  for (let i = 0; i < steps; i++) {
    const slope = f(x, y);
    if (!Number.isFinite(slope)) break;
    y += step * slope;
    x += step;
    points.push({ x, y });
  }
  return points;
}

export const LP_CORNERS = [
  { x: 0, y: 2 },
  { x: 0, y: 5 },
  { x: 1, y: 5 },
  { x: 4, y: 2 },
  { x: 4, y: 0 },
  { x: 2, y: 0 },
];

export function insidePolygon(x: number, y: number, poly = LP_CORNERS) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x;
    const yi = poly[i].y;
    const xj = poly[j].x;
    const yj = poly[j].y;
    const hit = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (hit) inside = !inside;
  }
  return inside;
}

export function clampToPolygon(x: number, y: number, poly = LP_CORNERS) {
  if (insidePolygon(x, y, poly)) return { x, y };
  let best = poly[0];
  let bestD = Infinity;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const t = clamp(((x - a.x) * dx + (y - a.y) * dy) / (dx * dx + dy * dy || 1), 0, 1);
    const px = a.x + t * dx;
    const py = a.y + t * dy;
    const d = (px - x) ** 2 + (py - y) ** 2;
    if (d < bestD) {
      bestD = d;
      best = { x: px, y: py };
    }
  }
  return best;
}

export function bestCorner(cx: number, cy: number, mode: "max" | "min") {
  let point = LP_CORNERS[0];
  let z = cx * point.x + cy * point.y;
  for (const corner of LP_CORNERS) {
    const value = cx * corner.x + cy * corner.y;
    if (mode === "max" ? value > z + 1e-9 : value < z - 1e-9) {
      point = corner;
      z = value;
    }
  }
  return { point, z };
}

export function bayes(redA: number, blueA: number, redB: number, blueB: number, color: "red" | "blue") {
  const likeA = (color === "red" ? redA : blueA) / (redA + blueA);
  const likeB = (color === "red" ? redB : blueB) / (redB + blueB);
  const evidence = 0.5 * likeA + 0.5 * likeB;
  if (evidence <= 0) return { evidence, postA: Number.NaN, postB: Number.NaN, likeA, likeB };
  return { evidence, postA: (0.5 * likeA) / evidence, postB: (0.5 * likeB) / evidence, likeA, likeB };
}
