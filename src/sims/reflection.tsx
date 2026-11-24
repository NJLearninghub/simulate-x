import { useState } from "react";
import { Check, Instrument, Slider } from "./kit";

const COLORS = ["#ffe600", "#38e1ff", "#ff5cf0", "#46ff9e", "#ff9a3c", "#ffffff"];

export default function Reflection() {
  const [angle, setAngle] = useState(45);
  const [color, setColor] = useState(COLORS[0]);
  const [incident, setIncident] = useState(true);
  const [reflected, setReflected] = useState(true);
  const [normal, setNormal] = useState(true);
  const [angles, setAngles] = useState(true);
  const [protractor, setProtractor] = useState(false);

  const t = (angle * Math.PI) / 180;
  const P = { x: 500, y: 430 };
  const L = 320;
  const R = 78;
  const src = { x: P.x - L * Math.sin(t), y: P.y - L * Math.cos(t) };
  const refl = { x: P.x + L * Math.sin(t), y: P.y - L * Math.cos(t) };

  function arc(side: number) {
    let d = "";
    for (let i = 0; i <= 24; i++) {
      const f = ((angle * i) / 24) * (Math.PI / 180);
      const x = P.x + R * Math.sin(f) * side;
      const y = P.y - R * Math.cos(f);
      d += `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)} `;
    }
    return d;
  }

  const ticks = [];
  if (protractor) {
    for (let d = 0; d <= 180; d += 10) {
      const ang = ((d - 90) * Math.PI) / 180;
      const outer = 150;
      const inner = d % 30 === 0 ? outer - 16 : outer - 8;
      ticks.push(
        <line
          key={d}
          x1={P.x + outer * Math.sin(ang)}
          y1={P.y - outer * Math.cos(ang)}
          x2={P.x + inner * Math.sin(ang)}
          y2={P.y - inner * Math.cos(ang)}
          stroke="#7d8aa6"
          strokeWidth={d % 30 === 0 ? 2 : 1}
        />,
      );
    }
  }

  return (
    <Instrument
      controls={
        <>
          <Slider label="Angle of incidence" value={angle} min={0} max={80} step={1} onChange={setAngle} format={(v) => `${v}°`} />
          <div>
            <div className="mb-1 text-[13px] font-semibold text-[var(--text-muted)]">Ray colour</div>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  aria-label={c}
                  onClick={() => setColor(c)}
                  className="h-8 w-8 rounded-lg border-2"
                  style={{ background: c, borderColor: c === color ? "var(--primary)" : "transparent", minHeight: 32 }}
                />
              ))}
            </div>
          </div>
          <Check label="Incident ray" checked={incident} onChange={setIncident} />
          <Check label="Reflected ray" checked={reflected} onChange={setReflected} />
          <Check label="Normal" checked={normal} onChange={setNormal} />
          <Check label="Angle marks" checked={angles} onChange={setAngles} />
          <Check label="Protractor" checked={protractor} onChange={setProtractor} />
          <p className="note">Law of reflection: ∠i = ∠r = {angle}°. Both angles are measured from the normal.</p>
          <button
            className="reset-btn"
            onClick={() => {
              setAngle(45);
              setColor(COLORS[0]);
              setIncident(true);
              setReflected(true);
              setNormal(true);
              setAngles(true);
              setProtractor(false);
            }}
          >
            Reset
          </button>
        </>
      }
    >
      <svg viewBox="0 0 1000 520" className="h-full w-full">
        <rect width="1000" height="520" fill="#10141d" />
        {ticks}
        {normal && (
          <>
            <line x1={P.x} y1={80} x2={P.x} y2={P.y} stroke="#9aa6bf" strokeWidth={2} strokeDasharray="8 7" />
            <text x={P.x + 10} y={100} fill="#aeb8cd" fontSize={18}>Normal</text>
          </>
        )}
        {angles && angle > 0 && (
          <>
            <path d={arc(-1)} fill="none" stroke="#cfd7e8" strokeWidth={1.6} />
            <path d={arc(1)} fill="none" stroke="#cfd7e8" strokeWidth={1.6} />
            <text x={P.x - (R + 28) * Math.sin(t / 2)} y={P.y - (R + 28) * Math.cos(t / 2)} fill="#e6ebf5" fontSize={20} textAnchor="middle">∠i</text>
            <text x={P.x + (R + 28) * Math.sin(t / 2)} y={P.y - (R + 28) * Math.cos(t / 2)} fill="#e6ebf5" fontSize={20} textAnchor="middle">∠r</text>
          </>
        )}
        {incident && <line x1={src.x} y1={src.y} x2={P.x} y2={P.y} stroke={color} strokeWidth={4} strokeLinecap="round" />}
        {reflected && <line x1={P.x} y1={P.y} x2={refl.x} y2={refl.y} stroke={color} strokeWidth={4} strokeLinecap="round" />}
        <rect x="140" y={P.y} width="720" height="14" fill="#c5ceda" />
        <rect x="140" y={P.y + 14} width="720" height="8" fill="#4a5468" />
        <text x="160" y="36" fill="#9fb0cf" fontSize={16}>Mirror · ∠i = ∠r</text>
      </svg>
    </Instrument>
  );
}
