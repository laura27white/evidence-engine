# @tp/external-data

Adapters for the UK public statistical APIs that Project Trueplan anchors its externally-anchored assumptions to. Each adapter turns an upstream response into typed, validated, provenanced `ExternalSignal` objects; the pipeline persists them as `drift_measurements` rows with an accompanying `ingest_audit` trail.

Authoritative spec: `ARCHITECTURE.md` section 9. Paper-grade methodology: [METHODOLOGY.md](./METHODOLOGY.md).

## What ships in this PR

Three **primary-signal** adapters for the three externally-anchored HPO assumptions (A046 / A047 / A048):

| Assumption          | Adapter       | Series                              | External ref                          |
| ------------------- | ------------- | ----------------------------------- | ------------------------------------- |
| A046 Inflation      | ONS           | CPI all items, 12-month rate (D7G7) | `ONS:D7G7`                            |
| A047 Interest Rates | BoE IADB      | Bank Rate, daily (IUDSOIA)          | `BOE:IUDSOIA`                         |
| A048 Tax Policy     | gov.uk search | HMRC policy paper count             | `GOVUK:hmrc-tax-policy-announcements` |

Plus the orchestrator, writer, audit writer, and a Supabase edge function scaffold. Coverage 92 percent, above the 80 target.

**Deferred to a follow-up PR** with TODOs in-code:

- Leading-indicator series (ONS D7NN services CPI, PPI PLLU, BoE OIS forward + 2y gilt, gov.uk HMRC consultations). The `drift_measurements.is_leading_indicator` column and `assumptions.leading_indicator_refs` array are in place (migration 0007) so downstream consumers can distinguish once these land.
- World Bank cross-source adapter.
- Live pg_cron deployment. The edge function at `supabase/functions/ingest-external-signals/` is a heartbeat skeleton; wiring `runIngest()` into it requires a small tsconfig for the Deno edge runtime that I did not want to rush.
- `ingest:warmkeep` 10-minute ping loop.

See METHODOLOGY.md for the limitations section and the paper reviewer's sanity checks.

## Usage

### One-shot backfill

```bash
cp .env.example apps/web/.env.local   # already done during Prompt 1
# add SUPABASE_SERVICE_ROLE_KEY (from the dashboard) to apps/web/.env.local
pnpm --filter @tp/external-data ingest:backfill
```

Prints a summary of rows fetched and written per adapter. Idempotent: run twice, the second run writes zero rows.

### Direct adapter use

```ts
import { fetchOnsCpi, fetchBoeBankRate, fetchGovukTaxPolicy } from '@tp/external-data';

const cpi = await fetchOnsCpi({ fromDate: '2025-06-01' });
if (cpi.ok) {
  for (const signal of cpi.data) {
    console.log(signal.asOf, signal.value, signal.sourceUrl);
  }
} else {
  console.error(cpi.error.kind, cpi.error.message);
}
```

Every adapter returns `FetchResult<ExternalSignal[]>`. No exceptions escape.

### Pipeline

```ts
import { runIngest } from '@tp/external-data';
import { createServerClient } from '@tp/db';

const summary = await runIngest(createServerClient(), { baselineDate: '2025-06-12' });
console.log(summary);
```

Writes `drift_measurements` rows and an `ingest_audit` trail.

## Testing

- `pnpm --filter @tp/external-data test` runs unit tests with MSW stubs, no network access
- `pnpm --filter @tp/external-data test:coverage` runs v8 coverage; target 80 percent, currently 92
- `pnpm --filter @tp/external-data test:integration` hits live APIs; gated behind `CI_ALLOW_NETWORK=1` so it never runs automatically

See [FIXTURES.md](./FIXTURES.md) for how fixtures were recorded and how to refresh them.

## Module layout

```
packages/external-data/src
├── adapters
│   ├── ons/{client, schemas, series/cpi, __tests__}.ts
│   ├── boe/{client, schemas, series/bank-rate, __tests__}.ts
│   └── govuk/{client, schemas, series/tax-policy, __tests__}.ts
├── common/{types, http, provenance}.ts
└── pipeline/{ingest, writer, audit, __tests__}.ts
```

## Scheduling

See [SCHEDULING.md](./SCHEDULING.md) for the pg_cron setup and warm-keep plan.
