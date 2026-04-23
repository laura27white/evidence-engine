# @tp/db

Supabase schema, migrations, generated types, and typed client factories for Project Trueplan. This package is the single place the rest of the monorepo imports from when it needs to talk to the database.

See [SCHEMA.md](./SCHEMA.md) for the data model, [RLS.md](./RLS.md) for the row-level security policies, and [SYNTHETIC_DATA.md](./SYNTHETIC_DATA.md) for how drift measurements are generated. The authoritative source of truth is [`ARCHITECTURE.md`](../../ARCHITECTURE.md) sections 3 and 4.

## Contents

```
packages/db/
├── src/
│   ├── index.ts        Named re-exports for downstream packages
│   ├── clients.ts      createServerClient() and createAnonClient()
│   └── row-types.ts    Assumption, DriftMeasurement, etc.
├── types/
│   └── database.ts     Hand-written Database type for evidence_engine schema
├── scripts/
│   ├── import-hpo.ts               Load 47 HPO assumptions from the xlsx
│   ├── hpo-mapping.ts              Pure helpers for xlsx to schema mapping
│   ├── hpo-cascade-links.ts        Hand-coded cascade edges with rationale
│   └── seed-drift-measurements.ts  9 months of drift per assumption
├── __tests__/
│   ├── hpo-mapping.test.ts
│   ├── hpo-cascade-links.test.ts
│   └── migrations-structure.test.ts
├── README.md
├── SCHEMA.md
├── RLS.md
└── SYNTHETIC_DATA.md
```

The migrations themselves live at `supabase/migrations/` at the repo root (Supabase CLI convention).

## Prerequisites

- Supabase project provisioned and linked. The current target is `project-trueplan` in `eu-west-2` (project ref `nyvrfcqixjcjhhfwfmbd`).
- Environment variables set:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publishable key, or the legacy anon JWT)
  - `SUPABASE_SERVICE_ROLE_KEY` for the import and seed scripts

Copy `.env.example` at the repo root to `apps/web/.env.local` and fill in the service role key from the Supabase dashboard (Project Settings > API).

## Applying migrations

The six migrations under `supabase/migrations/` were applied to the live project via the Supabase MCP connector during Prompt 1. To replay on a fresh database:

```bash
# Link once per machine
supabase link --project-ref nyvrfcqixjcjhhfwfmbd

# Replay in order
supabase db push
```

If Docker Desktop is running you can also `supabase start` for a local instance, then apply. See the individual files for the reverse statements documented in each header.

## Generating TypeScript types

The `evidence_engine` schema is not on the Supabase API's exposed schema list by default. Until that is changed in the dashboard (Project Settings > API > Exposed schemas), the Database type in `types/database.ts` is hand-written and kept in sync with the migrations manually.

Once `evidence_engine` is exposed, replace the hand-written file with:

```bash
pnpm db:gen-types > packages/db/types/database.ts
```

Inspect the diff before committing; CI should run the same command and fail if the committed file drifts from what the Supabase CLI produces.

## Importing the HPO register

The 47 assumptions ship in `data/HPO_All_Assumptions_Register_Approved.xlsx`. To reload into a linked project:

```bash
# From the repo root
pnpm --filter @tp/db import:hpo
```

The script is idempotent: it upserts on `(project_id, code)` for assumptions and on `(source_assumption_id, target_assumption_id)` for cascade links. Rerun safely.

## Seeding drift measurements

Nine monthly observations per assumption. Real stubs for A046 Inflation, A047 Interest Rates, and A048 Tax Policy (to be replaced with live adapter fetches once Prompt 3 merges); Gaussian-drift synthetic trajectories for the other 44.

```bash
# First time
pnpm --filter @tp/db seed:drift

# Rebuild from scratch
pnpm --filter @tp/db seed:drift -- --reset
```

Reproducibility: the RNG seed is pinned (see `seed-drift-measurements.ts`); the method is documented in [SYNTHETIC_DATA.md](./SYNTHETIC_DATA.md).

## Using the clients

```ts
import { createAnonClient, createServerClient, type Assumption } from '@tp/db';

// Server-side (edge functions, API routes, scripts): bypasses RLS.
const admin = createServerClient();

// Browser-side: bound by RLS. Only the HPO24A01-DEMO project is readable without auth.
const anon = createAnonClient();
```

Both clients are scoped to the `evidence_engine` schema. Query columns with full type-safety via the hand-written Database type.

## Tests

```bash
pnpm --filter @tp/db test           # 37 unit tests on mapping, cascade, migration structure
pnpm --filter @tp/db test:coverage  # With v8 coverage; target 70 percent
```

Live database behaviour (RLS, import idempotency, migration application) is validated end-to-end during the PR via the Supabase MCP; see the Prompt 1 PR body for the verification queries.
