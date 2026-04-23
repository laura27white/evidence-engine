import 'server-only';

import { getDbClient, MissingDataError } from './client';
import { DEMO_PROJECT_CODE } from './constants';
import { requireProject } from './project';

import type { Brief } from '@tp/db';

export async function getLatestBrief(
  projectCode: string = DEMO_PROJECT_CODE,
): Promise<Brief | null> {
  const project = await requireProject(projectCode);
  const client = getDbClient();
  if (project === null || client === null) return null;
  const { data, error } = await client
    .from('briefs')
    .select('*')
    .eq('project_id', project.id)
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new MissingDataError('Failed to load brief', error);
  return data ?? null;
}
