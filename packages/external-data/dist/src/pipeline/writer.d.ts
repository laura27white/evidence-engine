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
export declare function writeSignals(client: TrueplanClient, signals: ExternalSignal[], options: WriterOptions): Promise<WriteResult>;
//# sourceMappingURL=writer.d.ts.map