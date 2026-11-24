import { useState } from "react";
import { Instrument, Slider } from "./kit";

export default function Refraction() {
  const [angle, setAngle] = useState(40);
  const [n1, setN1] = useState(1);
  const [n2, setN2] = useState(1.5);

  const i = (angle * Math.PI) / 180;
  const sinR = (n1 * Math.sin(i)) / n2;
  const tir = sinR > 1;
  const r = tir ? Math.PI / 2 : Math.asin(Math.min(1, Math.max(-1, sinR)));
  const critical = n1 > n2 ? (Math.asin(Math.min(1, n2 / n1)) * 180) / Math.PI : null;

  const cx = 300;
  const cy = 190;
  const L = 170;
  const ix = cx - L * Math.sin(i);
  const iy = cy - L * Math.cos(i);
  const rx = cx + L * Math.sin(r);
  const ry = cy + L * Math.cos(r);
  const reflx = cx + L * Math.sin(i);
  const refly = cy - L * Math.cos(i);

  return (
    <Instrument
      controls={
        <>
          <Slider label="Angle of incidence" value={angle} min={0} max={85} step={1} onChange={setAngle} format={(v) => `${v}°`} />
          <Slider label="n₁ (incident medium)" value={n1} min={1} max={2.5} step={0.01} onChange={setN1} format={(v) => v.toFixed(2)} />
          <Slider label="n₂ (second medium)" value={n2} min={1} max={2.5} step={0.01} onChange={setN2} format={(v) => v.toFixed(2)} />
          <div className="readout">
            <div>
              <span>∠r</span>
              <b>{tir ? "—" : `${((r * 180) / Math.PI).toFixed(1)}°`}</b>
            </div>
            <div>
              <span>Critical angle</span>
              <b>{critical === null ? "none" : `${critical.toFixed(1)}°`}</b>
            </div>
          </div>
          <p className="note">
            Snell’s law: n₁ sin θ₁ = n₂ sin θ₂.
            {tir
              ? " The ray is totally internally reflected — it cannot enter the rarer medium."
              : n2 > n1
                ? " Entering a denser medium bends the ray toward the normal."
                : n2 < n1
                  ? " Entering a rarer medium bends the ray away from the normal."
                  : " Same medium: the ray does not bend."}
          </p>
        </>
      }
    >
      <svg viewBox="0 0 600 380" className="h-full w-full">
        <rect width="600" height="190" fill="#1a2336" />
        <rect y="190" width="600" height="190" fill="#10203f" />
        <line x1="0" y1="190" x2="600" y2="190" stroke="#5e7bff" strokeWidth="2" />
        <line x1={cx} y1="30" x2={cx} y2="350" stroke="#6b7a99" strokeDasharray="6 6" />
        <line x1={ix} y1={iy} x2={cx} y2={cy} stroke="#ffd23f" strokeWidth="3" />
        {tir ? (
          <line x1={cx} y1={cy} x2={reflx} y2={refly} stroke="#ffd23f" strokeWidth="3" />
        ) : (
          <line x1={cx} y1={cy} x2={rx} y2={ry} stroke="#3fe0ff" strokeWidth="3" />
        )}
        {!tir && n1 !== n2 && (
          <line x1={cx} y1={cy} x2={reflx} y2={refly} stroke="#ffd23f" strokeWidth="1.5" opacity="0.35" />
        )}
        <text x="16" y="28" fill="#9fb0cf" fontSize="14">Medium 1 · n₁ = {n1.toFixed(2)}</text>
        <text x="16" y="364" fill="#9fb0cf" fontSize="14">Medium 2 · n₂ = {n2.toFixed(2)}</text>
        <text x={ix - 8} y={iy - 8} fill="#ffd23f" fontSize="14">θ₁ = {angle}°</text>
        <text x={tir ? reflx - 20 : rx + 6} y={tir ? refly : ry} fill={tir ? "#ffd23f" : "#3fe0ff"} fontSize="14">
          {tir ? "TIR" : `θ₂ = ${((r * 180) / Math.PI).toFixed(0)}°`}
        </text>
      </svg>
    </Instrument>
  );
}
