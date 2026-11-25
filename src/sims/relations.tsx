import { useState } from "react";
import { Goal, Lesson, Predict, Presets, Readouts } from "./lesson";

const DOMAIN = ["1", "2", "3"];
const CODOMAIN = ["a", "b", "c"];

export default function RelationsSim() {
  const [arrows, setArrows] = useState<Record<string, string>>({ "1": "a", "2": "b", "3": "c" });
  const [from, setFrom] = useState<string | null>(null);
  const images = DOMAIN.map((item) => arrows[item]).filter(Boolean);
  const isFunction = DOMAIN.every((item) => arrows[item]);
  const oneOne = isFunction && new Set(images).size === images.length;
  const onto = isFunction && CODOMAIN.every((item) => images.includes(item));

  function link(domain: string, codomain: string) {
    setArrows((current) => {
      const next = { ...current };
      if (next[domain] === codomain) delete next[domain];
      else next[domain] = codomain;
      return next;
    });
  }

  return (
    <Lesson
      idea="A function gives every input exactly one output. One-one means different inputs stay different. Onto means every output is used."
      graph={
        <svg viewBox="0 0 360 220" className="block h-auto w-full touch-none" aria-label="Arrow diagram">
          <rect width={360} height={220} fill="var(--surface-2)" />
          <text x={48} y={28} fill="var(--text-muted)" fontSize={13}>Drag from an input to an output.</text>
          {DOMAIN.map((item, index) => {
            const y = 60 + index * 48;
            const target = arrows[item];
            const ty = target ? 60 + CODOMAIN.indexOf(target) * 48 : y;
            return (
              <g key={item}>
                {target && <line x1={78} y1={y} x2={250} y2={ty} stroke="var(--primary)" strokeWidth={2} />}
                <circle
                  cx={70}
                  cy={y}
                  r={18}
                  fill="var(--primary)"
                  onPointerDown={(event) => {
                    const target = event.currentTarget;
                    target.setPointerCapture(event.pointerId);
                    setFrom(item);
                    const up = (ev: PointerEvent) => {
                      const hit = document.elementFromPoint(ev.clientX, ev.clientY);
                      const code = hit?.getAttribute("data-code") ?? hit?.parentElement?.getAttribute("data-code");
                      if (code) link(item, code);
                      setFrom(null);
                      target.removeEventListener("pointerup", up);
                    };
                    target.addEventListener("pointerup", up);
                  }}
                />
                <text x={70} y={y + 4} textAnchor="middle" fill="#fff" fontSize={14} fontWeight={700}>{item}</text>
              </g>
            );
          })}
          {CODOMAIN.map((item, index) => (
            <g key={item}>
              <circle data-code={item} cx={270} cy={60 + index * 48} r={18} fill={from ? "var(--primary-soft)" : "var(--surface)"} stroke="var(--primary)" strokeWidth={2} />
              <text data-code={item} x={270} y={64 + index * 48} textAnchor="middle" fontSize={14} fontWeight={700} fill="var(--text)" pointerEvents="none">{item}</text>
            </g>
          ))}
        </svg>
      }
      presets={
        <Presets
          items={[
            { id: "bij", label: "One-one and onto", onClick: () => setArrows({ "1": "a", "2": "b", "3": "c" }) },
            { id: "const", label: "Constant", onClick: () => setArrows({ "1": "b", "2": "b", "3": "b" }) },
            { id: "miss", label: "Input left out", onClick: () => setArrows({ "1": "a", "2": "c" }) },
          ]}
        />
      }
      tries={
        <>
          <Predict
            prompt="Two inputs point at the same output, and every input has an arrow. This relation is…"
            options={[{ id: "not", label: "Not a function" }, { id: "fun", label: "A function, not one-one" }, { id: "bi", label: "One-one and onto" }]}
            answer="fun"
            because="A function may repeat an output. It is one-one only when no output is shared. Try the Constant preset."
          />
          <Goal ok={isFunction && !oneOne} pending="Make a function that is not one-one." done="Every input has one output, but an output is repeated, so it is not one-one." />
          <Goal ok={!isFunction} pending="Leave one input with no arrow." done="An input with no image means this is a relation, not a function." />
          <Goal ok={oneOne && onto} pending="Give every input its own output, and use every output." done="One-one and onto: a bijection. An inverse arrow can be drawn back." />
        </>
      }
      readouts={
        <Readouts
          items={[
            { label: "Function", value: isFunction ? "Yes" : "No" },
            { label: "One-one", value: oneOne ? "Yes" : "No" },
            { label: "Onto", value: onto ? "Yes" : "No" },
            { label: "Arrows", value: String(images.length) },
          ]}
        />
      }
      explain={<p>From a set A to a set B, a function f assigns exactly one element of B to each element of A. One-one: f(x₁) = f(x₂) implies x₁ = x₂. Onto: the range is all of B.</p>}
    />
  );
}
