/**
 * ONS CPI all items 12-month rate (series D7G7). Primary signal for A046 Inflation.
 *
 * Returns monthly observations as `ExternalSignal` objects. Missing values (represented
 * as '' or '-' in the ONS payload) are skipped rather than returned as zero; the domain
 * semantics of "no observation" and "observation of zero" are distinct.
 */
import { err, ok, type ExternalSignal, type FetchResult } from '../../../common/types';
import { fetchOnsTimeseries } from '../client';

import type { OnsObservation } from '../schemas';

const SERIES_ID = 'D7G7';
const DATASET = 'mm23';
const EXTERNAL_REF = 'ONS:D7G7';
const METRIC = 'CPI all items 12-month rate';
const UNIT = '% YoY';

export interface FetchCpiOptions {
  /** Inclusive lower bound on observation date (ISO YYYY-MM-DD). */
  fromDate?: string;
  /** Inclusive upper bound on observation date. */
  toDate?: string;
}

export async function fetchOnsCpi(
  options: FetchCpiOptions = {},
): Promise<FetchResult<ExternalSignal[]>> {
  const response = await fetchOnsTimeseries({ seriesId: SERIES_ID, dataset: DATASET });
  if (!response.ok) {
    return err(response.error);
  }

  const { body, sourceUrl, fetchedAt } = response.data;
  const rows = body.months ?? [];
  const signals: ExternalSignal[] = [];

  for (const row of rows) {
    const parsedDate = parseMonthDate(row.date);
    if (!parsedDate) continue;
    if (options.fromDate && parsedDate < options.fromDate) continue;
    if (options.toDate && parsedDate > options.toDate) continue;

    const numericValue = parseOnsValue(row);
    if (numericValue === null) continue;

    signals.push({
      source: 'ONS',
      seriesId: SERIES_ID,
      metric: METRIC,
      value: numericValue,
      unit: UNIT,
      asOf: parsedDate,
      fetchedAt,
      sourceUrl,
      sourceTier: 1,
      provisional: false,
      isLeadingIndicator: false,
      externalRef: EXTERNAL_REF,
    });
  }

  return ok(signals);
}

/**
 * ONS monthly observation dates look like "2025 JAN" or "2025 Jan". Returns
 * canonical ISO YYYY-MM-01 so we can index and range-filter without parsing again.
 */
export function parseMonthDate(raw: string): string | null {
  const match = raw.trim().match(/^(\d{4})\s+([A-Za-z]{3})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const monthAbbrev = match[2]?.toUpperCase() ?? '';
  const months = [
    'JAN',
    'FEB',
    'MAR',
    'APR',
    'MAY',
    'JUN',
    'JUL',
    'AUG',
    'SEP',
    'OCT',
    'NOV',
    'DEC',
  ];
  const monthIndex = months.indexOf(monthAbbrev);
  if (monthIndex < 0 || Number.isNaN(year)) return null;
  const monthPadded = String(monthIndex + 1).padStart(2, '0');
  return `${year}-${monthPadded}-01`;
}

/**
 * Returns the numeric value, or null for the ONS missing-value sentinels ('' and '-').
 */
export function parseOnsValue(obs: OnsObservation): number | null {
  const trimmed = obs.value.trim();
  if (trimmed === '' || trimmed === '-') return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}
