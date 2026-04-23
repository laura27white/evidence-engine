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

export async function writeAudit(client: TrueplanClient, row: AuditRow): Promise<void> {
  const { error } = await client.from('ingest_audit').insert({
    source: row.source,
    endpoint: row.endpoint,
    status: row.status,
    records_fetched: row.recordsFetched ?? null,
    records_written: row.recordsWritten ?? null,
    error_detail: row.errorDetail ?? null,
    duration_ms: row.durationMs,
  });
  if (error) {
    throw new Error(`ingest_audit insert failed: ${error.message}`);
  }
}
