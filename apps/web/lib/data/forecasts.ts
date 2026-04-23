import 'server-only';

import { getDbClient, MissingDataError } from './client';
import { DEMO_PROJECT_CODE } from './constants';
import { requireProject } from './project';

import type { Forecast } from '@tp/db';

export async function getLatestForecast(assumptionId: string): Promise<Forecast | null> {
  const client = getDbClient();
  if (client === null) return null;
  const { data, error } = await client
    .from('forecasts')
    .select('*')
    .eq('assumption_id', assumptionId)
    .eq('method', 'ENSEMBLE')
    .order('computed_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new MissingDataError('Failed to load latest forecast', error);
  return data ?? null;
}

export async function listLatestForecasts(
  projectCode: string = DEMO_PROJECT_CODE,
): Promise<Map<string, Forecast>> {
  const project = await requireProject(projectCode);
  const client = getDbClient();
  if (project === null || client === null) return new Map();
  const { data: assumptionRows, error: aErr } = await client
    .from('assumptions')
    .select('id')
    .eq('project_id', project.id);
  if (aErr) throw new MissingDataError('Failed to enumerate assumptions', aErr);
  const assumptionIds = (assumptionRows ?? []).map((row) => row.id);
  if (assumptionIds.length === 0) return new Map();

  const { data, error } = await client
    .from('forecasts')
    .select('*')
    .in('assumption_id', assumptionIds)
    .eq('method', 'ENSEMBLE')
    .order('computed_at', { ascending: false });
  if (error) throw new MissingDataError('Failed to load forecasts', error);

  const latestById = new Map<string, Forecast>();
  for (const row of data ?? []) {
    if (!latestById.has(row.assumption_id)) latestById.set(row.assumption_id, row);
  }
  return latestById;
}

export async function listMethodForecasts(assumptionId: string): Promise<Forecast[]> {
  const client = getDbClient();
  if (client === null) return [];
  const { data, error } = await client
    .from('forecasts')
    .select('*')
    .eq('assumption_id', assumptionId)
    .order('computed_at', { ascending: false })
    .limit(40);
  if (error) throw new MissingDataError('Failed to load method forecasts', error);
  return data ?? [];
}
