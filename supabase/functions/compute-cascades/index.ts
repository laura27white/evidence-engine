// deno-lint-ignore-file no-explicit-any
// @ts-nocheck Deno runtime.
/**
 * compute-cascades edge function.
 *
 * Builds the cascade DAG, runs all-pairs propagation with unit drift at each source,
 * and upserts into cascade_impacts. Also surfaces the top drivers for convenience.
 */
import { buildGraph, propagateAllPairs } from 'https://esm.sh/@tp/intelligence/cascade';

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
  if (pErr || projectRow === null) {
    return respond({ ok: false, error: 'project not found' }, 400);
  }

  const { data: assumptions, error: aErr } = await client
    .from('assumptions')
    .select('id, code, category, is_external')
    .eq('project_id', projectRow.id);
  if (aErr) return respond({ ok: false, error: aErr.message }, 500);

  const ids = (assumptions ?? []).map((a: any) => a.id);
  const { data: links, error: lErr } = await client
    .from('cascade_links')
    .select('source_assumption_id, target_assumption_id, propagation_weight, rationale')
    .in('source_assumption_id', ids);
  if (lErr) return respond({ ok: false, error: lErr.message }, 500);

  const nodes = (assumptions ?? []).map((a: any) => ({
    id: a.id,
    code: a.code,
    category: a.category,
    isExternal: a.is_external,
    currentDriftScore: 1,
  }));
  const edges = (links ?? []).map((l: any) => ({
    sourceId: l.source_assumption_id,
    targetId: l.target_assumption_id,
    weight: Number(l.propagation_weight),
    rationale: l.rationale,
  }));

  const graph = buildGraph(nodes, edges);
  if (!graph.ok) {
    return respond({ ok: false, error: `graph: ${graph.error.kind}` }, 500);
  }

  const allPairs = propagateAllPairs(graph.value);
  let written = 0;
  for (const [sourceId, prop] of allPairs) {
    for (const impact of prop.impacts) {
      await client.from('cascade_impacts').upsert(
        {
          source_assumption_id: sourceId,
          target_assumption_id: impact.targetId,
          expected_drift_score: impact.expectedDriftScore,
          paths: impact.paths.map((p: any) => ({
            nodes: p.nodes,
            weights: p.weights,
            pathProduct: p.pathProduct,
          })),
        },
        { onConflict: 'source_assumption_id,target_assumption_id' },
      );
      written += 1;
    }
  }

  await client.from('ingest_audit').insert({
    source: 'compute-cascades',
    endpoint: 'supabase/functions/compute-cascades',
    status: 'SUCCESS',
    records_fetched: (assumptions?.length ?? 0) + (links?.length ?? 0),
    records_written: written,
    duration_ms: Date.now() - startedAt,
  });

  return respond({ ok: true, cascadesComputed: written });
});

function respond(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
