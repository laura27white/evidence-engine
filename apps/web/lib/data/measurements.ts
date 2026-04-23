import 'server-only';
import { getDbClient, MissingDataError } from './client';

import type { DriftMeasurement } from '@tp/db';

export async function getMeasurementsForAssumption(
  assumptionId: string,
  options?: { fromDate?: string; limit?: number },
): Promise<DriftMeasurement[]> {
  const client = getDbClient();
  if (client === null) return [];
  let query = client
    .from('drift_measurements')
    .select('*')
    .eq('assumption_id', assumptionId)
    .order('measured_at', { ascending: true });
  if (options?.fromDate !== undefined) {
    query = query.gte('measured_at', options.fromDate);
  }
  if (options?.limit !== undefined) {
    query = query.limit(options.limit);
  }
  const { data, error } = await query;
  if (error) throw new MissingDataError('Failed to load measurements', error);
  return data ?? [];
}
