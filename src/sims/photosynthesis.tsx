import { useEffect, useRef, useState } from "react";
import { Instrument, Slider } from "./kit";

/** Saturating response: rate rises with light, then other factors limit it. */
function rateOf(lightPercent: number) {
  const x = lightPercent / 100;
  return x / (x + 0.35);
}

export default function Photosynthesis() {
  const [light, setLight] = useState(40);
  const svgRef = useRef<SVGSVGElement>(null);
  const bubbles = useRef(
    Array.from({ length: 14 }, () => ({
      x: 300 + Math.random() * 50,
      y: 180 + Math.random() * 70,
      r: 2 + Math.random() * 3,
    })),
  );

  const rate = rateOf(light);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const svg = svgRef.current;
      if (svg) {
        const nodes = svg.querySelectorAll<SVGCircleElement>("[data-bubble]");
        bubbles.current.forEach((b, i) => {
          b.y -= 0.35 + rate * 2.4;
          if (b.y < 70) {
            b.y = 250;
            b.x = 300 + Math.random() * 50;
          }
          const node = nodes[i];
          if (node) {
            node.setAttribute("cx", b.x.toFixed(1));
            node.setAttribute("cy", b.y.toFixed(1));
            node.setAttribute("opacity", (0.25 + rate * 0.7).toFixed(2));
          }
        });
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [rate]);

  const curve: string[] = [];
  for (let i = 0; i <= 100; i += 2) {
    const x = 40 + (i / 100) * 200;
    const y = 120 - rateOf(i) * 90;
    curve.push(`${x},${y}`);
  }
  const dotX = 40 + (light / 100) * 200;
  const dotY = 120 - rate * 90;

  return (
    <Instrument
      controls={
        <>
          <Slider label="Light intensity" value={light} min={0} max={100} step={1} onChange={setLight} format={(v) => `${v}%`} />
          <div className="readout">
            <div><span>Relative rate</span><b>{Math.round(rate * 100)}%</b></div>
            <div><span>Limiting</span><b>{light > 70 ? "other factors" : "light"}</b></div>
          </div>
          <p className="note">
            6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂, in light. More light releases oxygen faster, until carbon dioxide, temperature or chlorophyll limits the rate and the curve flattens.
          </p>
        </>
      }
    >
      <div className="grid h-full items-center gap-2 p-3 md:grid-cols-[1.2fr_0.8fr]">
        <svg ref={svgRef} viewBox="0 0 460 300" className="w-full">
          <rect width="460" height="300" fill="#10141d" rx="12" />
          <circle cx="70" cy="64" r={18 + rate * 12} fill="#ffd23f" opacity={0.35 + rate * 0.6} />
          <rect x="248" y="150" width="8" height="100" fill="#1f7a3a" />
          <path d="M252 160 q70 -70 120 0 q-40 70 -120 40 q-40 -10 0 -40 z" fill="#2fae5a" />
          {bubbles.current.map((b, i) => (
            <circle key={i} data-bubble="" cx={b.x} cy={b.y} r={b.r} fill="#7fe7ff" />
          ))}
          <text x="16" y="24" fill="#9fb0cf" fontSize="13">Oxygen bubbles</text>
        </svg>
        <svg viewBox="0 0 260 150" className="w-full">
          <text x="8" y="14" fill="#9fb0cf" fontSize="12">Rate vs light</text>
          <line x1="40" y1="16" x2="40" y2="120" stroke="#5a6685" />
          <line x1="40" y1="120" x2="246" y2="120" stroke="#5a6685" />
          <polyline points={curve.join(" ")} fill="none" stroke="#3ddc84" strokeWidth="2.5" />
          <circle cx={dotX} cy={dotY} r="4.5" fill="#ffd23f" />
          <text x="200" y="140" fill="#9fb0cf" fontSize="11">Light</text>
        </svg>
      </div>
    </Instrument>
  );
}
