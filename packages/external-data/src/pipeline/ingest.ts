/**
 * Ingestion orchestrator. For each externally-anchored assumption, dispatch to the right
 * adapter based on `external_ref` prefix, validate, persist, and audit.
 *
 * Not wired to pg_cron yet (see packages/external-data/SCHEDULING.md); the Supabase edge
 * function at supabase/functions/ingest-external-signals/index.ts imports and invokes
 * `runIngest()` once that deployment lands.
 */

import { fetchBoeBankRate } from '../adapters/boe';
import { fetchGovukTaxPolicy } from '../adapters/govuk';
import { fetchOnsCpi } from '../adapters/ons';

import { writeAudit } from './audit';
import { writeSignals, type WriteResult } from './writer';

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

export function defaultAdapters(projectBaselineDate: string): AdapterDef[] {
  const since = projectBaselineDate || '2025-06-01';
  return [
    {
      externalRef: 'ONS:D7G7',
      source: 'ONS',
      endpointLabel: 'ONS timeseries D7G7 (CPI 12-month rate)',
      run: () => fetchOnsCpi({ fromDate: since }),
    },
    {
      externalRef: 'BOE:IUDSOIA',
      source: 'BOE',
      endpointLabel: 'BoE IADB IUDSOIA (Bank Rate daily)',
      run: () => fetchBoeBankRate({ fromDate: since }),
    },
    {
      externalRef: 'GOVUK:hmrc-tax-policy-announcements',
      source: 'GOVUK',
      endpointLabel: 'gov.uk search policy_paper HMRC',
      run: () => fetchGovukTaxPolicy({ sinceDate: since }),
    },
  ];
}

export interface IngestOptions {
  adapters?: AdapterDef[];
  /** baseline date for all adapters (defaults to the HPO register's 2025-06-12 logging). */
  baselineDate?: string;
}

/**
 * Pull assumptions from Supabase, map external_ref to assumption_id, run each adapter
 * defined in `adapters`, persist via the writer, and append ingest_audit rows.
 */
export async function runIngest(
  client: TrueplanClient,
  options: IngestOptions = {},
): Promise<IngestRunSummary> {
  const baselineDate = options.baselineDate ?? '2025-06-12';
  const adapters = options.adapters ?? defaultAdapters(baselineDate);

  const { data: assumptions, error } = await client
    .from('assumptions')
    .select('id, external_ref')
    .eq('is_external', true)
    .not('external_ref', 'is', null);
  if (error) {
    throw new Error(`Could not read assumptions: ${error.message}`);
  }

  const assumptionIdByRef = new Map<string, string>();
  for (const row of assumptions ?? []) {
    if (row.external_ref) assumptionIdByRef.set(row.external_ref, row.id);
  }

  const summary: IngestRunSummary = {
    totalFetched: 0,
    totalWritten: 0,
    perAdapter: [],
  };

  for (const adapter of adapters) {
    const started = Date.now();
    const fetched = await adapter.run();
    const durationMs = Date.now() - started;

    if (!fetched.ok) {
      summary.perAdapter.push({
        source: adapter.source,
        externalRef: adapter.externalRef,
        status: 'FAILURE',
        fetched: 0,
        written: null,
        errorDetail: `${fetched.error.kind}: ${fetched.error.message}`,
        durationMs,
      });
      await writeAudit(client, {
        source: adapter.source,
        endpoint: adapter.endpointLabel,
        status: 'FAILURE',
        recordsFetched: 0,
        recordsWritten: 0,
        errorDetail: `${fetched.error.kind}: ${fetched.error.message}`,
        durationMs,
      });
      continue;
    }

    const signals = fetched.data;
    summary.totalFetched += signals.length;

    const writeResult = await writeSignals(client, signals, { assumptionIdByRef });
    summary.totalWritten += writeResult.inserted;

    summary.perAdapter.push({
      source: adapter.source,
      externalRef: adapter.externalRef,
      status: 'SUCCESS',
      fetched: signals.length,
      written: writeResult,
      durationMs,
    });

    await writeAudit(client, {
      source: adapter.source,
      endpoint: adapter.endpointLabel,
      status: 'SUCCESS',
      recordsFetched: signals.length,
      recordsWritten: writeResult.inserted,
      durationMs,
    });
  }

  return summary;
}
