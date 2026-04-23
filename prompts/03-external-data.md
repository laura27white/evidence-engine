# Prompt 3: External Data Adapters and Scheduled Ingestion

**Runtime:** approximately 2.5 hours. Runs in parallel with Prompts 1 and 2 against the merged output of Prompt 0.

**Prerequisite:** Prompt 0 merged to main. Repo cloned. Architecture doc at root.

**Soft dependency:** This prompt benefits from `drift_measurements` table existing (Prompt 1). If Prompt 1 hasn't merged yet, write the adapters and tests in full, stub the database writes with a simple in-memory store for testing, and add a TODO to replace with real Supabase writes once Prompt 1 merges.

**Authoritative context:** Read `ARCHITECTURE.md` section 9 (external integrations) in full before starting.

---

## Role and mission

You are a senior backend engineer building the data-ingestion layer for Project Trueplan. Your adapters turn public UK statistical APIs into typed, validated, provenanced `drift_measurements` rows. Without this layer, the three externally-anchored assumptions (A039 Inflation, A040 Interest Rates, A041 Tax Policy) have no real data, and the demo's key moment falls apart.

The judges' key question, "is this really live data, or did you fake it?", is answered by the code in this prompt. Build it so the answer is unambiguous.

---

## What you are building

### 3.1 Package structure

`packages/external-data/` contains:

```
packages/external-data/
├── src/
│   ├── adapters/
│   │   ├── ons/
│   │   │   ├── index.ts
│   │   │   ├── client.ts
│   │   │   ├── schemas.ts
│   │   │   ├── series/
│   │   │   │   ├── cpi.ts         // D7G7 – CPI 12m
│   │   │   │   ├── cpi-services.ts // D7NN – CPI services
│   │   │   │   └── ppi-steel.ts    // MM22/steel
│   │   │   └── __tests__/
│   │   ├── boe/
│   │   │   ├── index.ts
│   │   │   ├── client.ts
│   │   │   ├── schemas.ts
│   │   │   ├── series/
│   │   │   │   └── bank-rate.ts    // IUDSOIA
│   │   │   └── __tests__/
│   │   ├── govuk/
│   │   │   ├── index.ts
│   │   │   ├── client.ts
│   │   │   ├── schemas.ts
│   │   │   ├── series/
│   │   │   │   └── tax-policy.ts   // policy papers feed, filtered
│   │   │   └── __tests__/
│   │   └── worldbank/        // cross-source fallback
│   │       └── ...
│   ├── common/
│   │   ├── types.ts            // ExternalSignal, FetchResult, etc.
│   │   ├── http.ts             // rate-limited, retrying HTTP client
│   │   ├── errors.ts           // typed errors
│   │   └── logging.ts
│   ├── pipeline/
│   │   ├── ingest.ts           // the orchestrator
│   │   ├── writer.ts           // writes drift_measurements to Supabase
│   │   └── audit.ts            // writes ingest_audit rows
│   └── index.ts                // package exports
├── __tests__/                  // integration tests
├── README.md
├── METHODOLOGY.md              // paper-grade docs (see 3.8)
└── package.json
```

### 3.2 The common types

```typescript
// packages/external-data/src/common/types.ts

export type SourceTier = 1 | 2 | 3;

export interface ExternalSignal {
  source: 'ONS' | 'BOE' | 'GOVUK' | 'WORLDBANK';
  seriesId: string;         // e.g. 'D7G7'
  metric: string;           // human-readable, e.g. 'CPI all items 12-month rate'
  value: number;
  unit: string;             // e.g. '% YoY', '%', 'GBP'
  asOf: string;             // ISO 8601 date
  fetchedAt: string;        // ISO 8601 timestamp
  sourceUrl: string;        // the exact URL the number came from
  sourceTier: SourceTier;
  provisional: boolean;     // many ONS series are provisional
  revisionNote?: string;    // when present, the revision or note attached
}

export type FetchResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: FetchError };

export interface FetchError {
  kind: 'NETWORK' | 'HTTP' | 'SCHEMA' | 'RATE_LIMIT' | 'NOT_FOUND' | 'UNKNOWN';
  message: string;
  cause?: unknown;
  retryable: boolean;
}
```

All adapters return `FetchResult<ExternalSignal[]>`. No exceptions escape the adapter layer; errors are values.

### 3.3 ONS adapter

**Endpoint:** `https://api.beta.ons.gov.uk/v1/` (current ONS public API). Verify the current URL at build time with a single fetch of the root and log the API version.

**Key series:**

| Series ID | Dataset | Path | Description | Role |
|---|---|---|---|---|
| D7G7 | `cpih01` or equivalent | `/datasets/.../timeseries/d7g7` | CPI all items 12-month rate, monthly | Primary for A039 |
| D7NN | same dataset | `/datasets/.../timeseries/d7nn` | CPI services 12-month rate, monthly | Leading indicator for A039 |
| D7F5 | same dataset | `/datasets/.../timeseries/d7f5` | CPI all items index, monthly | Supporting |
| PLLU | `ppi` or equivalent | `/datasets/.../timeseries/pllu` | Producer price index, output prices, monthly | Leading indicator for A039 (typically leads CPI by 1-3 months) |

Services CPI (D7NN) is a useful leading indicator because services inflation is stickier and often moves ahead of headline CPI. PPI leads CPI through the cost-of-goods transmission lag. Both are pulled alongside the primary series D7G7 for the A039 assumption.

The exact path format has changed historically; **at implementation time, verify against the live API and document the exact paths used in `METHODOLOGY.md`**.

**Functionality:**

```typescript
export async function fetchOnsSeries(
  seriesId: string,
  options?: { fromDate?: string; toDate?: string },
): Promise<FetchResult<ExternalSignal[]>>;
```

Returns one `ExternalSignal` per observation in the date range. If no range, returns the last 24 months. Values are parsed as numbers (the API returns strings). Missing values are skipped, not returned as zero.

**Validation:** Every response parsed through a Zod schema before being mapped to `ExternalSignal`. Schema lives in `schemas.ts`. If the API shape changes and breaks the schema, the adapter returns `{ ok: false, error: { kind: 'SCHEMA', ... } }` with a clear message; it does not silently partial-succeed.

**Rate limiting:** Respect 10 req/s. Use a token-bucket limiter from `bottleneck` or similar. Batch requests where possible.

**User-Agent:** Set to the value of `EXTERNAL_DATA_USER_AGENT` env var, which defaults to `ProjectTrueplan/0.1 `. Update this in `.env.example` as part of this prompt's changes.

**Retry:** Exponential backoff for 5xx and network errors. Max 3 retries. No retry on 4xx (schema or auth issues that won't resolve by retrying).

### 3.4 Bank of England adapter

**Endpoint:** `https://www.bankofengland.co.uk/boeapps/iadb/`, the Interactive Database. CSV downloads, no auth, no API key.

**Key series:**

| Series ID | Description | URL pattern | Role |
|---|---|---|---|
| IUDSOIA | Bank Rate, daily | Specific IADB URL with date range params | Primary for A040 |
| IUDMNPY | Market-implied Bank Rate expectation (OIS-derived forward rate, 12m) | IADB series for sterling overnight index swap forward curve | Leading indicator for A040 |
| IUMAMNPY | 2-year nominal gilt yield, daily | IADB series | Leading indicator for A040 |

The OIS forward curve encodes market expectations of future Bank Rate moves; gilt yields incorporate both rate and term-premium signals. Both lead the actual Bank Rate because the MPC responds to market conditions as well as to its own forward guidance. Verify exact series codes against the IADB at implementation time; the IDs above are illustrative and may be refined.

The IADB's URL format is finicky; read the IADB documentation during implementation and document the exact URL template used in `METHODOLOGY.md`.

**Functionality:** Same signature as ONS: `fetchBoeSeries(seriesId, options)` returning `FetchResult<ExternalSignal[]>`.

**Parsing:** The IADB returns CSV. Use `csv-parse` for typed parsing. Schema validation via Zod on the parsed rows. Handle the CSV's quirks: some series carry trailing metadata rows that must be skipped; some use `-99999` or blank to indicate no data.

**Rate limiting:** Courtesy limit of 1 req/s because this is a polite endpoint with no public limit documented.

### 3.5 gov.uk adapter

**Endpoint:** `https://www.gov.uk/api/search.json`.

**Use case:** We're looking for tax policy announcements and consultations since a reference date (the baseline for A041 Tax Policy). The adapter fetches two things: a count of matching policy documents (the primary signal) and a count of consultations (the leading indicator). Consultations typically precede policy papers by 3-6 months and signal intended changes before they are enacted.

**Queries:**

Primary (policy papers):

```
filter_content_store_document_type=policy_paper
&filter_organisations[]=hm-revenue-customs
&filter_public_timestamp[from]={BASELINE_DATE}
&order=-public_timestamp
&count=100
```

Leading indicator (consultations):

```
filter_content_store_document_type=consultation
&filter_organisations[]=hm-revenue-customs
&filter_public_timestamp[from]={BASELINE_DATE}
&order=-public_timestamp
&count=100
```

**Output:** Two ExternalSignal objects per fetch. One carries the policy-paper count (metric `policy_changes_since_baseline`); one carries the consultation count (metric `consultations_since_baseline`). Both list individual document titles and URLs in `revisionNote`.

**Functionality:**

```typescript
export async function fetchGovukTaxPolicy(
  options: { sinceDate: string },
): Promise<FetchResult<ExternalSignal[]>>;

export async function fetchGovukTaxConsultations(
  options: { sinceDate: string },
): Promise<FetchResult<ExternalSignal[]>>;
```

Returns single-element arrays. The adapters are deliberately simple because the signal is interpretive, not numeric. Downstream treatment in the Trace view shows both as annotations on the timeline so reviewers can see consultations coming before they become policy.

**Rate limiting:** 1 req/s courtesy.

### 3.6 World Bank adapter

For cross-source inflation comparison, as a tier-2 secondary signal.

**Endpoint:** `https://api.worldbank.org/v2/country/GB/indicator/FP.CPI.TOTL.ZG?format=json`.

**Functionality:** Standard signature. Returns annual UK inflation as reported by the World Bank, used as a sanity check against ONS.

Sparse: annual data, one point per year, used only for confidence scoring (cross-source agreement in Prompt 6).

### 3.7 Leading indicators and how they differ from primary signals

Every externally-anchored assumption has a single **primary signal** and optionally one or more **leading indicators**. The distinction matters:

- **Primary signal.** The series the assumption is directly anchored to. Drift is measured against this. Breach is calculated against this. The forecast ensemble runs on this.
- **Leading indicator.** A related series that tends to move ahead of the primary signal. Displayed in the Trace view as context. Does *not* feed the forecast ensemble directly (future work; requires a multi-series model).

This distinction protects the honesty of what we claim:

- We claim: "Project Trueplan forecasts breach using the assumption's drift trajectory."
- We do *not* claim: "Project Trueplan uses leading indicators to predict drift." The forecast is univariate; leading indicators are display context.

For the three externally-anchored assumptions, the leading-indicator mapping is:

| Assumption | Primary | Leading indicators |
|---|---|---|
| A039 Inflation | ONS CPI D7G7 | ONS CPI services D7NN, ONS PPI output prices PLLU |
| A040 Interest Rates | BoE Bank Rate IUDSOIA | BoE OIS forward curve (IUDMNPY or equivalent), 2y gilt yield |
| A041 Tax Policy | gov.uk policy paper count | gov.uk consultation count |

The pipeline fetches both primary and leading-indicator signals; the database stores all measurements. The `drift_measurements` table carries an optional `is_leading_indicator` boolean so downstream consumers can distinguish. Add this column in a migration now (Prompt 1's schema did not include it; this is a Prompt 3 schema update).

**Metadata:** Each assumption row gets a new `leading_indicator_refs text[]` column (also a Prompt 1 schema update) listing the `external_ref` codes of its leading indicators. The UI reads this to know what to overlay.

### 3.8 The ingestion pipeline

`src/pipeline/ingest.ts` is the orchestrator that:

1. Reads a list of `(assumption_id, external_ref, fromDate)` triples from Supabase (query assumptions where `is_external = true`).
2. For each triple, dispatches to the right adapter based on the `external_ref` prefix (`ONS:`, `BOE:`, `GOVUK:`, `WORLDBANK:`).
3. Collects `ExternalSignal`s.
4. Writes each as a `drift_measurements` row via `writer.ts`.
5. Writes an `ingest_audit` row summarising the run: source, endpoint, status, records fetched, records written, duration.
6. Returns a summary for the caller.

**Idempotency.** The pipeline must be safe to run multiple times per day without duplicating measurements. Strategy: before inserting, check whether a measurement for this `(assumption_id, measured_at)` exists; if so, skip. Measurement timestamp uses the `asOf` from the `ExternalSignal`, not `fetchedAt`, so revisions to the same observation date update in-place via a proper upsert (but remember, `drift_measurements` is append-only, so a revision becomes a new row with a later `fetchedAt` and a `revisionNote`, and the reader picks the latest-`fetchedAt` per `asOf`).

**Scheduling.** Create a Supabase edge function at `supabase/functions/ingest-external-signals/index.ts` that invokes the pipeline. Schedule via Supabase pg_cron to run nightly at 03:00 UTC. Document the cron setup in `packages/external-data/SCHEDULING.md`.

**Backfill.** A second pipeline entrypoint, `backfill.ts`, invokable as a pnpm script (`pnpm ingest:backfill`). Accepts `--from` and `--to` flags, fetches all available data in that range for all externally-anchored assumptions, and writes measurements. Used once at setup time to populate 12 months of history.

**Warm-keep.** In addition to the nightly ingest, schedule a lightweight ping every 10 minutes during the hackathon period (configurable via env var `KEEP_WARM_ENABLED`) that does a minimal ONS fetch. Its purpose is to keep any downstream services warm (like PDA Platform on Render, pinged separately from Prompt 9). If you wire up Sentry monitoring for the pipeline, this also gives you a heartbeat.

### 3.9 METHODOLOGY.md

This file becomes part of the paper's methodology section. Write at paper quality.

Cover:

1. **Source provenance.** For each series, the exact API URL, the metadata fields, the license and attribution requirements. ONS data is Open Government Licence; BoE IADB data is similar; gov.uk API is Open Government Licence. Cite each.

2. **Data integrity.** How we handle provisional data (mark as such, allow revision, keep history). How we handle revisions (append-only with `revisionNote`). How we handle missing data (skip, don't impute at this layer).

3. **Scale-of-measurement discipline.** ONS CPI is a 12-month rate, already a percentage; do not treat as an index. BoE Bank Rate is a daily point; annualise correctly if needed. gov.uk policy paper count is an ordinal signal; do not treat as ratio-scale.

4. **Sampling and frequency.** ONS CPI is monthly; BoE Bank Rate is daily; gov.uk is event-driven. The adapter reports the native frequency. Downstream (Prompt 4) handles resampling.

5. **Reproducibility.** Every fetch is logged with the exact URL, timestamp, and response hash (SHA-256 of the response body) in `ingest_audit`. A paper reviewer can replay any single measurement by fetching the logged URL.

6. **Error handling.** Errors are values, not exceptions. Transient failures retry with backoff. Schema failures fail loudly and halt the ingestion of that series. Partial successes write what succeeded and audit the failures.

7. **Citations.** BibTeX-cited references for: ONS methodology, BoE IADB user guide, gov.uk API documentation, World Bank indicator metadata. Include URLs and access dates.

### 3.10 Tests

- **Unit tests per adapter** against fixture responses. Use `msw` (Mock Service Worker) to stub network calls with realistic recorded payloads. Record fresh fixtures quarterly.
- **Schema tests** that assert Zod schemas reject every documented bad-data case (missing fields, wrong types, provisional flags, revision metadata).
- **Rate-limit tests** that confirm the limiter holds to stated rates.
- **Idempotency tests** for the pipeline: run twice, assert no duplicates.
- **Append-only tests** for revisions: a new observation for an existing `asOf` creates a new row, not an update.
- **Integration test** that hits the real ONS API once per CI run (behind a `CI_ALLOW_NETWORK` flag so local CI doesn't hit live APIs unnecessarily, and the test is tolerant of the live API being slow or down).

Coverage target 80% (per architecture doc).

### 3.11 Documentation

- `README.md`, how to use each adapter, how to run the pipeline, scheduling overview.
- `METHODOLOGY.md`, as described in 3.9.
- `SCHEDULING.md`, the pg_cron setup, the warm-keep strategy, how to rotate or disable.
- `FIXTURES.md`, how fixtures were recorded, how to refresh them, licensing considerations for committing recorded public-sector API responses (generally fine under OGL, but document it).

---

## Out of scope

- Forecast computation (Prompt 4).
- Any UI (Prompts 7, 8).
- PDA Platform integration (Prompt 9).
- The synthetic-data generator (Prompt 1 already handles that).

---

## Definition of done

- [ ] `packages/external-data` structure matches the spec in 3.1
- [ ] ONS adapter fetches live data for D7G7 (primary) and D7NN + PLLU (leading indicators), all correctly-typed and validated
- [ ] BoE adapter fetches IUDSOIA (primary) and OIS forward + gilt yield (leading indicators) daily, correctly-typed
- [ ] gov.uk adapter returns both policy-count (primary) and consultation-count (leading indicator) signals with documents in `revisionNote`
- [ ] Schema migrations add `is_leading_indicator` to `drift_measurements` and `leading_indicator_refs` to `assumptions` (coordinate with Prompt 1 owner; this is a Prompt 3 schema update)
- [ ] World Bank adapter fetches UK CPI annual series
- [ ] Every adapter has Zod schemas, unit tests with msw fixtures, and explicit error types
- [ ] Rate limiting works as documented
- [ ] Retry with exponential backoff works for transient errors; no retry for 4xx
- [ ] Pipeline orchestrator ingests primary signals and leading indicators together, writes `drift_measurements` rows with correct `is_leading_indicator` flag, writes `ingest_audit` rows
- [ ] Idempotency verified: run pipeline twice, no duplicates
- [ ] Append-only discipline verified: a revision creates a new row, not an update
- [ ] Supabase edge function deployed and scheduled via pg_cron at 03:00 UTC nightly
- [ ] Backfill script runs and populates 12 months of history for A039, A040, A041 (including their leading indicators)
- [ ] Warm-keep schedule documented and runnable
- [ ] Coverage ≥ 80%
- [ ] METHODOLOGY.md written at paper quality with BibTeX references, reproducibility statement, and an explicit subsection on the distinction between primary signals and leading indicators
- [ ] README, SCHEDULING.md, FIXTURES.md written
- [ ] PR opened, CI green, reviewed against `ARCHITECTURE.md` sections 2.2 (ingestion layer) and 9 (external integrations)

---

## Self-check before PR

Answer in the PR description:

1. Is every number returned by these adapters traceable back to an exact URL, timestamp, and source hash, such that a paper reviewer could independently verify it? If not, fix.
2. Have I confirmed the ONS and BoE API paths against the live APIs at implementation time, and documented the exact paths in METHODOLOGY.md? APIs change; don't assume my spec is current.
3. Do the Zod schemas fail loudly when the upstream API changes, rather than silently corrupting downstream calculations? Verify by flipping a field type in a fixture.
4. Does the pipeline handle transient failures (network blip) without corrupting `drift_measurements` or leaking a broken run?
5. Is METHODOLOGY.md honest about limitations (provisional data, revisions, irregular frequency)?

---

*End of Prompt 3. Runs in parallel with Prompts 1 and 2.*
