import { useState } from "react";
import { Goal, Handle, Lesson, PlotFrame, Predict, Presets, Readouts, num } from "./lesson";

export default function InequalitiesSim() {
  const [intercept, setIntercept] = useState(6);
  const [px, setPx] = useState(1);
  const [py, setPy] = useState(1);
  const [sense, setSense] = useState<"le" | "ge">("le");
  const sum = px + py;
  const inside = sense === "le" ? sum <= intercept + 0.05 : sum >= intercept - 0.05;
  const onLine = Math.abs(sum - intercept) < 0.15;
  const scale = 28;
  const origin = { x: 40, y: 200 };
  const X = (x: number) => origin.x + x * scale;
  const Y = (y: number) => origin.y - y * scale;
  const polygon = sense === "le"
    ? `M ${X(0)} ${Y(0)} L ${X(intercept)} ${Y(0)} L ${X(0)} ${Y(intercept)} Z`
    : `M ${X(intercept)} ${Y(0)} L ${X(8)} ${Y(0)} L ${X(8)} ${Y(8)} L ${X(0)} ${Y(8)} L ${X(0)} ${Y(intercept)} Z`;

  return (
    <Lesson
      idea="A linear inequality is a half-plane. The boundary line is the equality, and a test point tells you which side is included."
      graph={
        <PlotFrame label="Half-plane x + y compared with a number">
          <rect width={360} height={240} fill="var(--surface-2)" />
          <path d={polygon} fill="var(--primary)" opacity={0.18} />
          <line x1={X(0)} y1={Y(0)} x2={X(8)} y2={Y(0)} stroke="var(--text-muted)" />
          <line x1={X(0)} y1={Y(0)} x2={X(0)} y2={Y(7)} stroke="var(--text-muted)" />
          <line x1={X(0)} y1={Y(intercept)} x2={X(intercept)} y2={Y(0)} stroke="var(--primary)" strokeWidth={2.5} />
          <Handle x={X(intercept)} y={Y(0)} label="line" onDrag={(point) => setIntercept(Math.min(8, Math.max(1, (point.x - origin.x) / scale)))} />
          <Handle x={X(px)} y={Y(py)} label="P" onDrag={(point) => { setPx(Math.min(8, Math.max(0, (point.x - origin.x) / scale))); setPy(Math.min(6.5, Math.max(0, (origin.y - point.y) / scale))); }} />
          <text x={16} y={22} fill="var(--text-muted)" fontSize={13}>{inside ? "P satisfies the inequality." : "P is outside the shaded side."}</text>
        </PlotFrame>
      }
      presets={
        <Presets
          items={[
            { id: "le", label: "x + y ≤ 6", active: sense === "le" && Math.abs(intercept - 6) < 0.2, onClick: () => { setSense("le"); setIntercept(6); } },
            { id: "ge", label: "x + y ≥ 4", active: sense === "ge" && Math.abs(intercept - 4) < 0.2, onClick: () => { setSense("ge"); setIntercept(4); setPx(3); setPy(3); } },
            { id: "origin", label: "Test the origin", onClick: () => { setPx(0); setPy(0); } },
          ]}
        />
      }
      tries={
        <>
          <Predict
            prompt="Does the origin satisfy x + y ≥ 4?"
            options={[{ id: "yes", label: "Yes" }, { id: "no", label: "No" }]}
            answer="no"
            because="0 + 0 = 0, which is not at least 4. The origin is on the empty side of that line. Drop P on the origin to see it."
          />
          <Goal ok={onLine} pending="Drag P onto the boundary line." done="On the line, x + y equals the intercept. The inequality’s equality case lives here." />
          <Goal ok={sense === "le" && px >= 4 && !inside} pending="For x + y ≤ 6, find a point with x ≥ 4 that is still outside." done="That point has a large x, so y would have to be small or negative to fit under the line." />
          <Goal ok={sense === "ge" && py === 0 && px === 0} pending="With x + y ≥ 4, drop P on the origin." done="The origin fails x + y ≥ 4. Shading is the side away from the origin." />
        </>
      }
      readouts={
        <Readouts
          items={[
            { label: "Inequality", value: `x + y ${sense === "le" ? "≤" : "≥"} ${num(intercept, 1)}` },
            { label: "Point P", value: `(${num(px, 1)}, ${num(py, 1)})` },
            { label: "x + y", value: num(sum, 2) },
            { label: "Inside?", value: inside ? "Yes" : "No" },
          ]}
        />
      }
      explain={<p>The line x + y = c cuts the plane into two half-planes. Substitute a test point. If it makes the inequality true, shade its side. The first quadrant with x ≥ 0 and y ≥ 0 is the region used in most Class 11 graphs.</p>}
    />
  );
}
