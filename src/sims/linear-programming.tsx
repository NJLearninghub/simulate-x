import { useState } from "react";
import { LP_CORNERS, bestCorner, clampToPolygon } from "./formulas";
import { Goal, Handle, Lesson, PlotFrame, Predict, Presets, Readouts, num } from "./lesson";

export default function LinearProgrammingSim() {
  const [point, setPoint] = useState({ x: 2, y: 2 });
  const [objective, setObjective] = useState<"profit" | "cost">("profit");
  const cx = objective === "profit" ? 3 : 1;
  const cy = objective === "profit" ? 4 : 2;
  const mode = objective === "profit" ? "max" : "min";
  const best = bestCorner(cx, cy, mode);
  const z = cx * point.x + cy * point.y;
  const scale = 28;
  const O = { x: 48, y: 200 };
  const X = (x: number) => O.x + x * scale;
  const Y = (y: number) => O.y - y * scale;
  const poly = LP_CORNERS.map((corner, index) => `${index ? "L" : "M"} ${X(corner.x)} ${Y(corner.y)}`).join(" ") + " Z";
  const level = z / cy;
  const atBest = Math.hypot(point.x - best.point.x, point.y - best.point.y) < 0.28;

  return (
    <Lesson
      idea="A linear objective on a polygonal region is largest or smallest at a corner. Slide a test point around: the interior never beats the best vertex."
      graph={
        <PlotFrame label="Feasible region">
          <rect width={360} height={240} fill="var(--surface-2)" />
          <line x1={O.x} y1={O.y} x2={O.x + 8 * scale} y2={O.y} stroke="var(--text-muted)" />
          <line x1={O.x} y1={O.y} x2={O.x} y2={O.y - 7 * scale} stroke="var(--text-muted)" />
          <path d={poly} fill="var(--primary)" opacity={0.18} stroke="var(--primary)" strokeWidth={2} />
          <line x1={X(0)} y1={Y(level)} x2={X(Math.min(8, z / cx))} y2={Y(0)} stroke="#d97706" strokeDasharray="5 4" />
          {LP_CORNERS.map((corner, index) => (
            <circle key={index} cx={X(corner.x)} cy={Y(corner.y)} r={corner === best.point ? 6 : 3} fill={corner === best.point ? "#d97706" : "var(--text)"} />
          ))}
          <Handle
            x={X(point.x)}
            y={Y(point.y)}
            label="P"
            onDrag={(drag) => setPoint(clampToPolygon((drag.x - O.x) / scale, (O.y - drag.y) / scale))}
          />
          <text x={16} y={22} fill="var(--text-muted)" fontSize={12}>Drag P inside the region. The amber corner is the optimum.</text>
        </PlotFrame>
      }
      presets={
        <Presets
          items={[
            { id: "profit", label: "Maximise 3x + 4y", active: objective === "profit", onClick: () => setObjective("profit") },
            { id: "cost", label: "Minimise x + 2y", active: objective === "cost", onClick: () => setObjective("cost") },
            { id: "go", label: "Jump to the best corner", onClick: () => setPoint(best.point) },
          ]}
        />
      }
      tries={
        <>
          <Predict
            prompt="Which corner maximises 3x + 4y?"
            options={[{ id: "15", label: "(1, 5)" }, { id: "42", label: "(4, 2)" }, { id: "05", label: "(0, 5)" }]}
            answer="15"
            because="Check the corners: (1, 5) gives 23, (0, 5) gives 20 and (4, 2) gives 20. The largest value is at (1, 5)."
          />
          <Goal ok={objective === "profit" && atBest} pending="Drag P to the amber corner for 3x + 4y." done={`Maximum is ${num(best.z, 0)} at (${num(best.point.x, 0)}, ${num(best.point.y, 0)}).`} />
          <Goal ok={objective === "cost" && atBest} pending="Switch to minimising x + 2y and drag P to the new best corner." done={`Minimum is ${num(best.z, 0)} at (${num(best.point.x, 0)}, ${num(best.point.y, 0)}).`} />
          <Goal ok={!atBest && z < best.z - 0.2 && objective === "profit"} pending="Leave P in the interior while maximising." done="An interior point gives a smaller value. For a linear objective the optimum is at a vertex." />
        </>
      }
      readouts={
        <Readouts
          items={[
            { label: "P", value: `(${num(point.x, 2)}, ${num(point.y, 2)})` },
            { label: "Z at P", value: num(z, 2) },
            { label: mode === "max" ? "Maximum" : "Minimum", value: num(best.z, 2) },
            { label: "Best corner", value: `(${num(best.point.x, 0)}, ${num(best.point.y, 0)})` },
          ]}
        />
      }
      explain={<p>The region is x ≥ 0, y ≥ 0, x + y ≥ 2, x + y ≤ 6, x ≤ 4 and y ≤ 5. The corners are (0, 2), (0, 5), (1, 5), (4, 2), (4, 0) and (2, 0). A linear function on a convex polygon takes its maximum and minimum at a corner, so it is enough to evaluate Z there.</p>}
    />
  );
}
