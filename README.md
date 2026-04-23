# Evidence Engine

Forecast-driven early warning system for project assumption drift. MPA Challenge 5 hackathon entry. Author: Laura White.

The [PDA Platform](https://github.com/antnewman/pda-platform) is the engine that enables the insights surfaced here, through its project-specific tools, particularly [assurance](https://github.com/antnewman/pda-platform/blob/main/docs/assurance-for-practitioners.md). Evidence Engine wraps that engine with a forecasting layer, a cascade propagation model, and a confidence decomposition so that assurance evidence becomes an early-warning signal rather than a point-in-time check.

> For the full specification, conventions, and reasoning, read [ARCHITECTURE.md](./ARCHITECTURE.md). That document is the single source of truth. This README is an operational quick start.

## Repo layout

```
project-trueplan/
  apps/web              Next.js 14 dashboard
  packages/
    intelligence        Pure-function forecast, cascade, confidence
    external-data       ONS, BoE, gov.uk adapters
    db                  Supabase schema, migrations, generated types
    design-system       Design tokens, primitives, Storybook
  supabase/             Edge functions and migrations
  docs/                 Architecture, demo script, paper
```

## Prerequisites

- Node 20 or newer
- pnpm 9 or newer (the repo pins pnpm 10.28.0 via `packageManager`)
- Git

Windows users: this repo uses LF line endings enforced via `.gitattributes`. Run git commands inside Git Bash, WSL, or the bundled Git for Windows shell.

## Getting started

```bash
pnpm install
cp .env.example .env     # fill in local values as needed
pnpm dev                 # starts the Next.js app on http://localhost:3000
```

No environment variables are required for `pnpm dev` to run; Sentry and PostHog are disabled when their env vars are missing.

## Common commands

| Command                   | What it does                                          |
| ------------------------- | ----------------------------------------------------- |
| `pnpm dev`                | Next.js dev server for `apps/web`                     |
| `pnpm build`              | Production build of every workspace package           |
| `pnpm test`               | Run Vitest across all packages                        |
| `pnpm test:coverage`      | As above, with v8 coverage reporters                  |
| `pnpm lint`               | Run ESLint across all packages plus the em-dash check |
| `pnpm lint:emdash`        | Scan tracked files for `U+2014` em dashes             |
| `pnpm typecheck`          | `tsc --noEmit` in every package                       |
| `pnpm format`             | Prettier write across the repo                        |
| `pnpm storybook`          | Open the design-system Storybook on port 6006         |
| `pnpm playwright`         | Run Playwright smoke tests against the built app      |
| `pnpm playwright:install` | Install the Chromium browser for Playwright           |

## Continuous integration

Every push and pull request runs the GitHub Actions workflow at `.github/workflows/ci.yml`. Jobs: em-dash check, install, lint, typecheck, unit tests with coverage, Next.js build, Playwright smoke plus axe-core scan, Lighthouse CI. See [docs/REPO_SETUP.md](./docs/REPO_SETUP.md) for branch protection expectations.

## Deployment

- App deploys to Netlify via `netlify.toml`. Branch deploys are enabled for every non-main branch.
- Supabase schema and edge functions deploy from the `supabase/` directory. Details land in Prompt 1.

## Contributing

Read [CONTRIBUTING.md](./CONTRIBUTING.md) for commit style, branching rules, and the definition of done. All work happens on feature branches; `main` is production.

## PDA Platform integration

Evidence Engine integrates with the [PDA Platform](https://github.com/antnewman/pda-platform), an open-source Model Context Protocol (MCP) server that exposes government-grade assurance analytics, gate-review summaries, and narrative generation as tool calls over SSE. The assurance contract is documented in [assurance-for-practitioners.md](https://github.com/antnewman/pda-platform/blob/main/docs/assurance-for-practitioners.md); start there if you want the shape of the data model this project consumes.

- **Source repository**: <https://github.com/antnewman/pda-platform>
- **Live endpoint (MCP SSE)**: `https://pda-platform-i33p.onrender.com/sse`
- **Tool used by Evidence Engine**: `generate_narrative` with `narrative_type: "risk"` mapped from the portfolio summary.
- **Why it matters**: PDA Platform carries the assurance register, the narrative style, and the evidence standards that senior responsible owners already accept. By consuming that engine rather than re-implementing it, Evidence Engine spends its novelty on forecasting, cascade propagation, and confidence decomposition. The two projects are complementary: PDA Platform is the assurance backbone; Evidence Engine is the early-warning layer that rides on top of it.
- **Graceful degradation**: if PDA Platform is unavailable (cold-start on Render, MCP schema change, network issue), the Brief view falls back to a deterministic three-paragraph narrative composed locally from the same portfolio summary. The badge in the Brief header always identifies which engine produced the text on display.

## Licence

MIT, copyright Laura White. See [LICENSE](./LICENSE).
