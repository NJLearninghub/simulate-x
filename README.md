# SimulateX by NJ Learning Hub

Interactive simulations for Classes 9–12. The site is a static Vite + React + TypeScript app: every simulation is bundled, so students do not sign in and the page does not load React from a CDN.

## Scripts

```bash
npm install
npm run dev      # local preview
npm run build    # typecheck and write dist/
npm run preview  # serve the production build
```

## Vercel

The existing Vercel project can keep deploying from this repository.

| Setting | Value |
| --- | --- |
| Framework | Vite |
| Build command | `npm run build` |
| Output directory | `dist` |
| Install command | `npm install` |

`vercel.json` sets those and rewrites every path to `index.html` so client-side routes (`/class/11/physics`, `/sim/projectile`, …) work on refresh. No server and no environment variables are required. Firebase, Google login and the admin upload panel have been removed.

## How to add a simulation

1. Create a React component in `src/sims/`, for example `src/sims/my-sim.tsx`, and `export default` it. Use Tailwind classes. Prefer the shared panel in `src/sims/kit.tsx` (`Instrument`, `Slider`) when the simulation is new, so controls match the rest of the site and stay usable on a phone or a projector.
2. If it belongs to a chapter that is not listed yet, add that chapter to `src/chapters.ts` (class, subject, NCERT chapter number and name, textbook).
3. Register it in the `SIMS` array in `src/catalog.ts`:

```ts
{
  id: "my-sim",                 // used in the URL /sim/my-sim
  classId: 11,                  // 9, 10, 11 or 12
  subject: "physics",           // physics | chemistry | maths | biology
  chapter: 4,                   // NCERT chapter number
  title: "Short title",
  explore: "One or two sentences on what a student should try.",
  Component: lazy(() => import("./sims/my-sim")),
}
```

4. Run `npm run build`. The new card shows up under that class, subject and chapter. Chapters with no simulation show “Coming soon”.

Keep formulas, units and sign conventions aligned with the rationalised NCERT textbook for that chapter.
