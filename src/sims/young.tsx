import { useState } from "react";
import { fringeSpacing } from "./formulas";
import { Goal, Handle, Lesson, PlotFrame, Predict, Presets, Readouts, num } from "./lesson";

const COLOURS = [
  { id: "red", label: "Red 650 nm", lambda: 650, color: "#e11d48" },
  { id: "yellow", label: "Sodium 589 nm", lambda: 589, color: "#eab308" },
  { id: "blue", label: "Blue 450 nm", lambda: 450, color: "#2563eb" },
];

export default function YoungSim() {
  const [lambdaNm, setLambdaNm] = useState(650);
  const [separationMm, setSeparationMm] = useState(0.5);
  const [screenM, setScreenM] = useState(1.2);
  const [fringe, setFringe] = useState(0);
  const lambda = lambdaNm * 1e-9;
  const separation = separationMm * 1e-3;
  const beta = fringeSpacing(lambda, screenM, separation);
  const y = fringe * beta;
  const delta = (separation * y) / screenM;
  const inWavelengths = delta / lambda;
  const intensity = Math.cos(Math.PI * inWavelengths) ** 2;
  const colour = COLOURS.reduce((best, item) => (Math.abs(item.lambda - lambdaNm) < Math.abs(best.lambda - lambdaNm) ? item : best)).color;
  const gap = 18 + separationMm * 36;
  const slitA = 120 - gap / 2;
  const slitB = 120 + gap / 2;
  const band = Math.max(8, Math.min(28, (beta / 0.00156) * 14));
  const probeY = 120 - fringe * band;

  return (
    <Lesson
      idea="Two slits split one wave into two. Where the paths differ by a whole number of wavelengths the waves add; halfway between, they cancel."
      graph={
        <PlotFrame label="Young's double slit">
          <rect width={360} height={240} fill="var(--surface-2)" />
          <line x1={70} y1={30} x2={70} y2={200} stroke="var(--text)" strokeWidth={3} />
          <circle cx={70} cy={slitA} r={5} fill="var(--primary)" />
          <circle cx={70} cy={slitB} r={5} fill="var(--primary)" />
          <Handle x={70} y={slitA} onDrag={(point) => setSeparationMm(Math.min(1.2, Math.max(0.25, (Math.abs(120 - point.y) * 2 - 18) / 36)))} />
          <line x1={300} y1={24} x2={300} y2={200} stroke="var(--border-strong)" strokeWidth={8} />
          {Array.from({ length: 11 }, (_, index) => {
            const order = index - 5;
            const yy = 120 + order * band;
            const bright = order % 2 === 0;
            return <line key={index} x1={294} y1={yy} x2={306} y2={yy} stroke={bright ? colour : "var(--text)"} strokeWidth={bright ? 5 : 2} opacity={bright ? 0.95 : 0.35} />;
          })}
          <line x1={70} y1={slitA} x2={300} y2={probeY} stroke="var(--primary)" strokeWidth={1.2} />
          <line x1={70} y1={slitB} x2={300} y2={probeY} stroke="var(--primary)" strokeWidth={1.2} />
          <Handle x={300} y={probeY} label="screen" onDrag={(point) => setFringe(Math.min(3, Math.max(-3, (120 - point.y) / band)))} />
          <Handle x={40 + ((lambdaNm - 450) / 250) * 200} y={222} onDrag={(point) => setLambdaNm(Math.min(700, Math.max(450, 450 + ((point.x - 40) / 200) * 250)))} />
          <text x={16} y={22} fill="var(--text-muted)" fontSize={12}>Drag a slit, the screen point, or the colour.</text>
        </PlotFrame>
      }
      presets={
        <Presets
          items={[
            ...COLOURS.map((item) => ({ id: item.id, label: item.label, active: Math.abs(lambdaNm - item.lambda) < 8, onClick: () => setLambdaNm(item.lambda) })),
            { id: "wide", label: "Wider slits", active: separationMm > 0.9, onClick: () => setSeparationMm(1) },
            { id: "centre", label: "Centre of screen", active: Math.abs(fringe) < 0.08, onClick: () => setFringe(0) },
          ]}
        />
      }
      tries={
        <>
          <Predict
            prompt="You move the two slits farther apart. What happens to the bright bands?"
            options={[{ id: "wider", label: "They spread out" }, { id: "closer", label: "They pack closer" }, { id: "same", label: "No change" }]}
            answer="closer"
            because="Fringe width β = λD/d. A larger slit separation d makes a smaller β. Drag a slit upward and watch β."
          />
          <Goal ok={separationMm > 0.85} pending="Drag the slits apart. The fringe width should shrink." done={`Slit gap ${num(separationMm, 2)} mm, fringe width ${num(beta * 1000, 2)} mm.`} />
          <Goal ok={lambdaNm < 480} pending="Drag the colour toward blue. Blue has a shorter wavelength, so narrower fringes than red." done="Blue’s smaller λ shrinks β. Red spreads the pattern out." />
          <Goal ok={Math.abs(Math.abs(inWavelengths) - 0.5) < 0.08} pending="Drag the screen point to the first dark band. The path difference should be half a wavelength." done="The paths differ by about λ/2, so the waves arrive out of step and the intensity drops to zero." />
        </>
      }
      readouts={
        <Readouts
          items={[
            { label: "Wavelength λ", value: `${num(lambdaNm, 0)} nm` },
            { label: "Slit gap d", value: `${num(separationMm, 2)} mm` },
            { label: "Screen D", value: `${num(screenM, 1)} m` },
            { label: "Fringe width β", value: `${num(beta * 1000, 2)} mm` },
            { label: "Path difference", value: `${num(inWavelengths, 2)} λ` },
            { label: "Intensity / max", value: num(intensity, 2) },
          ]}
        />
      }
      extra={
        <label className="block text-sm font-semibold text-[var(--text-muted)]">
          Screen distance D
          <input className="w-full" style={{ height: 44 }} type="range" min={0.6} max={2} step={0.1} value={screenM} onChange={(event) => setScreenM(Number(event.target.value))} />
        </label>
      }
      explain={
        <p>β = λD/d. The path difference at height y on the screen is δ = d y / D. Bright fringes sit at δ = nλ and dark fringes at δ = (2n − 1)λ/2. Intensity follows cos²(πδ/λ). Moving the screen farther (larger D) spreads the fringes, just as a smaller d does.</p>
      }
    />
  );
}
