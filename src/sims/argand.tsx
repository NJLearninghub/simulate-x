import { useState } from "react";
import { Goal, Handle, Lesson, PlotFrame, Predict, Presets, Readouts, num } from "./lesson";

export default function ArgandSim() {
  const [x, setX] = useState(3);
  const [y, setY] = useState(4);
  const [showI, setShowI] = useState(true);
  const mod = Math.hypot(x, y);
  const arg = Math.atan2(y, x);
  const scale = 22;
  const cx = 180;
  const cy = 120;
  const X = (value: number) => cx + value * scale;
  const Y = (value: number) => cy - value * scale;

  return (
    <Lesson
      idea="A complex number x + iy is a point on a plane. Multiplying by i turns that point a quarter turn anticlockwise, without changing its distance from the origin."
      graph={
        <PlotFrame label="Argand plane">
          <rect width={360} height={240} fill="var(--surface-2)" />
          <line x1={30} y1={cy} x2={330} y2={cy} stroke="var(--text-muted)" />
          <line x1={cx} y1={20} x2={cx} y2={220} stroke="var(--text-muted)" />
          <text x={318} y={cy - 6} fontSize={12} fill="var(--text-soft)">real</text>
          <text x={cx + 6} y={32} fontSize={12} fill="var(--text-soft)">imag</text>
          <line x1={cx} y1={cy} x2={X(x)} y2={Y(y)} stroke="var(--primary)" strokeWidth={2} />
          <line x1={cx} y1={cy} x2={X(x)} y2={Y(-y)} stroke="var(--text-soft)" strokeDasharray="4 3" />
          {showI && <line x1={cx} y1={cy} x2={X(-y)} y2={Y(x)} stroke="#d97706" strokeWidth={2} />}
          <Handle x={X(x)} y={Y(y)} label="z" onDrag={(point) => { setX(Math.min(6, Math.max(-6, (point.x - cx) / scale))); setY(Math.min(4.2, Math.max(-4.2, (cy - point.y) / scale))); }} />
          <circle cx={X(x)} cy={Y(-y)} r={5} fill="none" stroke="var(--text-soft)" />
          {showI && <circle cx={X(-y)} cy={Y(x)} r={5} fill="#d97706" />}
        </PlotFrame>
      }
      presets={
        <Presets
          items={[
            { id: "3-4", label: "3 + 4i", active: Math.abs(x - 3) < 0.15 && Math.abs(y - 4) < 0.15, onClick: () => { setX(3); setY(4); } },
            { id: "i", label: "i", active: Math.abs(x) < 0.15 && Math.abs(y - 1) < 0.15, onClick: () => { setX(0); setY(1); } },
            { id: "1i", label: "1 + i", active: Math.abs(x - 1) < 0.15 && Math.abs(y - 1) < 0.15, onClick: () => { setX(1); setY(1); } },
            { id: "times", label: showI ? "Hide × i" : "Show × i", onClick: () => setShowI((value) => !value) },
          ]}
        />
      }
      tries={
        <>
          <Predict
            prompt="Start at 1 on the real axis and multiply by i. Where does the point land?"
            options={[{ id: "neg", label: "−1" }, { id: "i", label: "i, up the axis" }, { id: "nei", label: "−i" }]}
            answer="i"
            because="i × 1 = i. Each factor of i is a 90° anticlockwise turn. Four of them bring you home, because i⁴ = 1."
          />
          <Goal ok={Math.abs(mod - 5) < 0.2} pending="Drag the point to 3 + 4i. The modulus should be 5." done="|z| = √(3² + 4²) = 5. The modulus is the distance from the origin." />
          <Goal ok={showI && Math.abs(Math.hypot(-y, x) - mod) < 0.05} pending="Turn on × i and compare lengths." done="Multiplying by i does not change the modulus. The amber point is the same distance out." />
          <Goal ok={Math.abs(y) < 0.15 && Math.abs(x) > 0.5} pending="Drag onto the real axis. The argument should be 0 or π." done={x >= 0 ? "A positive real number has argument 0." : "A negative real number has argument π."} />
        </>
      }
      readouts={
        <Readouts
          items={[
            { label: "z", value: `${num(x, 2)} + ${num(y, 2)} i` },
            { label: "|z|", value: num(mod, 3) },
            { label: "arg z", value: `${num((arg * 180) / Math.PI, 0)}°` },
            { label: "Conjugate", value: `${num(x, 2)} − ${num(Math.abs(y), 2)} i` },
            { label: "i · z", value: `${num(-y, 2)} + ${num(x, 2)} i` },
            { label: "|i · z|", value: num(Math.hypot(-y, x), 3) },
          ]}
        />
      }
      explain={<p>z = x + iy, |z| = √(x² + y²), and arg z is the angle from the positive real axis. The conjugate x − iy is the reflection in the real axis. i · z = −y + ix.</p>}
    />
  );
}
