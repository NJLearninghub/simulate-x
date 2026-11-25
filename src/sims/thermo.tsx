import { useState } from "react";
import { thermo, type Process } from "./formulas";
import { Goal, Handle, Lesson, PlotFrame, Predict, Presets, Readouts, num } from "./lesson";

const PROCESSES: { id: Process; label: string }[] = [
  { id: "isothermal", label: "Isothermal" },
  { id: "isobaric", label: "Isobaric" },
  { id: "isochoric", label: "Isochoric" },
  { id: "adiabatic", label: "Adiabatic" },
];

export default function ThermoSim() {
  const [process, setProcess] = useState<Process>("isothermal");
  const [v1, setV1] = useState(0.02);
  const [v2, setV2] = useState(0.04);
  const [t1, setT1] = useState(300);
  const [t2, setT2] = useState(400);
  const state = thermo(process, v1, v2, t1, 1.4, 1, t2);
  const path: { v: number; p: number }[] = [];
  if (process === "isochoric") {
    path.push({ v: v1, p: state.P1 }, { v: v1, p: state.P2 });
  } else {
    for (let i = 0; i <= 24; i++) {
      const v = v1 + ((v2 - v1) * i) / 24;
      const sample = thermo(process, v1, v, t1);
      path.push({ v, p: i === 0 ? sample.P1 : sample.P2 });
    }
  }
  const pressures = path.map((point) => point.p);
  const pMax = Math.max(...pressures, state.P1, state.P2) * 1.15;
  const X = (v: number) => 50 + ((v - 0.01) / 0.05) * 280;
  const Y = (p: number) => 200 - (p / pMax) * 160;
  const d = path.map((point, index) => `${index ? "L" : "M"} ${X(point.v).toFixed(1)} ${Y(point.p).toFixed(1)}`).join(" ");

  return (
    <Lesson
      idea="A gas exchanges energy as heat and as work. On a P–V diagram the work done by the gas is the area under the path, and ΔU = Q − W."
      graph={
        <PlotFrame label="Piston and P-V path">
          <rect width={360} height={240} fill="var(--surface-2)" />
          <line x1={50} y1={200} x2={340} y2={200} stroke="var(--text-muted)" />
          <line x1={50} y1={200} x2={50} y2={28} stroke="var(--text-muted)" />
          <text x={300} y={222} fontSize={12} fill="var(--text-soft)">V</text>
          <text x={28} y={36} fontSize={12} fill="var(--text-soft)">P</text>
          <path d={`${d} L ${X(path[path.length - 1].v)} 200 L ${X(path[0].v)} 200 Z`} fill="var(--primary)" opacity={0.18} />
          <path d={d} fill="none" stroke="var(--primary)" strokeWidth={2.4} />
          <Handle x={X(v1)} y={210} label="start" onDrag={(point) => setV1(Math.min(0.05, Math.max(0.012, 0.01 + ((point.x - 50) / 280) * 0.05)))} />
          {process === "isochoric" ? (
            <Handle x={326} y={40 + ((500 - t2) / 300) * 140} label="T" onDrag={(point) => setT2(Math.min(500, Math.max(220, 500 - ((point.y - 40) / 140) * 300)))} />
          ) : (
            <Handle x={X(v2)} y={Y(state.P2)} label="piston" onDrag={(point) => setV2(Math.min(0.055, Math.max(0.012, 0.01 + ((point.x - 50) / 280) * 0.05)))} />
          )}
        </PlotFrame>
      }
      presets={
        <Presets
          items={PROCESSES.map((item) => ({
            id: item.id,
            label: item.label,
            active: process === item.id,
            onClick: () => {
              setProcess(item.id);
              setV1(0.02);
              setV2(0.04);
              setT1(300);
              setT2(400);
            },
          }))}
        />
      }
      tries={
        <>
          <Predict
            prompt="One mole of gas expands slowly at constant temperature. What happens to its internal energy?"
            options={[{ id: "up", label: "It rises" }, { id: "zero", label: "It stays the same" }, { id: "down", label: "It falls" }]}
            answer="zero"
            because="For an ideal gas U depends only on temperature. Isothermal means ΔT = 0, so ΔU = 0 and Q = W."
          />
          <Goal ok={process === "isothermal" && Math.abs(state.dU) < 1e-6} pending="Stay on isothermal and drag the piston. ΔU should read zero." done="Temperature is fixed, so ΔU = 0. Every joule of work done by the gas was supplied as heat." />
          <Goal ok={process === "isochoric"} pending="Choose isochoric. The piston cannot move, so the work is zero." done="W = 0. All the heat stays in the gas: Q = ΔU = n Cv ΔT." />
          <Goal ok={process === "adiabatic" && v2 > v1 + 0.005} pending="Choose adiabatic and expand. The temperature should fall, because Q = 0." done={`Q is zero, so the work comes out of the gas. T falls from ${num(t1, 0)} K to ${num(state.T2, 0)} K.`} />
        </>
      }
      readouts={
        <Readouts
          items={[
            { label: "T start → now", value: `${num(t1, 0)} → ${num(state.T2, 0)} K` },
            { label: "Work by gas W", value: `${num(state.W, 0)} J` },
            { label: "ΔU", value: `${num(state.dU, 0)} J` },
            { label: "Heat Q", value: `${num(state.Q, 0)} J` },
            { label: "P start", value: `${num(state.P1 / 1000, 1)} kPa` },
            { label: "P now", value: `${num(state.P2 / 1000, 1)} kPa` },
          ]}
        />
      }
      explain={
        <>
          <p>Ideal gas, one mole, diatomic so γ = 1.4, Cv = R/(γ − 1) and Cp = Cv + R. PV = nRT.</p>
          <p>Isothermal: W = nRT ln(V₂/V₁) and ΔU = 0. Isobaric: W = PΔV and Q = nCpΔT. Isochoric: W = 0. Adiabatic: Q = 0, TV^(γ−1) stays constant, and W = −ΔU.</p>
          <p>The shaded area is the work done by the gas when the piston moves. On the isochoric path the piston is locked and you drag the temperature instead.</p>
        </>
      }
    />
  );
}
