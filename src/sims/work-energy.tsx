import { useState } from "react";
import { work } from "./formulas";
import { Goal, Handle, Lesson, PlotFrame, Predict, Presets, Readouts, num } from "./lesson";

export default function WorkEnergySim() {
  const [force, setForce] = useState(12);
  const [degrees, setDegrees] = useState(0);
  const [distance, setDistance] = useState(3);
  const joules = work(force, distance, degrees);
  const ke = Math.max(0, joules);
  const speed = Math.sqrt((2 * ke) / 2);
  const active = Math.abs(degrees) < 4 ? "along" : Math.abs(degrees - 60) < 4 ? "60" : Math.abs(degrees - 90) < 4 ? "perp" : Math.abs(degrees - 180) < 4 ? "back" : "";

  const rad = (degrees * Math.PI) / 180;
  const tipX = 70 + force * 4 * Math.cos(rad);
  const tipY = 150 - force * 4 * Math.sin(rad);
  const blockX = 70 + distance * 36;

  return (
    <Lesson
      idea="Work is only the part of the force that points along the displacement. A force at right angles does none, and that work is what becomes kinetic energy."
      graph={
        <PlotFrame label="Block pulled by a force">
          <rect width={360} height={240} fill="var(--surface-2)" />
          <line x1={24} y1={188} x2={340} y2={188} stroke="var(--text-muted)" strokeWidth={2} />
          <line x1={70} y1={188} x2={blockX} y2={188} stroke="var(--primary)" strokeWidth={4} />
          <rect x={blockX - 22} y={150} width={44} height={38} rx={6} fill="var(--primary)" />
          <text x={blockX} y={174} textAnchor="middle" fill="#fff" fontSize={12} fontWeight={700}>2 kg</text>
          <line x1={blockX} y1={150} x2={tipX + (blockX - 70)} y2={tipY} stroke="var(--text)" strokeWidth={3} />
          <Handle
            x={tipX + (blockX - 70)}
            y={tipY}
            label="F"
            onDrag={(point) => {
              const dx = point.x - blockX;
              const dy = 150 - point.y;
              setForce(Math.min(20, Math.max(4, Math.hypot(dx, dy) / 4)));
              let next = (Math.atan2(dy, dx) * 180) / Math.PI;
              if (next < 0) next += 360;
              if (next > 180) next = 360 - next;
              setDegrees(next);
            }}
          />
          <Handle x={blockX} y={210} label="s" onDrag={(point) => setDistance(Math.min(6, Math.max(0.4, (point.x - 70) / 36)))} />
          <text x={20} y={28} fill="var(--text-muted)" fontSize={13}>Drag F to turn the force. Drag s to slide the block.</text>
        </PlotFrame>
      }
      presets={
        <Presets
          items={[
            { id: "along", label: "Force along the path", active: active === "along", onClick: () => { setDegrees(0); setForce(12); setDistance(3); } },
            { id: "60", label: "At 60°", active: active === "60", onClick: () => setDegrees(60) },
            { id: "perp", label: "Straight up", active: active === "perp", onClick: () => setDegrees(90) },
            { id: "back", label: "Pushing backward", active: active === "back", onClick: () => setDegrees(180) },
          ]}
        />
      }
      tries={
        <>
          <Predict
            prompt="The force stays the same size but turns until it is straight up, perpendicular to the motion. What is the work?"
            options={[{ id: "same", label: "Same as F × s" }, { id: "half", label: "Half" }, { id: "zero", label: "Zero" }]}
            answer="zero"
            because="cos 90° = 0, so W = Fs cos θ = 0. Turning the arrow straight up on the diagram shows it."
          />
          <Goal ok={Math.abs(degrees - 90) < 6} pending="Turn the force until it is perpendicular to the displacement." done="Work is zero. The block gains no kinetic energy from this force." />
          <Goal ok={Math.abs(degrees - 60) < 5} pending="Set the force at 60°. Work should be half of F × s, because cos 60° = 1/2." done={`W = ${num(joules, 1)} J and Fs/2 = ${num((force * distance) / 2, 1)} J.`} />
          <Goal ok={degrees > 120} pending="Point the force backward. Work becomes negative: the block slows down." done="Negative work takes kinetic energy away. The force opposes the displacement." />
        </>
      }
      readouts={
        <Readouts
          items={[
            { label: "Force F", value: `${num(force, 1)} N` },
            { label: "Displacement s", value: `${num(distance, 2)} m` },
            { label: "Angle θ", value: `${num(degrees, 0)}°` },
            { label: "cos θ", value: num(Math.cos((degrees * Math.PI) / 180), 2) },
            { label: "Work W = Fs cos θ", value: `${num(joules, 1)} J` },
            { label: "Speed from rest", value: `${num(speed, 2)} m/s` },
          ]}
        />
      }
      explain={
        <>
          <p>W = F s cos θ. Only the component F cos θ travels with the block. The mass here is 2 kg, so if it starts from rest and this is the net work, ½ mv² = W and v = √(2W/m).</p>
          <p>Power is that work divided by the time taken. The same work done faster means more power.</p>
        </>
      }
    />
  );
}
