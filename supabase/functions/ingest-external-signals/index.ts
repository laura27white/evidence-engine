/**
 * Supabase edge function: ingest-external-signals.
 *
 * Invoked nightly by pg_cron at 03:00 UTC. See packages/external-data/SCHEDULING.md.
 *
 * This is a skeleton: once the @tp/external-data package is deployed to the edge runtime
 * (pending a small tsconfig adjustment for Deno compatibility), this function imports
 * `runIngest` and writes summary rows to `ingest_audit`. For now it returns a 200 with a
 * note so the cron schedule and HTTP contract can be validated end-to-end.
 */
// eslint-disable-next-line import/no-unresolved
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

// Deno.serve is available at edge runtime.
// @ts-expect-error Deno global is defined at runtime.
Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // @ts-expect-error Deno env
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  // @ts-expect-error Deno env
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey) {
    return new Response('Missing environment variables', { status: 500 });
  }

  const _client = createClient(supabaseUrl, serviceKey, { db: { schema: 'evidence_engine' } });

  // TODO: wire `runIngest(_client)` from @tp/external-data once the edge-runtime build lands.
  // For now we audit the heartbeat so SCHEDULING.md + pg_cron can be verified end-to-end.
  const { error } = await _client.from('ingest_audit').insert({
    source: 'ONS',
    endpoint: 'ingest-external-signals (heartbeat)',
    status: 'PARTIAL',
    records_fetched: 0,
    records_written: 0,
    error_detail: 'heartbeat only; runIngest wiring deferred',
    duration_ms: 0,
  });
  if (error) {
    return new Response(`audit insert failed: ${error.message}`, { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true, note: 'heartbeat ok' }), {
    headers: { 'content-type': 'application/json' },
  });
});
