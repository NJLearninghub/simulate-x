import { useState, type PointerEvent as ReactPointerEvent } from "react";
import { Goal, Lesson, Predict, Presets, Readouts, num } from "./lesson";

function key(a: number, b: number) {
  return a * 6 + b;
}

export default function Probability11Sim() {
  const [on, setOn] = useState<boolean[]>(() => Array.from({ length: 36 }, (_, index) => index % 6 === (5 - (index % 6) + 6) % 6 ? false : false));
  const favourable = on.filter(Boolean).length;

  function paint(event: ReactPointerEvent<HTMLDivElement>, force?: boolean) {
    const board = event.currentTarget;
    const mark = (ev: PointerEvent) => {
      const rect = board.getBoundingClientRect();
      const col = Math.floor(((ev.clientX - rect.left) / rect.width) * 6);
      const row = Math.floor(((ev.clientY - rect.top) / rect.height) * 6);
      if (col < 0 || col > 5 || row < 0 || row > 5) return;
      const index = key(row, col);
      setOn((current) => current.map((value, i) => (i === index ? (force ?? !value) : value)));
    };
    board.setPointerCapture(event.pointerId);
    mark(event.nativeEvent);
    board.onpointermove = (ev) => mark(ev);
    board.onpointerup = () => {
      board.onpointermove = null;
    };
  }

  function fill(test: (a: number, b: number) => boolean) {
    setOn(Array.from({ length: 36 }, (_, index) => test(Math.floor(index / 6) + 1, (index % 6) + 1)));
  }

  return (
    <Lesson
      idea="If every outcome is equally likely, probability is just a count: favourable outcomes divided by all outcomes. Two dice have 36 outcomes."
      graph={
        <div className="p-3">
          <p className="mb-2 text-sm text-[var(--text-muted)]">Paint the outcomes that belong to your event. Rows are the first die, columns the second.</p>
          <div className="grid aspect-square w-full max-w-sm grid-cols-6 gap-1 touch-none" onPointerDown={(event) => paint(event, true)}>
            {on.map((marked, index) => {
              const a = Math.floor(index / 6) + 1;
              const b = (index % 6) + 1;
              return (
                <div key={index} className={`grid min-h-11 place-items-center rounded-md text-xs font-bold ${marked ? "bg-[var(--primary)] text-white" : "bg-[var(--surface-3)]"}`}>
                  {a}+{b}
                </div>
              );
            })}
          </div>
        </div>
      }
      presets={
        <Presets
          items={[
            { id: "seven", label: "Sum 7", onClick: () => fill((a, b) => a + b === 7) },
            { id: "double", label: "Doubles", onClick: () => fill((a, b) => a === b) },
            { id: "six", label: "At least one 6", onClick: () => fill((a, b) => a === 6 || b === 6) },
            { id: "clear", label: "Clear", onClick: () => fill(() => false) },
          ]}
        />
      }
      tries={
        <>
          <Predict
            prompt="Two fair dice are rolled. P(sum = 7) equals…"
            options={[{ id: "1/6", label: "1/6" }, { id: "1/12", label: "1/12" }, { id: "7/36", label: "7/36" }]}
            answer="1/6"
            because="The pairs are (1,6), (2,5), (3,4), (4,3), (5,2), (6,1): 6 outcomes out of 36, which is 1/6."
          />
          <Goal ok={favourable === 6 && on.filter((marked, index) => marked && Math.floor(index / 6) + 1 + (index % 6) + 1 === 7).length === 6} pending="Paint exactly the six outcomes whose faces add to 7." done="6 / 36 = 1/6. Sum 7 is the most common total." />
          <Goal ok={on.filter(Boolean).length === 6 && on.every((marked, index) => marked === (Math.floor(index / 6) === index % 6))} pending="Paint the doubles." done="Six doubles out of 36, so the probability is again 1/6." />
          <Goal ok={favourable === 0} pending="Clear the board. An empty event has probability 0." done="Nothing favourable means probability 0. The certain event, all 36 cells, would be 1." />
        </>
      }
      readouts={
        <Readouts
          items={[
            { label: "Outcomes in S", value: "36" },
            { label: "Favourable", value: String(favourable) },
            { label: "P(E)", value: `${favourable}/36` },
            { label: "Decimal", value: num(favourable / 36, 3) },
          ]}
        />
      }
      explain={<p>P(E) = n(E) / n(S) when the sample space is equiprobable. For two dice, n(S) = 6 × 6 = 36. P(A ∪ B) = P(A) + P(B) − P(A ∩ B) when events overlap, which is why “at least one 6” is 11/36 and not 12/36.</p>}
    />
  );
}
