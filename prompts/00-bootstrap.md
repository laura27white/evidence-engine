# Prompt 0: Repo Bootstrap, CI, Observability

**Runtime:** ~45 minutes. Run first. No other prompts can run until this one is complete and merged.

**Prerequisite:** `ARCHITECTURE.md` checked in at repo root. Read it before doing anything.

---

## Role and mission

You are a senior full-stack engineer bootstrapping a production-grade hackathon project. The project is **Project Trueplan**, an early-warning system for project assumption drift, built for the MPA Challenge 5 hackathon.

Your job in this prompt is to stand up the monorepo foundation: repo structure, tooling, CI, observability, and the architectural skeleton. You are not writing product features in this prompt. You are laying rails.

Every subsequent prompt will depend on what you produce here. If you take shortcuts now, every prompt after this will pay for them.

---

## Authoritative context

Before you begin, read:

1. `ARCHITECTURE.md` at the repo root. This is the source of truth for naming, structure, and conventions.
2. This prompt.

If the prompt and `ARCHITECTURE.md` disagree on any point, `ARCHITECTURE.md` wins. If you need to resolve something not covered by either, make the decision, update `ARCHITECTURE.md`, and call it out in your PR description.

---

## What to build in this prompt

### 0.1 Repository initialisation

1. Initialise a new Git repository. Configure Git identity locally:
   ```bash
   git config user.name "laurawhite"
   git config user.email "laura27white@gmail.com"
   ```
2. Create an initial `main` branch, then immediately create and switch to a feature branch: `chore/bootstrap-monorepo`.
3. All work in this prompt happens on that feature branch. Do not commit to `main`.
4. Commit messages must follow Conventional Commits. Expect multiple small commits, not one giant one.

### 0.2 Monorepo structure

Create the structure exactly as specified in `ARCHITECTURE.md` section 5.1. At the end of this prompt you should have:

```
mpa-ch5-project-trueplan/
├── apps/web/
├── packages/
│   ├── intelligence/
│   ├── external-data/
│   ├── db/
│   └── design-system/
├── supabase/
├── docs/
├── .github/workflows/
└── (root config files)
```

Each package contains only a placeholder `package.json` and a `src/index.ts` that exports nothing (yet). Apps/web is the only package that contains real code at the end of this prompt.

### 0.3 Tooling

Use **pnpm workspaces**. Do not use npm, yarn, Turborepo, or Nx. Rationale: pnpm is fast, has first-class workspace support, and avoids the config overhead of Turborepo for a project our size.

Root `package.json` fields required:

- `"name": "project-trueplan"`
- `"private": true`
- `"engines": { "node": ">=20.0.0", "pnpm": ">=9.0.0" }`
- `"packageManager": "pnpm@9.x.x"` (pin to latest stable)
- Workspace scripts: `dev`, `build`, `test`, `lint`, `typecheck`, `format`

`pnpm-workspace.yaml`:

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### 0.4 TypeScript configuration

Root `tsconfig.base.json` with these options set:

- `"target": "ES2022"`
- `"module": "ESNext"`
- `"moduleResolution": "Bundler"`
- `"strict": true`
- `"noUncheckedIndexedAccess": true`
- `"noImplicitOverride": true`
- `"noFallthroughCasesInSwitch": true`
- `"esModuleInterop": true`
- `"skipLibCheck": true`
- `"forceConsistentCasingInFileNames": true`
- `"isolatedModules": true`

Each package has its own `tsconfig.json` extending the base. Path aliases set up so `@tp/intelligence`, `@tp/external-data`, `@tp/db`, `@tp/design-system` resolve correctly.

### 0.5 Next.js 14 app scaffold

In `apps/web`:

- Next.js 14 with App Router.
- TypeScript strict.
- Tailwind CSS v3.4.
- ESLint + `eslint-config-next`.
- One single placeholder page at `app/page.tsx` that renders "Project Trueplan, bootstrap successful" in the fonts specified in `ARCHITECTURE.md` section 6.2 (use the free fallbacks: Source Serif 4 for display, IBM Plex Sans for body, JetBrains Mono for data). Set up the font loading via `next/font/google`.
- Set up the Tailwind theme with the colour tokens from `ARCHITECTURE.md` section 6.3 (cream `#F7F4EE`, ink `#1A1A1A`, teal accent `#0E6B6B`, severity tokens).
- App shell layout with a top nav placeholder (logo text + four nav items: Horizon, Cascade, Trace, Brief) and a page body. No real routes for the four views yet, just the nav links.
- Accessibility baseline: `lang="en-GB"` on the html element, skip-to-content link, proper document title.

### 0.6 Linting and formatting

- ESLint config at root, extended by each package.
- Rules: `@typescript-eslint/recommended`, `eslint-plugin-react`, `eslint-plugin-jsx-a11y` (strict), `eslint-plugin-import`.
- **Custom rule or lint job that flags em dashes** in source files. Per Ant's preferences, no em dashes in code comments, UI copy, or docs. Achieve this either via a custom ESLint rule or a grep-based CI check. I'd prefer the grep check for simplicity: `grep -rn "," apps/ packages/ docs/` must return nothing. Put this in a CI job.
- Prettier with `printWidth: 100`, `singleQuote: true`, `trailingComma: "all"`, `semi: true`.
- Husky + lint-staged for pre-commit hooks: lint, format, typecheck on staged files.

### 0.7 Testing infrastructure

- **Vitest** at root, configured per-package. Coverage via `@vitest/coverage-v8`.
- **Playwright** installed in `apps/web` with a minimal smoke test that visits `/` and asserts the title.
- **Storybook 8** scaffolded in `packages/design-system`. Empty stories directory for now; Prompt 2 will populate it.
- Coverage thresholds configured:
  - `packages/intelligence`: 95% (this is the paper-grade core)
  - `packages/external-data`: 80%
  - `packages/db`: 70%
  - `packages/design-system`: 60% (visual regression does most of the work)
  - `apps/web`: 70%

### 0.8 CI: GitHub Actions

Create `.github/workflows/ci.yml` with these jobs, all triggered on push and PR:

1. **Lint**: runs `pnpm lint` across the monorepo
2. **Typecheck**: runs `pnpm typecheck` across the monorepo
3. **Test**: runs `pnpm test` with coverage, uploads coverage artifact
4. **Em-dash check**: grep for em dashes, fails if any found
5. **Build**: runs `pnpm build` to ensure Next.js build succeeds
6. **Playwright**: runs against the built app
7. **Lighthouse CI**: against the built app, budgets per `ARCHITECTURE.md` section 7.9 (LCP < 2.5s, CLS < 0.1, performance ≥ 90, accessibility ≥ 95)
8. **Axe-core**: accessibility scan in Playwright, fails on any violations

Cache pnpm store, Next.js `.next/cache`, and Playwright browsers. Matrix strategy only if needed; prefer single-Node (20.x) for speed.

Branch protection rule documentation (not enforceable in CI but document in `docs/REPO_SETUP.md`): require all CI checks passing, require PR review, no direct pushes to main, no force-pushes.

### 0.9 Observability

- **Sentry**. Install `@sentry/nextjs` in `apps/web`. Configure with environment variable `SENTRY_DSN`. Source maps uploaded on production build. `.env.example` documents the variable. Do NOT include a real DSN in the repo.
- **PostHog**. Install `posthog-js` and `posthog-node`. Wire up with `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST`. Same treatment as Sentry, env vars only, `.env.example` only.

Both wrapped in a small `lib/observability.ts` module that no-ops if env vars are missing, so local dev and tests don't require keys.

### 0.10 Environment variables

Create `.env.example` at repo root with every variable the project will need, even if not yet used. Variables with placeholders and comments explaining what they're for:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=         # server-side only, never exposed to client

# Observability
SENTRY_DSN=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://eu.posthog.com

# PDA Platform
PDA_PLATFORM_MCP_URL=https://pda-platform-i33p.onrender.com/sse

# External data
# No keys required for ONS, BoE, gov.uk public endpoints.
# Add a user-agent string for polite requests.
EXTERNAL_DATA_USER_AGENT=ProjectTrueplan/0.1 
```

`.gitignore` must include `.env`, `.env.local`, `.env.*.local`, `node_modules`, `.next`, `out`, `coverage`, `.turbo`, `*.log`, `.DS_Store`, `playwright-report`, `test-results`.

Verify `.gitignore` is in place before staging any commit.

### 0.11 Netlify configuration

`netlify.toml` at repo root:

```toml
[build]
  base = "apps/web"
  command = "pnpm install --frozen-lockfile && pnpm build"
  publish = "apps/web/.next"

[build.environment]
  NODE_VERSION = "20"
  PNPM_VERSION = "9"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"
    Strict-Transport-Security = "max-age=31536000; includeSubDomains"
```

Branch deploys enabled for all non-main branches (documented in `docs/REPO_SETUP.md`).

### 0.12 Documentation

At this stage you produce:

- `README.md` at repo root, installation, dev, test, build, deploy commands. Link to `ARCHITECTURE.md` and `docs/REPO_SETUP.md`.
- `docs/REPO_SETUP.md`, step-by-step for someone cloning cold: pnpm install, env vars, Supabase init (placeholder; Prompt 1 fills this in), local dev, running tests.
- `CONTRIBUTING.md`, conventional commits, branching, PR template, definition of done from `ARCHITECTURE.md` section 7.6.
- `.github/PULL_REQUEST_TEMPLATE.md`, a checklist matching the definition of done.
- `.github/ISSUE_TEMPLATE/bug.md` and `feature.md`, standard templates.
- `LICENSE`, MIT. Copyright holder: "Laura White".

---

## Out of scope for this prompt

To be absolutely clear, do NOT in this prompt:

- Write any Supabase schema or migrations (Prompt 1).
- Write any design system components beyond the minimal nav/shell (Prompt 2).
- Write any external data adapters (Prompt 3).
- Write any intelligence logic (Prompts 4, 5, 6).
- Write any of the four dashboard views beyond the placeholder home page (Prompt 7).
- Write any visualisations (Prompt 8).
- Call PDA Platform (Prompt 9).

If you find yourself tempted, stop. Those belong in later prompts.

---

## Definition of done for this prompt

Do not open the PR until every box is ticked. If any item blocks, raise it in the PR description rather than skipping.

- [ ] Repo created, `main` branch exists, feature branch `chore/bootstrap-monorepo` created
- [ ] Git identity set to `laurawhite` / `laura27white@gmail.com`
- [ ] No commits to `main`; all work on the feature branch
- [ ] Every commit follows Conventional Commits
- [ ] Monorepo structure matches `ARCHITECTURE.md` section 5.1
- [ ] pnpm workspaces configured and resolving correctly
- [ ] `tsconfig.base.json` present with all specified strict options
- [ ] Next.js 14 app scaffolded, renders placeholder page
- [ ] Tailwind theme includes colour tokens and font stacks from `ARCHITECTURE.md` section 6
- [ ] ESLint, Prettier, Husky, lint-staged configured
- [ ] Em-dash grep check passes (zero em dashes anywhere in repo)
- [ ] Vitest configured, empty coverage run passes
- [ ] Playwright smoke test passes
- [ ] Storybook 8 scaffolded (empty stories; real stories in Prompt 2)
- [ ] CI workflow runs green on first PR push
- [ ] Sentry and PostHog wired via env vars; missing env vars must not break build
- [ ] `.env.example` complete; real `.env` gitignored and verified not in repo
- [ ] `netlify.toml` present, Next.js plugin referenced
- [ ] All documentation files present and accurate
- [ ] `pnpm install && pnpm dev` works on a clean clone
- [ ] `pnpm build` produces a successful production build
- [ ] `pnpm test` runs (no tests yet, so passes trivially) with coverage reporting
- [ ] `pnpm lint` passes with zero warnings
- [ ] `pnpm typecheck` passes with zero errors
- [ ] Lighthouse CI runs against the placeholder page and meets budgets (if placeholder fails Lighthouse budgets, that is a bug, fix it)
- [ ] axe-core scan runs in Playwright and reports zero violations
- [ ] PR opened against `main`, all CI checks green, PR description summarises changes and calls out any deviations from `ARCHITECTURE.md`

---

## Self-check before PR

Answer these out loud, in the PR description:

1. Can someone clone this repo, run `pnpm install`, copy `.env.example` to `.env`, and run `pnpm dev` without any additional setup? If no, fix it.
2. Does CI run under 5 minutes? If not, identify the bottleneck and either fix or document why.
3. If I handed this to a senior engineer for review, what would they flag? Fix those things before opening the PR.
4. Have I introduced any dependency not strictly needed by this prompt? If yes, justify each one inline in the PR description.
5. Does every commit message tell me what changed and why?

---

## Reference: userPreferences to respect throughout

Drawn from Ant's standing instructions. Apply automatically:

- British English in all code, copy, and docs.
- No em dashes anywhere.
- Git identity `laurawhite` / `laura27white@gmail.com`; never commit as Claude.
- Feature branches only; no direct commits to main; no force-pushes.
- Conventional commit format: `feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`.
- Tests alongside code from day one.
- TypeScript strict. Never `any` without justification.
- No hardcoded secrets. Validate `.gitignore` before committing anything touching credentials.
- New dependencies flagged explicitly with justification.
- WCAG AA minimum; semantic HTML, proper ARIA labels, keyboard navigability.

---

*End of Prompt 0. The next prompts (1, 2, 3) can run in parallel against the merged output of this one.*
