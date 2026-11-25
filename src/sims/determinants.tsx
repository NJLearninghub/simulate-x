import { useState } from "react";
import { det2 } from "./formulas";
import { Goal, Handle, Lesson, PlotFrame, Predict, Presets, Readouts, num } from "./lesson";

export default function DeterminantsSim() {
  const [u, setU] = useState({ x: 3, y: 1 });
  const [v, setV] = useState({ x: 1, y: 2 });
  const det = det2(u.x, u.y, v.x, v.y);
  const cx = 80;
  const cy = 170;
  const scale = 32;
  const X = (x: number) => cx + x * scale;
  const Y = (y: number) => cy - y * scale;

  return (
    <Lesson
      idea="The determinant of two column vectors is the signed area of the parallelogram they span. Zero area means the vectors lie on the same line, so the matrix cannot be inverted."
      graph={
        <PlotFrame label="Parallelogram of two vectors">
          <rect width={360} height={240} fill="var(--surface-2)" />
          <line x1={30} y1={cy} x2={340} y2={cy} stroke="var(--text-muted)" />
          <line x1={cx} y1={20} x2={cx} y2={220} stroke="var(--text-muted)" />
          <path d={`M ${X(0)} ${Y(0)} L ${X(u.x)} ${Y(u.y)} L ${X(u.x + v.x)} ${Y(u.y + v.y)} L ${X(v.x)} ${Y(v.y)} Z`} fill="var(--primary)" opacity={0.2} stroke="var(--primary)" />
          <Handle x={X(u.x)} y={Y(u.y)} label="u" onDrag={(point) => setU({ x: (point.x - cx) / scale, y: (cy - point.y) / scale })} />
          <Handle x={X(v.x)} y={Y(v.y)} label="v" onDrag={(point) => setV({ x: (point.x - cx) / scale, y: (cy - point.y) / scale })} />
        </PlotFrame>
      }
      presets={
        <Presets
          items={[
            { id: "unit", label: "Unit square", onClick: () => { setU({ x: 1, y: 0 }); setV({ x: 0, y: 1 }); } },
            { id: "parallel", label: "Make them parallel", onClick: () => setV({ x: u.x * 0.6, y: u.y * 0.6 }) },
            { id: "swap", label: "Swap the vectors", onClick: () => { setU(v); setV(u); } },
          ]}
        />
      }
      tries={
        <>
          <Predict
            prompt="You swap the two columns. What happens to the determinant?"
            options={[{ id: "same", label: "It stays the same" }, { id: "sign", label: "It changes sign" }, { id: "zero", label: "It becomes zero" }]}
            answer="sign"
            because="Swapping columns reverses the orientation of the parallelogram, so the signed area changes sign. The ordinary area does not."
          />
          <Goal ok={Math.abs(det - 1) < 0.08} pending="Drag the vectors onto the axes, each of length 1." done="The signed area is 1, the determinant of the identity." />
          <Goal ok={Math.abs(det) < 0.08 && Math.hypot(u.x, u.y) > 0.4 && Math.hypot(v.x, v.y) > 0.4} pending="Make the vectors parallel without collapsing one of them." done="The parallelogram is flat, so the determinant is 0 and the matrix is singular." />
          <Goal ok={det < -0.2} pending="Swap the vectors, or drag one across the other, so the signed area becomes negative." done="A negative determinant means the second vector is clockwise from the first. The area is still |det|." />
        </>
      }
      readouts={
        <Readouts
          items={[
            { label: "det [u v]", value: num(det, 2) },
            { label: "Area", value: num(Math.abs(det), 2) },
            { label: "u", value: `(${num(u.x, 1)}, ${num(u.y, 1)})` },
            { label: "v", value: `(${num(v.x, 1)}, ${num(v.y, 1)})` },
          ]}
        />
      }
      explain={<p>For columns (x₁, y₁) and (x₂, y₂), the determinant is x₁y₂ − x₂y₁. Its absolute value is the area of the parallelogram. If the determinant is zero the columns are linearly dependent and the matrix has no inverse.</p>}
    />
  );
}
