import { Component, Suspense, useMemo, type ReactNode } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { SIMS, getSim, searchSims, simCountForClass, simsFor } from "./catalog";
import {
  CLASSES,
  SUBJECTS,
  chaptersFor,
  findChapter,
  subjectsFor,
  type ClassId,
  type SubjectId,
} from "./chapters";
import { Crumb } from "./components/Shell";

function parseClass(value: string | undefined): ClassId | null {
  const n = Number(value);
  return CLASSES.includes(n as ClassId) ? (n as ClassId) : null;
}

function parseSubject(value: string | undefined): SubjectId | null {
  if (value === "physics" || value === "chemistry" || value === "maths" || value === "biology") return value;
  return null;
}

class SimErrorBoundary extends Component<{ name: string; children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="p-8 text-center">
          <h2 className="font-display text-xl font-bold">This simulation hit a problem</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">{this.props.name} could not finish drawing.</p>
          <button className="reset-btn mt-4" onClick={() => this.setState({ error: null })}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function HomePage() {
  return (
    <div className="page">
      <p className="m-0 text-sm font-semibold uppercase tracking-wider text-[var(--primary)]">Classes 9 to 12</p>
      <h1 className="mb-2 mt-2 font-display text-4xl font-extrabold tracking-tight md:text-5xl">
        Interactive simulations
      </h1>
      <p className="m-0 max-w-2xl text-[17px] leading-relaxed text-[var(--text-muted)]">
        Open to every curious mind from Std 9 to 12 — explore, experiment and see Physics, Chemistry, Maths and Biology come alive.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {CLASSES.map((id) => {
          const count = simCountForClass(id);
          return (
            <Link key={id} to={`/class/${id}`} className="card-link min-h-[140px]">
              <span className="text-sm font-semibold text-[var(--text-muted)]">Class</span>
              <span className="font-display text-4xl font-extrabold tracking-tight">{id}</span>
              <span className="mt-auto text-sm text-[var(--text-muted)]">
                {count === 0 ? "Chapters ready · simulations coming soon" : `${count} simulation${count === 1 ? "" : "s"}`}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function ClassPage() {
  const { classId: raw } = useParams();
  const classId = parseClass(raw);
  if (!classId) return <Missing />;
  const subjects = subjectsFor(classId);
  return (
    <div className="page">
      <Crumb items={[{ label: `Class ${classId}` }]} />
      <h1 className="mb-2 font-display text-3xl font-extrabold tracking-tight">Class {classId}</h1>
      <p className="m-0 text-[var(--text-muted)]">Choose a subject.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {subjects.map((id) => {
          const meta = SUBJECTS[id];
          const n = simsFor(classId, id).length;
          const chapters = chaptersFor(classId, id).length;
          return (
            <Link key={id} to={`/class/${classId}/${id}`} className="card-link">
              <span className="text-sm font-bold" style={{ color: meta.tint }}>{meta.name}</span>
              <span className="text-sm text-[var(--text-muted)]">
                {chapters} chapter{chapters === 1 ? "" : "s"} · {n === 0 ? "coming soon" : `${n} simulation${n === 1 ? "" : "s"}`}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function SubjectPage() {
  const { classId: raw, subject: rawSubject } = useParams();
  const classId = parseClass(raw);
  const subject = parseSubject(rawSubject);
  if (!classId || !subject) return <Missing />;
  const chapters = chaptersFor(classId, subject);
  const meta = SUBJECTS[subject];
  return (
    <div className="page">
      <Crumb items={[{ to: `/class/${classId}`, label: `Class ${classId}` }, { label: meta.name }]} />
      <h1 className="mb-1 font-display text-3xl font-extrabold tracking-tight">{meta.name}</h1>
      <p className="m-0 text-[var(--text-muted)]">Class {classId} · NCERT chapters</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {chapters.map((chapter) => {
          const sims = simsFor(classId, subject, chapter.number);
          return (
            <Link
              key={chapter.number}
              to={`/class/${classId}/${subject}/${chapter.number}`}
              className="card-link min-h-0 flex-row items-start justify-between gap-3"
            >
              <span>
                <span className="block text-xs font-bold uppercase tracking-wide text-[var(--text-soft)]">
                  Chapter {chapter.number}
                </span>
                <span className="mt-1 block font-display text-lg font-bold leading-snug">{chapter.name}</span>
                <span className="mt-2 block text-sm text-[var(--text-muted)]">
                  {sims.length === 0 ? "Coming soon" : `${sims.length} simulation${sims.length === 1 ? "" : "s"}`}
                </span>
              </span>
              <ChevronRight className="mt-1 shrink-0 text-[var(--text-soft)]" size={18} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function ChapterPage() {
  const { classId: raw, subject: rawSubject, chapter: rawChapter } = useParams();
  const classId = parseClass(raw);
  const subject = parseSubject(rawSubject);
  const number = Number(rawChapter);
  const chapter = classId && subject ? findChapter(classId, subject, number) : undefined;
  if (!classId || !subject || !chapter) return <Missing />;
  const sims = simsFor(classId, subject, chapter.number);
  const meta = SUBJECTS[subject];
  return (
    <div className="page">
      <Crumb
        items={[
          { to: `/class/${classId}`, label: `Class ${classId}` },
          { to: `/class/${classId}/${subject}`, label: meta.name },
          { label: `Chapter ${chapter.number}` },
        ]}
      />
      <p className="m-0 text-xs font-bold uppercase tracking-wide text-[var(--text-soft)]">{chapter.book}</p>
      <h1 className="mb-1 mt-1 font-display text-3xl font-extrabold tracking-tight">
        {chapter.number}. {chapter.name}
      </h1>
      {sims.length === 0 ? (
        <div className="card mt-6 p-8 text-center">
          <h2 className="m-0 font-display text-2xl font-bold">Coming soon</h2>
          <p className="mx-auto mt-2 max-w-md text-[var(--text-muted)]">
            A simulation for this chapter is not on SimulateX yet. Try another chapter, or search for a topic.
          </p>
          <Link to={`/class/${classId}/${subject}`} className="back-btn mt-4 justify-center">
            <ArrowLeft size={16} /> All {meta.name} chapters
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {sims.map((sim) => (
            <Link key={sim.id} to={`/sim/${sim.id}`} className="card-link">
              <span className="font-display text-xl font-bold">{sim.title}</span>
              <span className="text-sm leading-relaxed text-[var(--text-muted)]">{sim.explore}</span>
              <span className="mt-1 text-sm font-semibold text-[var(--primary)]">Open simulation</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function SimPage() {
  const { simId } = useParams();
  const navigate = useNavigate();
  const sim = getSim(simId);
  const chapter = sim ? findChapter(sim.classId, sim.subject, sim.chapter) : undefined;
  if (!sim || !chapter) return <Missing />;
  const Comp = sim.Component;
  const meta = SUBJECTS[sim.subject];
  return (
    <div className="page">
      <Crumb
        items={[
          { to: `/class/${sim.classId}`, label: `Class ${sim.classId}` },
          { to: `/class/${sim.classId}/${sim.subject}`, label: meta.name },
          { to: `/class/${sim.classId}/${sim.subject}/${sim.chapter}`, label: `Ch ${chapter.number}` },
          { label: sim.title },
        ]}
      />
      <button className="back-btn" onClick={() => navigate(`/class/${sim.classId}/${sim.subject}/${sim.chapter}`)}>
        <ArrowLeft size={16} /> Back to chapter
      </button>
      <h1 className="mb-1 font-display text-3xl font-extrabold tracking-tight">{sim.title}</h1>
      <p className="m-0 text-sm text-[var(--text-muted)]">
        Class {sim.classId} · {meta.name} · Chapter {chapter.number}: {chapter.name}
      </p>
      <div className="card mt-4 p-4 md:p-5">
        <h2 className="m-0 font-display text-base font-bold text-[var(--primary)]">What to explore</h2>
        <p className="mb-0 mt-1 text-[15px] leading-relaxed text-[var(--text-muted)]">{sim.explore}</p>
      </div>
      <div className="sim-frame">
        <Suspense fallback={<div className="p-10 text-center text-[var(--text-muted)]">Loading simulation…</div>}>
          <SimErrorBoundary name={sim.title}>
            <div className="sim-root">
              <Comp />
            </div>
          </SimErrorBoundary>
        </Suspense>
      </div>
    </div>
  );
}

export function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get("q") ?? "";
  const hits = useMemo(() => searchSims(q), [q]);
  return (
    <div className="page">
      <Crumb items={[{ label: "Search" }]} />
      <h1 className="mb-2 font-display text-3xl font-extrabold tracking-tight">Search</h1>
      <p className="m-0 text-[var(--text-muted)]">
        {q ? `${hits.length} result${hits.length === 1 ? "" : "s"} for “${q}”` : "Type a topic in the search box."}
      </p>
      <div className="mt-6 grid gap-3">
        {hits.map((sim) => {
          const chapter = findChapter(sim.classId, sim.subject, sim.chapter);
          return (
            <Link key={sim.id} to={`/sim/${sim.id}`} className="card-link">
              <span className="font-display text-lg font-bold">{sim.title}</span>
              <span className="text-sm text-[var(--text-muted)]">
                Class {sim.classId} · {SUBJECTS[sim.subject].name}
                {chapter ? ` · Ch ${chapter.number} ${chapter.name}` : ""}
              </span>
            </Link>
          );
        })}
      </div>
      {q && hits.length === 0 && (
        <p className="mt-6 text-[var(--text-muted)]">Nothing matched. Try “projectile”, “Ohm” or “photoelectric”.</p>
      )}
      {!q && (
        <p className="mt-4 text-sm text-[var(--text-muted)]">{SIMS.length} simulations are on the site.</p>
      )}
    </div>
  );
}

function Missing() {
  return (
    <div className="page">
      <h1 className="font-display text-3xl font-extrabold">Page not found</h1>
      <Link to="/" className="back-btn mt-3">
        <ArrowLeft size={16} /> Back home
      </Link>
    </div>
  );
}
