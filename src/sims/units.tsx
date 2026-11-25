import { useState } from "react";
import { vernier } from "./formulas";
import { Goal, Handle, Lesson, PlotFrame, Predict, Presets, Readouts, num } from "./lesson";

const PRESETS = [
  { id: "block", label: "Steel block 2.36 cm", length: 2.36 },
  { id: "coin", label: "Coin 1.80 cm", length: 1.8 },
  { id: "wire", label: "Short wire 0.54 cm", length: 0.54 },
];

export default function UnitsSim() {
  const [length, setLength] = useState(2.36);
  const [fine, setFine] = useState(true);
  const divisions = fine ? 10 : 1;
  const reading = vernier(length, divisions);
  const relative = (reading.lc / Math.max(reading.reading, reading.lc)) * 100;
  const active = PRESETS.find((item) => Math.abs(item.length - length) < 0.005)?.id;

  return (
    <Lesson
      idea="A measurement is only as sharp as the instrument. The vernier reads the millimetre the main scale misses, and that least count is the absolute error."
      graph={
        <PlotFrame label="Vernier caliper">
          <rect x={0} y={0} width={360} height={240} fill="var(--surface-2)" />
          <text x={16} y={28} fill="var(--text-muted)" fontSize={13}>Drag the jaw. The highlighted vernier line is the one that meets a main-scale line.</text>
          <line x1={30} y1={90} x2={330} y2={90} stroke="var(--text-muted)" strokeWidth={2} />
          {Array.from({ length: 41 }, (_, i) => (
            <line key={i} x1={30 + i * 7} y1={90} x2={30 + i * 7} y2={i % 10 === 0 ? 74 : 82} stroke="var(--text-soft)" />
          ))}
          <text x={26} y={70} fontSize={11} fill="var(--text-soft)">0</text>
          <text x={160} y={70} fontSize={11} fill="var(--text-soft)">2 cm</text>
          <text x={300} y={70} fontSize={11} fill="var(--text-soft)">4 cm</text>
          <rect x={30} y={98} width={Math.max(8, length * 70)} height={28} rx={4} fill="var(--primary)" opacity={0.25} stroke="var(--primary)" />
          <Handle x={30 + length * 70} y={112} label="jaw" onDrag={(point) => setLength(Math.min(4, Math.max(0.2, (point.x - 30) / 70)))} />
          {Array.from({ length: divisions === 1 ? 2 : 10 }, (_, i) => {
            const x = 40 + i * 16;
            const hit = i === reading.coinciding;
            return (
              <g key={i}>
                <line x1={x} y1={160} x2={x} y2={188} stroke={hit ? "var(--primary)" : "var(--text-soft)"} strokeWidth={hit ? 3 : 1} />
                <text x={x} y={204} textAnchor="middle" fontSize={10} fill={hit ? "var(--primary)" : "var(--text-soft)"}>{i}</text>
              </g>
            );
          })}
          <text x={40} y={150} fontSize={12} fill="var(--text-muted)">Vernier coincidence</text>
        </PlotFrame>
      }
      presets={
        <Presets
          items={[
            ...PRESETS.map((item) => ({ id: item.id, label: item.label, active: active === item.id && fine, onClick: () => { setLength(item.length); setFine(true); } })),
            { id: "metre", label: "Metre scale only (0.1 cm)", active: !fine, onClick: () => setFine(false) },
          ]}
        />
      }
      tries={
        <>
          <Predict
            prompt="The steel block is 2.36 cm on a vernier whose least count is 0.01 cm. Which vernier division coincides?"
            options={[{ id: "3", label: "3" }, { id: "6", label: "6" }, { id: "10", label: "0" }]}
            answer="6"
            because="2.36 cm = 2.3 cm on the main scale + 6 × 0.01 cm. Drag the jaw to the block and look for line 6."
          />
          <Goal
            ok={Math.abs(reading.reading - 2.36) < 0.02 && fine}
            pending="Drag the jaw to the steel block, 2.36 cm, and read the coinciding division."
            done="The reading is 2.36 cm. Main scale 2.3 cm, vernier division 6."
          />
          <Goal
            ok={!fine}
            pending="Switch to the metre scale. The hundredths place disappears."
            done={`The metre scale can only claim ${num(reading.reading, 1)} cm. Its least count, 0.1 cm, is now the absolute error.`}
          />
        </>
      }
      readouts={
        <Readouts
          items={[
            { label: "Reading", value: `${num(reading.reading, fine ? 2 : 1)} cm` },
            { label: "Least count", value: `${num(reading.lc, 2)} cm` },
            { label: "Main scale", value: `${num(reading.main, 1)} cm` },
            { label: "Coinciding division", value: String(reading.coinciding) },
            { label: "Absolute error", value: `± ${num(reading.lc, 2)} cm` },
            { label: "Relative error", value: `${num(relative, 2)} %` },
          ]}
        />
      }
      explain={
        <>
          <p>Ten vernier divisions match nine main-scale millimetres, so the least count is 1 mm − 0.9 mm = 0.01 cm.</p>
          <p>Reading = main-scale reading + coinciding vernier division × least count. Relative error = least count / reading. A longer object has the same absolute error but a smaller relative error.</p>
        </>
      }
    />
  );
}
