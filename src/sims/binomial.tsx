import { useState } from "react";
import { binomialRow } from "./formulas";
import { Goal, Handle, Lesson, PlotFrame, Predict, Presets, Readouts, num } from "./lesson";

export default function BinomialSim() {
  const [n, setN] = useState(4);
  const [a, setA] = useState(1);
  const [b, setB] = useState(1);
  const row = binomialRow(n);
  const terms = row.map((coeff, k) => coeff * a ** (n - k) * b ** k);
  const total = terms.reduce((sum, term) => sum + term, 0);
  const direct = (a + b) ** n;
  const max = Math.max(...terms.map((term) => Math.abs(term)), 1);

  return (
    <Lesson
      idea="(a + b)ⁿ unfolds into n + 1 terms. The coefficients are a row of Pascal’s triangle, and they count the ways to pick the b’s."
      graph={
        <PlotFrame label="Binomial terms">
          <rect width={360} height={240} fill="var(--surface-2)" />
          {terms.map((term, index) => {
            const height = (Math.abs(term) / max) * 140;
            const x = 30 + index * (300 / terms.length);
            const w = 260 / terms.length;
            return (
              <g key={index}>
                <rect x={x} y={180 - height} width={w} height={height} fill="var(--primary)" opacity={0.8} rx={4} />
                <text x={x + w / 2} y={198} textAnchor="middle" fontSize={11} fill="var(--text-muted)" >{num(row[index], 0)}</text>
              </g>
            );
          })}
          <Handle x={40 + n * 28} y={24} label={`n = ${n}`} onDrag={(point) => setN(Math.min(8, Math.max(1, Math.round((point.x - 40) / 28))))} />
          <text x={16} y={226} fontSize={12} fill="var(--text-soft)">Bars are the terms. The numbers underneath are the binomial coefficients.</text>
        </PlotFrame>
      }
      presets={
        <Presets
          items={[
            { id: "4", label: "(a + b)⁴", active: n === 4 && a === 1 && b === 1, onClick: () => { setN(4); setA(1); setB(1); } },
            { id: "5", label: "n = 5", active: n === 5, onClick: () => setN(5) },
            { id: "2-3", label: "(2 + 3)³", active: n === 3 && a === 2 && b === 3, onClick: () => { setN(3); setA(2); setB(3); } },
          ]}
        />
      }
      extra={
        <div className="grid grid-cols-2 gap-3 text-sm font-semibold text-[var(--text-muted)]">
          <label>a = {num(a, 1)}<input className="w-full" style={{ height: 44 }} type="range" min={1} max={4} step={1} value={a} onChange={(event) => setA(Number(event.target.value))} /></label>
          <label>b = {num(b, 1)}<input className="w-full" style={{ height: 44 }} type="range" min={1} max={4} step={1} value={b} onChange={(event) => setB(Number(event.target.value))} /></label>
        </div>
      }
      tries={
        <>
          <Predict
            prompt="How many terms are in the expansion of (a + b)⁴?"
            options={[{ id: "4", label: "4" }, { id: "5", label: "5" }, { id: "8", label: "8" }]}
            answer="5"
            because="The powers of b run from 0 to n, so there are n + 1 terms. For n = 4 the coefficients are 1, 4, 6, 4, 1."
          />
          <Goal ok={n === 4 && row.join(",") === "1,4,6,4,1"} pending="Set n = 4 and read the coefficients." done="1, 4, 6, 4, 1. Each number is the sum of the two neighbours above it in Pascal’s triangle." />
          <Goal ok={n === 5 && a === 1 && b === 1 && Math.abs(total - 32) < 1e-6} pending="Set n = 5 with a = b = 1. The terms should add to 32." done="(1 + 1)⁵ = 2⁵ = 32. The sum of a row of Pascal’s triangle is 2ⁿ." />
          <Goal ok={n === 3 && a === 2 && b === 3 && Math.abs(total - 125) < 1e-6} pending="Open (2 + 3)³ and check the sum against 5³." done="The bars add to 125, which is 5³. The expansion agrees with multiplying the number directly." />
        </>
      }
      readouts={
        <Readouts
          items={[
            { label: "n", value: String(n) },
            { label: "Terms", value: String(n + 1) },
            { label: "Sum of terms", value: num(total, 2) },
            { label: "(a + b)ⁿ", value: num(direct, 2) },
          ]}
        />
      }
      explain={<p>The general term is C(n, k) aⁿ⁻ᵏ bᵏ. C(n, k) = n! / (k! (n − k)!). Putting a = b = 1 makes every term a coefficient, and the sum is 2ⁿ.</p>}
    />
  );
}
