import 'server-only';

import { getDbClient, MissingDataError, shouldSwallowRestError } from './client';
import { DEMO_PROJECT_CODE } from './constants';

import type { Project } from '@tp/db';

export async function getProject(code: string = DEMO_PROJECT_CODE): Promise<Project | null> {
  const client = getDbClient();
  if (client === null) return null;
  const { data, error } = await client.from('projects').select('*').eq('code', code).maybeSingle();
  if (error) {
    if (shouldSwallowRestError(error)) return null;
    throw new MissingDataError(`Could not load project ${code}`, error);
  }
  return data ?? null;
}

/**
 * Returns the demo project, or null when Supabase is not configured. Callers are
 * expected to treat null as an "empty project" signal and short-circuit to an empty
 * state so the UI still renders in environments without credentials.
 */
export async function requireProject(code: string = DEMO_PROJECT_CODE): Promise<Project | null> {
  return getProject(code);
}
