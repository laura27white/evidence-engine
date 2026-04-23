// deno-lint-ignore-file no-explicit-any
// @ts-nocheck Deno runtime.
/**
 * compute-all orchestrator. Calls compute-forecasts then compute-cascades then
 * compute-confidences in order, returns a combined summary. Invoked by the web app's
 * /api/recompute proxy and by the nightly scheduler.
 */
import { readEnv } from '../_shared/env.ts';

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const baseUrl = readEnv('SUPABASE_URL');
  const token = readEnv('SUPABASE_SERVICE_ROLE_KEY');
  const startedAt = Date.now();

  const summaries: Record<string, unknown> = {};
  for (const name of ['compute-forecasts', 'compute-cascades', 'compute-confidences']) {
    const url = `${baseUrl}/functions/v1/${name}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ trigger: 'compute-all' }),
    });
    summaries[name] = res.ok ? await res.json() : { ok: false, status: res.status };
  }

  return new Response(
    JSON.stringify({
      ok: true,
      durationMs: Date.now() - startedAt,
      forecastsComputed: readCount(summaries['compute-forecasts'], 'forecastsComputed'),
      cascadesComputed: readCount(summaries['compute-cascades'], 'cascadesComputed'),
      confidencesComputed: readCount(summaries['compute-confidences'], 'confidencesComputed'),
      detail: summaries,
    }),
    { status: 200, headers: { 'content-type': 'application/json' } },
  );
});

function readCount(payload: unknown, key: string): number {
  if (payload && typeof payload === 'object' && key in payload) {
    const value = (payload as Record<string, unknown>)[key];
    if (typeof value === 'number') return value;
  }
  return 0;
}
