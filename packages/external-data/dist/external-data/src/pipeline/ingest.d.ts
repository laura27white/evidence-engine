/**
 * Ingestion orchestrator. For each externally-anchored assumption, dispatch to the right
 * adapter based on `external_ref` prefix, validate, persist, and audit.
 *
 * Not wired to pg_cron yet (see packages/external-data/SCHEDULING.md); the Supabase edge
 * function at supabase/functions/ingest-external-signals/index.ts imports and invokes
 * `runIngest()` once that deployment lands.
 */
import { type WriteResult } from './writer';
import type { ExternalSignal, FetchResult } from '../common/types';
import type { TrueplanClient } from '@tp/db';
export interface IngestRunSummary {
    totalFetched: number;
    totalWritten: number;
    perAdapter: AdapterSummary[];
}
export interface AdapterSummary {
    source: 'ONS' | 'BOE' | 'GOVUK' | 'WORLDBANK';
    externalRef: string;
    status: 'SUCCESS' | 'FAILURE';
    fetched: number;
    written: WriteResult | null;
    errorDetail?: string;
    durationMs: number;
}
type AdapterFn = () => Promise<FetchResult<ExternalSignal[]>>;
export interface AdapterDef {
    externalRef: string;
    source: 'ONS' | 'BOE' | 'GOVUK' | 'WORLDBANK';
    endpointLabel: string;
    run: AdapterFn;
}
export declare function defaultAdapters(projectBaselineDate: string): AdapterDef[];
export interface IngestOptions {
    adapters?: AdapterDef[];
    /** baseline date for all adapters (defaults to the HPO register's 2025-06-12 logging). */
    baselineDate?: string;
}
/**
 * Pull assumptions from Supabase, map external_ref to assumption_id, run each adapter
 * defined in `adapters`, persist via the writer, and append ingest_audit rows.
 */
export declare function runIngest(client: TrueplanClient, options?: IngestOptions): Promise<IngestRunSummary>;
export {};
//# sourceMappingURL=ingest.d.ts.map