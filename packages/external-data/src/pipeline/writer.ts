/**
 * drift_measurements writer.
 *
 * Idempotent: before inserting an observation, the writer checks whether a row already
 * exists for the same `(assumption_id, measured_at, external_data_ref)` and skips if so.
 * Revisions to the same observation are written as new rows with a later fetched_at and
 * a revisionNote, so the append-only discipline (per migration 0004) is preserved.
 */
import type { ExternalSignal } from '../common/types';
import type { TrueplanClient } from '@tp/db';

export interface WriterOptions {
  /** Map of external_ref to assumption_id, built once per pipeline run. */
  assumptionIdByRef: Map<string, string>;
}

export interface WriteResult {
  inserted: number;
  skippedExisting: number;
  skippedNoAssumption: number;
}

export async function writeSignals(
  client: TrueplanClient,
  signals: ExternalSignal[],
  options: WriterOptions,
): Promise<WriteResult> {
  const result: WriteResult = { inserted: 0, skippedExisting: 0, skippedNoAssumption: 0 };

  for (const signal of signals) {
    const assumptionId = options.assumptionIdByRef.get(signal.externalRef);
    if (!assumptionId) {
      result.skippedNoAssumption += 1;
      continue;
    }

    const measuredAt = `${signal.asOf}T00:00:00.000Z`;

    const { data: existing, error: lookupErr } = await client
      .from('drift_measurements')
      .select('id')
      .eq('assumption_id', assumptionId)
      .eq('measured_at', measuredAt)
      .eq('external_data_ref', buildRef(signal))
      .limit(1);
    if (lookupErr) {
      throw new Error(`drift_measurements lookup failed: ${lookupErr.message}`);
    }
    if (existing && existing.length > 0) {
      result.skippedExisting += 1;
      continue;
    }

    const { error: insertErr } = await client.from('drift_measurements').insert({
      assumption_id: assumptionId,
      measured_at: measuredAt,
      observed_value: signal.value,
      source: 'EXTERNAL_API',
      source_url: signal.sourceUrl,
      external_data_ref: buildRef(signal),
      notes: signal.revisionNote ?? null,
      is_leading_indicator: signal.isLeadingIndicator,
    });
    if (insertErr) {
      throw new Error(`drift_measurements insert failed: ${insertErr.message}`);
    }
    result.inserted += 1;
  }

  return result;
}

function buildRef(signal: ExternalSignal): string {
  return `${signal.externalRef} ${signal.asOf}`;
}
