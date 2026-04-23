# Prompt 1: Schema, Migrations, RLS, Seed Data

**Runtime:** approximately 2 hours. Runs in parallel with Prompts 2 and 3 against the merged output of Prompt 0.

**Prerequisite:** Prompt 0 merged to main. Repo cloned. Architecture doc at root.

**Authoritative context:** Read `ARCHITECTURE.md` sections 3 (conceptual model) and 4 (data model) before doing anything. If this prompt conflicts with the architecture doc, the architecture doc wins.

---

## Role and mission

You are a senior backend engineer building the data foundation for Project Trueplan. Your job in this prompt is to produce: the complete Supabase schema, all migrations, row-level security policies, seed data for the 47 HPO assumptions, and TypeScript types generated from the schema. Every subsequent prompt depends on this data layer being correct.

This is the boring-but-critical prompt. Get it right and everything else slots in. Get it wrong and every downstream prompt has to compensate.

---

## What you are building

### 1.1 Supabase project setup

1. Create a new Supabase project named `project-trueplan` in the eu-west-2 region (London). Free tier. Use the Supabase dashboard for this step; note the project ID, URL, anon key, and service role key.

2. Add the environment variables to `.env.local` in `apps/web` (keeping `.env.example` in sync at repo root). Never commit the real `.env.local`.

3. Install the Supabase CLI locally if not present. Link it to the project. Configure `supabase/config.toml` to match.

4. Confirm `supabase start` runs locally (uses Docker; requires Docker Desktop on Windows or equivalent).

### 1.2 Schema design

All tables live under a single schema, `evidence_engine`. Create it first.

Nine tables, in dependency order:

#### `projects`

```sql
create table evidence_engine.projects (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  description text,
  org_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Constraints: `code` matches `^[A-Z0-9-]{3,32}$` (uppercase alphanumeric plus hyphen). Trigger to update `updated_at` on row update.

#### `assumptions`

```sql
create table evidence_engine.assumptions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references evidence_engine.projects(id) on delete cascade,
  code text not null,
  description text not null,
  category text not null,
  owner text,
  baseline_value numeric(20, 6),
  baseline_unit text,
  tolerance_pct numeric(8, 4),
  review_cadence_days integer not null default 90,
  source_tier smallint not null check (source_tier in (1, 2, 3)),
  external_ref text,
  is_external boolean not null default false,
  is_portfolio_level boolean not null default false,
  pda_platform_id text,
  date_logged date not null,
  review_date date,
  status text not null default 'OPEN' check (status in ('OPEN','CLOSED','RETIRED')),
  impact_if_false text,
  likelihood_of_failure text check (likelihood_of_failure in ('LOW','MEDIUM','HIGH')),
  source_rationale text,
  validation_plan text,
  linked_items text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, code)
);

create index on evidence_engine.assumptions(project_id);
create index on evidence_engine.assumptions(category);
create index on evidence_engine.assumptions(is_external);
```

Constraints: `code` matches `^A\d{3,4}$` (e.g. A001, A0047). Trigger on update.

#### `drift_measurements` (append-only time series)

```sql
create table evidence_engine.drift_measurements (
  id uuid primary key default gen_random_uuid(),
  assumption_id uuid not null references evidence_engine.assumptions(id) on delete cascade,
  measured_at timestamptz not null,
  observed_value numeric(20, 6) not null,
  source text not null check (source in ('EXTERNAL_API','MANUAL','SYSTEM_DERIVED')),
  source_url text,
  external_data_ref text,
  notes text,
  created_at timestamptz not null default now()
);

create index on evidence_engine.drift_measurements(assumption_id, measured_at desc);
create index on evidence_engine.drift_measurements(source);
```

This table is append-only. No UPDATE. No DELETE by application code. Revoke those privileges at the end of the migration.

#### `cascade_links`

```sql
create table evidence_engine.cascade_links (
  id uuid primary key default gen_random_uuid(),
  source_assumption_id uuid not null references evidence_engine.assumptions(id) on delete cascade,
  target_assumption_id uuid not null references evidence_engine.assumptions(id) on delete cascade,
  propagation_weight numeric(4, 3) not null check (propagation_weight >= 0 and propagation_weight <= 1),
  rationale text not null,
  created_at timestamptz not null default now(),
  check (source_assumption_id <> target_assumption_id),
  unique (source_assumption_id, target_assumption_id)
);

create index on evidence_engine.cascade_links(source_assumption_id);
create index on evidence_engine.cascade_links(target_assumption_id);
```

Rationale is required because cascade is interpretive; the rationale is what makes it defensible.

#### `forecasts`

```sql
create table evidence_engine.forecasts (
  id uuid primary key default gen_random_uuid(),
  assumption_id uuid not null references evidence_engine.assumptions(id) on delete cascade,
  computed_at timestamptz not null default now(),
  method text not null check (method in ('LINEAR','EWMA','AR1','ENSEMBLE')),
  projected_value_30d numeric(20, 6),
  projected_value_90d numeric(20, 6),
  projected_value_365d numeric(20, 6),
  projected_breach_date date,
  lead_time_days integer,
  confidence_interval_lower numeric(20, 6),
  confidence_interval_upper numeric(20, 6),
  ensemble_agreement numeric(4, 3),
  model_params jsonb,
  input_series_hash text not null,
  created_at timestamptz not null default now()
);

create index on evidence_engine.forecasts(assumption_id, computed_at desc);
create index on evidence_engine.forecasts(method);
```

`input_series_hash` is a SHA-256 of the sorted measurement series the forecast was computed from, used to detect when a re-forecast is needed.

#### `cascade_impacts`

```sql
create table evidence_engine.cascade_impacts (
  id uuid primary key default gen_random_uuid(),
  source_assumption_id uuid not null references evidence_engine.assumptions(id) on delete cascade,
  target_assumption_id uuid not null references evidence_engine.assumptions(id) on delete cascade,
  computed_at timestamptz not null default now(),
  expected_drift_score numeric(4, 3) not null,
  paths jsonb not null,
  created_at timestamptz not null default now()
);

create index on evidence_engine.cascade_impacts(source_assumption_id);
create index on evidence_engine.cascade_impacts(target_assumption_id);
```

`paths` is a JSONB array documenting every path from source to target and its weight product.

#### `confidence_scores`

```sql
create table evidence_engine.confidence_scores (
  id uuid primary key default gen_random_uuid(),
  assumption_id uuid not null references evidence_engine.assumptions(id) on delete cascade,
  computed_at timestamptz not null default now(),
  score numeric(5, 2) not null check (score >= 0 and score <= 100),
  recency_component numeric(5, 2) not null,
  source_tier_component numeric(5, 2) not null,
  agreement_component numeric(5, 2) not null,
  volatility_component numeric(5, 2) not null,
  created_at timestamptz not null default now()
);

create index on evidence_engine.confidence_scores(assumption_id, computed_at desc);
```

#### `briefs`

```sql
create table evidence_engine.briefs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references evidence_engine.projects(id) on delete cascade,
  generated_at timestamptz not null default now(),
  narrative_text text not null,
  pda_platform_response_json jsonb,
  cache_key text not null,
  unique (project_id, cache_key)
);

create index on evidence_engine.briefs(project_id, generated_at desc);
```

`cache_key` is a deterministic hash of the inputs (project state summary) so repeat calls return cached narrative instead of hitting PDA Platform.

#### `ingest_audit`

```sql
create table evidence_engine.ingest_audit (
  id uuid primary key default gen_random_uuid(),
  run_at timestamptz not null default now(),
  source text not null,
  endpoint text not null,
  status text not null check (status in ('SUCCESS','FAILURE','PARTIAL')),
  records_fetched integer,
  records_written integer,
  error_detail text,
  duration_ms integer
);

create index on evidence_engine.ingest_audit(run_at desc);
create index on evidence_engine.ingest_audit(source, status);
```

Audit trail for every external-data fetch. Critical for demo-reliability proofs and for the paper's reproducibility statement.

### 1.3 Row-level security

Enable RLS on all tables. Policies:

**Default-deny, opt-in-read.** No table is publicly readable without an explicit policy.

**Per-project read access** for authenticated users whose JWT contains a `project_ids` claim that includes the row's `project_id`. For tables without a direct `project_id` column (e.g. `drift_measurements`), join through `assumptions`.

**Service-role full access** for all tables, used by edge functions and the ingestion pipeline.

**Anon read access** limited to a single demo project whose `code` is `'HPO24A01-DEMO'`. This is the project judges and visitors will see. Implemented as a policy that checks `project_id in (select id from projects where code = 'HPO24A01-DEMO')` with no auth required. Document this policy explicitly in `supabase/RLS.md`.

**No anon write access** anywhere.

Write policies and tests for each of the above using Supabase's `pgtap` framework or equivalent. A failing RLS test fails CI.

### 1.4 Migrations

Structure migrations in `supabase/migrations/` using Supabase CLI conventions:

1. `0001_create_schema_and_tables.sql`, the schema, all tables, indexes, constraints.
2. `0002_triggers_and_functions.sql`, `updated_at` triggers, any helper functions.
3. `0003_rls_policies.sql`, all RLS policies and the anon demo-project exception.
4. `0004_revoke_destructive_privileges.sql`, revoke UPDATE and DELETE on `drift_measurements` from the `authenticated` role; keep only INSERT and SELECT.
5. `0005_seed_hpo_project.sql`, insert the `HPO24A01-DEMO` project row. Do NOT insert the 47 assumptions here; that's handled by the import script in section 1.6.

Each migration must be reversible. Include a companion `down.sql` if using Supabase CLI's migration tooling, or document the reverse operations in a comment block.

### 1.5 TypeScript types

Generate types from the schema using `supabase gen types typescript`. Write them to `packages/db/types/database.ts`. Commit them.

Add a `pnpm db:gen-types` script at repo root that regenerates types from the local Supabase instance. Add it to CI so drift between schema and types fails the build.

Export from `packages/db/src/index.ts`:

- The generated `Database` type and all table row types.
- A typed Supabase client factory: `createServerClient()` (service role) and `createAnonClient()` (anon key).
- Helper types: `Assumption`, `DriftMeasurement`, `CascadeLink`, `Forecast`, `CascadeImpact`, `ConfidenceScore`, `Brief`.

### 1.6 HPO register import

The 47 HPO assumptions live in `HPO_All_Assumptions_Register_Approved.xlsx`. This file is the dataset provided by Projecting Success for MPA Challenge 5 and is committed to the repo (under the Open Government Licence; see below). Confirm it exists at `./data/HPO_All_Assumptions_Register_Approved.xlsx` before running the import.

**Data provenance setup.**

Create the following in the repo:

- `data/HPO_All_Assumptions_Register_Approved.xlsx`: the committed dataset. The user copies this from their local machine during Prompt 1 setup.
- `data/README.md`: a short provenance note. Template:

```markdown
# Project Trueplan: Data Directory

## HPO_All_Assumptions_Register_Approved.xlsx

Source: Projecting Success, provided as the reference dataset for MPA Challenge 5 (Critical Assumption Drift, April 2026).

Contains 47 assumptions for the synthetic "Holographic Project Office" (HPO24A01) programme described in the accompanying Statement of Requirements. The programme itself is fictional, part of the challenge briefing; the assumptions are illustrative of the kinds of assumption registers major programmes produce.

Committed to this repo for reproducibility of the Project Trueplan demonstration and companion academic paper.

## Licensing

Committed on the understanding that Projecting Success's challenge materials are provided openly for participant use. If this understanding is incorrect, the file will be removed and the import script adapted to read from a path outside the repo. No copyright is claimed by the Project Trueplan authors over the content of this file.

## Other reference documents

`Challenge_5_Assumption_Drift___Early_Warning_Intelligence.pdf` and `RFP_-_SOR.docx` are the challenge brief and Statement of Requirements respectively. Not committed; available from Projecting Success.
```

**Ensure `.gitignore` is adjusted.** The default `.gitignore` from Prompt 0 likely ignores `data/` via a generic rule; explicitly un-ignore this file by adding a `!data/HPO_All_Assumptions_Register_Approved.xlsx` line, or by whitelisting `data/*.xlsx` and `data/README.md`. Prefer explicit over implicit; document in the `.gitignore` with a comment.

Write an import script at `packages/db/scripts/import-hpo.ts` that:

1. Reads the xlsx from a configurable path (default: `./data/HPO_All_Assumptions_Register_Approved.xlsx`).
2. Validates each row against a Zod schema; abort on any validation error with a clear message identifying the row.
3. Maps each row to the `assumptions` table schema. Field mapping:
   - `ID` → `code`
   - `Assumption Description` → `description`
   - `Category` → `category`
   - `Date Logged` → `date_logged`
   - `Owner` → `owner`
   - `Impact if False` → `impact_if_false`
   - `Likelihood of Failure` → `likelihood_of_failure` (normalise to upper-case)
   - `Source / Rationale` → `source_rationale`
   - `Validation Plan` → `validation_plan`
   - `Status` → `status` (normalise to upper-case; 'Open' becomes 'OPEN')
   - `Review Date` → `review_date`
   - `Linked Items` → `linked_items` (array; split on comma or semicolon)

4. Infer `is_external` from the category: true for any category starting with `Economic /` or matching `Regulatory`, `Political`, `Compliance`, `Legal`. Everything else is false. Document this mapping in a comment.

5. Set `source_tier`: 1 for any assumption whose `external_ref` points to ONS, Bank of England, or gov.uk; 2 for other external sources; 3 for internal. For the HPO register, default all rows to tier 3 (internal) except the three economic assumptions (A039, A040, A041) which become tier 1 and gain the following `external_ref` values:
   - A039 (Economic / Inflation) → `ONS:D7G7` (CPI all items, 12-month rate)
   - A040 (Economic / Interest Rates) → `BOE:IUDSOIA` (Bank Rate daily)
   - A041 (Economic / Tax Policy) → `GOVUK:hmrc-tax-policy-announcements` (policy papers feed, filtered)

6. Infer `baseline_value`, `baseline_unit`, `tolerance_pct` for A039, A040, A041 from the register's descriptive text. For A039: baseline 2.5% CPI, unit "% YoY", tolerance 40% relative (so 1.0pp absolute movement triggers breach). For A040: baseline 4.25% (Bank Rate as at logging date), unit "%", tolerance 25%. For A041: baseline is the policy-stable state, unit null, tolerance null (boolean-style assumption). Document these inferences in the import script as a comment block with rationale; the rationale becomes a paper appendix.

7. For the other 44 assumptions, leave `baseline_value`, `baseline_unit`, and `tolerance_pct` null. They'll be synthesised later by a separate script (out of scope for this prompt).

8. Insert cascade links for the seven documented dependencies from the register's `Linked Items` column. Each link carries a `propagation_weight` of 0.5 by default and a `rationale` of "Inferred from HPO register Linked Items column; refined in methodology." This is the default. Plus hand-coded additional links documented in `packages/db/scripts/hpo-cascade-links.ts` for the A039 economic cascade (which has 12 downstream assumptions with weights ranging 0.3 to 0.8). These weights are the paper's cascade-propagation case study; document each weight with a one-sentence rationale.

9. Make the script idempotent. Re-running does not duplicate rows; it upserts on `(project_id, code)`.

10. Run the script against a fresh local Supabase instance and verify: 47 rows in `assumptions`, 3 externally-anchored with tier 1, cascade links present, no validation errors.

Add `pnpm db:import-hpo` as a root-level script.

### 1.7 Seed data for demo

The import in 1.6 populates the register. Separately, we need some drift measurements so forecasts have data to work with at demo time. Write a second script, `packages/db/scripts/seed-drift-measurements.ts`:

1. For A039, A040, A041: fetch 9 months of historical data from ONS and BoE (via the external-data adapters in Prompt 3, so this script has a dependency on that prompt landing first). Store each as a `drift_measurements` row with `source='EXTERNAL_API'`, the source URL, and a reference. **If Prompt 3 is not yet merged, stub this with hardcoded historical values for now and leave a TODO.**

2. For the other 44 assumptions: generate synthetic drift measurements. Use the following model:
   - Starting point: the baseline (or 100 if no baseline).
   - Drift rate: sampled from a distribution parameterised by the assumption's likelihood-of-failure (LOW: N(0, 0.01), MEDIUM: N(0.002, 0.02), HIGH: N(0.005, 0.03)) per day.
   - 9 monthly measurements backdated from today.
   - `source='SYSTEM_DERIVED'`, with `notes` field marking it as synthetic and explaining the method.

3. Document the synthetic generation model in `packages/db/SYNTHETIC_DATA.md`. This becomes a paper appendix. Include: the distribution, the seed, the rationale ("we demonstrate the method on a mix of real and synthetic trajectories to show generalisation; real data validates the forecast ensemble, synthetic data exercises the cascade engine at portfolio scale"), and the limitations.

4. Make the script idempotent. A `--reset` flag clears and re-seeds; without it, skip if measurements already exist.

Add `pnpm db:seed-drift` as a root-level script.

### 1.8 Tests

Tests live in `packages/db/__tests__/`:

- **Migration tests.** Boot a fresh local Supabase, apply all migrations, assert schema matches expectations.
- **RLS tests.** Using `pgtap` or equivalent: for each policy, assert that the expected identities can read/write and unexpected ones cannot.
- **Import tests.** Given a fixture xlsx, assert the import script produces exactly the expected rows.
- **Idempotency tests.** Re-run the import script twice; assert no duplicates and no errors.
- **Type-generation drift test.** CI job runs `pnpm db:gen-types` and fails if the generated file differs from the committed file.

Coverage target 70% (per architecture doc) for this package.

### 1.9 Documentation

Write the following in `packages/db/`:

- `README.md`, how to set up Supabase locally, run migrations, generate types, import the HPO register, seed drift measurements.
- `SCHEMA.md`, human-readable schema description with an ER diagram (use Mermaid). Every table, every column, what it's for.
- `RLS.md`, every policy, who it applies to, what it allows.
- `SYNTHETIC_DATA.md`, as described in 1.7.

---

## Out of scope for this prompt

- External data adapters (Prompt 3)
- Forecast computation (Prompt 4)
- Cascade impact computation (Prompt 5)
- Confidence scoring (Prompt 6)
- Any UI or pages (Prompts 7 and 8)
- PDA Platform integration (Prompt 9)

---

## Definition of done

- [ ] Supabase project created, env vars wired, `supabase start` works locally
- [ ] `data/HPO_All_Assumptions_Register_Approved.xlsx` committed to repo
- [ ] `data/README.md` written with provenance and licensing note
- [ ] `.gitignore` adjusted to allow the committed xlsx and data README
- [ ] All 9 tables created with correct schema, constraints, indexes
- [ ] Migrations 0001–0005 run in order on a fresh database without error
- [ ] RLS enabled on all tables with documented policies; `pgtap` tests pass
- [ ] Revoke migration in place; UPDATE and DELETE forbidden on `drift_measurements` for non-service-role
- [ ] TypeScript types generated and committed; CI fails if they drift
- [ ] HPO import script validates, maps, and inserts all 47 assumptions idempotently
- [ ] 3 externally-anchored assumptions correctly tier-1 tagged with `external_ref`
- [ ] Cascade links present for the A039 economic cascade with documented rationales
- [ ] Synthetic drift-measurement generator runs and populates 9 months of data for the 44 non-anchored assumptions
- [ ] `SYNTHETIC_DATA.md` documents the generation model at paper-appendix quality
- [ ] All tests pass locally and in CI
- [ ] Coverage ≥ 70% on `packages/db`
- [ ] README, SCHEMA.md, RLS.md, SYNTHETIC_DATA.md written and accurate
- [ ] PR opened with clear description, all CI green, reviewed against `ARCHITECTURE.md` section 4

---

## Self-check before PR

Answer in the PR description:

1. Can someone clone the repo, set the Supabase env vars, and run `pnpm db:reset && pnpm db:import-hpo && pnpm db:seed-drift` to get a fully populated local database? If not, fix it.
2. Have I matched the conceptual model from `ARCHITECTURE.md` section 3 exactly? Drift score, lead time, cascade impact formulas must be achievable from the data I'm storing.
3. Would a senior backend engineer find anything to criticise in the schema? Fix it before opening the PR.
4. Is the synthetic-data documentation honest enough that a paper reviewer would accept it? If not, rewrite until it is.
5. Does the RLS policy for the demo project actually work with anon access? Verify by hitting Supabase with only the anon key and reading an assumption.

---

*End of Prompt 1. Runs in parallel with Prompts 2 and 3.*
