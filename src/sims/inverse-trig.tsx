import { useState } from "react";
import { Goal, Handle, Lesson, PlotFrame, Predict, Presets, Readouts, num } from "./lesson";

const PRESETS = [
  { id: "0", label: "0", x: 0 },
  { id: "half", label: "1/2", x: 0.5 },
  { id: "root2", label: "√2/2", x: Math.SQRT1_2 },
  { id: "root3", label: "√3/2", x: Math.sqrt(3) / 2 },
  { id: "1", label: "1", x: 1 },
];

export default function InverseTrigSim() {
  const [x, setX] = useState(0.5);
  const sine = Math.asin(x);
  const cosine = Math.acos(x);
  const cx = 120;
  const cy = 120;
  const r = 78;

  return (
    <Lesson
      idea="sin⁻¹ x is the angle, in a restricted range, whose sine is x. The restriction to [−π/2, π/2] is what makes it a function."
      graph={
        <PlotFrame label="Principal value of inverse sine">
          <rect width={360} height={240} fill="var(--surface-2)" />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border-strong)" />
          <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke="var(--text-muted)" />
          <line x1={cx} y1={cy + r} x2={cx} y2={cy - r} stroke="var(--text-muted)" />
          <path d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r}`} fill="none" stroke="var(--primary)" strokeWidth={4} />
          <line x1={cx} y1={cy} x2={cx + r * Math.cos(sine)} y2={cy - r * Math.sin(sine)} stroke="#d97706" strokeWidth={2} />
          <Handle
            x={cx + r * Math.cos(sine)}
            y={cy - r * Math.sin(sine)}
            label="θ"
            onDrag={(point) => {
              const angle = Math.atan2(cy - point.y, point.x - cx);
              setX(Math.sin(Math.min(Math.PI / 2, Math.max(-Math.PI / 2, angle))));
            }}
          />
          <text x={210} y={48} fill="var(--text-muted)" fontSize={13}>Drag along the right-hand semicircle. That is the principal branch.</text>
        </PlotFrame>
      }
      presets={<Presets items={PRESETS.map((item) => ({ id: item.id, label: `x = ${item.label}`, active: Math.abs(x - item.x) < 0.02, onClick: () => setX(item.x) }))} />}
      tries={
        <>
          <Predict
            prompt="sin⁻¹(1/2) equals…"
            options={[{ id: "30", label: "30°" }, { id: "45", label: "45°" }, { id: "60", label: "60°" }]}
            answer="30"
            because="sin 30° = 1/2, and 30° lies in the principal range [−90°, 90°]. Set x = 1/2 and read the angle."
          />
          <Goal ok={Math.abs(x - 0.5) < 0.03 && Math.abs(sine - Math.PI / 6) < 0.05} pending="Set x = 1/2." done="sin⁻¹(1/2) = π/6 = 30°." />
          <Goal ok={Math.abs(x - 1) < 0.03} pending="Drag to the top of the circle, x = 1." done="sin⁻¹(1) = π/2 = 90°. That is the edge of the principal range." />
          <Goal ok={Math.abs(sine + cosine - Math.PI / 2) < 1e-6} pending="Check the sum of sin⁻¹ x and cos⁻¹ x as you drag." done="The sum stays π/2 wherever you stop. cos⁻¹ x is the complementary angle." />
        </>
      }
      readouts={
        <Readouts
          items={[
            { label: "x", value: num(x, 3) },
            { label: "sin⁻¹ x", value: `${num((sine * 180) / Math.PI, 1)}°` },
            { label: "cos⁻¹ x", value: `${num((cosine * 180) / Math.PI, 1)}°` },
            { label: "Sum", value: `${num(((sine + cosine) * 180) / Math.PI, 1)}°` },
          ]}
        />
      }
      explain={<p>The principal value of sin⁻¹ x lies in [−π/2, π/2], of cos⁻¹ x in [0, π], and of tan⁻¹ x in (−π/2, π/2). On those ranges, sin⁻¹ x + cos⁻¹ x = π/2. The bold arc is the only part of the circle used for sin⁻¹.</p>}
    />
  );
}
