import 'server-only';

import {
  buildNarrativeInput,
  type AssumptionRow,
  type CascadeImpactRow,
  type ConfidenceRow,
  type DriftMeasurementRow,
  type ForecastRow,
  type NarrativeInput,
  type ProjectRow,
} from '@tp/narrative';

import { getDbClient, MissingDataError, shouldSwallowRestError } from './client';
import { DEMO_PROJECT_CODE } from './constants';

/**
 * Fetches everything the narrative generator needs in one server round-trip.
 * Returns null if the project is not reachable (RLS, missing schema, network)
 * so the API route can short-circuit to a pure-fallback brief without crashing.
 */
export async function loadNarrativeInput(
  projectCode: string = DEMO_PROJECT_CODE,
  now: Date = new Date(),
): Promise<NarrativeInput | null> {
  const client = getDbClient();
  if (client === null) return null;

  const { data: project, error: pErr } = await client
    .from('projects')
    .select('id, code, name, description')
    .eq('code', projectCode)
    .maybeSingle();
  if (pErr && !shouldSwallowRestError(pErr)) {
    throw new MissingDataError('Failed to load project', pErr);
  }
  if (project === null) return null;

  const projectRow: ProjectRow = {
    id: project.id,
    code: project.code,
    name: project.name,
    description: project.description,
  };

  const [assumptionsResult, forecastsResult, confidencesResult, impactsResult] = await Promise.all([
    client
      .from('assumptions')
      .select('id, code, description, category, baseline_value, tolerance_pct, is_external')
      .eq('project_id', project.id),
    client
      .from('forecasts')
      .select('assumption_id, lead_time_days, ensemble_agreement, computed_at')
      .eq('method', 'ENSEMBLE')
      .order('computed_at', { ascending: false }),
    client
      .from('confidence_scores')
      .select('assumption_id, score, computed_at')
      .order('computed_at', { ascending: false }),
    client
      .from('cascade_impacts')
      .select('source_assumption_id, target_assumption_id, expected_drift_score'),
  ]);

  if (assumptionsResult.error !== null) return null;
  const assumptions = (assumptionsResult.data ?? []) as AssumptionRow[];

  const forecastsByAssumptionId = new Map<string, ForecastRow>();
  for (const row of forecastsResult.data ?? []) {
    if (!forecastsByAssumptionId.has(row.assumption_id)) {
      forecastsByAssumptionId.set(row.assumption_id, {
        assumption_id: row.assumption_id,
        lead_time_days: row.lead_time_days,
        ensemble_agreement: row.ensemble_agreement,
      });
    }
  }

  const confidencesByAssumptionId = new Map<string, ConfidenceRow>();
  for (const row of confidencesResult.data ?? []) {
    if (!confidencesByAssumptionId.has(row.assumption_id)) {
      confidencesByAssumptionId.set(row.assumption_id, {
        assumption_id: row.assumption_id,
        score: row.score,
      });
    }
  }

  const impacts: CascadeImpactRow[] = (impactsResult.data ?? []).map((row) => ({
    source_assumption_id: row.source_assumption_id,
    target_assumption_id: row.target_assumption_id,
    expected_drift_score: row.expected_drift_score,
  }));

  const assumptionIds = assumptions.map((a) => a.id);
  const externalMeasurements = new Map<string, DriftMeasurementRow>();
  if (assumptionIds.length > 0) {
    const { data: measurementRows } = await client
      .from('drift_measurements')
      .select('assumption_id, measured_at, observed_value')
      .in('assumption_id', assumptionIds)
      .order('measured_at', { ascending: false });
    for (const row of measurementRows ?? []) {
      if (!externalMeasurements.has(row.assumption_id)) {
        externalMeasurements.set(row.assumption_id, {
          assumption_id: row.assumption_id,
          measured_at: row.measured_at,
          observed_value: row.observed_value,
        });
      }
    }
  }

  return buildNarrativeInput({
    project: projectRow,
    computedAt: now,
    assumptions,
    forecastsByAssumptionId,
    confidencesByAssumptionId,
    impacts,
    externalMeasurements,
  });
}
