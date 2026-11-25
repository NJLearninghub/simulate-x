import { useState } from "react";
import { riemann } from "./formulas";
import { Goal, Handle, Lesson, PlotFrame, Predict, Presets, Readouts, num } from "./lesson";

type FnId = "square" | "sine" | "constant";

const FNS: Record<FnId, { label: string; f: (x: number) => number; exact: (a: number, b: number) => number; a: number; b: number }> = {
  square: { label: "x² from 0 to 2", f: (x) => x * x, exact: (a, b) => (b ** 3 - a ** 3) / 3, a: 0, b: 2 },
  sine: { label: "sin x from 0 to π", f: Math.sin, exact: (a, b) => -Math.cos(b) + Math.cos(a), a: 0, b: Math.PI },
  constant: { label: "constant 3", f: () => 3, exact: (a, b) => 3 * (b - a), a: 0, b: 2 },
};

export default function RiemannSim() {
  const [fn, setFn] = useState<FnId>("square");
  const [n, setN] = useState(6);
  const [b, setB] = useState(FNS.square.b);
  const spec = FNS[fn];
  const a = spec.a;
  const right = riemann(spec.f, a, b, n, "right");
  const left = riemann(spec.f, a, b, n, "left");
  const exact = spec.exact(a, b);
  const dx = (b - a) / n;
  const width = 280;
  const X = (x: number) => 40 + ((x - a) / Math.max(b - a, 0.2)) * width;
  const Y = (y: number) => 190 - (y / (fn === "sine" ? 1.3 : fn === "constant" ? 4 : Math.max(4, b * b))) * 140;

  return (
    <Lesson
      idea="An integral is the limit of rectangular slices. More slices, a thinner mismatch, and the sum settles on the exact area."
      graph={
        <PlotFrame label="Riemann rectangles">
          <rect width={360} height={240} fill="var(--surface-2)" />
          {Array.from({ length: n }, (_, index) => {
            const x0 = a + index * dx;
            const height = spec.f(x0 + dx);
            return <rect key={index} x={X(x0)} y={Y(height)} width={Math.max(1, X(x0 + dx) - X(x0) - 1)} height={Math.max(0, 190 - Y(height))} fill="var(--primary)" opacity={0.25} />;
          })}
          <path
            d={Array.from({ length: 60 }, (_, index) => {
              const x = a + ((b - a) * index) / 59;
              return `${index ? "L" : "M"} ${X(x).toFixed(1)} ${Y(spec.f(x)).toFixed(1)}`;
            }).join(" ")}
            fill="none"
            stroke="var(--primary)"
            strokeWidth={2}
          />
          <line x1={40} y1={190} x2={340} y2={190} stroke="var(--text-muted)" />
          <Handle x={X(b)} y={206} label="b" onDrag={(point) => setB(Math.min(fn === "sine" ? Math.PI : 3, Math.max(a + 0.4, a + ((point.x - 40) / width) * (fn === "sine" ? Math.PI : 3))))} />
          <Handle x={40 + n * 16} y={24} label={`${n} slices`} onDrag={(point) => setN(Math.min(16, Math.max(2, Math.round((point.x - 40) / 16))))} />
        </PlotFrame>
      }
      presets={
        <Presets
          items={(Object.keys(FNS) as FnId[]).map((id) => ({
            id,
            label: FNS[id].label,
            active: fn === id,
            onClick: () => { setFn(id); setB(FNS[id].b); setN(6); },
          }))}
        />
      }
      tries={
        <>
          <Predict
            prompt="x² is increasing on [0, 2]. A right-endpoint sum is…"
            options={[{ id: "over", label: "Too big" }, { id: "under", label: "Too small" }, { id: "exact", label: "Exact" }]}
            answer="over"
            because="On each slice the right edge is the highest point, so the rectangle covers more than the curve. The exact area from 0 to 2 is 8/3."
          />
          <Goal ok={fn === "square" && Math.abs(b - 2) < 0.05 && right > exact} pending="Keep x² from 0 to 2. The right sum should sit above 8/3." done={`Right sum ${num(right, 3)} is above the exact ${num(exact, 3)}.`} />
          <Goal ok={n >= 12 && Math.abs(right - exact) < Math.abs(riemann(spec.f, a, b, 4, "right") - exact)} pending="Drag to more slices. The error should shrink." done="Thinner rectangles hug the curve. The integral is this limit." />
          <Goal ok={fn === "constant" && Math.abs(right - exact) < 1e-6} pending="Choose the constant function. Every sum should match the exact area." done="A constant needs only one rectangle. Left, right and exact all agree." />
        </>
      }
      readouts={
        <Readouts
          items={[
            { label: "Right sum", value: num(right, 3) },
            { label: "Left sum", value: num(left, 3) },
            { label: "Exact integral", value: num(exact, 3) },
            { label: "Right − exact", value: num(right - exact, 3) },
          ]}
        />
      }
      explain={<p>∫₀² x² dx = [x³/3]₀² = 8/3. ∫₀^π sin x dx = 2. The right sum uses the value at the right edge of each slice of width (b − a)/n. For an increasing positive function that sum is larger than the integral.</p>}
    />
  );
}
