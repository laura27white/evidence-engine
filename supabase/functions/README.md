# Supabase edge functions

This directory contains the four scheduled compute functions that turn raw
`drift_measurements`, `cascade_links`, and `assumptions` rows into derived tables
(`forecasts`, `cascade_impacts`, `confidence_scores`) via the pure logic in
`@tp/intelligence`.

## Functions

- `compute-forecasts` - runs the forecast ensemble for every assumption with at least
  the minimum number of drift measurements. Upserts the ENSEMBLE row plus the three
  method rows (LINEAR, EWMA, AR1).
- `compute-cascades` - builds the cascade DAG from `cascade_links`, runs all-pairs
  propagation with unit source drift, and upserts into `cascade_impacts`.
- `compute-confidences` - computes the four-component confidence score for every
  assumption and inserts a new row into `confidence_scores` (history is retained).
- `compute-all` - orchestrator that invokes the three above in order and returns a
  combined summary. This is what the web app's `POST /api/recompute` proxies to and
  what the nightly scheduler triggers.

## Deploy

```
pnpm supabase functions deploy compute-forecasts
pnpm supabase functions deploy compute-cascades
pnpm supabase functions deploy compute-confidences
pnpm supabase functions deploy compute-all
```

Environment: the functions require `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
to be present in the Supabase project environment. The `compute-all` orchestrator
additionally expects these to be set so it can call its siblings over HTTP.

## Scheduling

Nightly cron (Supabase Schedules) at:

- 04:00 UTC `compute-forecasts`
- 04:15 UTC `compute-cascades`
- 04:30 UTC `compute-confidences`

Or a single daily trigger at 04:00 UTC against `compute-all` that runs them serially.

## Idempotency

`compute-forecasts` upserts on `(assumption_id, method, input_series_hash)`. When a
series has not changed, the hash does not change and the row simply refreshes its
`computed_at`. `compute-cascades` upserts on `(source_assumption_id,
target_assumption_id)`. `compute-confidences` inserts a new row each time so history
is preserved; the UI reads the most recent row.

## Known limitations

- Imports from `@tp/intelligence` resolve via `esm.sh`. A custom build output that
  pre-bundles the package could reduce cold-start time but is not necessary for
  hackathon scale (47 assumptions, ~15s total).
- Errors are collected but the bulk writer does not yet support partial success
  retries within a single run.
