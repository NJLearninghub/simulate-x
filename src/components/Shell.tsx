import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Moon, Search, Sun } from "lucide-react";
import { searchSims } from "../catalog";
import { SUBJECTS } from "../chapters";

function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(
    () => (document.documentElement.dataset.theme as "light" | "dark") || "light",
  );
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("sx-theme", theme);
  }, [theme]);
  return {
    theme,
    toggle: () => setTheme((t) => (t === "light" ? "dark" : "light")),
  };
}

export function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);
  return null;
}

export function Header() {
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLFormElement>(null);
  const hits = useMemo(() => (q.trim().length >= 1 ? searchSims(q).slice(0, 7) : []), [q]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <header className="app-header">
      <div className="mx-auto flex w-[min(1120px,calc(100%-20px))] items-center gap-3 py-3 md:gap-5">
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <span className="brand-mark text-[#dbe6ff]">Sx</span>
          <span className="leading-tight">
            <span className="block font-display text-[22px] font-extrabold tracking-tight">
              Simulate<span className="text-[#8eb0ff]">X</span>
            </span>
            <span className="block text-[12px] text-[#c5d4f5]">by NJ Learning Hub</span>
          </span>
        </Link>
        <p className="hide-sm m-0 text-sm text-[#c5d4f5]">
          Explore <span className="opacity-50">·</span> Experiment <span className="opacity-50">·</span> Learn
        </p>
        <form
          ref={box}
          className="relative ml-auto w-full max-w-md"
          onSubmit={(e) => {
            e.preventDefault();
            const query = q.trim();
            if (!query) return;
            setOpen(false);
            navigate(`/search?q=${encodeURIComponent(query)}`);
          }}
        >
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#d5e2ff]" />
          <input
            className="search-input"
            placeholder="Search simulations"
            aria-label="Search simulations"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
          />
          {open && q.trim() && (
            <div className="search-pop" role="listbox">
              {hits.length === 0 && <div className="px-3.5 py-3 text-sm text-[var(--text-muted)]">No simulations match.</div>}
              {hits.map((s) => (
                <Link
                  key={s.id}
                  to={`/sim/${s.id}`}
                  onClick={() => setOpen(false)}
                >
                  <span className="block text-sm font-semibold">{s.title}</span>
                  <span className="block text-xs text-[var(--text-muted)]">
                    Class {s.classId} · {SUBJECTS[s.subject].name} · Ch {s.chapter}
                  </span>
                </Link>
              ))}
              <button
                type="submit"
                className="text-sm font-semibold text-[var(--primary)]"
              >
                See all results
              </button>
            </div>
          )}
        </form>
        <button className="icon-btn shrink-0" onClick={toggle} aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}>
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>
    </header>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-[var(--border)] py-6 text-center text-sm text-[var(--text-muted)]">
        SimulateX by NJ Learning Hub · Classes 9–12 · Ahmedabad
      </footer>
    </div>
  );
}

export function Crumb({ items }: { items: { to?: string; label: string }[] }) {
  return (
    <nav className="crumb" aria-label="Breadcrumb">
      <NavLink to="/">Home</NavLink>
      {items.map((item, i) => (
        <span key={i} className="contents">
          <span aria-hidden>/</span>
          {item.to ? <NavLink to={item.to}>{item.label}</NavLink> : <span className="text-[var(--text)]">{item.label}</span>}
        </span>
      ))}
    </nav>
  );
}
