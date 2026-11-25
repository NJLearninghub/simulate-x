import { useState } from "react";
import { youngExtension } from "./formulas";
import { Goal, Handle, Lesson, PlotFrame, Predict, Presets, Readouts, num } from "./lesson";

const MATERIALS = {
  steel: { label: "Steel", y: 2.0e11 },
  copper: { label: "Copper", y: 1.1e11 },
  aluminium: { label: "Aluminium", y: 0.7e11 },
};

export default function SolidsSim() {
  const [material, setMaterial] = useState<keyof typeof MATERIALS>("steel");
  const [mass, setMass] = useState(5);
  const [length, setLength] = useState(1.5);
  const [radiusMm, setRadiusMm] = useState(0.4);
  const force = mass * 9.8;
  const radius = radiusMm / 1000;
  const wire = youngExtension(force, length, radius, MATERIALS[material].y);
  const steel = youngExtension(force, length, radius, MATERIALS.steel.y);
  const extensionMm = wire.extension * 1000;
  const draw = Math.min(70, extensionMm * 8);

  return (
    <Lesson
      idea="Inside the elastic limit a wire behaves like a stiff spring. Stress is force per area, strain is the fractional stretch, and their ratio is Young’s modulus."
      graph={
        <PlotFrame label="Loaded wire">
          <rect width={360} height={240} fill="var(--surface-2)" />
          <text x={16} y={24} fill="var(--text-muted)" fontSize={13}>Drag the load, the length mark, or the thickness.</text>
          <line x1={120} y1={36} x2={240} y2={36} stroke="var(--text)" strokeWidth={4} />
          <line x1={180} y1={36} x2={180} y2={120 + draw} stroke="var(--primary)" strokeWidth={Math.max(2, radiusMm * 6)} />
          <rect x={158} y={120 + draw} width={44} height={36} rx={4} fill="var(--primary)" />
          <Handle x={180} y={156 + draw} label={`${num(mass, 1)} kg`} onDrag={(point) => setMass(Math.min(15, Math.max(1, (point.y - 140) / 6)))} />
          <Handle x={250} y={78} label="L" onDrag={(point) => setLength(Math.min(3, Math.max(0.6, (point.y - 36) / 40)))} />
          <Handle x={70} y={100} label="r" onDrag={(point) => setRadiusMm(Math.min(1, Math.max(0.2, (120 - point.y) / 80)))} />
          <text x={16} y={210} fill="var(--text-soft)" fontSize={12}>The drawing exaggerates the stretch. The true extension is {num(extensionMm, 2)} mm.</text>
        </PlotFrame>
      }
      presets={
        <Presets
          items={(Object.keys(MATERIALS) as (keyof typeof MATERIALS)[]).map((id) => ({
            id,
            label: MATERIALS[id].label,
            active: material === id,
            onClick: () => setMaterial(id),
          }))}
        />
      }
      tries={
        <>
          <Predict
            prompt="Same load, same wire size. Which metal stretches more?"
            options={[{ id: "steel", label: "Steel" }, { id: "copper", label: "Copper" }, { id: "same", label: "They match" }]}
            answer="copper"
            because="Young’s modulus of copper (110 GPa) is less than steel (200 GPa), so copper extends more. Switch the preset and compare."
          />
          <Goal ok={material === "copper"} pending="Choose copper and compare the extension with steel’s." done={`Copper extends ${num(wire.extension * 1000, 2)} mm. Steel in the same setup would extend ${num(steel.extension * 1000, 2)} mm.`} />
          <Goal ok={radiusMm > 0.75} pending="Drag the wire thicker. Stretch falls with the area, and area grows with r²." done="A thicker wire has more area, so the same force produces less stress and less extension." />
          <Goal ok={Math.abs(length - 1.5) > 0.4} pending="Change the length. Stress stays put; the extension changes." done="Stress = F/A does not use the length. Strain = ΔL/L, so a longer wire extends more for the same strain." />
        </>
      }
      readouts={
        <Readouts
          items={[
            { label: "Force mg", value: `${num(force, 1)} N` },
            { label: "Stress F/A", value: `${num(wire.stress / 1e6, 1)} MPa` },
            { label: "Strain ΔL/L", value: num(wire.strain, 5) },
            { label: "Young’s modulus", value: `${num(MATERIALS[material].y / 1e9, 0)} GPa` },
            { label: "Extension ΔL", value: `${num(extensionMm, 3)} mm` },
            { label: "Radius", value: `${num(radiusMm, 2)} mm` },
          ]}
        />
      }
      explain={
        <>
          <p>Y = stress / strain = (F/A) / (ΔL/L), so ΔL = F L / (A Y). A = πr².</p>
          <p>Doubling the radius multiplies the area by four and cuts the extension to a quarter. These metals stay in the elastic region for the loads on the diagram; past the elastic limit the line stops being straight and the wire does not spring back.</p>
        </>
      }
    />
  );
}
