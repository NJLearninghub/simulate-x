import { useEffect, useRef, useState } from "react";
import { Instrument, Slider } from "./kit";

export default function Quadratic() {
  const [a, setA] = useState(1);
  const [b, setB] = useState(0);
  const [c, setC] = useState(-2);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const disc = b * b - 4 * a * c;
  let roots = "";
  if (a === 0 && b === 0) roots = "This is the horizontal line y = c.";
  else if (a === 0) roots = `a = 0, so this is the straight line y = ${b}x + ${c}. Root: x = ${(-c / b).toFixed(2)}.`;
  else if (disc > 1e-8) {
    const r1 = (-b + Math.sqrt(disc)) / (2 * a);
    const r2 = (-b - Math.sqrt(disc)) / (2 * a);
    roots = `Two real roots: x = ${r1.toFixed(2)} and x = ${r2.toFixed(2)}. Discriminant = ${disc.toFixed(2)}.`;
  } else if (Math.abs(disc) <= 1e-8) {
    roots = `One repeated root: x = ${(-b / (2 * a)).toFixed(2)}. Discriminant = 0.`;
  } else {
    roots = `No real roots. Discriminant = ${disc.toFixed(2)} < 0, so the parabola does not meet the x-axis.`;
  }
  const vertex = a === 0 ? null : { x: -b / (2 * a), y: c - (b * b) / (4 * a) };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    const sx = 28;
    const sy = 22;
    const ox = W / 2;
    const oy = H / 2;
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = "#243049";
    ctx.lineWidth = 1;
    for (let gx = ox; gx < W; gx += sx) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }
    for (let gx = ox; gx > 0; gx -= sx) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }
    for (let gy = oy; gy < H; gy += sy) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }
    for (let gy = oy; gy > 0; gy -= sy) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }
    ctx.strokeStyle = "#8ea0c0";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, oy); ctx.lineTo(W, oy);
    ctx.moveTo(ox, 0); ctx.lineTo(ox, H);
    ctx.stroke();
    ctx.strokeStyle = "#7aa2ff";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    let started = false;
    for (let px = 0; px <= W; px++) {
      const x = (px - ox) / sx;
      const y = a * x * x + b * x + c;
      const py = oy - y * sy;
      if (!started) { ctx.moveTo(px, py); started = true; }
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    if (vertex && Math.abs(vertex.x) < W / sx && Math.abs(vertex.y) < H / sy) {
      ctx.fillStyle = "#ffd23f";
      ctx.beginPath();
      ctx.arc(ox + vertex.x * sx, oy - vertex.y * sy, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [a, b, c]);

  return (
    <Instrument
      controls={
        <>
          <Slider label="a" value={a} min={-3} max={3} step={0.1} onChange={setA} format={(v) => v.toFixed(1)} />
          <Slider label="b" value={b} min={-6} max={6} step={0.1} onChange={setB} format={(v) => v.toFixed(1)} />
          <Slider label="c" value={c} min={-6} max={6} step={0.1} onChange={setC} format={(v) => v.toFixed(1)} />
          <div className="readout">
            <div><span>Vertex x</span><b>{vertex ? vertex.x.toFixed(2) : "—"}</b></div>
            <div><span>Vertex y</span><b>{vertex ? vertex.y.toFixed(2) : "—"}</b></div>
          </div>
          <p className="note">y = {a.toFixed(1)}x² + {b.toFixed(1)}x + {c.toFixed(1)}. {roots} The yellow point is the vertex.</p>
        </>
      }
    >
      <canvas ref={canvasRef} width={720} height={420} className="h-full w-full" />
    </Instrument>
  );
}
