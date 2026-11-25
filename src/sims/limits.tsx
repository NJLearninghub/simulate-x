import { useState } from "react";
import { secantSlope } from "./formulas";
import { Goal, Handle, Lesson, PlotFrame, Predict, Presets, Readouts, num } from "./lesson";

const FUNCTIONS = {
  square: { label: "y = x²", f: (x: number) => x * x, derivative: (x: number) => 2 * x, a: 2, expect: 4 },
  sine: { label: "y = sin x", f: Math.sin, derivative: Math.cos, a: 0, expect: 1 },
  recip: { label: "y = 1/x", f: (x: number) => 1 / x, derivative: (x: number) => -1 / (x * x), a: 1, expect: -1 },
};

export default function LimitsSim() {
  const [which, setWhich] = useState<keyof typeof FUNCTIONS>("square");
  const [h, setH] = useState(1);
  const spec = FUNCTIONS[which];
  const slope = secantSlope(spec.f, spec.a, h);
  const exact = spec.derivative(spec.a);
  const samples = Array.from({ length: 80 }, (_, index) => {
    const x = which === "recip" ? 0.3 + (index / 79) * 3.2 : -1 + (index / 79) * 5;
    return { x, y: spec.f(x) };
  });
  const X = (x: number) => 40 + ((x + 1) / 5) * 280;
  const Y = (y: number) => 130 - y * 28;
  const d = samples.map((sample, index) => `${index ? "L" : "M"} ${X(sample.x).toFixed(1)} ${Y(sample.y).toFixed(1)}`).join(" ");
  const p1 = { x: spec.a, y: spec.f(spec.a) };
  const p2 = { x: spec.a + h, y: spec.f(spec.a + h) };

  return (
    <Lesson
      idea="The derivative is a slope you can see. A secant joins two nearby points; let the gap shrink and the secant becomes the tangent."
      graph={
        <PlotFrame label="Secant becoming a tangent">
          <rect width={360} height={240} fill="var(--surface-2)" />
          <line x1={30} y1={Y(0)} x2={340} y2={Y(0)} stroke="var(--text-muted)" />
          <line x1={X(0)} y1={20} x2={X(0)} y2={220} stroke="var(--text-muted)" />
          <path d={d} fill="none" stroke="var(--primary)" strokeWidth={2.2} />
          <line x1={X(p1.x)} y1={Y(p1.y)} x2={X(p2.x)} y2={Y(p2.y)} stroke="#d97706" strokeWidth={2} />
          <Handle x={X(p2.x)} y={Y(0)} label="h" onDrag={(point) => {
            let next = (point.x - X(spec.a)) / (280 / 5);
            if (Math.abs(next) < 0.05) next = next < 0 ? -0.05 : 0.05;
            setH(Math.min(2, Math.max(-2, next)));
          }} />
          <circle cx={X(p1.x)} cy={Y(p1.y)} r={5} fill="var(--text)" />
          <circle cx={X(p2.x)} cy={Y(p2.y)} r={5} fill="#d97706" />
        </PlotFrame>
      }
      presets={
        <Presets
          items={[
            ...(Object.keys(FUNCTIONS) as (keyof typeof FUNCTIONS)[]).map((id) => ({ id, label: FUNCTIONS[id].label, active: which === id, onClick: () => { setWhich(id); setH(1); } })),
            { id: "close", label: "Shrink h", onClick: () => setH(0.1) },
          ]}
        />
      }
      tries={
        <>
          <Predict
            prompt="What is the slope of y = x² at x = 2?"
            options={[{ id: "2", label: "2" }, { id: "4", label: "4" }, { id: "8", label: "8" }]}
            answer="4"
            because="The derivative of x² is 2x, so at x = 2 the slope is 4. Drag h toward 0 and the secant slope approaches 4."
          />
          <Goal ok={which === "square" && Math.abs(h) < 0.2 && Math.abs(slope - 4) < 0.3} pending="On y = x², drag h close to 0 at x = 2." done={`Secant slope ${num(slope, 3)} is close to the tangent slope 4.`} />
          <Goal ok={which === "sine" && Math.abs(h) < 0.25} pending="Switch to sin x at 0 and shrink h. The slope should approach 1." done={`cos 0 = 1. The secant reads ${num(slope, 3)}.`} />
          <Goal ok={Math.abs(h) > 0.8 && Math.abs(slope - exact) > 0.4} pending="Pull h far from zero and compare with the true derivative." done="A wide chord is only a rough slope. The derivative is the limit as h tends to 0." />
        </>
      }
      readouts={
        <Readouts
          items={[
            { label: "Point a", value: num(spec.a, 2) },
            { label: "Gap h", value: num(h, 3) },
            { label: "Secant slope", value: num(slope, 3) },
            { label: "Derivative", value: num(exact, 3) },
          ]}
        />
      }
      explain={<p>Slope of the chord = (f(a + h) − f(a)) / h. The derivative f′(a) is the limit of that quotient as h → 0. For x² it is 2x, for sin x it is cos x, and for 1/x it is −1/x².</p>}
    />
  );
}
