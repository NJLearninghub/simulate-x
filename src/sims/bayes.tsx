import { useState } from "react";
import { bayes } from "./formulas";
import { Goal, Lesson, Predict, Presets, Readouts, num } from "./lesson";

type Ball = { id: number; color: "red" | "blue"; bag: "A" | "B" };

const START: Ball[] = [
  { id: 1, color: "red", bag: "A" },
  { id: 2, color: "red", bag: "A" },
  { id: 3, color: "red", bag: "A" },
  { id: 4, color: "blue", bag: "A" },
  { id: 5, color: "red", bag: "B" },
  { id: 6, color: "blue", bag: "B" },
  { id: 7, color: "blue", bag: "B" },
  { id: 8, color: "blue", bag: "B" },
];

export default function BayesSim() {
  const [balls, setBalls] = useState<Ball[]>(START);
  const [drawn, setDrawn] = useState<"red" | "blue">("red");
  const redA = balls.filter((ball) => ball.bag === "A" && ball.color === "red").length;
  const blueA = balls.filter((ball) => ball.bag === "A" && ball.color === "blue").length;
  const redB = balls.filter((ball) => ball.bag === "B" && ball.color === "red").length;
  const blueB = balls.filter((ball) => ball.bag === "B" && ball.color === "blue").length;
  const result = redA + blueA > 0 && redB + blueB > 0 ? bayes(redA, blueA, redB, blueB, drawn) : null;

  function move(id: number, bag: "A" | "B") {
    setBalls((current) => {
      const leaving = current.find((ball) => ball.id === id);
      if (!leaving) return current;
      const stay = current.filter((ball) => ball.bag === leaving.bag).length;
      if (stay <= 1 && leaving.bag !== bag) return current;
      return current.map((ball) => (ball.id === id ? { ...ball, bag } : ball));
    });
  }

  return (
    <Lesson
      idea="A red ball is more likely to have come from the bag that holds more red balls. Bayes’ theorem turns that likelihood, and how often you pick each bag, into a probability."
      graph={
        <div className="grid grid-cols-2 gap-2 p-3 touch-none" aria-label="Two bags of balls">
          {(["A", "B"] as const).map((bag) => (
            <div
              key={bag}
              data-bag={bag}
              className="min-h-48 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-3"
              onPointerUp={(event) => {
                const id = (event.target as HTMLElement).closest("[data-ball]")?.getAttribute("data-ball");
                if (id) move(Number(id), bag);
              }}
            >
              <p className="mb-2 text-sm font-bold">Bag {bag}</p>
              <div className="flex flex-wrap gap-2">
                {balls.filter((ball) => ball.bag === bag).map((ball) => (
                  <button
                    key={ball.id}
                    type="button"
                    data-ball={ball.id}
                    className={`h-11 w-11 rounded-full font-bold text-white ${ball.color === "red" ? "bg-rose-600" : "bg-sky-600"}`}
                    onPointerDown={(event) => {
                      const token = event.currentTarget;
                      token.setPointerCapture(event.pointerId);
                      token.onpointerup = (ev) => {
                        const hit = document.elementFromPoint(ev.clientX, ev.clientY);
                        const next = hit?.closest("[data-bag]")?.getAttribute("data-bag");
                        if (next === "A" || next === "B") move(ball.id, next);
                      };
                    }}
                  >
                    {ball.color === "red" ? "R" : "B"}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      }
      presets={
        <Presets
          items={[
            { id: "classic", label: "A richer in red", onClick: () => setBalls(START) },
            { id: "same", label: "Identical bags", onClick: () => setBalls(START.map((ball, index) => ({ ...ball, color: index % 2 ? "red" : "blue", bag: index < 4 ? "A" : "B" }))) },
            { id: "red", label: "You drew red", active: drawn === "red", onClick: () => setDrawn("red") },
            { id: "blue", label: "You drew blue", active: drawn === "blue", onClick: () => setDrawn("blue") },
          ]}
        />
      }
      tries={
        <>
          <Predict
            prompt="Bag A has more red balls than bag B, and you pick a bag at random. You draw a red ball. Which bag is more likely?"
            options={[{ id: "A", label: "Bag A" }, { id: "B", label: "Bag B" }, { id: "tie", label: "Equally likely" }]}
            answer="A"
            because="The bags were equally likely before the draw. The red ball is stronger evidence for the bag that contains more red balls."
          />
          <Goal ok={drawn === "red" && result !== null && result.postA > result.postB + 0.05} pending="Keep A richer in red, and say you drew red." done={`P(A | red) = ${num((result?.postA ?? 0) * 100, 0)}%, larger than P(B | red).`} />
          <Goal ok={result !== null && Math.abs(result.postA - 0.5) < 0.02} pending="Make the two bags identical. The draw should not favour either bag." done="Identical bags mean the colour tells you nothing. Each posterior stays 1/2." />
          <Goal ok={drawn === "blue" && redB === 0 && blueB > 0 && result !== null && result.postB > 0.7} pending="Move balls so a blue draw points strongly at bag B." done="When one bag is full of the colour you drew, most of the posterior lands on that bag." />
        </>
      }
      readouts={
        <Readouts
          items={[
            { label: "Drew", value: drawn },
            { label: "P(colour | A)", value: result ? num(result.likeA, 2) : "—" },
            { label: "P(colour | B)", value: result ? num(result.likeB, 2) : "—" },
            { label: "P(A | colour)", value: result ? num(result.postA, 2) : "—" },
            { label: "P(B | colour)", value: result ? num(result.postB, 2) : "—" },
            { label: "Bag sizes", value: `${redA + blueA} and ${redB + blueB}` },
          ]}
        />
      }
      explain={<p>Each bag is chosen with probability 1/2. P(A | colour) = P(colour | A) P(A) / P(colour). P(colour) = P(colour | A)P(A) + P(colour | B)P(B). Drag balls between the bags, but a bag cannot be emptied. Then choose the colour you drew.</p>}
    />
  );
}
