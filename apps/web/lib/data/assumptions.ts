import 'server-only';

import { getDbClient, MissingDataError } from './client';
import { DEMO_PROJECT_CODE } from './constants';
import { requireProject } from './project';

import type { Assumption } from '@tp/db';

export async function listAssumptions(
  projectCode: string = DEMO_PROJECT_CODE,
): Promise<Assumption[]> {
  const project = await requireProject(projectCode);
  const client = getDbClient();
  if (project === null || client === null) return [];
  const { data, error } = await client
    .from('assumptions')
    .select('*')
    .eq('project_id', project.id)
    .order('code', { ascending: true });
  if (error) throw new MissingDataError('Failed to load assumptions', error);
  return data ?? [];
}

export async function getAssumption(
  code: string,
  projectCode: string = DEMO_PROJECT_CODE,
): Promise<Assumption | null> {
  const project = await requireProject(projectCode);
  const client = getDbClient();
  if (project === null || client === null) return null;
  const { data, error } = await client
    .from('assumptions')
    .select('*')
    .eq('project_id', project.id)
    .eq('code', code)
    .maybeSingle();
  if (error) throw new MissingDataError(`Failed to load assumption ${code}`, error);
  return data ?? null;
}

export async function getAssumptionById(id: string): Promise<Assumption | null> {
  const client = getDbClient();
  if (client === null) return null;
  const { data, error } = await client.from('assumptions').select('*').eq('id', id).maybeSingle();
  if (error) throw new MissingDataError(`Failed to load assumption ${id}`, error);
  return data ?? null;
}
