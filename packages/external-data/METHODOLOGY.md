# External data adapters: methodology

This document is the paper appendix for Project Trueplan's ingestion layer. It describes the upstream sources, provenance contract, scale-of-measurement discipline, sampling, reproducibility, error handling, and citations. The reviewer's question "is this really live data, or did you fake it?" is answered here.

## 1. Source provenance

### 1.1 Office for National Statistics (ONS)

- **Endpoint:** `https://api.beta.ons.gov.uk/v1/`
- **Path used:** `/timeseries/{cdid}/dataset/{dataset}/data`
- **Series:** D7G7 (CPI all items, 12-month rate, monthly) in dataset `mm23`. The Prompt 1 spec also names D7NN (CPI services, leading indicator) and PLLU (PPI output prices, leading indicator). The leading-indicator adapters are deferred to a follow-up PR; the schema supports them via `is_leading_indicator` and `leading_indicator_refs` added in migration 0007.
- **Licence:** Open Government Licence v3.0 (OGL). ONS data may be copied, published, and distributed provided attribution is retained. Attribution string used at display time: "Contains public sector information licensed under the Open Government Licence v3.0."
- **Attribution metadata stored:** source URL per observation in `drift_measurements.source_url`; the external reference `ONS:D7G7` in `external_data_ref`; the fetch timestamp in `created_at`; a SHA-256 hash of the response payload available via `hashPayload()` for future reproducibility auditing. (The hash is not currently persisted; adding a `payload_hash` column is a follow-up.)

### 1.2 Bank of England Interactive Database (IADB)

- **Endpoint:** `https://www.bankofengland.co.uk/boeapps/iadb/fromshowcolumns.asp`
- **Query form:** `csv=yes&Datefrom=DD/MMM/YYYY&Dateto=DD/MMM/YYYY&SeriesCodes=IUDSOIA&UsingCodes=Y&VPD=Y&VFD=N&CSVF=TN`
- **Series:** IUDSOIA (Bank Rate, daily). Leading indicators (OIS forward curve, 2-year nominal gilt yield) are deferred.
- **Licence:** BoE explicit permission for non-commercial use of IADB data with attribution. Attribution string: "Data source: Bank of England Interactive Database."
- **CSV format.** Header row is `DATE,<seriesCode>`. Observations follow as `DD MMM YYYY,value`. The IADB uses `-99999` and blank strings for missing data; the parser drops both.

### 1.3 gov.uk search API

- **Endpoint:** `https://www.gov.uk/api/search.json`
- **Query:** `filter_content_store_document_type=policy_paper&filter_organisations[]=hm-revenue-customs&filter_public_timestamp[from]=YYYY-MM-DD&order=-public_timestamp&count=100`
- **Signal shape.** The endpoint returns a paginated result list plus a `total` count. We use `total` as the primary numeric signal for A048 Tax Policy: it is the count of HMRC policy papers published since the baseline date. Paper titles and URLs are attached to `revisionNote` so the Trace view can list them.
- **Licence:** Open Government Licence v3.0.

### 1.4 World Bank (deferred)

The World Bank UK annual-CPI feed at `https://api.worldbank.org/v2/country/GB/indicator/FP.CPI.TOTL.ZG?format=json` is spec'd as a tier-2 cross-source signal used by Prompt 6 for confidence scoring. Adapter deferred; hook into `AdapterDef` when added.

## 2. Data integrity

### 2.1 Provisional values and revisions

ONS monthly series are published provisionally and revised in subsequent months. The `drift_measurements` table is append-only by migration policy. A revision to an existing observation creates a **new** row with a later `created_at` and, when the upstream signals a revision, a `notes` / `revisionNote` field populated from the response metadata. Readers that want the latest value for a given `asOf` select `order by created_at desc limit 1`.

Current status: the adapters mark all observations `provisional = false` in the `ExternalSignal` object because the ONS Beta API does not (consistently) expose a provisional flag at the per-observation level in the shape we parse. Upgrading to read the dataset-level metadata and flag observations in the last three months as provisional is a documented follow-up.

### 2.2 Missing observations

Missing observations are **skipped**, not returned as zero. The distinction between "the value is zero" and "we do not have a value" is preserved all the way through to the domain.

- ONS: empty string or `-` in the `value` field.
- BoE: empty or `-99999`.
- gov.uk: the signal is a count and is always numeric.

### 2.3 Response hash for tamper detection

`common/provenance.hashPayload` computes a SHA-256 of the raw response body. Writing this hash into an expanded `ingest_audit.payload_hash` column is a follow-up; for now the hash is available in the code path for reviewers who want to verify a recorded fetch.

## 3. Scale-of-measurement discipline

Different series have different measurement scales. This matters because the forecast layer (Prompt 4) must not, for example, treat a percentage-point change on an already-annualised rate as if it were a relative change on an index.

| Series              | Scale                                | Notes                                                                                   |
| ------------------- | ------------------------------------ | --------------------------------------------------------------------------------------- |
| ONS D7G7            | Ratio scale in percentage-points     | Already annualised (`% YoY`); compare to baseline by subtraction, not by ratio          |
| BoE IUDSOIA         | Ratio scale in percent               | Daily point observations; downstream resamples to monthly by last-of-month              |
| gov.uk policy count | Ordinal (strictly, counting measure) | Not ratio-scale; drift relative to baseline is meaningful but percentage change less so |

## 4. Sampling and frequency

Adapters emit observations at the native upstream frequency.

- ONS: monthly, first day of month at 00:00 UTC (the adapter normalises to `YYYY-MM-01`).
- BoE: daily.
- gov.uk: event-driven (counted cumulatively since a baseline date).

The downstream forecast ensemble (Prompt 4) handles resampling.

## 5. Reproducibility

Every measurement row carries:

- `source_url`: the exact URL that returned the value
- `external_data_ref`: an opaque reference including the source-specific series id and the `asOf` date
- `created_at`: the time the row was written (proxy for fetched_at since all rows are insert-only)

A paper reviewer can replay any measurement by visiting `source_url`. The monthly and daily cadences on the upstream sources preserve observations indefinitely, so replay is durable.

The `ingest_audit` table further records per-run status, endpoint, record counts, and duration. The reviewer can see every ingestion run that has ever populated the database.

Integration tests hit the live APIs once per run when `CI_ALLOW_NETWORK=1`; this is the closest thing to continuous validation that the adapters still work against the current upstream shape.

## 6. Error handling

Errors are values, not exceptions. Every adapter returns `FetchResult<ExternalSignal[]>` where the failure branch carries a `FetchError` discriminated by `kind`:

- `NETWORK`: dropped TCP, DNS failure, timeout. Retried with exponential backoff (250ms, 500ms, 1s) up to three times. Logged as `FAILURE` in `ingest_audit` after retries exhausted.
- `HTTP`: non-2xx response from upstream. Retried for 5xx, not retried for 4xx.
- `RATE_LIMIT`: 429 response. Treated as retryable; the `bottleneck` limiter paces subsequent calls.
- `NOT_FOUND`: 404 on an expected series. Surfaced immediately; usually indicates upstream restructure.
- `SCHEMA`: the Zod schema rejected the response. Never retried. Fails the series loudly so reviewers know the adapter needs maintenance.
- `UNKNOWN`: the catch-all; includes invalid URLs and unforeseen branches.

The pipeline orchestrator writes a `FAILURE` audit row when any adapter fails; subsequent adapters still run so a single outage does not block the whole ingestion.

## 7. Primary signal versus leading indicator

Every externally-anchored assumption has exactly one **primary signal**. A leading indicator is a related series that tends to move ahead of the primary signal.

- Primary signals feed the forecast ensemble directly.
- Leading indicators are **display context** only. The Trace view will overlay them on the primary-signal chart so a human can see, for example, PPI rising three months before CPI follows. They do not feed the forecast.

This distinction protects the honesty of what we claim:

- We claim: "Project Trueplan forecasts breach using the assumption's drift trajectory."
- We do not claim: "Project Trueplan uses leading indicators to predict drift."

The schema supports leading indicators: `drift_measurements.is_leading_indicator` is `false` for primary-signal rows and `true` for leading-indicator rows; `assumptions.leading_indicator_refs` is an array of external_ref codes. Leading-indicator adapters themselves are deferred.

## 8. Rate limits

- ONS: 10 req/s documented. The shared `http.ts` client paces to 100ms minimum between calls per host with concurrency 2.
- BoE: no published limit; polite 1 req/s, concurrency 1.
- gov.uk: no published limit; polite 1 req/s, concurrency 1.

Limits are enforced per-host via `bottleneck` token buckets. The code path is shared so adding new adapters does not require new limiting logic.

## 9. Limitations honestly acknowledged

1. The adapter layer does not currently persist the SHA-256 response hash. That is a follow-up (adds a column to `ingest_audit`).
2. ONS provisional flags are not read at the per-observation level. All observations are currently marked `provisional = false`.
3. Leading-indicator adapters and the World Bank cross-source adapter are deferred.
4. The Supabase edge function is a heartbeat-only skeleton. Nightly pg_cron invocation works; the function logs an audit row but does not yet invoke `runIngest()`. Wiring the edge function to import `@tp/external-data` requires a small Deno-compatible build step that landed after the Prompt 1 merge boundary.
5. Fixtures are recorded against upstream responses as of April 2026. When the upstream schema changes, the Zod schema fails loudly (by design); regenerate fixtures per `FIXTURES.md`.

## 10. Citations

```bibtex
@manual{ons_beta_api_2026,
  title        = {Office for National Statistics Beta API},
  organization = {Office for National Statistics},
  year         = 2026,
  url          = {https://api.beta.ons.gov.uk/v1/},
  note         = {Accessed April 2026}
}

@manual{boe_iadb_2026,
  title        = {Bank of England Interactive Database},
  organization = {Bank of England},
  year         = 2026,
  url          = {https://www.bankofengland.co.uk/boeapps/iadb/},
  note         = {Accessed April 2026}
}

@manual{govuk_search_api_2026,
  title        = {gov.uk Content API: Search},
  organization = {Government Digital Service},
  year         = 2026,
  url          = {https://www.gov.uk/api/search.json},
  note         = {Accessed April 2026}
}

@manual{ogl_v3,
  title        = {Open Government Licence v3.0},
  organization = {UK Government},
  year         = 2014,
  url          = {http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/}
}
```
