import { useState } from "react";
import { expandedLength } from "./formulas";
import { Goal, Handle, Lesson, PlotFrame, Predict, Presets, Readouts, num } from "./lesson";

const METALS = {
  steel: { label: "Steel", alpha: 1.2e-5 },
  brass: { label: "Brass", alpha: 1.8e-5 },
  aluminium: { label: "Aluminium", alpha: 2.3e-5 },
};

export default function ThermalSim() {
  const [metal, setMetal] = useState<keyof typeof METALS>("brass");
  const [temperature, setTemperature] = useState(20);
  const rise = temperature - 20;
  const length = expandedLength(1, METALS[metal].alpha, rise);
  const hole = expandedLength(2, METALS[metal].alpha, rise);
  const deltaMm = (length - 1) * 1000;
  const other = metal === "steel" ? expandedLength(1, METALS.brass.alpha, rise) : expandedLength(1, METALS.steel.alpha, rise);

  return (
    <Lesson
      idea="Heating shakes the atoms farther apart, so a rod gets longer. A hole is made of the same empty shape, so the hole gets larger too."
      graph={
        <PlotFrame label="Heated rod and a plate with a hole">
          <rect width={360} height={240} fill="var(--surface-2)" />
          <text x={16} y={22} fill="var(--text-muted)" fontSize={13}>Drag the thermometer. The picture magnifies the expansion.</text>
          <rect x={28} y={150} width={40} height={70} rx={8} fill="var(--surface)" stroke="var(--border-strong)" />
          <rect x={42} y={210 - Math.max(8, (temperature / 220) * 100)} width={12} height={Math.max(8, (temperature / 220) * 100)} fill="#e11d48" />
          <Handle x={48} y={48} label={`${num(temperature, 0)}°C`} onDrag={(point) => setTemperature(Math.min(220, Math.max(20, 220 - point.y)))} />
          <rect x={100} y={78} width={210 + deltaMm * 4} height={16} rx={3} fill="var(--primary)" />
          <text x={100} y={70} fontSize={12} fill="var(--text-muted)">1 m rod</text>
          <circle cx={200} cy={150} r={28 + (hole - 2) * 800} fill="none" stroke="var(--primary)" strokeWidth={8} />
          <text x={168} y={154} fontSize={11} fill="var(--text)">hole</text>
          <text x={100} y={214} fontSize={12} fill="var(--text-soft)">Magnified so a fraction of a millimetre is visible.</text>
        </PlotFrame>
      }
      presets={
        <Presets
          items={[
            ...(Object.keys(METALS) as (keyof typeof METALS)[]).map((id) => ({
              id,
              label: METALS[id].label,
              active: metal === id,
              onClick: () => setMetal(id),
            })),
            { id: "hot", label: "Heat to 120°C", active: temperature > 110 && temperature < 130, onClick: () => setTemperature(120) },
            { id: "room", label: "Back to 20°C", active: temperature < 25, onClick: () => setTemperature(20) },
          ]}
        />
      }
      tries={
        <>
          <Predict
            prompt="A metal plate has a hole. You heat the plate. What happens to the hole?"
            options={[{ id: "shrink", label: "It shrinks" }, { id: "same", label: "It stays" }, { id: "grow", label: "It grows" }]}
            answer="grow"
            because="Every length in the plate, including the rim of the hole, expands. The hole behaves like a disc of metal that was removed."
          />
          <Goal ok={temperature > 80} pending="Drag the thermometer up. Watch both the rod and the hole." done={`The rod grew by ${num(deltaMm, 2)} mm and the 2 cm hole grew by ${num((hole - 2) * 10, 3)} mm.`} />
          <Goal ok={metal === "aluminium" && temperature > 80} pending="Switch to aluminium. It should grow more than steel for the same rise." done={`Aluminium’s ΔL is ${num(deltaMm, 2)} mm. Steel at this temperature would grow ${num((other - 1) * 1000, 2)} mm.`} />
        </>
      }
      readouts={
        <Readouts
          items={[
            { label: "Temperature", value: `${num(temperature, 0)} °C` },
            { label: "α", value: `${num(METALS[metal].alpha * 1e5, 1)} × 10⁻⁵ /°C` },
            { label: "ΔT", value: `${num(rise, 0)} °C` },
            { label: "New length", value: `${num(length, 5)} m` },
            { label: "ΔL = L₀ α ΔT", value: `${num(deltaMm, 3)} mm` },
            { label: "Hole diameter", value: `${num(hole, 4)} cm` },
          ]}
        />
      }
      explain={
        <p>L = L₀ (1 + α ΔT). The same factor multiplies the diameter of a hole, the diameter of a disc, and the length of a rod of that metal. Brass is the usual NCERT comparison with steel because its α is larger.</p>
      }
    />
  );
}
