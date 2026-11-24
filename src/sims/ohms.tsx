import { useState } from "react";
import { Instrument, Slider } from "./kit";

export default function OhmsLaw() {
  const [voltage, setVoltage] = useState(6);
  const [resistance, setResistance] = useState(3);
  const current = voltage / resistance;
  const power = voltage * current;
  const glow = Math.min(1, power / 48);

  const points: string[] = [];
  for (let v = 0; v <= 12; v += 0.5) {
    const x = 40 + (v / 12) * 220;
    const y = 150 - ((v / resistance) / 12) * 120;
    points.push(`${x},${y}`);
  }
  const dotX = 40 + (voltage / 12) * 220;
  const dotY = 150 - (current / 12) * 120;

  return (
    <Instrument
      controls={
        <>
          <Slider label="Voltage V" value={voltage} min={0} max={12} step={0.1} onChange={setVoltage} format={(v) => `${v.toFixed(1)} V`} />
          <Slider label="Resistance R" value={resistance} min={1} max={12} step={0.1} onChange={setResistance} format={(v) => `${v.toFixed(1)} Ω`} />
          <div className="readout">
            <div><span>Current I = V/R</span><b>{current.toFixed(2)} A</b></div>
            <div><span>Power P = VI</span><b>{power.toFixed(1)} W</b></div>
          </div>
          <p className="note">
            Ohm’s law: at constant temperature, V ∝ I, so the graph of V against I is a straight line through the origin. Slope of the I–V graph here is 1/R = {(1 / resistance).toFixed(3)} S.
          </p>
        </>
      }
    >
      <div className="grid h-full items-center gap-2 p-4 md:grid-cols-2">
        <svg viewBox="0 0 220 220" className="mx-auto w-full max-w-[240px]">
          <circle cx="110" cy="90" r={48 + glow * 26} fill="#ffd23f" opacity={glow * 0.45} />
          <circle cx="110" cy="90" r="46" fill={glow > 0.02 ? "#fff4c2" : "#39435c"} stroke="#ffd23f" strokeWidth="2" />
          <path d="M96 96 q14 -22 28 0" fill="none" stroke={glow > 0.02 ? "#ff8a00" : "#5a6685"} strokeWidth="3" />
          <rect x="96" y="132" width="28" height="18" rx="3" fill="#8a93a8" />
          <text x="110" y="190" textAnchor="middle" fill="#d5deef" fontSize="14">{power.toFixed(1)} W</text>
        </svg>
        <svg viewBox="0 0 280 180" className="w-full">
          <text x="40" y="16" fill="#9fb0cf" fontSize="12">I (A) against V (V), R fixed</text>
          <line x1="40" y1="20" x2="40" y2="150" stroke="#5a6685" />
          <line x1="40" y1="150" x2="270" y2="150" stroke="#5a6685" />
          <polyline points={points.join(" ")} fill="none" stroke="#5e7bff" strokeWidth="2.5" />
          <circle cx={dotX} cy={dotY} r="5" fill="#ffd23f" />
          <text x="250" y="168" fill="#9fb0cf" fontSize="11">V</text>
          <text x="12" y="28" fill="#9fb0cf" fontSize="11">I</text>
        </svg>
      </div>
    </Instrument>
  );
}
