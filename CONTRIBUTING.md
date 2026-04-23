# Contributing to Project Trueplan

Thanks for picking up a task. This guide describes how to propose changes, commit them, and get them merged. For the wider architectural picture, start with [ARCHITECTURE.md](./ARCHITECTURE.md).

## Ground rules

- British English in all code, copy, and docs. `colour`, `behaviour`, `organise`.
- No em dashes. Use commas, semicolons, or full stops. Enforced by `pnpm lint:emdash` and CI.
- No `console.log` in committed code. Use `console.warn` or `console.error` when deliberate; route real errors through Sentry.
- No hardcoded secrets. `.env` is gitignored; add new variables to `.env.example`.
- WCAG AA minimum; see ARCHITECTURE.md section 7.8.

## Branching

- `main` is always deployable. Never commit to it directly.
- Create a branch per change, named by type:
  - `feat/<slug>` new feature
  - `fix/<slug>` bug fix
  - `chore/<slug>` tooling, config, docs housekeeping
  - `refactor/<slug>`, `test/<slug>`, `docs/<slug>` as fit
- Keep branches focused. Smaller PRs merge faster.
- Force pushes to shared branches (including `main`) are not allowed.

## Commits

Conventional Commits, always. Examples:

```
feat(horizon): add forecast ensemble visualisation
fix(cascade): tolerate missing edge weights
chore(ci): cache Playwright browsers between runs
docs(architecture): clarify confidence score weights
refactor(external-data): extract ONS series parser
test(intelligence): add AR(1) ensemble edge cases
```

Scope is optional but helpful. Body is encouraged when the subject alone does not explain the _why_.

## Pull requests

Use the template in `.github/PULL_REQUEST_TEMPLATE.md`. Every PR must satisfy the definition of done below before it can be merged.

## Definition of done

Mirrors ARCHITECTURE.md section 7.6. Every box must be ticked:

- [ ] Tests pass (`pnpm test`)
- [ ] Lint passes (`pnpm lint`)
- [ ] TypeScript checks pass (`pnpm typecheck`)
- [ ] No hardcoded values or secrets
- [ ] No `console.log` or debug code
- [ ] Git identity is `Laura White <laura27white@gmail.com>`
- [ ] Conventional commit messages
- [ ] CI green on every check
- [ ] Lighthouse score at or above 90 for changed pages
- [ ] No axe-core violations on changed pages

## Dependencies

New dependencies must be justified in the PR description. Prefer the lightest viable option. Pin production dependency versions in `package.json`. Dev-only tools may use a caret if the minor series is stable.

## Code style

- TypeScript strict mode on, including `noUncheckedIndexedAccess` and `noImplicitOverride`. Never `any` without a justifying comment.
- Tests live alongside the code they cover (`foo.ts` and `foo.test.ts` in the same directory).
- Validate every external data boundary with a `zod` schema (API responses, env vars, Supabase rows).
- Errors do not silently swallow. Use `Result<T, E>` discriminated unions or bubble the error to Sentry.

## Questions

Open an issue with the `question` label, or start a draft PR with your thinking. This project moves fast; early feedback saves rework.
