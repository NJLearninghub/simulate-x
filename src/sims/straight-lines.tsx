import { useState } from "react";
import { lineThrough, pointLineDistance } from "./formulas";
import { Goal, Handle, Lesson, PlotFrame, Predict, Presets, Readouts, num } from "./lesson";

export default function StraightLinesSim() {
  const [a, setA] = useState({ x: 0, y: 0 });
  const [b, setB] = useState({ x: 4, y: 2 });
  const [c, setC] = useState({ x: 1, y: 3 });
  const line = lineThrough(a.x, a.y, b.x, b.y);
  const distance = pointLineDistance(line.a, line.b, line.c, c.x, c.y);
  const scale = 32;
  const O = { x: 50, y: 190 };
  const X = (x: number) => O.x + x * scale;
  const Y = (y: number) => O.y - y * scale;

  return (
    <Lesson
      idea="Two points fix a line. Its slope is the rise over the run, and the distance from a third point is the length of the perpendicular."
      graph={
        <PlotFrame label="Line through two points">
          <rect width={360} height={240} fill="var(--surface-2)" />
          <line x1={30} y1={O.y} x2={340} y2={O.y} stroke="var(--text-muted)" />
          <line x1={O.x} y1={20} x2={O.x} y2={220} stroke="var(--text-muted)" />
          <line x1={X(a.x)} y1={Y(a.y)} x2={X(b.x)} y2={Y(b.y)} stroke="var(--primary)" strokeWidth={2.5} />
          <line x1={X(c.x)} y1={Y(c.y)} x2={X(c.x)} y2={Y(c.y)} stroke="var(--text)" />
          <Handle x={X(a.x)} y={Y(a.y)} label="A" onDrag={(point) => setA({ x: (point.x - O.x) / scale, y: (O.y - point.y) / scale })} />
          <Handle x={X(b.x)} y={Y(b.y)} label="B" onDrag={(point) => setB({ x: (point.x - O.x) / scale, y: (O.y - point.y) / scale })} />
          <Handle x={X(c.x)} y={Y(c.y)} label="C" onDrag={(point) => setC({ x: (point.x - O.x) / scale, y: (O.y - point.y) / scale })} />
        </PlotFrame>
      }
      presets={
        <Presets
          items={[
            { id: "flat", label: "Horizontal", onClick: () => { setA({ x: 0, y: 2 }); setB({ x: 4, y: 2 }); } },
            { id: "up", label: "y = x", onClick: () => { setA({ x: 0, y: 0 }); setB({ x: 4, y: 4 }); } },
            { id: "vert", label: "Vertical", onClick: () => { setA({ x: 2, y: 0 }); setB({ x: 2, y: 4 }); } },
            { id: "on", label: "Put C on AB", onClick: () => setC({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }) },
          ]}
        />
      }
      tries={
        <>
          <Predict
            prompt="A horizontal line has slope…"
            options={[{ id: "0", label: "0" }, { id: "1", label: "1" }, { id: "none", label: "Undefined" }]}
            answer="0"
            because="Rise is zero, so m = 0 / run = 0. A vertical line is the one whose slope is undefined, because the run is zero."
          />
          <Goal ok={line.slope !== null && Math.abs(line.slope) < 0.08} pending="Drag A and B to the same height." done="The line is horizontal and the slope is 0." />
          <Goal ok={line.slope === null} pending="Drag A and B onto the same vertical line." done="The run is zero, so the slope is undefined. The equation is x = constant." />
          <Goal ok={distance < 0.12} pending="Drag C onto the line. The distance should fall to 0." done="C is on the line, so the perpendicular distance is 0." />
        </>
      }
      readouts={
        <Readouts
          items={[
            { label: "Slope m", value: line.slope === null ? "undefined" : num(line.slope, 2) },
            { label: "A", value: `(${num(a.x, 1)}, ${num(a.y, 1)})` },
            { label: "B", value: `(${num(b.x, 1)}, ${num(b.y, 1)})` },
            { label: "Distance from C", value: num(distance, 2) },
          ]}
        />
      }
      explain={<p>m = (y₂ − y₁) / (x₂ − x₁). The line is (y − y₁)(x₂ − x₁) = (x − x₁)(y₂ − y₁). Distance from (x₀, y₀) to ax + by + c = 0 is |ax₀ + by₀ + c| / √(a² + b²).</p>}
    />
  );
}
