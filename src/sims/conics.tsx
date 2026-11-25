import { useState } from "react";
import { conicPoint } from "./formulas";
import { Goal, Handle, Lesson, PlotFrame, Predict, Presets, Readouts, num } from "./lesson";

export default function ConicsSim() {
  const [eccentricity, setEccentricity] = useState(0.6);
  const [t, setT] = useState(0.8);
  const a = 3;
  const samples = Array.from({ length: 80 }, (_, index) => {
    const parameter = eccentricity < 1.05 && eccentricity > 0.98 ? -6 + (12 * index) / 79 : eccentricity > 1.05 ? -1.15 + (2.3 * index) / 79 : -Math.PI + (2 * Math.PI * index) / 79;
    return conicPoint(eccentricity, a, parameter);
  });
  const point = conicPoint(eccentricity, a, eccentricity > 0.98 && eccentricity < 1.05 ? t * 4 : eccentricity > 1.05 ? t * 1.1 : t);
  const pf = point.directrix === null ? Math.hypot(point.x, point.y) : Math.hypot(point.x - point.focusX, point.y);
  const pm = point.directrix === null ? null : Math.abs(point.x - point.directrix);
  const scale = eccentricity > 1.05 ? 14 : 28;
  const cx = 190;
  const cy = 120;
  const X = (x: number) => cx + x * scale;
  const Y = (y: number) => cy - y * scale;
  const d = samples.map((sample, index) => `${index ? "L" : "M"} ${X(sample.x).toFixed(1)} ${Y(sample.y).toFixed(1)}`).join(" ");
  const name = eccentricity <= 0.02 ? "circle" : eccentricity < 0.98 ? "ellipse" : eccentricity < 1.05 ? "parabola" : "hyperbola";

  return (
    <Lesson
      idea="A conic is the set of points whose distance to a focus is a fixed multiple of the distance to a directrix. That multiple is the eccentricity."
      graph={
        <PlotFrame label="Conic section">
          <rect width={360} height={240} fill="var(--surface-2)" />
          <line x1={20} y1={cy} x2={340} y2={cy} stroke="var(--text-muted)" />
          <line x1={cx} y1={16} x2={cx} y2={224} stroke="var(--text-muted)" />
          {point.directrix !== null && <line x1={X(point.directrix)} y1={20} x2={X(point.directrix)} y2={220} stroke="var(--text-soft)" strokeDasharray="4 3" />}
          <path d={d} fill="none" stroke="var(--primary)" strokeWidth={2.2} />
          {point.directrix !== null && <circle cx={X(point.focusX)} cy={cy} r={4} fill="#d97706" />}
          <line x1={X(point.focusX)} y1={cy} x2={X(point.x)} y2={Y(point.y)} stroke="#d97706" />
          {pm !== null && <line x1={X(point.x)} y1={Y(point.y)} x2={X(point.directrix)} y2={Y(point.y)} stroke="var(--text)" strokeDasharray="3 3" />}
          <Handle x={X(point.x)} y={Y(point.y)} label="P" onDrag={(pointDrag) => {
            if (eccentricity > 0.98 && eccentricity < 1.05) setT(Math.min(1.4, Math.max(-1.4, (cy - pointDrag.y) / scale / 4)));
            else if (eccentricity > 1.05) setT(Math.min(1.15, Math.max(-1.15, Math.atan2((cy - pointDrag.y) / scale, (pointDrag.x - cx) / scale))));
            else setT(Math.atan2((cy - pointDrag.y) / scale, (pointDrag.x - cx) / scale));
          }} />
          <Handle x={40 + eccentricity * 80} y={24} label={`e = ${num(eccentricity, 2)}`} onDrag={(drag) => setEccentricity(Math.min(1.8, Math.max(0, (drag.x - 40) / 80)))} />
        </PlotFrame>
      }
      presets={
        <Presets
          items={[
            { id: "circle", label: "Circle e = 0", active: name === "circle", onClick: () => setEccentricity(0) },
            { id: "ellipse", label: "Ellipse e = 0.6", active: name === "ellipse", onClick: () => setEccentricity(0.6) },
            { id: "parabola", label: "Parabola e = 1", active: name === "parabola", onClick: () => { setEccentricity(1); setT(1); } },
            { id: "hyperbola", label: "Hyperbola e = 1.5", active: name === "hyperbola", onClick: () => { setEccentricity(1.5); setT(0.4); } },
          ]}
        />
      }
      tries={
        <>
          <Predict
            prompt="Which eccentricity closes the curve into an ellipse?"
            options={[{ id: "lt", label: "e between 0 and 1" }, { id: "1", label: "e = 1" }, { id: "gt", label: "e greater than 1" }]}
            answer="lt"
            because="e = 0 is a circle, 0 < e < 1 an ellipse, e = 1 a parabola and e > 1 a hyperbola. Drag the e handle across 1 and watch the curve open."
          />
          <Goal ok={name === "parabola" && pm !== null && Math.abs(pf - pm) < 0.08} pending="Set e = 1 and drag P. The two distances should match." done="On the parabola, distance to the focus equals distance to the directrix." />
          <Goal ok={name === "ellipse" && pm !== null && Math.abs(pf / pm - eccentricity) < 0.05} pending="Set an ellipse and drag P around. PF / PM should stay equal to e." done={`PF / PM = ${num(pm ? pf / pm : 0, 2)}, and e = ${num(eccentricity, 2)}.`} />
          <Goal ok={name === "hyperbola"} pending="Push e past 1." done="The curve has opened into a hyperbola. It still obeys PF = e PM, now with e greater than 1." />
        </>
      }
      readouts={
        <Readouts
          items={[
            { label: "Curve", value: name },
            { label: "e", value: num(eccentricity, 2) },
            { label: "PF", value: num(pf, 2) },
            { label: "e · PM", value: pm === null ? "—" : num(eccentricity * pm, 2) },
          ]}
        />
      }
      explain={<p>For an ellipse, b² = a²(1 − e²), the focus is (ae, 0) and the directrix is x = a/e. A parabola has e = 1 and equation y² = 4ax. A hyperbola has b² = a²(e² − 1). The amber segment is PF and the dashed segment is PM.</p>}
    />
  );
}
