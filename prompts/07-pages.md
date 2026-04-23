# Prompt 7: Pages, Routing, Data Fetching, State, Edge Functions

**Runtime:** approximately 4 hours. Sequential. Requires Prompts 0-6 all merged to main.

**Authoritative context:** Read `ARCHITECTURE.md` sections 2 (architecture), 5 (tech stack), 10 (demo reliability rules). Review the design system in Storybook before starting; you are consuming those components, not reinventing them.

---

## Role and mission

You are a senior full-stack engineer wiring Project Trueplan together. The intelligence is built. The data is flowing. The design system is ready. Your job is to build the four dashboard views (Horizon, Cascade, Trace, Brief) as page skeletons that fetch data, manage state, and hand off to the visualisations in Prompt 8.

Every page must render in under two seconds on the demo laptop. Every page must work without network access after first load (data is pre-computed in Supabase; no live API calls from the browser). Every page must be accessible at WCAG AA.

You are also writing the edge functions that compute forecasts, cascades, and confidences from the raw data and write the derived tables. These are the glue between the pure intelligence packages and the Supabase reads the UI performs.

---

## What you are building

### 7.1 Supabase edge functions

Three edge functions, in `supabase/functions/`:

#### `compute-forecasts/`

```typescript
// supabase/functions/compute-forecasts/index.ts
// Triggered: on demand via RPC, and nightly at 04:00 UTC (one hour after ingest)

export async function handler(req: Request) {
  // 1. For each assumption in the demo project that has >= minMeasurementsRequired drift_measurements:
  //    - Fetch measurements
  //    - Fetch baseline (assumptions.baseline_value, baseline_unit, tolerance_pct)
  //    - Compute ensembleForecast using @tp/intelligence
  //    - Upsert into forecasts table (keyed on assumption_id + input_series_hash)
  // 2. Write an ingest_audit row summarising the run
  // 3. Return { forecastsComputed: n, skipped: m, errors: [] }
}
```

Notes:
- Deno runtime (Supabase edge functions use Deno). Ensure `@tp/intelligence` ships ESM and has no Node-specific APIs in the forecast package.
- If the package can't be imported via Deno natively, publish a thin adapter that compiles to a Deno-compatible bundle. Document in `supabase/functions/README.md`.
- Input series hash (SHA-256 of sorted measurements) lets us skip recomputation when data hasn't changed.
- Idempotent: running twice with unchanged data produces no duplicates.

#### `compute-cascades/`

Same pattern. Fetches all assumptions and cascade_links for the project, constructs the graph, runs `propagateAllPairs` and `computeSystemFragility`, upserts into `cascade_impacts`. Triggered on demand and nightly at 04:15 UTC.

#### `compute-confidences/`

Same pattern. For each assumption, gathers `ConfidenceInputs` from the database (review date, source tier, cross-source values if any, recent measurements), runs `computeConfidence`, upserts into `confidence_scores`. Triggered on demand and nightly at 04:30 UTC.

### 7.2 Edge function orchestration

A fourth edge function, `compute-all/`, calls the three above in order (forecasts → cascades → confidences) and returns a combined summary. This is what the UI calls on the "Recompute" action (if we surface it) and what a cron job triggers nightly via a single entry point.

Add `pnpm supabase:deploy-functions` and `pnpm supabase:trigger-recompute` as repo-root scripts.

### 7.3 Next.js app shell

In `apps/web/app/`:

```
app/
├── layout.tsx                    // root layout with fonts, providers, skip-to-content
├── page.tsx                      // marketing/landing page with a "View the dashboard" CTA
├── (dashboard)/
│   ├── layout.tsx                // dashboard-shell layout with top nav
│   ├── horizon/
│   │   └── page.tsx              // Horizon view
│   ├── cascade/
│   │   ├── page.tsx              // Cascade overview
│   │   └── [assumptionId]/
│   │       └── page.tsx          // Single-source cascade focus
│   ├── trace/
│   │   └── [assumptionId]/
│   │       └── page.tsx          // Trace view (drill into one assumption)
│   └── brief/
│       └── page.tsx              // Brief view
├── api/
│   ├── recompute/
│   │   └── route.ts              // proxies to compute-all edge function
│   └── brief-generate/
│       └── route.ts              // for Prompt 9
├── error.tsx                     // global error boundary
├── not-found.tsx                 // 404
└── loading.tsx                   // root loading state
```

#### Root layout

- Font loading via `next/font/google` as specified in Prompt 2.
- `lang="en-GB"` on the `<html>` tag.
- Skip-to-content link.
- Sentry and PostHog providers wrapped.
- Paper cream background.
- Full-bleed layout; the dashboard layout adds its own max-width.

#### Dashboard shell

- Top navigation: Project Trueplan wordmark on the left; nav items (Horizon, Cascade, Trace, Brief) in the centre; a "Last computed" timestamp and "Recompute" button on the right.
- Active nav item indicated with an ink-coloured underline, not a background fill.
- Below the nav, a slim ribbon showing the current project ("HPO24A01-DEMO: Nova Britannia Holographic Project Office"), muted; this anchors the user to what data they're looking at.
- Main content area below the ribbon, with the asymmetric 12-column grid and 80px gutters specified in ARCHITECTURE section 6.4.
- Footer: ink-coloured, minimal. Project Trueplan by the maintainer. Link to the GitHub repo (if public) or to the maintainer site. Licence note. MPA Challenge 5 acknowledgement.

### 7.4 Data access layer

In `apps/web/lib/data/`, one file per read pattern. All are server-only (use `import 'server-only'` pragma).

```typescript
// lib/data/assumptions.ts

export async function listAssumptions(projectCode: string): Promise<AssumptionRow[]>;
export async function getAssumption(projectCode: string, code: string): Promise<AssumptionRow | null>;
export async function listAssumptionsWithForecasts(projectCode: string): Promise<AssumptionWithForecast[]>;

// lib/data/forecasts.ts

export async function getLatestForecast(assumptionId: string): Promise<Forecast | null>;
export async function listForecasts(projectCode: string): Promise<Forecast[]>;

// lib/data/cascades.ts

export async function getCascadeGraph(projectCode: string): Promise<CascadeGraphData>;
export async function getCascadeImpacts(sourceAssumptionId: string): Promise<CascadeImpact[]>;
export async function getSystemFragility(projectCode: string): Promise<SystemFragilitySummary>;

// lib/data/confidence.ts

export async function getLatestConfidence(assumptionId: string): Promise<ConfidenceScore | null>;
export async function listConfidences(projectCode: string): Promise<ConfidenceScore[]>;

// lib/data/measurements.ts

export async function getMeasurementsForAssumption(
  assumptionId: string,
  options?: { fromDate?: string; limit?: number },
): Promise<DriftMeasurement[]>;

// lib/data/briefs.ts -- Prompt 9 populates this
```

All functions use the **anonymous** Supabase client (RLS lets anon read the demo project). Do not use the service-role key from the Next.js server; that's reserved for edge functions and backfill scripts.

Cache directives: each function sets `next: { revalidate: 300 }` on fetches (5-minute ISR). Revalidation on explicit tags via `revalidateTag` after recompute actions.

### 7.5 Horizon view

Page: `app/(dashboard)/horizon/page.tsx`.

**Purpose.** Answer the question "what's coming at me, and when?" across all 47 assumptions.

**Layout.**

- `PageHeader`: title "Horizon", kicker "All assumptions, forecasted lead time", meta row with "Data as of {timestamp}", "Computing from {n} measurements", and a time-horizon selector (30/90/365 days).
- Main area is a two-column layout: 8 columns for the horizon visualisation (built in Prompt 8), 4 columns for a right-hand `DataTable` showing the same assumptions sorted by lead time.
- Below: a small Summary band with KPIs (KPI component from design system): "Average lead time", "Assumptions in breach", "Assumptions within 30 days", "Assumptions with low confidence". These numbers are computed server-side.

**Interactivity.**

- Clicking a horizon bar or table row navigates to `/trace/{assumptionId}`.
- Filter chips above the table: category, severity, source tier. Filters apply to both the visualisation and the table.
- Sort toggle on the table columns. Persisted to URL params for shareable links.

**Data.**

- Server component fetches all assumptions, latest forecasts, latest confidences for the demo project.
- Computes derived fields (severity from drift score and breach proximity; colour coding; sort keys).
- Passes to a client component for interactivity.

**Accessibility.**

- Every horizon bar has an `aria-label` with full data read aloud by screen readers ("A039 Economic Inflation, lead time 23 days, severity critical").
- Table is keyboard-navigable (Prompt 2's DataTable primitive handles this).
- Filter chips are proper checkboxes with visible focus states.

### 7.6 Cascade view

Page: `app/(dashboard)/cascade/page.tsx` (overview).
Page: `app/(dashboard)/cascade/[assumptionId]/page.tsx` (single-source focus).

**Overview purpose.** "Show me the system's fragility at a glance."

**Overview layout.**

- PageHeader: title "Cascade", kicker "Dependency network and system fragility", meta row with global fragility score and top-3 upstream drivers.
- Main area: 12-column full-width visualisation built in Prompt 8 (Cytoscape force-directed graph by default; toggle to Sankey).
- Right side: a panel listing top upstream drivers with their `driverScore`, clickable to the single-source focus page.
- Below: a "Most exposed" panel showing nodes with highest fragility (sensitivity to upstream drift), clickable to open the trace view for that node.

**Single-source focus purpose.** "Show me what this one assumption cascades into."

**Single-source layout.**

- PageHeader with the source assumption's code and description as title.
- Main area: a Sankey diagram showing drift flow from the source to all reachable targets, weighted by path-product. Built in Prompt 8.
- Below: a DataTable of affected assumptions, sorted by `expectedDriftScore` descending. Each row links to its own trace view.

**Interactivity.**

- On the overview, hovering a node highlights all its outgoing edges and their targets.
- On the single-source focus, hovering a Sankey flow shows the full path (e.g. "A039 → A015 → A027 via weights 0.8, 0.5").
- URL params persist selected source node.

### 7.7 Trace view: the demo centrepiece

Page: `app/(dashboard)/trace/[assumptionId]/page.tsx`.

**Purpose.** The hero view. One assumption drilled down with baseline, actuals, forecast cone, source provenance, and confidence breakdown. This is what Laura clicks during the demo and what carries the moment described in the hackathon pitch.

**Build this page to a higher standard than the others.** It is the single view judges will remember.

**Layout.**

- PageHeader: assumption code (monospace, display size) as kicker; description as title (serif display medium); meta row with owner, category, and review status.
- Primary visualisation (Prompt 8): baseline value overlaid with measurements, forecast cone, breach date annotation. Full-width, tall (480px), editorial.
- Below, a three-column panel:
  - **Confidence breakdown** (left 4 cols): the confidence score as a KPI, its interpretation (HIGH/MODERATE/LOW), and the caveat list.
  - **Provenance** (centre 4 cols): a vertical list of every measurement with timestamp, value, source (icon + label), source URL as SourceLink. Scroll within the panel if the list is long. Every entry is click-through to the raw source.
  - **Cascade summary** (right 4 cols): the top 5 downstream assumptions ranked by expected drift, linked to `/cascade/{assumptionId}` for the full Sankey.
- Below that, a final row: "Raw data" disclosure section (collapsible). Expands to show the full measurement table, the forecast ensemble's individual method breakdowns (linear, EWMA, AR(1) results), and the confidence component scores. This is for the judge who asks "can I see how this number was computed?", one click and they can.

**Interactivity.**

- Hovering the forecast cone reveals exact projected values and CI bounds.
- Hovering a measurement point reveals the full provenance (source, URL, timestamp, notes).
- "Open in Horizon" button at top-right to return to the context.
- Keyboard navigation between measurements and through the disclosure section.

**Timestamp discipline.**

- Two timestamps visible at all times: "Data as of {asOf}" (the most recent measurement's as-of date) and "Retrieved {retrievedAt}" (the most recent fetch timestamp). Use the Timestamp component; tooltips show absolute time.
- For the demo moment, the retrieved timestamp must show seconds-ago freshness during the demo. Achieve this by running a cheap warm-fetch just before demo time (documented in demo runbook).

**Motion.**

- The forecast cone draws in on page load with a 400ms stagger, 120ms delay after the measurements plot. Respects `prefers-reduced-motion`.

### 7.8 Brief view (skeleton only; content from Prompt 9)

Page: `app/(dashboard)/brief/page.tsx`.

**Purpose.** "Give me the board-ready summary."

**Layout.**

- PageHeader: title "Brief", kicker "Board-ready narrative", meta row with "Generated at {timestamp}", a refresh button, and an "Export" dropdown (copy-to-clipboard, copy as markdown, print view).
- Main area: a centred reading column at ~720px max-width (editorial measure). Cream background. Serif body at 17px. This is the only view where typography is set as if it were an article, not a dashboard.
- Content: fetched from `briefs` table, rendered as markdown. Prompt 9 populates this; in this prompt the page loads a placeholder with "Brief not yet generated. Click the refresh button to generate." and a functional refresh button that hits the `/api/brief-generate` route (stubbed here, implemented in Prompt 9).
- Below the reading column: source and methodology footnotes.

**Print styles.** A `@media print` section that strips nav and chrome, keeps the reading column and footnotes, uses ink on white. The brief is designed to be printable as a one-pager.

### 7.9 State management

- `zustand` for client-side state. One store per page, colocated with the page component. Stores hold UI state only (filter selections, hover state, modal state). Data comes from server components or from `useQuery` / `useSWR` for revalidation.
- No global state store. No context provider wrapping the whole app.
- URL state (filter selections, selected source node) is the source of truth for anything shareable. Zustand mirrors URL state, not the other way around.

### 7.10 Recompute action

- The "Recompute" button in the dashboard shell posts to `/api/recompute` which proxies to the `compute-all` edge function.
- On success, invalidates cache tags and revalidates the current page.
- Shows a loading state during compute (typical runtime ~15-30 seconds for 47 assumptions).
- Shows a completion toast with the compute summary ("47 forecasts, 47 cascades, 47 confidences recomputed in 23 seconds").

### 7.11 Landing page

The marketing/landing page at `app/page.tsx` (outside the dashboard layout).

**Purpose.** For anyone who hits the root URL (e.g. a judge who follows a tweet link), a one-screen introduction: what Project Trueplan is, what the hackathon context is, a single CTA "View the dashboard."

**Layout.**

- Cream background, full height.
- Left 7 columns: editorial headline serif ("An early warning system for project assumptions"), short body paragraph, CTA button to `/horizon`.
- Right 5 columns: a static SVG illustration or a compact KPI quartet showing real numbers from the demo project. Live data makes the page feel alive.
- Below the fold (one scroll): three short columns titled "The problem", "The approach", "What you'll see", each 60-80 words of body prose.
- Footer: Project Trueplan by the maintainer, repo link, licence, MPA Challenge 5 acknowledgement.

This page is the first impression for search-engine visitors or link-sharers. It sets a confident, editorial tone consistent with the dashboard.

### 7.12 Tests

- **Playwright E2E smoke test.** Loads `/horizon`, clicks the first horizon bar, asserts navigation to `/trace/{id}`, asserts the forecast cone renders, clicks "Open in Horizon" and returns.
- **Playwright accessibility test.** Runs axe-core on each of the four views; zero violations allowed.
- **Playwright Lighthouse test.** Each page must score >=90 performance, >=95 accessibility.
- **Integration tests for edge functions.** Using a local Supabase instance, seed the database, invoke `compute-all`, assert the derived tables populate correctly.
- **Unit tests for data-access functions.** Mock the Supabase client; assert each function shapes results correctly.

### 7.13 Documentation

- `apps/web/README.md`, how to run the app, environment setup, demo-mode notes.
- `apps/web/DEMO_CHECKLIST.md`, pre-demo checks: recompute has been run, retrievedAt timestamps are fresh, no console errors, all four views render in <2s. This is used the morning of the hack.
- `supabase/functions/README.md`, edge function architecture, how to deploy, how to trigger manually.

---

## Out of scope

- The visualisations themselves (Horizon bar chart, Cascade Sankey/Cytoscape, Trace timeline). Prompt 8 builds these as components this prompt imports.
- The Brief content generation via PDA Platform. Prompt 9 handles this; this prompt leaves a stub button.

---

## Definition of done

- [ ] Three edge functions (`compute-forecasts`, `compute-cascades`, `compute-confidences`) deployed and tested
- [ ] `compute-all` orchestrator deployed
- [ ] Next.js app shell in place with dashboard layout, nav, and brief indicator
- [ ] Data-access layer complete, server-only, typed, cached with ISR
- [ ] Horizon view renders the 47 HPO assumptions with filter, sort, and navigation to Trace
- [ ] Cascade overview renders the graph and the system fragility summary
- [ ] Cascade single-source focus renders the Sankey and ranked targets
- [ ] Trace view renders the primary visualisation, confidence breakdown, provenance panel, cascade summary, and raw-data disclosure
- [ ] Brief view skeleton loads and shows placeholder content; refresh button wired but stubbed for Prompt 9
- [ ] Landing page on `/` renders with CTA to `/horizon`
- [ ] Recompute flow works end-to-end; toast reports success; UI revalidates
- [ ] Every page loads in <2s on throttled 4G (Lighthouse verified)
- [ ] Every page scores >=95 accessibility (axe-core verified)
- [ ] Playwright E2E smoke test passes in CI
- [ ] Documentation complete (README, DEMO_CHECKLIST, supabase/functions/README)
- [ ] CI green; PR opened; reviewed against `ARCHITECTURE.md` sections 2, 5, 10

---

## Self-check before PR

1. Does the Trace view genuinely feel like the product's hero, or does it feel like a fourth page with equal weight? It must feel like the hero.
2. Are the timestamps on Trace view set up so that during the live demo, "Retrieved X seconds ago" is honest? Check by running the warm-fetch and loading the page.
3. Does the Horizon view's visualisation communicate lead time legibly to someone who has never seen it before? If it needs a paragraph of explanation, redesign.
4. Is every edge function idempotent? Re-running `compute-all` produces no duplicates and no errors.
5. Are server components the default, with client components only for interactivity? Verify no unnecessary `'use client'` pragmas.
6. Is the landing page something you'd be happy for a judge to see via a shared link, not just the one opened on demo day?

---

*End of Prompt 7. Sequential dependency on Prompts 0-6. Prompt 8 depends on this, but can overlap where helpful.*
