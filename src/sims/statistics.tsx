import { useState } from "react";
import { meanOf, sdOf } from "./formulas";
import { Goal, Handle, Lesson, PlotFrame, Predict, Presets, Readouts, num } from "./lesson";

const START = [2, 4, 4, 4, 7, 9];

export default function StatisticsSim() {
  const [values, setValues] = useState(START);
  const mean = meanOf(values);
  const sd = sdOf(values);
  const shifted = values.map((value) => value + 2);

  return (
    <Lesson
      idea="The mean is the balance point of the data. The standard deviation measures how far the values typically sit from that balance point."
      graph={
        <PlotFrame label="Draggable data values">
          <rect width={360} height={240} fill="var(--surface-2)" />
          <line x1={30} y1={200} x2={340} y2={200} stroke="var(--text-muted)" />
          <line x1={40 + mean * 26} y1={40} x2={40 + mean * 26} y2={200} stroke="#d97706" strokeDasharray="4 3" />
          {values.map((value, index) => (
            <Handle key={index} x={40 + value * 26} y={70 + index * 20} label={String(index + 1)} onDrag={(point) => {
              const next = Math.min(10, Math.max(0, (point.x - 40) / 26));
              setValues((current) => current.map((item, i) => (i === index ? next : item)));
            }} />
          ))}
          <text x={16} y={24} fill="var(--text-muted)" fontSize={13}>Drag each point. The amber line is the mean.</text>
        </PlotFrame>
      }
      presets={
        <Presets
          items={[
            { id: "start", label: "NCERT-style list", onClick: () => setValues(START) },
            { id: "same", label: "Make them equal", onClick: () => setValues([5, 5, 5, 5, 5, 5]) },
            { id: "shift", label: "Add 2 to every value", onClick: () => setValues((current) => current.map((value) => Math.min(10, value + 2))) },
            { id: "spread", label: "Spread them out", onClick: () => setValues([0, 2, 4, 6, 8, 10]) },
          ]}
        />
      }
      tries={
        <>
          <Predict
            prompt="You add 2 to every value. What happens?"
            options={[{ id: "both", label: "Mean and SD both rise" }, { id: "mean", label: "Mean rises by 2, SD stays" }, { id: "sd", label: "SD rises, mean stays" }]}
            answer="mean"
            because="A shift moves the balance point but does not change the gaps between the values, so the spread is unchanged."
          />
          <Goal ok={sd < 0.05} pending="Drag every point onto the same value. The standard deviation should vanish." done="There is no spread, so the variance and the standard deviation are 0." />
          <Goal ok={Math.abs(meanOf(shifted) - (mean + 2)) < 1e-6 && Math.abs(sdOf(shifted) - sd) < 1e-6} pending="The +2 preview is always available in the readouts." done="Adding 2 raises the mean by 2 and leaves the standard deviation unchanged. Use the preset, then compare." />
          <Goal ok={sd > 3} pending="Spread the points from end to end." done={`The standard deviation is ${num(sd, 2)}. Wider gaps mean a larger spread.`} />
        </>
      }
      readouts={
        <Readouts
          items={[
            { label: "Mean", value: num(mean, 2) },
            { label: "Standard deviation", value: num(sd, 2) },
            { label: "Variance", value: num(sd * sd, 2) },
            { label: "Mean if each +2", value: num(mean + 2, 2) },
          ]}
        />
      }
      explain={<p>Mean x̄ = Σxᵢ / n. Variance σ² = Σ(xᵢ − x̄)² / n, and the standard deviation is √σ². This is the population form used for a complete list of scores. Adding a constant c replaces x̄ by x̄ + c and leaves σ unchanged.</p>}
    />
  );
}
