import { useEffect, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { num } from "./formulas";

export { num };

export function Lesson({
  idea,
  graph,
  presets,
  tries,
  readouts,
  extra,
  explain,
}: {
  idea: string;
  graph: ReactNode;
  presets?: ReactNode;
  tries?: ReactNode;
  readouts?: ReactNode;
  extra?: ReactNode;
  explain: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 bg-[var(--surface)] p-3 text-[var(--text)] sm:p-4">
      <p className="rounded-xl bg-[var(--primary-soft)] px-3 py-2 text-sm leading-snug">
        <span className="font-bold text-[var(--primary)]">Big idea. </span>
        {idea}
      </p>
      <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]" aria-label="Interactive diagram">
        {graph}
      </section>
      {presets}
      {tries}
      {readouts}
      {extra}
      <details className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]">
        <summary className="cursor-pointer px-4 py-3 text-sm font-semibold">Why this works</summary>
        <div className="space-y-2 px-4 pb-4 text-sm leading-relaxed text-[var(--text-muted)]">{explain}</div>
      </details>
    </div>
  );
}

export function Presets({ items }: { items: { id: string; label: string; active?: boolean; onClick: () => void }[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={item.onClick}
          className={`min-h-11 rounded-lg px-3 text-left text-sm font-semibold ${item.active ? "bg-[var(--primary)] text-white" : "border border-[var(--border)] bg-[var(--surface)]"}`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function Readouts({ items }: { items: { label: string; value: string }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-2">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2">
          <dt className="text-[11px] font-bold uppercase tracking-wide text-[var(--text-soft)]">{item.label}</dt>
          <dd className="mt-0.5 font-mono text-sm font-semibold">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Goal({ ok, pending, done }: { ok: boolean; pending: string; done: string }) {
  return (
    <p className={`rounded-lg px-3 py-2 text-sm leading-snug ${ok ? "bg-emerald-500/15" : "bg-[var(--surface-3)] text-[var(--text-muted)]"}`}>
      <span className="font-bold">{ok ? "Yes. " : "Try this. "}</span>
      {ok ? done : pending}
    </p>
  );
}

export function Predict({
  prompt,
  options,
  answer,
  because,
}: {
  prompt: string;
  options: { id: string; label: string }[];
  answer: string;
  because: string;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  useEffect(() => setPicked(null), [prompt, answer]);
  const right = picked === answer;
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
      <p className="text-sm font-semibold">{prompt}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setPicked(option.id)}
            className={`min-h-11 rounded-lg px-3 text-sm font-semibold ${picked === option.id ? "bg-[var(--primary)] text-white" : "border border-[var(--border)]"}`}
          >
            {option.label}
          </button>
        ))}
      </div>
      {picked && (
        <p className={`mt-2 text-sm ${right ? "text-emerald-600 dark:text-emerald-400" : "text-[var(--text-muted)]"}`}>
          {right ? "Correct. " : "Not quite. "}
          {because}
        </p>
      )}
    </div>
  );
}

export function PlotFrame({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <svg viewBox="0 0 360 240" className="block h-auto w-full touch-none" role="img" aria-label={label}>
      {children}
    </svg>
  );
}

export function svgPoint(svg: SVGSVGElement, clientX: number, clientY: number) {
  const point = svg.createSVGPoint();
  point.x = clientX;
  point.y = clientY;
  const matrix = svg.getScreenCTM();
  if (!matrix) return { x: 0, y: 0 };
  const local = point.matrixTransform(matrix.inverse());
  return { x: local.x, y: local.y };
}

export function Handle({
  x,
  y,
  label,
  onDrag,
}: {
  x: number;
  y: number;
  label?: string;
  onDrag: (point: { x: number; y: number }) => void;
}) {
  const move = (event: ReactPointerEvent<SVGGElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg) return;
    onDrag(svgPoint(svg, event.clientX, event.clientY));
  };
  return (
    <g
      style={{ cursor: "grab" }}
      onPointerDown={(event) => event.currentTarget.setPointerCapture(event.pointerId)}
      onPointerMove={move}
    >
      <circle cx={x} cy={y} r={18} fill="transparent" />
      <circle cx={x} cy={y} r={8} fill="var(--primary)" stroke="#fff" strokeWidth={2} />
      {label && (
        <text x={x + 12} y={y - 10} fontSize={12} fontWeight={700} fill="var(--text)">
          {label}
        </text>
      )}
    </g>
  );
}
