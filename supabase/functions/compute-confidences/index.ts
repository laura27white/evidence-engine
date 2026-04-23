// deno-lint-ignore-file no-explicit-any
// @ts-nocheck Deno runtime.
/**
 * compute-confidences edge function.
 *
 * For every assumption, gathers inputs and runs @tp/intelligence/confidence. Writes
 * one row per assumption to confidence_scores keyed by (assumption_id, computed_at).
 */
import { computeConfidence } from 'https://esm.sh/@tp/intelligence/confidence';

import { createAdminClient } from '../_shared/client.ts';
import { demoProjectCode } from '../_shared/env.ts';

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const client = createAdminClient();
  const startedAt = Date.now();

  const { data: projectRow, error: pErr } = await client
    .from('projects')
    .select('id')
    .eq('code', demoProjectCode())
    .maybeSingle();
  if (pErr || projectRow === null) return respond({ ok: false, error: 'project not found' }, 400);

  const { data: assumptions, error: aErr } = await client
    .from('assumptions')
    .select('id, code, source_tier, review_date, review_cadence_days')
    .eq('project_id', projectRow.id);
  if (aErr) return respond({ ok: false, error: aErr.message }, 500);

  let written = 0;
  for (const a of assumptions ?? []) {
    const { data: measurements, error: mErr } = await client
      .from('drift_measurements')
      .select('measured_at, observed_value, source, external_data_ref')
      .eq('assumption_id', a.id)
      .order('measured_at', { ascending: true });
    if (mErr) continue;
    const result = computeConfidence({
      lastReviewDate: a.review_date === null ? null : new Date(a.review_date),
      reviewCadenceDays: a.review_cadence_days,
      sourceTier: a.source_tier,
      measurements: (measurements ?? []).map((row: any) => ({
        assumptionId: a.id,
        measuredAt: new Date(row.measured_at),
        observedValue: Number(row.observed_value),
        source: row.source,
        externalDataRef: row.external_data_ref ?? undefined,
      })),
    });
    await client.from('confidence_scores').insert({
      assumption_id: a.id,
      score: result.score,
      recency_component: result.components.recency,
      source_tier_component: result.components.sourceTier,
      agreement_component: result.components.agreement ?? 0,
      volatility_component: result.components.volatility,
    });
    written += 1;
  }

  await client.from('ingest_audit').insert({
    source: 'compute-confidences',
    endpoint: 'supabase/functions/compute-confidences',
    status: 'SUCCESS',
    records_fetched: assumptions?.length ?? 0,
    records_written: written,
    duration_ms: Date.now() - startedAt,
  });

  return respond({ ok: true, confidencesComputed: written });
});

function respond(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
