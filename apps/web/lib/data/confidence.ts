import 'server-only';

import { getDbClient, MissingDataError } from './client';
import { DEMO_PROJECT_CODE } from './constants';
import { requireProject } from './project';

import type { ConfidenceScore } from '@tp/db';

export async function getLatestConfidence(assumptionId: string): Promise<ConfidenceScore | null> {
  const client = getDbClient();
  if (client === null) return null;
  const { data, error } = await client
    .from('confidence_scores')
    .select('*')
    .eq('assumption_id', assumptionId)
    .order('computed_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new MissingDataError('Failed to load confidence score', error);
  return data ?? null;
}

export async function listLatestConfidences(
  projectCode: string = DEMO_PROJECT_CODE,
): Promise<Map<string, ConfidenceScore>> {
  const project = await requireProject(projectCode);
  const client = getDbClient();
  if (project === null || client === null) return new Map();
  const { data: assumptionRows, error: aErr } = await client
    .from('assumptions')
    .select('id')
    .eq('project_id', project.id);
  if (aErr) throw new MissingDataError('Failed to enumerate assumptions', aErr);
  const ids = (assumptionRows ?? []).map((r) => r.id);
  if (ids.length === 0) return new Map();
  const { data, error } = await client
    .from('confidence_scores')
    .select('*')
    .in('assumption_id', ids)
    .order('computed_at', { ascending: false });
  if (error) throw new MissingDataError('Failed to load confidence scores', error);
  const latestById = new Map<string, ConfidenceScore>();
  for (const row of data ?? []) {
    if (!latestById.has(row.assumption_id)) latestById.set(row.assumption_id, row);
  }
  return latestById;
}
