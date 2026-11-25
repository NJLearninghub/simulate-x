import { useState, type PointerEvent as ReactPointerEvent } from "react";
import { Goal, Lesson, Predict, Presets, Readouts } from "./lesson";

type Zone = "A" | "B" | "both" | "out";
const NAMES = ["1", "2", "3", "4", "5", "6", "7", "8"];

function zoneAt(x: number, y: number, w: number, h: number): Zone {
  const ax = w * 0.38;
  const bx = w * 0.62;
  const cy = h * 0.58;
  const r = w * 0.27;
  const inA = (x - ax) ** 2 + (y - cy) ** 2 < r * r;
  const inB = (x - bx) ** 2 + (y - cy) ** 2 < r * r;
  if (inA && inB) return "both";
  if (inA) return "A";
  if (inB) return "B";
  return "out";
}

export default function SetsSim() {
  const [zones, setZones] = useState<Zone[]>(["A", "A", "both", "B", "B", "out", "out", "out"]);
  const count = (zone: Zone) => zones.filter((item) => item === zone).length;
  const nA = count("A") + count("both");
  const nB = count("B") + count("both");
  const inter = count("both");
  const union = nA + nB - inter;

  function drag(index: number, event: ReactPointerEvent<HTMLButtonElement>) {
    const board = event.currentTarget.parentElement;
    if (!board) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const move = (ev: PointerEvent) => {
      const rect = board.getBoundingClientRect();
      setZones((current) => current.map((zone, i) => (i === index ? zoneAt(ev.clientX - rect.left, ev.clientY - rect.top, rect.width, rect.height) : zone)));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  const spot: Record<Zone, [string, string][]> = {
    A: [["22%", "42%"], ["28%", "68%"], ["18%", "58%"], ["32%", "48%"]],
    B: [["72%", "42%"], ["78%", "66%"], ["68%", "70%"], ["84%", "52%"]],
    both: [["46%", "50%"], ["54%", "64%"], ["50%", "40%"]],
    out: [["8%", "18%"], ["90%", "16%"], ["48%", "12%"], ["10%", "88%"], ["88%", "88%"]],
  };
  const used: Record<Zone, number> = { A: 0, B: 0, both: 0, out: 0 };

  return (
    <Lesson
      idea="An element is either in a set or not. The overlap is counted once in each set, so it must be subtracted once when you join them."
      graph={
        <div className="relative h-72 touch-none" aria-label="Venn diagram">
          <div className="absolute left-[12%] top-[22%] h-44 w-44 rounded-full border-2 border-[var(--primary)] bg-[var(--primary)]/10" />
          <div className="absolute right-[12%] top-[22%] h-44 w-44 rounded-full border-2 border-[#d97706] bg-[#d97706]/10" />
          <span className="absolute left-[18%] top-[26%] text-sm font-bold text-[var(--primary)]">A</span>
          <span className="absolute right-[18%] top-[26%] text-sm font-bold text-[#d97706]">B</span>
          {NAMES.map((name, index) => {
            const zone = zones[index];
            const places = spot[zone];
            const at = places[used[zone] % places.length];
            used[zone] += 1;
            return (
              <button
                key={name}
                type="button"
                onPointerDown={(event) => drag(index, event)}
                className="absolute grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[var(--text)] text-sm font-bold text-[var(--surface)]"
                style={{ left: at[0], top: at[1] }}
              >
                {name}
              </button>
            );
          })}
        </div>
      }
      presets={
        <Presets
          items={[
            { id: "overlap", label: "Overlapping", onClick: () => setZones(["A", "A", "both", "B", "B", "out", "out", "out"]) },
            { id: "disjoint", label: "Disjoint", onClick: () => setZones(["A", "A", "A", "B", "B", "B", "out", "out"]) },
            { id: "subset", label: "A inside B", onClick: () => setZones(["both", "both", "both", "B", "B", "out", "out", "out"]) },
          ]}
        />
      }
      tries={
        <>
          <Predict
            prompt="If A and B have nothing in common, n(A ∪ B) equals…"
            options={[{ id: "sum", label: "n(A) + n(B)" }, { id: "less", label: "Less than that" }, { id: "product", label: "n(A) × n(B)" }]}
            answer="sum"
            because="The subtraction term is n(A ∩ B). When the intersection is empty, nothing is subtracted."
          />
          <Goal ok={inter === 0 && nA > 0 && nB > 0} pending="Drag the numbers so the two circles do not share any." done={`Disjoint: n(A ∪ B) = ${union} = ${nA} + ${nB}.`} />
          <Goal ok={nA > 0 && nA === inter} pending="Put every element of A into the overlap, so A is inside B." done="A ⊂ B, so A ∩ B = A and A ∪ B = B." />
          <Goal ok={union <= nA + nB} pending="Try to make the union larger than n(A) + n(B)." done="You cannot. The union never exceeds n(A) + n(B), because the overlap is not counted twice." />
        </>
      }
      readouts={
        <Readouts
          items={[
            { label: "n(A)", value: String(nA) },
            { label: "n(B)", value: String(nB) },
            { label: "n(A ∩ B)", value: String(inter) },
            { label: "n(A) + n(B) − n(A ∩ B)", value: String(union) },
          ]}
        />
      }
      explain={<p>n(A ∪ B) = n(A) + n(B) − n(A ∩ B). Drag a number chip into A only, B only, the overlap, or outside both. The last goal stays green because the identity always holds.</p>}
    />
  );
}
