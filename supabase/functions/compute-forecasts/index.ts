// deno-lint-ignore-file no-explicit-any
// @ts-nocheck Deno runtime; types resolved at deploy time.
/**
 * compute-forecasts edge function.
 *
 * For every assumption in the demo project with sufficient drift_measurements, compute
 * the ensemble forecast and the three method forecasts, then upsert into the
 * `forecasts` table. Idempotent via (assumption_id, method, input_series_hash).
 */
import {
  ensembleForecast,
  forecastAr1,
  forecastEwma,
  forecastLinear,
  type Measurement,
} from 'https://esm.sh/@tp/intelligence/forecast';

import { createAdminClient } from '../_shared/client.ts';
import { demoProjectCode } from '../_shared/env.ts';

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }
  const client = createAdminClient();
  const startedAt = new Date();

  const { data: projectRow, error: projectErr } = await client
    .from('projects')
    .select('id')
    .eq('code', demoProjectCode())
    .maybeSingle();
  if (projectErr || projectRow === null) {
    return respond({ ok: false, error: 'project not found', detail: projectErr?.message });
  }

  const { data: assumptions, error: aErr } = await client
    .from('assumptions')
    .select('id, code, baseline_value, baseline_unit, tolerance_pct')
    .eq('project_id', projectRow.id);
  if (aErr) return respond({ ok: false, error: aErr.message });

  let computed = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const a of assumptions ?? []) {
    if (a.baseline_value === null || a.baseline_unit === null || a.tolerance_pct === null) {
      skipped += 1;
      continue;
    }
    const { data: rawMeasurements, error: mErr } = await client
      .from('drift_measurements')
      .select('measured_at, observed_value, source, external_data_ref')
      .eq('assumption_id', a.id)
      .order('measured_at', { ascending: true });
    if (mErr) {
      errors.push(`${a.code}: ${mErr.message}`);
      continue;
    }
    const measurements: Measurement[] = (rawMeasurements ?? []).map((row: any) => ({
      assumptionId: a.id,
      measuredAt: new Date(row.measured_at),
      observedValue: Number(row.observed_value),
      source: row.source,
      externalDataRef: row.external_data_ref ?? undefined,
    }));
    if (measurements.length < 6) {
      skipped += 1;
      continue;
    }
    const baseline = {
      baselineValue: Number(a.baseline_value),
      baselineUnit: a.baseline_unit,
      tolerancePct: Number(a.tolerance_pct),
    };
    try {
      const ensemble = ensembleForecast(measurements, baseline);
      await upsertForecast(client, a.id, ensemble);
      const methods = [
        { fn: forecastLinear, method: 'LINEAR' as const },
        { fn: forecastEwma, method: 'EWMA' as const },
        { fn: forecastAr1, method: 'AR1' as const },
      ];
      for (const m of methods) {
        const result = m.fn(measurements, baseline);
        await upsertMethod(client, a.id, m.method, result, ensemble.inputSeriesHash);
      }
      computed += 1;
    } catch (cause) {
      errors.push(`${a.code}: ${cause instanceof Error ? cause.message : 'unknown error'}`);
    }
  }

  await client.from('ingest_audit').insert({
    source: 'compute-forecasts',
    endpoint: 'supabase/functions/compute-forecasts',
    status: errors.length === 0 ? 'SUCCESS' : computed > 0 ? 'PARTIAL' : 'FAILURE',
    records_fetched: assumptions?.length ?? 0,
    records_written: computed * 4,
    error_detail: errors.length > 0 ? errors.slice(0, 20).join('; ') : null,
    duration_ms: Date.now() - startedAt.getTime(),
  });

  return respond({
    ok: true,
    forecastsComputed: computed,
    skipped,
    errors: errors.slice(0, 20),
  });
});

async function upsertForecast(client: any, assumptionId: string, ensemble: any) {
  await client.from('forecasts').upsert(
    {
      assumption_id: assumptionId,
      computed_at: ensemble.computedAt.toISOString(),
      method: 'ENSEMBLE',
      projected_value_30d: ensemble.projected30d,
      projected_value_90d: ensemble.projected90d,
      projected_value_365d: ensemble.projected365d,
      projected_breach_date: ensemble.breachDate?.toISOString() ?? null,
      lead_time_days: ensemble.leadTimeDays,
      confidence_interval_lower: ensemble.breachConfidenceInterval?.[0]?.toISOString() ?? null,
      confidence_interval_upper: ensemble.breachConfidenceInterval?.[1]?.toISOString() ?? null,
      ensemble_agreement: ensemble.ensembleAgreement,
      model_params: { memberCount: ensemble.memberForecasts.length },
      input_series_hash: ensemble.inputSeriesHash,
    },
    { onConflict: 'assumption_id,method,input_series_hash' },
  );
}

async function upsertMethod(
  client: any,
  assumptionId: string,
  method: 'LINEAR' | 'EWMA' | 'AR1',
  result: any,
  hash: string,
) {
  await client.from('forecasts').upsert(
    {
      assumption_id: assumptionId,
      method,
      projected_value_30d: result.projected30d,
      projected_value_90d: result.projected90d,
      projected_value_365d: result.projected365d,
      projected_breach_date: result.breachDate?.toISOString() ?? null,
      lead_time_days:
        result.breachDate === null
          ? null
          : Math.floor((result.breachDate.getTime() - Date.now()) / 86_400_000),
      confidence_interval_lower: result.breachConfidenceInterval?.[0]?.toISOString() ?? null,
      confidence_interval_upper: result.breachConfidenceInterval?.[1]?.toISOString() ?? null,
      ensemble_agreement: null,
      model_params: result.modelParams,
      input_series_hash: hash,
    },
    { onConflict: 'assumption_id,method,input_series_hash' },
  );
}

function respond(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
