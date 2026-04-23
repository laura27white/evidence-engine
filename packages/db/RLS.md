# Row-level security

RLS is enabled and forced on every table in the `evidence_engine` schema. All policies are SELECT-only; INSERT, UPDATE, and DELETE are reserved for the service role (which bypasses RLS entirely) except where explicitly called out below.

Migration source: [`supabase/migrations/0003_rls_policies.sql`](../../supabase/migrations/0003_rls_policies.sql).

## Identities

- **service_role**: used by edge functions, import scripts, and anything running under `SUPABASE_SERVICE_ROLE_KEY`. Bypasses RLS.
- **authenticated**: a user with a valid Supabase JWT. RLS requires the JWT to carry a `project_ids` claim (a JSON array of UUIDs) that includes the relevant `project_id`.
- **anon**: unauthenticated browser request. Can only read rows that belong to the demo project whose `code` is `'HPO24A01-DEMO'`.

## Helper functions

### `evidence_engine.jwt_project_ids() returns uuid[]`

Reads the `project_ids` claim from `auth.jwt()` and returns it as a UUID array. Returns `array[]::uuid[]` when the claim is absent or empty.

### `evidence_engine.demo_project_id() returns uuid`

Returns the id of the `HPO24A01-DEMO` project. Used by anon policies to avoid hard-coding the row's UUID.

Both functions are marked `stable`, have `set search_path = pg_catalog, evidence_engine` pinned (advisor 0011), and are `execute`-granted to anon, authenticated, and service_role.

## Policies per table

| Table                | anon                                             | authenticated                                                                                              | service_role |
| -------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- | ------------ |
| `projects`           | SELECT where `code = 'HPO24A01-DEMO'`            | SELECT where `id = any(jwt_project_ids())`                                                                 | ALL          |
| `assumptions`        | SELECT where `project_id = demo_project_id()`    | SELECT where `project_id = any(jwt_project_ids())`                                                         | ALL          |
| `drift_measurements` | SELECT via join on assumptions.project_id = demo | SELECT via join on assumptions.project_id = any(jwt_project_ids()); INSERT granted; UPDATE, DELETE revoked | ALL          |
| `cascade_links`      | SELECT via join                                  | SELECT via join                                                                                            | ALL          |
| `forecasts`          | SELECT via join                                  | SELECT via join                                                                                            | ALL          |
| `cascade_impacts`    | SELECT via join                                  | SELECT via join                                                                                            | ALL          |
| `confidence_scores`  | SELECT via join                                  | SELECT via join                                                                                            | ALL          |
| `briefs`             | SELECT where `project_id = demo_project_id()`    | SELECT where `project_id = any(jwt_project_ids())`                                                         | ALL          |
| `ingest_audit`       | no access                                        | SELECT if the caller has at least one project_ids claim                                                    | ALL          |

## INSERT, UPDATE, DELETE

- `drift_measurements` is append-only. `authenticated` has INSERT granted (for future client-side manual measurements) but UPDATE and DELETE were revoked in migration 0004. `anon` has no write access.
- All other tables: only the service role writes. Downstream prompts (4, 5, 6) write forecasts, cascade_impacts, and confidence_scores via edge functions running under the service role.

## Demo access expectations

The Project Trueplan demo is public-facing. Judges and anyone hitting the deployed site with only the anon key must be able to read:

- `projects` row `HPO24A01-DEMO`
- Every `assumptions` row in that project
- Every `drift_measurements` row linked to those assumptions
- Every `cascade_links`, `forecasts`, `cascade_impacts`, `confidence_scores` row linked to those assumptions
- Every `briefs` row for that project

And must not be able to:

- Read any row in any other project (none exist yet, but the policy is written for that future state)
- Read `ingest_audit` (operational data)
- Write to any table

## Testing

The deployed policies are exercised by hitting the project with the anon key once the `evidence_engine` schema is exposed on the Supabase API (Project Settings > API > Exposed schemas). Automated pgtap tests are deferred to a follow-up PR (see Prompt 1 self-check answer #5). The migration structure test suite confirms the policy SQL is well-formed and covers every table; see `packages/db/__tests__/migrations-structure.test.ts`.
