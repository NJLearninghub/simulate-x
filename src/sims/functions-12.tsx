import { useState } from "react";
import { Goal, Handle, Lesson, PlotFrame, Predict, Presets, Readouts, num } from "./lesson";

export default function Functions12Sim() {
  const [x, setX] = useState(1);
  const [mode, setMode] = useState<"inverse" | "compose">("inverse");
  const f = (value: number) => 2 * value + 3;
  const inverse = (value: number) => (value - 3) / 2;
  const g = (value: number) => value * value;
  const y = mode === "inverse" ? f(x) : g(x);
  const back = inverse(f(x));
  const fog = f(g(x));
  const gof = g(f(x));
  const X = (value: number) => 180 + value * 22;
  const Y = (value: number) => 120 - value * 16;

  return (
    <Lesson
      idea="An inverse undoes a function: do f, then f⁻¹, and you are back where you started. Composition cares about order, so f∘g and g∘f are different jobs."
      graph={
        <PlotFrame label="Function and its inverse">
          <rect width={360} height={240} fill="var(--surface-2)" />
          <line x1={20} y1={120} x2={340} y2={120} stroke="var(--text-muted)" />
          <line x1={180} y1={16} x2={180} y2={220} stroke="var(--text-muted)" />
          <line x1={40} y1={200} x2={320} y2={40} stroke="var(--text-soft)" strokeDasharray="4 3" />
          {mode === "inverse" ? (
            <>
              <line x1={X(-2)} y1={Y(f(-2))} x2={X(3)} y2={Y(f(3))} stroke="var(--primary)" strokeWidth={2} />
              <line x1={X(f(-2))} y1={Y(-2)} x2={X(f(2))} y2={Y(2)} stroke="#d97706" strokeWidth={2} />
              <circle cx={X(x)} cy={Y(f(x))} r={5} fill="var(--primary)" />
              <circle cx={X(f(x))} cy={Y(x)} r={5} fill="#d97706" />
            </>
          ) : (
            <text x={24} y={70} fill="var(--text)" fontSize={16}>f∘g({num(x, 2)}) = {num(fog, 2)} · g∘f({num(x, 2)}) = {num(gof, 2)}</text>
          )}
          <Handle x={X(x)} y={200} label="x" onDrag={(point) => setX(Math.min(3, Math.max(-2, (point.x - 180) / 22)))} />
        </PlotFrame>
      }
      presets={
        <Presets
          items={[
            { id: "inverse", label: "f(x) = 2x + 3", active: mode === "inverse", onClick: () => setMode("inverse") },
            { id: "compose", label: "Compose with x²", active: mode === "compose", onClick: () => setMode("compose") },
            { id: "zero", label: "x = 0", onClick: () => setX(0) },
          ]}
        />
      }
      tries={
        <>
          <Predict
            prompt="f(x) = 2x + 3. What is f⁻¹(x)?"
            options={[{ id: "half", label: "(x − 3)/2" }, { id: "two", label: "2x − 3" }, { id: "neg", label: "−2x − 3" }]}
            answer="half"
            because="Solve y = 2x + 3 for x: x = (y − 3)/2. Swap the names and that is the inverse. The amber line is that reflection in y = x."
          />
          <Goal ok={mode === "inverse" && Math.abs(back - x) < 1e-6} pending="Drag x. f⁻¹(f(x)) should equal x." done={`f⁻¹(f(x)) = ${num(back, 2)}, the same as x. The inverse undoes f.`} />
          <Goal ok={mode === "compose" && Math.abs(fog - gof) > 0.2} pending="Switch to composition and drag x until the two orders disagree." done={`f∘g = ${num(fog, 2)} and g∘f = ${num(gof, 2)}. Order matters.`} />
          <Goal ok={mode === "inverse" && Math.abs(x) > 0.4} pending="Drag along the blue line and watch the amber point, its reflection." done="Reflecting the graph in y = x swaps the roles of input and output." />
        </>
      }
      readouts={
        <Readouts
          items={[
            { label: "x", value: num(x, 2) },
            { label: mode === "inverse" ? "f(x)" : "g(x) = x²", value: num(y, 2) },
            { label: "f⁻¹(f(x))", value: num(back, 2) },
            { label: "f∘g and g∘f", value: `${num(fog, 2)}, ${num(gof, 2)}` },
          ]}
        />
      }
      explain={<p>f and f⁻¹ are inverses when f⁻¹(f(x)) = x and f(f⁻¹(x)) = x. Their graphs are reflections of each other in y = x. (f∘g)(x) = f(g(x)). Here g(x) = x² and f(x) = 2x + 3, so f(g(x)) = 2x² + 3 while g(f(x)) = (2x + 3)².</p>}
    />
  );
}
