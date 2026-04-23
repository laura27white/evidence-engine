# Scheduled ingestion

## Status in this PR

- **Edge function committed**, scaffolded at `supabase/functions/ingest-external-signals/`. It currently writes a heartbeat `ingest_audit` row so a pg_cron trigger can be validated end-to-end. Wiring `runIngest()` from `@tp/external-data` into the function requires a Deno-compatible build step; deferred to a follow-up.
- **pg_cron not yet enabled** on the project. The SQL below is the intended setup; run via the Supabase SQL editor or via the MCP connector once the edge function is fully wired.
- **Local backfill is available now** via `pnpm --filter @tp/external-data ingest:backfill`. This is what Prompt 1's Supabase demo dataset uses for its first 12 months of real data.

## Intended nightly cron

```sql
-- Runs every night at 03:00 UTC. Invokes the edge function which in turn calls runIngest.
select cron.schedule(
  'ingest-external-signals-nightly',
  '0 3 * * *',
  $$
    select net.http_post(
      url := 'https://nyvrfcqixjcjhhfwfmbd.functions.supabase.co/ingest-external-signals',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.service_role_key', true)
      ),
      body := jsonb_build_object('invokedBy', 'pg_cron')
    );
  $$
);
```

`app.service_role_key` is set as a database-level custom setting during project provisioning. The `net` extension ships with Supabase; enable via the dashboard.

## Warm-keep (deferred)

The challenge brief calls for a 10-minute ping to keep downstream services warm. Intent:

```sql
select cron.schedule(
  'ingest-external-signals-heartbeat',
  '*/10 * * * *',
  $$
    select net.http_post(
      url := 'https://nyvrfcqixjcjhhfwfmbd.functions.supabase.co/ingest-external-signals',
      headers := jsonb_build_object('X-Heartbeat', 'true'),
      body := jsonb_build_object('mode', 'heartbeat')
    );
  $$
)
where current_setting('app.keep_warm_enabled', true) = 'on';
```

The edge function reads the `X-Heartbeat` header and runs a minimal ONS fetch rather than the full pipeline, keeping both the edge runtime and any downstream (PDA Platform) warm. Gated on a per-env `app.keep_warm_enabled` setting so we can turn it off after the hackathon.

## How to disable or rotate

```sql
select cron.unschedule('ingest-external-signals-nightly');
select cron.unschedule('ingest-external-signals-heartbeat');
```

Both are idempotent; calling unschedule on a job that does not exist is a no-op.

## Monitoring

Every invocation writes a row to `evidence_engine.ingest_audit`. The Trace view (Prompt 7) surfaces recent audit rows as a sparkline, and alerting can be added via Supabase Database Webhooks firing on `status = 'FAILURE'` rows.
