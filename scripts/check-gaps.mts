import { CHAPTERS } from "../src/chapters.ts";
import { SIMS } from "../src/catalog.ts";
import {
  LP_CORNERS,
  apTerm,
  bayes,
  bestCorner,
  binomialRow,
  conicPoint,
  det2,
  dist3,
  euler,
  expandedLength,
  fringeSpacing,
  gpTerm,
  imageNature,
  locateImage,
  maxwell,
  meanOf,
  nCr,
  nPr,
  pointLineDistance,
  riemann,
  sdOf,
  secantSlope,
  section,
  speeds,
  thermo,
  vernier,
  work,
  youngExtension,
  lineThrough,
  num,
} from "../src/sims/formulas.ts";

function check(name: string, ok: boolean, detail = "") {
  if (!ok) {
    console.error("FAIL", name, detail);
    process.exitCode = 1;
  }
}

const gaps = CHAPTERS.filter(
  (chapter) =>
    (chapter.classId === 11 || chapter.classId === 12) &&
    (chapter.subject === "physics" || chapter.subject === "maths") &&
    !SIMS.some((sim) => sim.classId === chapter.classId && sim.subject === chapter.subject && sim.chapter === chapter.number),
);
console.log("uncovered", gaps.map((chapter) => `${chapter.classId} ${chapter.subject} ${chapter.number} ${chapter.name}`).join("\n") || "none");
check("coverage", gaps.length === 0, String(gaps.length));

const v = vernier(2.36, 10);
check("vernier", Math.abs(v.reading - 2.36) < 1e-9 && v.coinciding === 6, JSON.stringify(v));
check("work60", Math.abs(work(10, 2, 60) - 10) < 1e-9);
check("work90", Math.abs(work(10, 2, 90)) < 1e-9);

const wire = youngExtension(49, 1.5, 0.0004, 2e11);
const thick = youngExtension(49, 1.5, 0.0008, 2e11);
check("young quarter", Math.abs(thick.extension * 4 - wire.extension) / wire.extension < 1e-9);
check("stress independent of L", Math.abs(youngExtension(49, 3, 0.0004, 2e11).stress - wire.stress) < 1);

const hot = expandedLength(1, 1.2e-5, 100);
check("expansion", Math.abs(hot - 1.0012) < 1e-12);

const iso = thermo("isothermal", 0.02, 0.04, 300);
check("isothermal dU", Math.abs(iso.dU) < 1e-9 && Math.abs(iso.Q - iso.W) < 1e-6);
check("isothermal W", Math.abs(iso.W - 8.314 * 300 * Math.log(2)) < 1e-6);
const ad = thermo("adiabatic", 0.02, 0.04, 300);
check("adiabatic Q", Math.abs(ad.Q) < 1e-9 && ad.T2 < 300 && Math.abs(ad.W + ad.dU) < 1e-6);
const chor = thermo("isochoric", 0.02, 0.04, 300, 1.4, 1, 400);
check("isochoric", Math.abs(chor.W) < 1e-9 && Math.abs(chor.Q - chor.dU) < 1e-6 && chor.T2 === 400);
const bar = thermo("isobaric", 0.02, 0.04, 300);
check("isobaric", Math.abs(bar.Q - (bar.dU + bar.W)) < 1e-6 && Math.abs(bar.T2 - 600) < 1e-6);

const o2 = speeds(300, 0.032);
check("speed order", o2.vmp < o2.vavg && o2.vavg < o2.vrms);
check("speed ratio", Math.abs(o2.vrms / o2.vmp - Math.sqrt(1.5)) < 1e-9);
check("hot factor", Math.abs(speeds(600, 0.032).vrms / o2.vrms - Math.SQRT2) < 1e-9);
let area = 0;
const vmax = o2.vrms * 12;
const steps = 4000;
const h = vmax / steps;
for (let i = 0; i <= steps; i++) {
  const weight = i === 0 || i === steps ? 1 : i % 2 ? 4 : 2;
  area += weight * maxwell((i * vmax) / steps, 300, 0.032);
}
area *= h / 3;
check("maxwell norm", Math.abs(area - 1) < 1e-3, String(area));

const mirror = locateImage("mirror", -30, -20);
check("concave mirror", Math.abs(mirror.v - -60) < 1e-6 && Math.abs(mirror.m - -2) < 1e-6);
const inside = locateImage("mirror", -10, -20);
const insideNature = imageNature("mirror", inside.v, inside.m);
check("inside focus", inside.v > 0 && !insideNature.real && !insideNature.inverted);
const lens = locateImage("lens", -30, 20);
check("convex lens", Math.abs(lens.v - 60) < 1e-6 && lens.m < 0);
const beta = fringeSpacing(650e-9, 1.2, 0.5e-3);
check("fringe", Math.abs(beta - (650e-9 * 1.2) / 0.5e-3) < 1e-12);

check("nPr", nPr(5, 3) === 60 && nCr(5, 3) === 10 && nPr(4, 4) === 24);
const row = binomialRow(4);
check("pascal", row.join(",") === "1,4,6,4,1" && binomialRow(5).reduce((s, v) => s + v, 0) === 32);
check("ap", apTerm(2, 3, 5) === 14);
check("gp", gpTerm(3, 2, 4) === 24);
const horizontal = lineThrough(0, 2, 4, 2);
check("slope0", horizontal.slope === 0 && Math.abs(pointLineDistance(horizontal.a, horizontal.b, horizontal.c, 1, 5) - 3) < 1e-9);

function ratio(e: number, a: number, t: number) {
  const p = conicPoint(e, a, t);
  if (p.directrix === null) return 0;
  const pf = Math.hypot(p.x - p.focusX, p.y);
  const pm = Math.abs(p.x - p.directrix);
  return pf / pm;
}
check("ellipse e", Math.abs(ratio(0.6, 3, 0.7) - 0.6) < 1e-6);
check("parabola e", Math.abs(ratio(1, 2, 1.5) - 1) < 1e-6);
check("hyperbola e", Math.abs(ratio(1.5, 3, 0.4) - 1.5) < 1e-6);
check("distance 3-2-2", Math.abs(dist3({ x: 3, y: 2, z: 2 }, { x: 0, y: 0, z: 0 }) - Math.sqrt(17)) < 1e-12);
const mid = section({ x: 2, y: 0, z: 0 }, { x: 0, y: 2, z: 0 }, 1, 1);
check("midpoint", mid.x === 1 && mid.y === 1 && mid.z === 0);
check("secant", Math.abs(secantSlope((x) => x * x, 2, 1e-4) - 4) < 1e-3);
const data = [2, 4, 4, 4, 7, 9];
check("shift sd", Math.abs(sdOf(data) - sdOf(data.map((value) => value + 2))) < 1e-12 && Math.abs(meanOf(data.map((v) => v + 2)) - (meanOf(data) + 2)) < 1e-12);
check("riemann", Math.abs(riemann((x) => x * x, 0, 2, 200, "mid") - 8 / 3) < 1e-3);
const curve = euler((_x, y) => y, 0, 1, 1, 0.01);
check("euler", Math.abs(curve[curve.length - 1].y - Math.E) < 0.02);
check("det", det2(1, 0, 0, 1) === 1 && Math.abs(det2(2, 1, 4, 2)) < 1e-12);
const profit = bestCorner(3, 4, "max");
check("lp", profit.point.x === 1 && profit.point.y === 5 && profit.z === 23);
const prior = bayes(3, 1, 1, 3, "red");
check("bayes", prior.postA > prior.postB && Math.abs(prior.postA + prior.postB - 1) < 1e-12);
check("asin", Math.abs(Math.asin(0.5) - Math.PI / 6) < 1e-12);
check("corners feasible", LP_CORNERS.every((corner) => corner.x + corner.y >= 2 - 1e-9 && corner.x + corner.y <= 6 + 1e-9 && corner.x <= 4 && corner.y <= 5));

check("num keeps trailing zeros in the integer", num(650, 0) === "650" && num(300, 0) === "300" && num(2.4, 2) === "2.4" && num(-20, 0) === "−20");

if (!process.exitCode) console.log("all formula checks passed");
