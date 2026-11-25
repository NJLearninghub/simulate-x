import { useState } from "react";
import { apSum, apTerm, gpSum, gpTerm } from "./formulas";
import { Goal, Handle, Lesson, PlotFrame, Predict, Presets, Readouts, num } from "./lesson";

export default function SequencesSim() {
  const [kind, setKind] = useState<"ap" | "gp">("ap");
  const [first, setFirst] = useState(2);
  const [step, setStep] = useState(3);
  const [count, setCount] = useState(6);
  const terms = Array.from({ length: count }, (_, index) => (kind === "ap" ? apTerm(first, step, index + 1) : gpTerm(first, step, index + 1)));
  const sum = kind === "ap" ? apSum(first, step, count) : gpSum(first, step, count);
  const max = Math.max(...terms.map((term) => Math.abs(term)), 1);

  return (
    <Lesson
      idea="An arithmetic sequence steps by a fixed difference. A geometric sequence multiplies by a fixed ratio. The sum has a closed form, so you do not have to add term by term."
      graph={
        <PlotFrame label="Sequence bars">
          <rect width={360} height={240} fill="var(--surface-2)" />
          {terms.map((term, index) => {
            const h = (Math.abs(term) / max) * 120;
            const x = 36 + index * (300 / count);
            return (
              <g key={index}>
                <rect x={x} y={170 - h} width={220 / count} height={h} fill="var(--primary)" rx={3} />
                <text x={x + 8} y={188} fontSize={10} fill="var(--text-soft)">{num(term, 1)}</text>
              </g>
            );
          })}
          <Handle x={70} y={170 - (Math.abs(terms[0]) / max) * 120} label="first" onDrag={(point) => setFirst(Math.min(8, Math.max(-2, (170 - point.y) / 18)))} />
          <Handle x={70 + 300 / count} y={170 - (Math.abs(terms[1] ?? terms[0]) / max) * 120} label={kind === "ap" ? "d" : "r"} onDrag={(point) => {
            const next = Math.min(12, Math.max(-2, (170 - point.y) / 18));
            setStep(kind === "ap" ? next - first : first === 0 ? 1 : next / first);
          }} />
          <text x={16} y={22} fill="var(--text-muted)" fontSize={13}>Drag the first bar, then the second, to set the step.</text>
        </PlotFrame>
      }
      presets={
        <Presets
          items={[
            { id: "ap", label: "AP 2, 5, 8…", active: kind === "ap" && Math.abs(first - 2) < 0.2 && Math.abs(step - 3) < 0.2, onClick: () => { setKind("ap"); setFirst(2); setStep(3); setCount(6); } },
            { id: "gp", label: "GP 3, 6, 12…", active: kind === "gp" && Math.abs(first - 3) < 0.2 && Math.abs(step - 2) < 0.15, onClick: () => { setKind("gp"); setFirst(3); setStep(2); setCount(5); } },
            { id: "more", label: count < 8 ? "More terms" : "Fewer terms", onClick: () => setCount((value) => (value >= 8 ? 4 : value + 1)) },
          ]}
        />
      }
      tries={
        <>
          <Predict
            prompt="An AP starts at 2 and climbs by 3. What is the 5th term?"
            options={[{ id: "14", label: "14" }, { id: "17", label: "17" }, { id: "11", label: "11" }]}
            answer="14"
            because="tₙ = a + (n − 1)d = 2 + 4 × 3 = 14. The gaps between neighbours stay equal to d."
          />
          <Goal ok={kind === "ap" && Math.abs(apTerm(first, step, 5) - 14) < 0.3} pending="Build the AP whose 5th term is 14, starting at 2 with difference 3." done={`5th term is ${num(apTerm(first, step, 5), 2)}. Sum of ${count} terms is ${num(sum, 2)}.`} />
          <Goal ok={kind === "gp" && Math.abs(gpTerm(first, step, 4) - 24) < 0.4} pending="Build the GP 3, 6, 12… and check the 4th term." done="4th term is 24. Each term is twice the one before it." />
          <Goal ok={kind === "ap" && count >= 4 && Math.abs((terms[2] - terms[1]) - (terms[1] - terms[0])) < 0.15} pending="In an AP the gap between neighbours is constant. Watch it as you drag." done="The difference between neighbours is steady. That constant gap is the common difference." />
        </>
      }
      readouts={
        <Readouts
          items={[
            { label: kind === "ap" ? "First term a" : "First term a", value: num(first, 2) },
            { label: kind === "ap" ? "Common difference d" : "Common ratio r", value: num(step, 2) },
            { label: "5th term", value: num(kind === "ap" ? apTerm(first, step, 5) : gpTerm(first, step, 5), 2) },
            { label: "Sum", value: num(sum, 2) },
          ]}
        />
      }
      explain={
        <p>AP: tₙ = a + (n − 1)d and Sₙ = n/2 · (2a + (n − 1)d). GP: tₙ = a rⁿ⁻¹ and, when r ≠ 1, Sₙ = a(rⁿ − 1)/(r − 1). Dragging the second bar changes d, or r if you are on the geometric preset.</p>
      }
    />
  );
}
