import { useState } from "react";
import { dist3, section } from "./formulas";
import { Goal, Handle, Lesson, PlotFrame, Predict, Presets, Readouts, num } from "./lesson";

type Point = { x: number; y: number; z: number };

function project(point: Point) {
  return { x: 70 + (point.x - point.z * 0.55) * 28, y: 200 - (point.y + point.z * 0.45) * 28 };
}

export default function Intro3dSim() {
  const [a, setA] = useState<Point>({ x: 2, y: 1, z: 2 });
  const [b, setB] = useState<Point>({ x: 0, y: 0, z: 0 });
  const [ratio, setRatio] = useState(1);
  const mid = section(a, b, ratio, ratio);
  const divider = section(a, b, ratio, 2);
  const distance = dist3(a, b);
  const A = project(a);
  const B = project(b);
  const M = project(divider);

  return (
    <Lesson
      idea="Three perpendicular axes locate a point. The distance between two points is the straight-line length of the box whose edges are the changes in x, y and z."
      graph={
        <PlotFrame label="Two points in space">
          <rect width={360} height={240} fill="var(--surface-2)" />
          <line x1={70} y1={200} x2={250} y2={200} stroke="var(--text-muted)" />
          <line x1={70} y1={200} x2={70} y2={40} stroke="var(--text-muted)" />
          <line x1={70} y1={200} x2={150} y2={150} stroke="var(--text-soft)" />
          <text x={252} y={204} fontSize={12} fill="var(--text-soft)">x</text>
          <text x={54} y={40} fontSize={12} fill="var(--text-soft)">y</text>
          <text x={154} y={146} fontSize={12} fill="var(--text-soft)">z</text>
          <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="var(--primary)" strokeWidth={2} />
          <circle cx={M.x} cy={M.y} r={5} fill="#d97706" />
          <Handle x={A.x} y={A.y} label="A" onDrag={(point) => setA({ x: Math.min(5, Math.max(-1, (point.x - 70) / 28)), y: Math.min(5, Math.max(0, (200 - point.y) / 28)), z: a.z })} />
          <Handle x={B.x} y={B.y} label="B" onDrag={(point) => setB({ x: Math.min(5, Math.max(-1, (point.x - 70) / 28)), y: Math.min(5, Math.max(0, (200 - point.y) / 28)), z: b.z })} />
          <Handle x={300} y={40 + a.z * 24} label="z of A" onDrag={(point) => setA((current) => ({ ...current, z: Math.min(4, Math.max(0, (point.y - 40) / 24)) }))} />
        </PlotFrame>
      }
      presets={
        <Presets
          items={[
            { id: "origin", label: "B at origin", onClick: () => setB({ x: 0, y: 0, z: 0 }) },
            { id: "322", label: "A(3, 2, 2)", onClick: () => setA({ x: 3, y: 2, z: 2 }) },
            { id: "mid", label: "Equal ratio", onClick: () => setRatio(1) },
          ]}
        />
      }
      extra={
        <label className="block text-sm font-semibold text-[var(--text-muted)]">
          Ratio m:n = {num(ratio, 1)} : 2
          <input className="w-full" style={{ height: 44 }} type="range" min={0.5} max={3} step={0.1} value={ratio} onChange={(event) => setRatio(Number(event.target.value))} />
        </label>
      }
      tries={
        <>
          <Predict
            prompt="How far is (3, 2, 2) from the origin?"
            options={[{ id: "3", label: "3" }, { id: "7", label: "7" }, { id: "sqrt", label: "√17" }]}
            answer="sqrt"
            because="Distance = √(3² + 2² + 2²) = √17 ≈ 4.123. Put B at the origin and A at (3, 2, 2)."
          />
          <Goal ok={Math.abs(b.x) + Math.abs(b.y) + Math.abs(b.z) < 0.05 && Math.abs(distance - Math.hypot(a.x, a.y, a.z)) < 1e-6} pending="Put B at the origin. Distance should be √(x² + y² + z²)." done={`Distance is ${num(distance, 3)} = √(${num(a.x ** 2 + a.y ** 2 + a.z ** 2, 2)}).`} />
          <Goal ok={Math.abs(ratio - 2) < 0.12} pending="Set the ratio to 2 : 2. The amber point should be the midpoint." done={`m = n, so the point is the midpoint (${num(mid.x, 2)}, ${num(mid.y, 2)}, ${num(mid.z, 2)}).`} />
          <Goal ok={Math.abs(a.x - 2) < 0.2 && Math.abs(a.y) < 0.2 && Math.abs(b.x) < 0.2 && Math.abs(b.y - 2) < 0.2} pending="Drag A to (2, 0) and B to (0, 2). The midpoint is (1, 1, …)." done={`Midpoint is (${num(mid.x, 2)}, ${num(mid.y, 2)}, ${num(mid.z, 2)}).`} />
        </>
      }
      readouts={
        <Readouts
          items={[
            { label: "A", value: `(${num(a.x, 1)}, ${num(a.y, 1)}, ${num(a.z, 1)})` },
            { label: "B", value: `(${num(b.x, 1)}, ${num(b.y, 1)}, ${num(b.z, 1)})` },
            { label: "Distance", value: num(distance, 3) },
            { label: "Divides m:n", value: `(${num(divider.x, 2)}, ${num(divider.y, 2)}, ${num(divider.z, 2)})` },
          ]}
        />
      }
      explain={<p>Distance = √(Δx² + Δy² + Δz²). The point dividing AB in the ratio m:n is ((m x₂ + n x₁)/(m + n), and the same for y and z). The picture is a cabinet projection: z runs up and to the right so a flat screen can show all three axes. Drag z of A on the side handle.</p>}
    />
  );
}
