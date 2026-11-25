import { useState } from "react";
import { nCr, nPr } from "./formulas";
import { Goal, Lesson, Predict, Presets, Readouts, num } from "./lesson";

const PEOPLE = ["A", "B", "C", "D", "E", "F", "G", "H"];

export default function PermutationsSim() {
  const [n, setN] = useState(5);
  const [seats, setSeats] = useState<(string | null)[]>([null, null, null]);
  const [orderMatters, setOrderMatters] = useState(true);
  const r = seats.length;
  const arrangements = nPr(n, r);
  const committees = nCr(n, r);
  const seated = seats.filter(Boolean) as string[];
  const pool = PEOPLE.slice(0, n).filter((person) => !seats.includes(person));

  function dropOn(seat: number, person: string) {
    setSeats((current) => {
      const next = current.map((item) => (item === person ? null : item));
      next[seat] = person;
      return next;
    });
  }

  return (
    <Lesson
      idea="If the seats are different, order matters and you count permutations. If you only choose a group, order does not matter and you count combinations."
      graph={
        <div className="touch-none p-3" aria-label="People and seats">
          <p className="mb-2 text-sm text-[var(--text-muted)]">Drag a letter into a seat. Drag a seated letter out to free it.</p>
          <div className="mb-3 flex flex-wrap gap-2">
            {pool.map((person) => (
              <span
                key={person}
                className="grid h-11 w-11 cursor-grab place-items-center rounded-full bg-[var(--primary)] font-bold text-white"
                onPointerDown={(event) => {
                  const token = event.currentTarget;
                  token.setPointerCapture(event.pointerId);
                  token.onpointerup = (ev) => {
                    const hit = document.elementFromPoint(ev.clientX, ev.clientY);
                    const seat = hit?.closest("[data-seat]")?.getAttribute("data-seat");
                    if (seat !== null && seat !== undefined) dropOn(Number(seat), person);
                  };
                }}
              >
                {person}
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            {seats.map((person, index) => (
              <div key={index} data-seat={index} className="grid h-16 w-16 place-items-center rounded-xl border-2 border-dashed border-[var(--primary)] text-lg font-bold" onPointerDown={() => setSeats((current) => current.map((item, i) => (i === index ? null : item)))}>
                {person ?? index + 1}
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm">{seated.length < 2 ? "Seat at least two people, then swap them." : orderMatters ? "Swapping two seated people makes a new arrangement." : "Swapping them does not make a new committee."}</p>
        </div>
      }
      presets={
        <Presets
          items={[
            { id: "p", label: "Arrangements", active: orderMatters, onClick: () => setOrderMatters(true) },
            { id: "c", label: "Committees", active: !orderMatters, onClick: () => setOrderMatters(false) },
            { id: "5-3", label: "5 people, 3 seats", active: n === 5 && r === 3, onClick: () => { setN(5); setSeats([null, null, null]); } },
            { id: "4-4", label: "4 people, 4 seats", active: n === 4 && r === 4, onClick: () => { setN(4); setSeats([null, null, null, null]); } },
            { id: "seat", label: r < 5 ? "Add a seat" : "Fewer seats", onClick: () => setSeats((current) => (current.length >= 5 ? current.slice(0, 3) : [...current, null])) },
            { id: "person", label: n < 8 ? "Add a person" : "Fewer people", onClick: () => setN((value) => (value >= 8 ? 4 : value + 1)) },
          ]}
        />
      }
      tries={
        <>
          <Predict
            prompt="5 distinct students and 3 different seats. How many seating arrangements?"
            options={[{ id: "10", label: "10" }, { id: "60", label: "60" }, { id: "120", label: "125" }]}
            answer="60"
            because="The first seat has 5 choices, the next 4, the last 3: 5 × 4 × 3 = 60 = ⁵P₃."
          />
          <Goal ok={n === 5 && r === 3 && orderMatters} pending="Set 5 people and 3 seats, counting arrangements." done="⁵P₃ = 60. A committee of the same size would be ⁵C₃ = 10, because the 6 orders of each trio are the same group." />
          <Goal ok={!orderMatters && n === 5 && r === 3} pending="Switch to committees for those same 5 people and 3 seats." done="Order is ignored, so divide by 3! = 6. There are 10 committees." />
          <Goal ok={n === r && r === 4} pending="Fill 4 seats with 4 people. That count is 4!." done="ⁿPₙ = n!. Four people in four seats can sit in 24 orders." />
        </>
      }
      readouts={
        <Readouts
          items={[
            { label: "People n", value: String(n) },
            { label: "Seats r", value: String(r) },
            { label: "Permutations nPr", value: num(arrangements, 0) },
            { label: "Combinations nCr", value: num(committees, 0) },
          ]}
        />
      }
      explain={<p>ⁿPᵣ = n! / (n − r)!. ⁿCᵣ = n! / (r! (n − r)!). Each combination of r people corresponds to r! permutations, so ⁿCᵣ = ⁿPᵣ / r!. Tap a filled seat to empty it.</p>}
    />
  );
}
