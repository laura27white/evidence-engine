# Project Trueplan: Architecture and Conventions

**Project:** Project Trueplan
**Purpose:** Forecast-driven early warning system for project assumption drift
**Context:** MPA Challenge 5 (Critical Assumption Drift) hackathon entry
**Status:** Living document. Every Claude Code prompt references this file.

This document is the single source of truth for naming, structure, and conventions. If a prompt and this document disagree, this document wins. If a decision is not in this document, the prompt making that decision must update this document before merging.

---

## 1. Product overview

### 1.1 What the product does

Project Trueplan converts a static assumption register into a live, forecasted risk horizon. For every assumption in a project, it answers four questions:

1. Where does this assumption stand today relative to its baseline?
2. Where is it heading, based on recent measurements and external signals?
3. When will it breach tolerance if the trend continues?
4. What else will be affected when it does?

The primary metric the system exposes is **lead time**: the number of days of advance warning the system gives before an assumption materially threatens delivery.

### 1.2 Primary users

Three personas, matching the MPA Challenge 5 brief:

- **Portfolio Manager.** Wants cross-programme drift visibility and prioritised interventions.
- **Project Manager.** Wants to know which of their assumptions are about to fail and why.
- **Assurance Lead.** Wants evidence that assumptions are reviewed regularly and linked to data.

### 1.3 Success criteria mapping

The MPA Challenge 5 brief specifies the following. Every prompt must name which criteria it addresses.

| Criterion | Where addressed |
|---|---|
| Functioning assumption register with standardised formats and categories | Prompts 1 (schema), 3 (adapters), 7 (pages) |
| System to track internal vs external drift, identify dependencies, make automatic adjustments | Prompts 3 (adapters), 4 (forecast), 5 (cascade) |
| Confidence scoring and review-age tracking | Prompt 6 (confidence) |
| Live data integration with publicly available sources | Prompt 3 (adapters) |
| Clear distinction between assumptions and risks | Architecture section 3 |
| Demonstration of how one assumption's change can impact deliverables | Prompts 5 (cascade), 8 (Sankey visualisation) |
| Adaptability to multiple projects with unique contexts | Schema multi-tenancy; Prompt 1 |
| Visual interface showing current assumptions, drift status, and early warnings | Prompts 7 (pages), 8 (visualisations) |

---

## 2. High-level architecture

### 2.1 System diagram

```
┌────────────────────────────────────────────────────────────────────┐
│  EXTERNAL SOURCES                                                   │
│  ONS · Bank of England · gov.uk policy trackers · World Bank       │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌────────────────────────────────────────────────────────────────────┐
│  SUPABASE, scheduled edge functions (ingest, nightly)              │
│  • fetch external signals                                           │
│  • normalise to ExternalSignal schema                               │
│  • write to drift_measurements with provenance                      │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌────────────────────────────────────────────────────────────────────┐
│  INTELLIGENCE LAYER (TypeScript packages, pure functions)           │
│  • forecast: linear + EWMA + AR(1) ensemble                         │
│  • cascade:  Bayesian-style propagation across DAG                  │
│  • confidence: recency × source tier × agreement × volatility       │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌────────────────────────────────────────────────────────────────────┐
│  SUPABASE, derived tables                                          │
│  forecasts · cascade_impacts · confidence_scores · briefs          │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌────────────────────────────────────────────────────────────────────┐
│  NEXT.JS 14 APP (dashboard)                                         │
│  • Horizon view  · Cascade view · Trace view    · Brief view        │
│  • Server Components for data, Client Components for interaction    │
└─────────────────────────────────────────────────────────────────────┘

External engine (backgrounded, not on the critical demo path):
┌────────────────────────────────────────────────────────────────────┐
│  PDA PLATFORM, MCP server at pda-platform-i33p.onrender.com       │
│  • source of assumption register data model                         │
│  • narrative generation for Brief view                              │
│  • called from Supabase edge functions, never from the browser     │
│  • all responses cached in briefs table                            │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Layer responsibilities

**Experience layer (Next.js app).** Reads from Supabase. Never calls external APIs directly. Never calls PDA Platform directly. All computation is pre-computed and sitting in the database by the time the user loads the page.

**Derived data layer (Supabase tables).** Materialised views of intelligence-layer output. Refreshed by scheduled functions. This is the interface between the slow world (external APIs, forecasting) and the fast world (the UI).

**Intelligence layer (TypeScript packages).** Pure functions. No I/O. No network calls. Takes arrays of measurements in, returns forecast/cascade/confidence objects out. Fully testable without a database or network.

**Ingestion layer (Supabase edge functions).** The only layer that talks to the outside world. Scheduled, idempotent, traceable.

**Engine layer (PDA Platform).** External dependency. Used for narrative generation only. Every response cached. The UI never depends on it being available.

### 2.3 Why this shape

The shape is deliberate. It gives us four properties:

1. **Demo reliability.** Nothing on the critical path during the demo hits the network. Data is in Supabase. PDA Platform narratives are cached. If Render cold-starts, we don't care.
2. **Testability.** The intelligence layer is pure functions with no dependencies. 95%+ test coverage is trivial.
3. **Auditability.** Every derived number in the UI traces back to a source row in `drift_measurements` with a URL and timestamp.
4. **Paper defensibility.** The forecast, cascade, and confidence algorithms are modular, documented, and reproducible.

---

## 3. Conceptual model

### 3.1 Assumption vs risk vs issue (the challenge asks for this distinction)

- **Assumption.** A stated belief about a state of the world that the plan depends on, which may or may not still be true. Has a baseline value, a tolerance, and a review cadence.
- **Risk.** A possible future event with a likelihood and an impact. Assumptions can generate risks when they drift.
- **Issue.** A current problem that has already materialised. Drift beyond tolerance generates issues.

The system tracks assumptions primarily. Risks and issues are derived state.

### 3.2 Internal vs external assumptions

- **Internal assumption.** Anchored to a value inside the project's control (e.g. "the programme director is available 80% of the time"). Validated manually by the owner. Drift measured in absolute or percentage terms.
- **External assumption.** Anchored to a value outside the project's control (e.g. "UK CPI will be 2.5% or lower"). Validated automatically against a live external signal. Drift measured as the difference between the baseline and the current external value.

Both kinds use the same data model; they differ only in how `drift_measurements` rows are populated (manual vs scheduled job).

### 3.3 Tolerance, breach, drift score

For an assumption with baseline $b$, tolerance percentage $\tau$, and current value $v$:

$$\text{drift ratio} = \frac{|v - b|}{b}$$

$$\text{breach} = \text{drift ratio} > \frac{\tau}{100}$$

$$\text{drift score} = \min\left(1, \frac{\text{drift ratio}}{\tau / 100}\right)$$

Drift score is 0 at baseline, 1 at tolerance boundary, capped at 1 when in breach. Normalised to `[0, 1]` for consistency across assumptions with different units and magnitudes.

### 3.4 Lead time

For an assumption with projected breach date $d_b$ and today $d_0$:

$$\text{lead time} = d_b - d_0 \text{ (days)}$$

Negative lead time means the assumption has already breached. Large positive means safe. Zero means breaching today.

### 3.5 Cascade impact

For an assumption node $A$ in the cascade DAG with downstream children $C_1 \ldots C_n$ and edge weights $w_1 \ldots w_n \in [0, 1]$:

$$\text{downstream drift}(C_i) = w_i \times \text{drift score}(A)$$

Paths through multiple edges multiply: $A \to B \to C$ with weights $w_{AB}, w_{BC}$ gives $w_{AB} \times w_{BC}$. Multiple paths to the same node sum with a saturation cap at 1.

### 3.6 Confidence score

A pure function of four inputs, producing a score in `[0, 100]`:

- **Recency.** Days since last review, decayed exponentially against the assumption's review cadence.
- **Source tier.** Tier 1 (official statistics, e.g. ONS), Tier 2 (reputable secondary), Tier 3 (internal estimate).
- **Cross-source agreement.** Variance between multiple external signals anchored to the same concept.
- **Drift volatility.** Standard deviation of the recent measurement series.

Weights documented in Prompt 6 methodology.

---

## 4. Data model (canonical)

Full DDL lives in Prompt 1. This is the conceptual summary.

### 4.1 Core tables

```
projects (id, name, description, created_at)
  │
  ├── assumptions (id, project_id, code, description, category,
  │                owner, baseline_value, baseline_unit, tolerance_pct,
  │                review_cadence_days, source_tier, external_ref,
  │                is_external, is_portfolio_level, created_at, pda_platform_id)
  │
  ├── drift_measurements (id, assumption_id, measured_at, observed_value,
  │                       source, source_url, external_data_ref, notes)
  │
  ├── cascade_links (id, source_assumption_id, target_assumption_id,
  │                  propagation_weight, rationale, created_at)
  │
  ├── forecasts (id, assumption_id, computed_at, method,
  │              projected_value_30d, projected_value_90d, projected_value_365d,
  │              projected_breach_date, confidence_interval_lower,
  │              confidence_interval_upper, ensemble_agreement)
  │
  ├── cascade_impacts (id, source_assumption_id, target_assumption_id,
  │                    computed_at, expected_drift_score, paths_json)
  │
  ├── confidence_scores (id, assumption_id, computed_at, score,
  │                      recency_component, source_tier_component,
  │                      agreement_component, volatility_component)
  │
  └── briefs (id, project_id, generated_at, narrative_text,
              pda_platform_response_json, cache_key)
```

### 4.2 Time-series discipline

`drift_measurements` is append-only. Never UPDATE, never DELETE. This is the audit log. Every derived table (`forecasts`, `cascade_impacts`, `confidence_scores`) is fully recomputable from this.

### 4.3 Multi-tenancy

All tables scoped by `project_id`. RLS policies enforce per-project access. Auth is not wired in the MVP but the policies exist and are tested against a mock JWT claim.

---

## 5. Tech stack (canonical)

| Layer | Choice | Reason |
|---|---|---|
| Frontend framework | Next.js 14 (App Router) | React Server Components, Netlify native |
| Language | TypeScript 5, strict mode, `noUncheckedIndexedAccess` on | Type safety per userPreferences |
| Styling | Tailwind CSS v3.4 | Speed |
| UI primitives | Radix UI | Accessibility out of the box |
| Charts | Recharts for linear charts, Cytoscape.js for graph, custom SVG Sankey | Right tool for each job |
| State | React Server Components + `zustand` for client state | Minimal |
| Backend | Supabase (Postgres + Edge Functions + RLS) | Speed, integrated auth story |
| Scheduled jobs | Supabase pg_cron + Edge Functions | No separate cron infrastructure |
| External MCP | PDA Platform at `pda-platform-i33p.onrender.com/sse` | Existing open-source engine |
| Testing | Vitest (unit), Playwright (E2E), Storybook + Chromatic (visual regression) | Best-in-class for stack |
| CI | GitHub Actions | Free for public repos |
| Deployment | Netlify (app), Supabase (db + fns) | Matches Ant's established workflow |
| Observability | Sentry (errors), PostHog (product analytics) | Production-grade from day one |
| Package manager | pnpm | Faster than npm, better monorepo support |
| Monorepo | pnpm workspaces | Simpler than Turborepo/Nx for our size |

### 5.1 Repo structure

```
mpa-ch5-project-trueplan/
├── apps/
│   └── web/                    # Next.js 14 app
│       ├── app/
│       │   ├── (dashboard)/
│       │   │   ├── horizon/
│       │   │   ├── cascade/
│       │   │   ├── trace/[id]/
│       │   │   └── brief/
│       │   ├── api/
│       │   └── layout.tsx
│       ├── components/
│       └── lib/
├── packages/
│   ├── intelligence/           # Pure forecast, cascade, confidence
│   │   ├── src/
│   │   │   ├── forecast/
│   │   │   ├── cascade/
│   │   │   └── confidence/
│   │   └── METHODOLOGY.md      # Paper-grade docs
│   ├── external-data/          # ONS, BoE, gov.uk adapters
│   │   └── src/
│   │       ├── ons/
│   │       ├── boe/
│   │       └── govuk/
│   ├── db/                     # Schema, migrations, generated types
│   │   ├── migrations/
│   │   └── types/
│   └── design-system/          # Tokens, components, Storybook
│       ├── src/
│       ├── tokens/
│       └── .storybook/
├── supabase/
│   ├── functions/              # Edge functions
│   └── migrations/             # Symlinked from packages/db
├── docs/
│   ├── ARCHITECTURE.md         # This file
│   ├── DEMO_SCRIPT.md
│   └── paper/
│       ├── methodology.md      # Aggregated from packages
│       └── references.bib
├── .github/
│   └── workflows/
├── .env.example
├── .gitignore
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── README.md
```

---

## 6. Visual design direction

### 6.1 Aesthetic commitment

**Editorial intelligence, not dashboard-by-default.** This is the differentiator. Judges will see a dozen Tableau-clone dashboards today; we will not be one of them. We look like a Bloomberg terminal crossed with a quarterly review magazine: typographically confident, data-dense, monochrome with a single accent, designed to be read as well as looked at.

### 6.2 Typography

- **Display:** GT Sectra (serif) or Tiempos Headline. If licensing is a concern, use Source Serif 4 (free). Decisive, editorial, not "tech startup."
- **Body:** Söhne (licensed) or IBM Plex Sans (free). Neutral, legible at small sizes.
- **Mono:** Berkeley Mono (licensed) or JetBrains Mono (free). For data cells, timestamps, assumption codes.

Pair a serif display with a sans body. This is unusual for dashboards and immediately distinctive.

### 6.3 Colour

Dominant palette: monochrome greys, cream paper background (`#F7F4EE`), ink body (`#1A1A1A`). This is the base.

Single accent: a strong teal (`#0E6B6B`) for interactive elements and safe-state indicators.

Severity: a three-tone traffic signal that is colour-blind-safe, ember (`#D97534`) for warning, crimson (`#B3261E`) for critical, muted sage (`#6B8E7F`) for safe. Verified with Oracle/deuteranopia simulator. Always paired with an icon and a text label, never colour-only.

### 6.4 Layout

- 12-column grid, 80px gutter on desktop.
- Asymmetric composition. Horizon chart takes 8 columns, sidebar takes 4. Never 6/6.
- Generous negative space. Data-ink ratio high but with breathing room around it.
- Serif display type sized large (56-72px h1) on section landings.

### 6.5 Motion

- Restrained. Staggered fade-in on initial page load (80ms per card).
- Chart transitions on filter changes (250ms ease-out).
- No bouncy springs. No confetti. This is a serious tool.

### 6.6 What we are deliberately *not* doing

- Purple-to-pink gradients.
- Glassmorphism.
- Rounded-lg-everywhere.
- Inter as body font.
- Stock photo or 3D illustration hero.
- Pie charts.

---

## 7. Coding conventions

Drawn from Ant's `userPreferences`. These apply to every prompt without needing to be restated.

### 7.1 Language and writing

- British English throughout (code comments, UI copy, docs, commits). `colour` not `color` in UI copy, but CSS property names remain `color`.
- **No em dashes.** Not in code comments, not in UI copy, not in docs. Use semicolons, commas, or full stops.

### 7.2 Git

- Git identity: `laurawhite` / `laura27white@gmail.com`. Set explicitly in every repo clone.
- Feature branches only. Never commit to `main`.
- Conventional commits: `feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`.
- PRs required for merge. No force-push, no `git reset --hard`, no branch deletion without explicit confirmation.

### 7.3 TypeScript

- Strict mode on, `noUncheckedIndexedAccess` on, `noImplicitOverride` on.
- Never `any` without a justifying comment.
- Types narrow and precise. Prefer discriminated unions over booleans-plus-optionals.
- `zod` schemas for every external data boundary (API responses, env vars, Supabase row parsing).

### 7.4 Testing

- Tests alongside code, not after.
- Vitest for unit; Playwright for E2E critical-path.
- Coverage targets: 95% for `packages/intelligence` (pure functions, easy); 80% for adapters; E2E on the five-view happy path.
- Tests assert behaviour, not implementation.

### 7.5 Error handling

- No silent catches. No empty `catch` blocks. No unhandled promise rejections.
- Every error logged with context. Sentry in production.
- External API calls wrapped in `Result<T, E>` discriminated unions, not thrown exceptions.

### 7.6 Definition of done

Per userPreferences. Before any PR merges:

- [ ] Tests pass
- [ ] Lint passes
- [ ] TypeScript checks pass
- [ ] No hardcoded values or secrets
- [ ] No `console.log` or debug code
- [ ] Git identity correct
- [ ] Conventional commit message
- [ ] CI green on all checks
- [ ] Lighthouse score ≥ 90 for changed pages
- [ ] No axe-core violations on changed pages

### 7.7 Dependencies

- No silent additions. Every new dependency flagged with justification and a lighter alternative considered.
- Pin versions in `package.json` for production dependencies.

### 7.8 Accessibility

- WCAG AA minimum. Target AAA where feasible.
- Semantic HTML. ARIA only where HTML alone is insufficient.
- Keyboard navigation end-to-end, tested in CI with Playwright.
- Focus management on route changes.
- Screen reader tested with NVDA or VoiceOver at least once per view.
- Colour contrast verified. No colour-only meaning.

### 7.9 Performance

- Lighthouse performance ≥ 90 on every page, enforced in CI.
- Core Web Vitals budgets: LCP < 2.5s, CLS < 0.1, INP < 200ms.
- No database queries inside React render loops. No unbounded fetches. Cascade-heavy queries use materialised views.

---

## 8. Paper-grade documentation requirements

Every intelligence-layer prompt produces a `METHODOLOGY.md` in its package. Each methodology file contains:

1. **Problem statement**: what the module computes and why.
2. **Formal definition**: mathematical formulation in LaTeX.
3. **Algorithm**: pseudocode with complexity analysis (time and space).
4. **Assumptions and limitations**: what the method assumes, where it breaks down.
5. **Comparison with alternatives**: at least two alternative methods considered and rejected, with rationale.
6. **Validation approach**: how we verify correctness (unit tests, synthetic data experiments, comparison with ground truth).
7. **References**: BibTeX-cited, peer-reviewed where possible.

These files aggregate into `docs/paper/methodology.md` at the end of the build, forming the methodology section of the companion academic paper.

---

## 9. External integrations

### 9.1 ONS (Office for National Statistics)

- Base URL: `https://api.ons.gov.uk/`
- No API key required for public datasets.
- Rate limit: respect 10 requests per second; batch requests where possible.
- Datasets we use: CPI (`mm23/l55o`), PPI steel products (`mm22`), construction earnings (`ashe`).

### 9.2 Bank of England

- Statistical Interactive Database (IADB): `https://www.bankofengland.co.uk/boeapps/iadb/`
- CSV downloads, no API key.
- Series we use: Bank Rate (`IUDSOIA`), CPI inflation expectations (survey data).

### 9.3 gov.uk

- Policy papers feed: `https://www.gov.uk/api/search.json?filter_content_store_document_type=policy_paper`
- Rate limit: polite, no stated limit; space requests.

### 9.4 World Bank

- Indicators API: `https://api.worldbank.org/v2/`
- JSON format with `?format=json`.
- Used as a fallback cross-source for inflation comparisons.

### 9.5 PDA Platform (MCP)

- Endpoint: `https://pda-platform-i33p.onrender.com/sse`
- Used only for `generate_narrative`.
- Called from Supabase edge function, never from browser.
- Responses cached in `briefs` table keyed by `project_id + data_hash`.
- Cold-start mitigation: scheduled ping every 10 minutes during hack period.

---

## 10. Demo reliability rules

These are non-negotiable for anything on the critical demo path:

1. **No live external API calls during demo.** All data pre-computed and in Supabase.
2. **No PDA Platform calls during demo.** Brief view reads from cache.
3. **Every page renders within 2 seconds on the demo laptop.** Lighthouse budget enforces this.
4. **Offline fallback.** Static export of the dashboard as a backup, deployed to a second Netlify URL.
5. **Loom recording.** A 3-minute recording of the full demo uploaded the night before.
6. **Local mode.** The app runs end-to-end against a local Supabase instance. If network fails, we switch to local.

---

## 11. Scope discipline

Every prompt must justify features against the success criteria in section 1.3. Clever features that don't map are cut. The following are **in scope**:

- 47 HPO assumptions loaded, categorised, scored
- Forecast ensemble on the 3 externally-anchored assumptions (A039, A040, A041) using real 2025-2026 data
- Forecast on remaining 44 using trend-based extrapolation from synthetic historical measurements
- Cascade propagation with rationale-documented edges
- Confidence scoring per Prompt 6 methodology
- Four dashboard views (Horizon, Cascade, Trace, Brief)
- Brief generation with PDA Platform, cached
- Full accessibility, Storybook, CI, paper-grade methodology

Out of scope for the hack (noted as "next steps" in the pitch):

- Auth UI (RLS modelled but unused)
- Multi-project portfolio view (scoped to one project, HPO)
- Alerting via email/Slack (design documented; implementation deferred)
- Mobile layout (tablet and desktop only)

---

## 12. Open questions

Items to revisit before build:

1. Licensing for GT Sectra / Söhne / Berkeley Mono. Free fallbacks are named; upgrade if budget permits.
2. Exact shape of cascade links for the HPO register, the "Linked Items" column is sparse. May need to augment manually with documented rationale.
3. Whether to include a fifth view: "Portfolio" (aggregated drift score across projects). Defer to end-of-build decision; only if we have an hour spare.

---

*End of document. Update this file whenever a prompt changes a conventions decision.*
