import { useEffect, useId, useMemo, useState, type ReactNode } from "react";

type Curve = "circle" | "ellipse" | "parabola";
type Opening = "right" | "up";

const CURVES: { id: Curve; label: string }[] = [
  { id: "circle", label: "Circle" },
  { id: "ellipse", label: "Ellipse" },
  { id: "parabola", label: "Parabola" },
];

/** Area of x² + y² = a² between x = −t and x = t. Equals πa² when t = a. */
export function circlePartial(a: number, t: number) {
  const x = clamp(t, 0, a);
  if (a <= 0) return 0;
  return 2 * (x * Math.sqrt(Math.max(0, a * a - x * x)) + a * a * Math.asin(x / a));
}

/** Area of the ellipse between x = −t and x = t. Equals πab when t = a. */
export function ellipsePartial(a: number, b: number, t: number) {
  const x = clamp(t, 0, a);
  if (a <= 0) return 0;
  return (2 * b / a) * (x * Math.sqrt(Math.max(0, a * a - x * x)) + a * a * Math.asin(x / a));
}

/** Area inside y² = 4ax (or x² = 4ay) from the vertex out to c. Latus rectum is c = a, area 8a²/3. */
export function parabolaPartial(a: number, c: number) {
  if (a <= 0 || c <= 0) return 0;
  return (8 / 3) * Math.sqrt(a) * Math.pow(c, 1.5);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function num(value: number, digits = 3) {
  if (!Number.isFinite(value)) return "—";
  const text = value.toFixed(digits);
  return text.replace(/\.?0+$/, "") || "0";
}

function simpson(f: (x: number) => number, lo: number, hi: number, n = 800) {
  const steps = n % 2 === 0 ? n : n + 1;
  const h = (hi - lo) / steps;
  let sum = f(lo) + f(hi);
  for (let i = 1; i < steps; i++) {
    sum += (i % 2 === 0 ? 2 : 4) * f(lo + i * h);
  }
  return (sum * h) / 3;
}

export default function AreaBoundedByCurves() {
  const [curve, setCurve] = useState<Curve>("circle");
  const [radius, setRadius] = useState(3);
  const [semiMajor, setSemiMajor] = useState(4);
  const [semiMinor, setSemiMinor] = useState(2);
  const [focal, setFocal] = useState(1);
  const [opening, setOpening] = useState<Opening>("right");
  const [reach, setReach] = useState(3);
  const [showStrips, setShowStrips] = useState(true);
  const [playing, setPlaying] = useState(false);
  const titleId = useId();

  const limitMax = curve === "circle" ? radius : curve === "ellipse" ? semiMajor : 6;
  const limit = clamp(reach, 0, limitMax);

  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      setReach((current) => {
        const next = current + limitMax * dt * 0.45;
        if (next >= limitMax) {
          setPlaying(false);
          return limitMax;
        }
        return next;
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, limitMax]);

  const exact = useMemo(() => {
    if (curve === "circle") return circlePartial(radius, limit);
    if (curve === "ellipse") return ellipsePartial(semiMajor, semiMinor, limit);
    return parabolaPartial(focal, limit);
  }, [curve, radius, semiMajor, semiMinor, focal, limit]);

  const numeric = useMemo(() => {
    if (curve === "circle") {
      return 4 * simpson((t) => Math.sqrt(Math.max(0, radius * radius - t * t)), 0, limit);
    }
    if (curve === "ellipse") {
      return 4 * simpson((t) => (semiMinor / semiMajor) * Math.sqrt(Math.max(0, semiMajor * semiMajor - t * t)), 0, limit);
    }
    return 4 * Math.sqrt(focal) * simpson((t) => Math.sqrt(Math.max(0, t)), 0, limit);
  }, [curve, radius, semiMajor, semiMinor, focal, limit]);

  const full = curve === "circle"
    ? Math.PI * radius * radius
    : curve === "ellipse"
      ? Math.PI * semiMajor * semiMinor
      : parabolaPartial(focal, focal);

  return (
    <div className="flex flex-col gap-3 bg-[var(--surface)] p-3 text-[var(--text)] sm:p-4">
      <div className="grid grid-cols-3 gap-1 rounded-xl bg-[var(--surface-3)] p-1" role="tablist" aria-labelledby={titleId}>
        {CURVES.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={curve === item.id}
            onClick={() => {
              setCurve(item.id);
              setPlaying(false);
              setReach(item.id === "parabola" ? 1 : item.id === "ellipse" ? 4 : 3);
            }}
            className={`min-h-11 rounded-lg px-1 text-sm font-semibold ${curve === item.id ? "bg-[var(--primary)] text-white" : "text-[var(--text-muted)]"}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]" aria-label="Graph">
        <Graph
          curve={curve}
          opening={opening}
          radius={radius}
          semiMajor={semiMajor}
          semiMinor={semiMinor}
          focal={focal}
          limit={limit}
          showStrips={showStrips}
        />
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
        {curve === "circle" && (
          <Slider label="Radius a" value={radius} min={1} max={5} step={0.1} onChange={(value) => { setRadius(value); setReach((current) => Math.min(current, value)); }} display={num(radius, 1)} />
        )}
        {curve === "ellipse" && (
          <>
            <Slider label="Semi-axis a" value={semiMajor} min={2} max={6} step={0.1} onChange={(value) => { setSemiMajor(value); setReach((current) => Math.min(current, value)); }} display={num(semiMajor, 1)} />
            <Slider label="Semi-axis b" value={semiMinor} min={1} max={5} step={0.1} onChange={setSemiMinor} display={num(semiMinor, 1)} />
          </>
        )}
        {curve === "parabola" && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setOpening("right")} className={`min-h-11 rounded-lg border text-sm font-semibold ${opening === "right" ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]" : "border-[var(--border)]"}`}>y² = 4ax</button>
              <button type="button" onClick={() => setOpening("up")} className={`min-h-11 rounded-lg border text-sm font-semibold ${opening === "up" ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]" : "border-[var(--border)]"}`}>x² = 4ay</button>
            </div>
            <Slider label="Parameter a" value={focal} min={0.5} max={3} step={0.1} onChange={setFocal} display={num(focal, 1)} />
          </>
        )}
        <Slider
          label={curve === "parabola" ? (opening === "right" ? "Line x = c" : "Line y = c") : "Upper limit x"}
          value={limit}
          min={0}
          max={limitMax}
          step={0.01}
          onChange={(value) => { setPlaying(false); setReach(value); }}
          display={num(limit, 2)}
        />
        <div className="flex flex-wrap gap-2">
          <button type="button" className="min-h-11 flex-1 rounded-lg bg-[var(--primary)] px-3 text-sm font-semibold text-white" onClick={() => setPlaying((on) => !on)}>
            {playing ? "Pause sweep" : "Sweep the limit"}
          </button>
          {curve === "parabola" && (
            <button type="button" className="min-h-11 flex-1 rounded-lg border border-[var(--border)] px-3 text-sm font-semibold" onClick={() => { setPlaying(false); setReach(focal); }}>
              Latus rectum
            </button>
          )}
        </div>
        <label className="flex min-h-11 items-center justify-between gap-3 text-sm font-semibold">
          Show area strips
          <input type="checkbox" className="h-5 w-5" checked={showStrips} onChange={(event) => setShowStrips(event.target.checked)} />
        </label>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4" aria-label="Live calculus">
        <h2 id={titleId} className="font-display text-base font-bold">Live calculus</h2>
        <Formula curve={curve} opening={opening} radius={radius} semiMajor={semiMajor} semiMinor={semiMinor} focal={focal} limit={limit} area={exact} full={full} />
        <p className="text-xs text-[var(--text-soft)]">
          Simpson check {num(numeric, 4)} square units. Difference {num(Math.abs(exact - numeric), 4)}.
        </p>
      </section>

      <details className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]">
        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold">How this area is found</summary>
        <div className="space-y-2 px-4 pb-4 text-sm leading-relaxed text-[var(--text-muted)]">
          {curve === "circle" && <p>The circle is symmetric in all four quadrants, so its area is four times the first-quadrant integral. At the full radius that is πa².</p>}
          {curve === "ellipse" && <p>The ellipse uses the same symmetry. Stretching the circle’s vertical scale by b/a changes πa² into πab.</p>}
          {curve === "parabola" && <p>The shaded area lies between the two branches, out to the chosen line. The latus rectum is the line through the focus: x = a for y² = 4ax, and y = a for x² = 4ay. Its area is 8a²/3.</p>}
        </div>
      </details>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between text-sm font-semibold text-[var(--text-muted)]">
        {label}
        <span className="font-mono text-[var(--text)]">{display}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={clamp(value, min, max)}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full"
        style={{ height: 44 }}
      />
    </label>
  );
}

function Formula({
  curve,
  opening,
  radius,
  semiMajor,
  semiMinor,
  focal,
  limit,
  area,
  full,
}: {
  curve: Curve;
  opening: Opening;
  radius: number;
  semiMajor: number;
  semiMinor: number;
  focal: number;
  limit: number;
  area: number;
  full: number;
}) {
  return (
    <div className="space-y-3 text-sm leading-relaxed">
      <Block title="Curve">
        {curve === "circle" && <span>x² + y² = a², a = {num(radius, 1)}</span>}
        {curve === "ellipse" && <span>x²/a² + y²/b² = 1, a = {num(semiMajor, 1)}, b = {num(semiMinor, 1)}</span>}
        {curve === "parabola" && opening === "right" && <span>y² = 4ax, a = {num(focal, 1)}</span>}
        {curve === "parabola" && opening === "up" && <span>x² = 4ay, a = {num(focal, 1)}</span>}
      </Block>
      <Block title="Integral">
        {curve === "circle" && <span>A = 4 <IntegralSign from="0" to={num(limit, 2)} /> √(a² − t²) dt</span>}
        {curve === "ellipse" && <span>A = 4 <IntegralSign from="0" to={num(limit, 2)} /> (b/a) √(a² − t²) dt</span>}
        {curve === "parabola" && opening === "right" && <span>A = <IntegralSign from="0" to={num(limit, 2)} /> 4 √(a x) dx</span>}
        {curve === "parabola" && opening === "up" && <span>A = <IntegralSign from="0" to={num(limit, 2)} /> 4 √(a y) dy</span>}
      </Block>
      <Block title="Antiderivative">
        {curve === "circle" && <span>2 [ x √(a² − x²) + a² sin⁻¹(x/a) ]</span>}
        {curve === "ellipse" && <span>(2b/a) [ x √(a² − x²) + a² sin⁻¹(x/a) ]</span>}
        {curve === "parabola" && <span>(8/3) √a · c<sup>3/2</sup></span>}
      </Block>
      <Block title="Value at this limit">
        <strong className="font-mono text-base">{num(area, 3)}</strong>
        <span> square units</span>
      </Block>
      <Block title="Full standard area">
        {curve === "circle" && <span>πa² = {num(full, 3)}</span>}
        {curve === "ellipse" && <span>πab = {num(full, 3)}</span>}
        {curve === "parabola" && <span>Latus rectum, c = a: 8a²/3 = {num(full, 3)}. Up to this line: (8/3) √a · c<sup>3/2</sup> = {num(parabolaPartial(focal, limit), 3)}.</span>}
      </Block>
    </div>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-wide text-[var(--text-soft)]">{title}</div>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function IntegralSign({ from, to }: { from: string; to: string }) {
  return (
    <span className="mx-0.5 inline-flex flex-col items-center align-middle leading-none">
      <span className="text-[0.72em]">{to}</span>
      <span className="text-lg leading-none">∫</span>
      <span className="text-[0.72em]">{from}</span>
    </span>
  );
}

function Graph({
  curve,
  opening,
  radius,
  semiMajor,
  semiMinor,
  focal,
  limit,
  showStrips,
}: {
  curve: Curve;
  opening: Opening;
  radius: number;
  semiMajor: number;
  semiMinor: number;
  focal: number;
  limit: number;
  showStrips: boolean;
}) {
  const width = 420;
  const height = 320;
  const pad = 28;
  const active = Math.max(limit, 0.4);
  let xMin: number;
  let xMax: number;
  let yMin: number;
  let yMax: number;
  if (curve === "parabola" && opening === "right") {
    xMax = active * 1.22;
    xMin = -xMax * 0.22;
    const yReach = 2 * Math.sqrt(focal * xMax) * 1.15;
    yMin = -yReach;
    yMax = yReach;
  } else if (curve === "parabola") {
    yMax = active * 1.22;
    yMin = -yMax * 0.22;
    const xReach = 2 * Math.sqrt(focal * yMax) * 1.15;
    xMin = -xReach;
    xMax = xReach;
  } else {
    const reach = (curve === "circle" ? radius : Math.max(semiMajor, semiMinor)) * 1.28;
    xMin = -reach;
    xMax = reach;
    yMin = -reach;
    yMax = reach;
  }
  const X = (x: number) => pad + ((x - xMin) / (xMax - xMin)) * (width - 2 * pad);
  const Y = (y: number) => height - pad - ((y - yMin) / (yMax - yMin)) * (height - 2 * pad);

  const verticals: number[] = [];
  for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x++) verticals.push(x);
  const horizontals: number[] = [];
  for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y++) horizontals.push(y);

  const samples = 80;
  const upper: string[] = [];
  const lower: string[] = [];
  if (curve !== "parabola" || opening === "right") {
    const left = curve === "parabola" ? 0 : -limit;
    const right = curve === "parabola" ? limit : limit;
    for (let i = 0; i <= samples; i++) {
      const t = left + ((right - left) * i) / samples;
      const y = curve === "circle"
        ? Math.sqrt(Math.max(0, radius * radius - t * t))
        : curve === "ellipse"
          ? (semiMinor / semiMajor) * Math.sqrt(Math.max(0, semiMajor * semiMajor - t * t))
          : 2 * Math.sqrt(Math.max(0, focal * t));
      upper.push(`${X(t).toFixed(1)},${Y(y).toFixed(1)}`);
      lower.push(`${X(t).toFixed(1)},${Y(-y).toFixed(1)}`);
    }
  }

  const shade = curve === "parabola" && opening === "up"
    ? horizontalShade(limit, focal, samples, X, Y)
    : `${upper.length ? `M ${upper[0]} L ${upper.join(" L ")} L ${[...lower].reverse().join(" L ")} Z` : ""}`;

  const outline = curve === "parabola" && opening === "up"
    ? upParabola(focal, yMax, X, Y)
    : closedOutline(curve, radius, semiMajor, semiMinor, focal, xMax, X, Y);

  const strips = showStrips ? buildStrips(curve, opening, radius, semiMajor, semiMinor, focal, limit, X, Y) : [];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="block h-auto w-full">
      <rect width={width} height={height} fill="var(--surface-2)" />
      {verticals.map((x) => <line key={`v${x}`} x1={X(x)} y1={pad} x2={X(x)} y2={height - pad} stroke="var(--border)" />)}
      {horizontals.map((y) => <line key={`h${y}`} x1={pad} y1={Y(y)} x2={width - pad} y2={Y(y)} stroke="var(--border)" />)}
      <line x1={pad} y1={Y(0)} x2={width - pad} y2={Y(0)} stroke="var(--text-muted)" strokeWidth="1.4" />
      <line x1={X(0)} y1={pad} x2={X(0)} y2={height - pad} stroke="var(--text-muted)" strokeWidth="1.4" />
      {strips.map((strip, index) => <path key={index} d={strip} fill="var(--primary)" opacity="0.16" />)}
      {shade && <path d={shade} fill="var(--primary)" opacity="0.28" />}
      <path d={outline} fill="none" stroke="var(--primary)" strokeWidth="2.4" />
      {curve === "parabola" && opening === "up" ? (
        <line x1={pad} y1={Y(limit)} x2={width - pad} y2={Y(limit)} stroke="var(--text)" strokeDasharray="5 4" />
      ) : (
        <>
          {curve !== "parabola" && <line x1={X(-limit)} y1={pad} x2={X(-limit)} y2={height - pad} stroke="var(--text)" strokeDasharray="5 4" />}
          <line x1={X(limit)} y1={pad} x2={X(limit)} y2={height - pad} stroke="var(--text)" strokeDasharray="5 4" />
        </>
      )}
      <text x={width - pad} y={Y(0) - 6} textAnchor="end" fill="var(--text-muted)" fontSize="12">x</text>
      <text x={X(0) + 6} y={pad + 12} fill="var(--text-muted)" fontSize="12">y</text>
    </svg>
  );
}

function closedOutline(
  curve: Curve,
  radius: number,
  semiMajor: number,
  semiMinor: number,
  focal: number,
  span: number,
  X: (x: number) => number,
  Y: (y: number) => number,
) {
  const pts: string[] = [];
  const n = 120;
  if (curve === "parabola") {
    const top: string[] = [];
    const bottom: string[] = [];
    for (let i = 0; i <= n; i++) {
      const x = (span * i) / n;
      const y = 2 * Math.sqrt(Math.max(0, focal * x));
      top.push(`${X(x).toFixed(1)},${Y(y).toFixed(1)}`);
      bottom.push(`${X(x).toFixed(1)},${Y(-y).toFixed(1)}`);
    }
    return `M ${top.join(" L ")} M ${bottom.join(" L ")}`;
  }
  for (let i = 0; i <= n; i++) {
    const theta = (2 * Math.PI * i) / n;
    const x = curve === "circle" ? radius * Math.cos(theta) : semiMajor * Math.cos(theta);
    const y = curve === "circle" ? radius * Math.sin(theta) : semiMinor * Math.sin(theta);
    pts.push(`${X(x).toFixed(1)},${Y(y).toFixed(1)}`);
  }
  return `M ${pts.join(" L ")} Z`;
}

function upParabola(focal: number, span: number, X: (x: number) => number, Y: (y: number) => number) {
  const right: string[] = [];
  const left: string[] = [];
  for (let i = 0; i <= 80; i++) {
    const y = (span * i) / 80;
    const x = 2 * Math.sqrt(Math.max(0, focal * y));
    right.push(`${X(x).toFixed(1)},${Y(y).toFixed(1)}`);
    left.push(`${X(-x).toFixed(1)},${Y(y).toFixed(1)}`);
  }
  return `M ${right.join(" L ")} M ${left.join(" L ")}`;
}

function horizontalShade(limit: number, focal: number, samples: number, X: (x: number) => number, Y: (y: number) => number) {
  const right: string[] = [];
  const left: string[] = [];
  for (let i = 0; i <= samples; i++) {
    const y = (limit * i) / samples;
    const x = 2 * Math.sqrt(Math.max(0, focal * y));
    right.push(`${X(x).toFixed(1)},${Y(y).toFixed(1)}`);
    left.push(`${X(-x).toFixed(1)},${Y(y).toFixed(1)}`);
  }
  return `M ${right[0]} L ${right.join(" L ")} L ${left.reverse().join(" L ")} Z`;
}

function buildStrips(
  curve: Curve,
  opening: Opening,
  radius: number,
  semiMajor: number,
  semiMinor: number,
  focal: number,
  limit: number,
  X: (x: number) => number,
  Y: (y: number) => number,
) {
  const count = 8;
  const paths: string[] = [];
  if (curve === "parabola" && opening === "up") {
    const step = limit / count;
    for (let i = 0; i < count; i++) {
      const y0 = i * step;
      const y1 = (i + 1) * step;
      const y = (y0 + y1) / 2;
      const x = 2 * Math.sqrt(Math.max(0, focal * y));
      paths.push(`M ${X(-x)} ${Y(y0)} L ${X(x)} ${Y(y0)} L ${X(x)} ${Y(y1)} L ${X(-x)} ${Y(y1)} Z`);
    }
    return paths;
  }
  const left = curve === "parabola" ? 0 : -limit;
  const step = (limit - left) / count;
  for (let i = 0; i < count; i++) {
    const x0 = left + i * step;
    const x1 = left + (i + 1) * step;
    const x = (x0 + x1) / 2;
    const y = curve === "circle"
      ? Math.sqrt(Math.max(0, radius * radius - x * x))
      : curve === "ellipse"
        ? (semiMinor / semiMajor) * Math.sqrt(Math.max(0, semiMajor * semiMajor - x * x))
        : 2 * Math.sqrt(Math.max(0, focal * x));
    paths.push(`M ${X(x0)} ${Y(-y)} L ${X(x1)} ${Y(-y)} L ${X(x1)} ${Y(y)} L ${X(x0)} ${Y(y)} Z`);
  }
  return paths;
}
