# Repo setup

Step-by-step onboarding for a cold clone of Project Trueplan. Follow this end to end the first time you pull the repo.

## 1. Clone and identity

```bash
git clone https://github.com/antnewman/project-trueplan.git
cd project-trueplan

git config user.name "antnewman"
git config user.email "antjsnewman@outlook.com"
```

Git identity is repo-local so it does not leak into unrelated work. Every commit must be authored by `antnewman <antjsnewman@outlook.com>`.

## 2. Toolchain

- Node 20 or newer. Check with `node --version`.
- pnpm 9 or newer. Check with `pnpm --version`. The `packageManager` field pins `pnpm@10.28.0`; Corepack will download that version on first use if enabled (`corepack enable`).
- Git 2.40 or newer, configured for LF line endings (see `.gitattributes`).

Windows users: run commands in Git Bash, WSL, or a Unix-style shell. Husky hooks are POSIX scripts.

## 3. Install dependencies

```bash
pnpm install
```

Dependencies are hoisted via `shamefully-hoist=true` so that ESLint plugins, Prettier, TypeScript, and Vitest resolve from a single root `node_modules`.

## 4. Environment variables

Copy the template and fill in the values you need. Nothing is strictly required for local dev; Sentry and PostHog no-op when their keys are missing.

```bash
cp .env.example .env
```

| Variable                        | Needed for                         | Notes                    |
| ------------------------------- | ---------------------------------- | ------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | Reading from Supabase              | Prompt 1 onwards         |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Reading from Supabase              | Prompt 1 onwards         |
| `SUPABASE_SERVICE_ROLE_KEY`     | Edge functions only                | Never ship to the client |
| `SENTRY_DSN`                    | Error tracking                     | Optional for local dev   |
| `SENTRY_AUTH_TOKEN`             | Source map upload                  | Only needed in CI/CD     |
| `NEXT_PUBLIC_POSTHOG_KEY`       | Product analytics                  | Optional for local dev   |
| `NEXT_PUBLIC_POSTHOG_HOST`      | Product analytics                  | Defaults to EU host      |
| `PDA_PLATFORM_MCP_URL`          | Narrative generation               | Prompt 9                 |
| `EXTERNAL_DATA_USER_AGENT`      | Polite fetches to ONS, BoE, gov.uk | Prompt 3                 |

## 5. Local Supabase (Prompt 1 onwards)

Prompt 0 ships the directory shape only. Prompt 1 lands schema, migrations, and the `supabase start` workflow. Until then, the app runs happily without a database because no view reads from one yet.

## 6. Run the app

```bash
pnpm dev
```

Opens the Next.js app at `http://localhost:3000`. You should see the bootstrap placeholder page with the four dashboard navigation links.

## 7. Run tests

```bash
pnpm test                    # unit tests, all packages
pnpm test:coverage           # as above, with coverage reporters
pnpm playwright:install      # one-time browser install
pnpm playwright              # smoke tests against the built app
```

Playwright runs against a production build, so run `pnpm build` first or let the `webServer` config start it for you.

## 8. Storybook

```bash
pnpm storybook               # dev server on port 6006
pnpm storybook:build         # static build to storybook-static/
```

The bootstrap repo ships one placeholder "Welcome" story. Real components land in Prompt 2.

## 9. Branch protection and workflow

Branch protection rules are configured in the GitHub UI (not enforceable from code). Apply the following to `main`:

- Require pull request before merging
- Require a minimum of one approving review
- Require all CI status checks to pass: `Em-dash check`, `Lint`, `Typecheck`, `Unit tests`, `Build`, `Playwright smoke`, `Lighthouse CI`
- Require branches to be up to date before merging
- Disallow direct pushes to `main`
- Disallow force pushes
- Disallow branch deletion

Feature branches use the following prefixes:

- `feat/` for new features
- `fix/` for bug fixes
- `chore/` for tooling and non-product work
- `refactor/`, `test/`, `docs/` as appropriate

Every commit message follows the Conventional Commits spec.

## 10. Deploy

Netlify is wired up via `netlify.toml`. Merge to `main` deploys production; any other branch deploys a preview URL. Set Netlify environment variables in the site settings UI, matching the list above.
