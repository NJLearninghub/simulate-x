import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { Instrument, Slider } from "./kit";

/**
 * Point on a circle of radius r rolling on a straight line without slipping.
 * x = r (θ − sin θ), y = r (1 − cos θ), with θ in radians from the bottom contact.
 */
export default function Cycloid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [radius, setRadius] = useState(48);
  const [speed, setSpeed] = useState(1);
  const [theta, setTheta] = useState(0);
  const [playing, setPlaying] = useState(true);
  const state = useRef({ radius: 48, speed: 1, theta: 0, playing: true });
  state.current = { radius, speed, theta, playing };

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let frame = 0;

    const draw = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(320, rect.width);
      const h = Math.max(280, rect.height);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const { radius: r, theta: th } = state.current;
      const baseline = h - 56;
      const startX = 36;
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, baseline);
      ctx.lineTo(w, baseline);
      ctx.stroke();

      ctx.beginPath();
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 2.5;
      const steps = Math.max(2, Math.ceil(th * 40));
      for (let i = 0; i <= steps; i++) {
        const t = (th * i) / steps;
        const px = startX + r * (t - Math.sin(t));
        const py = baseline - r * (1 - Math.cos(t));
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      const cx = startX + r * th;
      const cy = baseline - r;
      const px = startX + r * (th - Math.sin(th));
      const py = baseline - r * (1 - Math.cos(th));

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(59,130,246,0.18)";
      ctx.fill();
      ctx.strokeStyle = "#60a5fa";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(px, py);
      ctx.strokeStyle = "#e2e8f0";
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#ef4444";
      ctx.fill();

      if (cx - r > w) state.current.theta = 0;
    };

    const loop = () => {
      if (state.current.playing) {
        state.current.theta += 0.018 * state.current.speed;
        setTheta(state.current.theta);
      }
      draw();
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, []);

  const maxTheta = 8 * Math.PI;

  return (
    <Instrument
      controls={
        <>
          <div className="flex gap-2">
            <button
              className="reset-btn mt-0 flex flex-1 items-center justify-center gap-2"
              onClick={() => setPlaying((p) => !p)}
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}
              {playing ? "Pause" : "Play"}
            </button>
            <button
              className="reset-btn mt-0 flex items-center justify-center gap-2"
              onClick={() => {
                state.current.theta = 0;
                setTheta(0);
              }}
            >
              <RotateCcw size={16} /> Reset
            </button>
          </div>
          <Slider
            label="Angle θ"
            value={Math.min(theta, maxTheta)}
            min={0}
            max={maxTheta}
            step={0.01}
            onChange={(v) => {
              state.current.theta = v;
              state.current.playing = false;
              setPlaying(false);
              setTheta(v);
            }}
            format={(v) => `${v.toFixed(2)} rad`}
          />
          <Slider label="Radius" value={radius} min={24} max={80} step={1} onChange={setRadius} format={(v) => `${v} px`} />
          <Slider label="Speed" value={speed} min={0.25} max={3} step={0.05} onChange={setSpeed} format={(v) => `${v.toFixed(2)}×`} />
          <div className="readout">
            <div><span>Arc rolled</span><b>{(radius * theta).toFixed(0)} px</b></div>
            <div><span>Turns</span><b>{(theta / (2 * Math.PI)).toFixed(2)}</b></div>
          </div>
          <p className="note">
            The distance the centre travels equals the arc length rθ, which is rolling without slipping. One cusp appears after each full turn, when the tracing point touches the line.
          </p>
        </>
      }
    >
      <div ref={wrapRef} className="h-full min-h-[360px]">
        <canvas ref={canvasRef} className="block h-full w-full" />
      </div>
    </Instrument>
  );
}
