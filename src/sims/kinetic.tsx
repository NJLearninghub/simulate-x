import { useState } from "react";
import { maxwell, speeds } from "./formulas";
import { Goal, Handle, Lesson, PlotFrame, Predict, Presets, Readouts, num } from "./lesson";

const GASES = {
  h2: { label: "Hydrogen", mass: 0.002 },
  n2: { label: "Nitrogen", mass: 0.028 },
  o2: { label: "Oxygen", mass: 0.032 },
};

export default function KineticSim() {
  const [gas, setGas] = useState<keyof typeof GASES>("o2");
  const [temperature, setTemperature] = useState(300);
  const [probe, setProbe] = useState(400);
  const molar = GASES[gas].mass;
  const marks = speeds(temperature, molar);
  const room = speeds(300, molar);
  const vMax = Math.max(2500, marks.vrms * 2.6);
  const samples = Array.from({ length: 80 }, (_, i) => {
    const speed = (vMax * i) / 79;
    return { speed, density: maxwell(speed, temperature, molar) };
  });
  const peak = Math.max(...samples.map((sample) => sample.density));
  const X = (speed: number) => 46 + (speed / vMax) * 290;
  const Y = (density: number) => 190 - (density / peak) * 140;
  const d = samples.map((sample, index) => `${index ? "L" : "M"} ${X(sample.speed).toFixed(1)} ${Y(sample.density).toFixed(1)}`).join(" ");
  const factor = marks.vrms / room.vrms;

  return (
    <Lesson
      idea="Molecules in a gas do not share one speed. Raising the temperature, or choosing a lighter gas, shifts the whole distribution toward higher speeds."
      graph={
        <PlotFrame label="Maxwell speed distribution">
          <rect width={360} height={240} fill="var(--surface-2)" />
          <line x1={46} y1={190} x2={340} y2={190} stroke="var(--text-muted)" />
          <path d={`${d} L ${X(vMax)} 190 L 46 190 Z`} fill="var(--primary)" opacity={0.15} />
          <path d={d} fill="none" stroke="var(--primary)" strokeWidth={2.4} />
          {(["vmp", "vavg", "vrms"] as const).map((key) => (
            <line key={key} x1={X(marks[key])} y1={50} x2={X(marks[key])} y2={190} stroke="var(--text-soft)" strokeDasharray="4 3" />
          ))}
          <text x={X(marks.vmp)} y={44} textAnchor="middle" fontSize={11} fill="var(--text-muted)">mp</text>
          <text x={X(marks.vavg)} y={32} textAnchor="middle" fontSize={11} fill="var(--text-muted)">avg</text>
          <text x={X(marks.vrms)} y={44} textAnchor="middle" fontSize={11} fill="var(--text-muted)">rms</text>
          <Handle x={28} y={190 - ((temperature - 150) / 750) * 150} label="T" onDrag={(point) => setTemperature(Math.min(900, Math.max(150, 150 + ((190 - point.y) / 150) * 750)))} />
          <Handle x={X(probe)} y={Y(maxwell(probe, temperature, molar))} label="v" onDrag={(point) => setProbe(Math.min(vMax, Math.max(0, ((point.x - 46) / 290) * vMax)))} />
        </PlotFrame>
      }
      presets={
        <Presets
          items={[
            ...(Object.keys(GASES) as (keyof typeof GASES)[]).map((id) => ({ id, label: GASES[id].label, active: gas === id, onClick: () => setGas(id) })),
            { id: "room", label: "300 K", active: Math.abs(temperature - 300) < 8, onClick: () => setTemperature(300) },
            { id: "hot", label: "600 K", active: Math.abs(temperature - 600) < 12, onClick: () => setTemperature(600) },
          ]}
        />
      }
      tries={
        <>
          <Predict
            prompt="At the same temperature, which marker is farthest to the right?"
            options={[{ id: "mp", label: "Most probable" }, { id: "avg", label: "Average" }, { id: "rms", label: "rms" }]}
            answer="rms"
            because="vrms = √(3RT/M), vavg = √(8RT/πM), vmp = √(2RT/M). Since 3 > 8/π > 2, rms is the largest."
          />
          <Goal ok={marks.vmp < marks.vavg && marks.vavg < marks.vrms} pending="Check the order of the three markers." done={`Most probable ${num(marks.vmp, 0)}, average ${num(marks.vavg, 0)}, rms ${num(marks.vrms, 0)} m/s.`} />
          <Goal ok={gas === "o2" && temperature > 560 && temperature < 660} pending="Keep oxygen and drag T to about 600 K. Speeds should grow by √2, not by 2." done={`rms is ×${num(factor, 3)} compared with 300 K. √2 is 1.414.`} />
          <Goal ok={gas === "h2"} pending="Switch to hydrogen at the same temperature. The lighter gas is much faster." done="Hydrogen’s molar mass is 16 times smaller than oxygen’s, so its speeds are 4 times larger." />
        </>
      }
      readouts={
        <Readouts
          items={[
            { label: "Temperature", value: `${num(temperature, 0)} K` },
            { label: "Probe speed", value: `${num(probe, 0)} m/s` },
            { label: "Most probable", value: `${num(marks.vmp, 0)} m/s` },
            { label: "Average", value: `${num(marks.vavg, 0)} m/s` },
            { label: "rms", value: `${num(marks.vrms, 0)} m/s` },
            { label: "rms / most probable", value: num(marks.vrms / marks.vmp, 3) },
          ]}
        />
      }
      explain={
        <p>f(v) = 4πv² (M / 2πRT)^(3/2) exp(−Mv² / 2RT). The peak sits at the most probable speed. The rms speed is the one in p = (1/3) ρ vrms² and in the average kinetic energy (3/2) kT per molecule.</p>
      }
    />
  );
}
