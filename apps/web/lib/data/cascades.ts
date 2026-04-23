import 'server-only';

import { getDbClient, MissingDataError } from './client';
import { DEMO_PROJECT_CODE } from './constants';
import { requireProject } from './project';

import type { CascadeImpact, CascadeLink } from '@tp/db';

export async function listCascadeLinks(
  projectCode: string = DEMO_PROJECT_CODE,
): Promise<CascadeLink[]> {
  const project = await requireProject(projectCode);
  const client = getDbClient();
  if (project === null || client === null) return [];
  const { data: assumptionRows, error: aErr } = await client
    .from('assumptions')
    .select('id')
    .eq('project_id', project.id);
  if (aErr) throw new MissingDataError('Failed to enumerate assumptions', aErr);
  const ids = (assumptionRows ?? []).map((r) => r.id);
  if (ids.length === 0) return [];
  const { data, error } = await client
    .from('cascade_links')
    .select('*')
    .in('source_assumption_id', ids);
  if (error) throw new MissingDataError('Failed to load cascade links', error);
  return data ?? [];
}

export async function listCascadeImpactsFromSource(sourceId: string): Promise<CascadeImpact[]> {
  const client = getDbClient();
  if (client === null) return [];
  const { data, error } = await client
    .from('cascade_impacts')
    .select('*')
    .eq('source_assumption_id', sourceId)
    .order('expected_drift_score', { ascending: false });
  if (error) throw new MissingDataError('Failed to load cascade impacts', error);
  return data ?? [];
}

export async function listAllCascadeImpacts(
  projectCode: string = DEMO_PROJECT_CODE,
): Promise<CascadeImpact[]> {
  const project = await requireProject(projectCode);
  const client = getDbClient();
  if (project === null || client === null) return [];
  const { data: assumptionRows, error: aErr } = await client
    .from('assumptions')
    .select('id')
    .eq('project_id', project.id);
  if (aErr) throw new MissingDataError('Failed to enumerate assumptions', aErr);
  const ids = (assumptionRows ?? []).map((r) => r.id);
  if (ids.length === 0) return [];
  const { data, error } = await client
    .from('cascade_impacts')
    .select('*')
    .in('source_assumption_id', ids);
  if (error) throw new MissingDataError('Failed to load cascade impacts', error);
  return data ?? [];
}
