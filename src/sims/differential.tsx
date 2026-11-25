import { useState } from "react";
import { euler } from "./formulas";
import { Goal, Handle, Lesson, PlotFrame, Predict, Presets, Readouts, num } from "./lesson";

type Eq = "exp" | "parabola" | "circle";

const EQS: Record<Eq, { label: string; f: (x: number, y: number) => number; exact: (x: number, x0: number, y0: number) => number; x0: number; y0: number }> = {
  exp: { label: "dy/dx = y", f: (_x, y) => y, exact: (x, x0, y0) => y0 * Math.exp(x - x0), x0: 0, y0: 1 },
  parabola: { label: "dy/dx = 2x", f: (x) => 2 * x, exact: (x, x0, y0) => y0 + x * x - x0 * x0, x0: 0, y0: 0 },
  circle: { label: "dy/dx = −x/y", f: (x, y) => -x / y, exact: (x, x0, y0) => Math.sign(y0 || 1) * Math.sqrt(Math.max(0, x0 * x0 + y0 * y0 - x * x)), x0: 0, y0: 2 },
};

export default function DifferentialSim() {
  const [eq, setEq] = useState<Eq>("exp");
  const [x0, setX0] = useState(0);
  const [y0, setY0] = useState(1);
  const spec = EQS[eq];
  const steps = euler(spec.f, x0, y0, x0 + 1.4, 0.05);
  const end = steps[steps.length - 1];
  const exactEnd = spec.exact(x0 + 1.4, x0, y0);
  const X = (x: number) => 180 + x * 48;
  const Y = (y: number) => 120 - y * 28;
  const field = [];
  for (let i = -3; i <= 3; i++) {
    for (let j = -2; j <= 3; j++) {
      if (eq === "circle" && Math.abs(j) < 0.2) continue;
      const slope = spec.f(i, j || 0.01);
      const angle = Math.atan(slope);
      field.push({ x: i, y: j, angle });
    }
  }

  return (
    <Lesson
      idea="A differential equation tells you the slope at every point. Follow those slopes from a starting point and you trace a solution."
      graph={
        <PlotFrame label="Slope field">
          <rect width={360} height={240} fill="var(--surface-2)" />
          <line x1={20} y1={120} x2={340} y2={120} stroke="var(--text-muted)" />
          <line x1={180} y1={16} x2={180} y2={220} stroke="var(--text-muted)" />
          {field.map((tick, index) => (
            <line key={index} x1={X(tick.x) - 6 * Math.cos(tick.angle)} y1={Y(tick.y) + 6 * Math.sin(tick.angle)} x2={X(tick.x) + 6 * Math.cos(tick.angle)} y2={Y(tick.y) - 6 * Math.sin(tick.angle)} stroke="var(--text-soft)" />
          ))}
          <path d={steps.map((point, index) => `${index ? "L" : "M"} ${X(point.x).toFixed(1)} ${Y(point.y).toFixed(1)}`).join(" ")} fill="none" stroke="var(--primary)" strokeWidth={2.4} />
          <Handle x={X(x0)} y={Y(y0)} label="start" onDrag={(point) => { setX0(Math.min(1.2, Math.max(-2, (point.x - 180) / 48))); setY0(Math.min(3, Math.max(-1.5, (120 - point.y) / 28))); }} />
        </PlotFrame>
      }
      presets={
        <Presets
          items={(Object.keys(EQS) as Eq[]).map((id) => ({
            id,
            label: EQS[id].label,
            active: eq === id,
            onClick: () => { setEq(id); setX0(EQS[id].x0); setY0(EQS[id].y0); },
          }))}
        />
      }
      tries={
        <>
          <Predict
            prompt="dy/dx = y, starting at (0, 1). What is y at x = 1, exactly?"
            options={[{ id: "e", label: "e ≈ 2.718" }, { id: "2", label: "2" }, { id: "1", label: "1" }]}
            answer="e"
            because="The solution is y = eˣ. Euler’s small steps only approximate it. Drag the start back to (0, 1) and compare the end of the curve with e."
          />
          <Goal ok={eq === "exp" && Math.abs(x0) < 0.08 && Math.abs(y0 - 1) < 0.08} pending="For dy/dx = y, put the start on (0, 1)." done={`Euler reaches about ${num(end.y, 3)} at x = 1.4. The exact value is ${num(exactEnd, 3)}.`} />
          <Goal ok={eq === "parabola" && Math.abs(y0 - x0 * x0) < 0.15} pending="Choose dy/dx = 2x and start on the parabola y = x²." done="The slopes of y = x² are 2x, so the solution stays on a parabola." />
          <Goal ok={eq === "circle"} pending="Choose dy/dx = −x/y." done="Those slopes are tangent to circles centred at the origin. The solution of x² + y² = constant follows them." />
        </>
      }
      readouts={
        <Readouts
          items={[
            { label: "Start", value: `(${num(x0, 2)}, ${num(y0, 2)})` },
            { label: "Euler at +1.4", value: num(end.y, 3) },
            { label: "Exact at +1.4", value: num(exactEnd, 3) },
            { label: "Equation", value: spec.label },
          ]}
        />
      }
      explain={<p>Euler’s method steps y ← y + h f(x, y) with h = 0.05. For dy/dx = y the exact solution is y₀ e^(x − x₀). For dy/dx = 2x it is y = x² + C. For dy/dx = −x/y, differentiating x² + y² = constant gives the same slope.</p>}
    />
  );
}
