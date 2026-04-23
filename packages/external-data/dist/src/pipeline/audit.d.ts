/**
 * ingest_audit writer. One row per adapter run regardless of success. The combination of
 * (source, endpoint, status) is indexed so the demo-reliability retrospective and the
 * paper reproducibility statement can query this table freely.
 */
import type { TrueplanClient } from '@tp/db';
export interface AuditRow {
    source: 'ONS' | 'BOE' | 'GOVUK' | 'WORLDBANK';
    endpoint: string;
    status: 'SUCCESS' | 'FAILURE' | 'PARTIAL';
    recordsFetched?: number;
    recordsWritten?: number;
    errorDetail?: string;
    durationMs: number;
}
export declare function writeAudit(client: TrueplanClient, row: AuditRow): Promise<void>;
//# sourceMappingURL=audit.d.ts.map