/**
 * BoE Bank Rate (series IUDSOIA). Primary signal for A047 Interest Rates.
 *
 * Returns daily observations as ExternalSignal objects. The IADB uses `-99999` to mark
 * "no data"; any such row is dropped at the mapper level.
 */
import { err, ok } from '../../../common/types';
import { fetchBoeCsv } from '../client';
const SERIES_ID = 'IUDSOIA';
const EXTERNAL_REF = 'BOE:IUDSOIA';
const METRIC = 'Bank Rate (daily)';
const UNIT = '%';
export async function fetchBoeBankRate(options = {}) {
    const response = await fetchBoeCsv({
        seriesId: SERIES_ID,
        ...(options.fromDate !== undefined ? { fromDate: options.fromDate } : {}),
        ...(options.toDate !== undefined ? { toDate: options.toDate } : {}),
    });
    if (!response.ok) {
        return err(response.error);
    }
    const { rows, sourceUrl, fetchedAt } = response.data;
    const signals = [];
    for (const row of rows) {
        const asOf = parseIadbDate(row.date);
        if (!asOf)
            continue;
        const value = parseIadbValue(row.value);
        if (value === null)
            continue;
        signals.push({
            source: 'BOE',
            seriesId: SERIES_ID,
            metric: METRIC,
            value,
            unit: UNIT,
            asOf,
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
 * Parses IADB date strings ('DD MMM YYYY' or 'DD/MMM/YYYY') into ISO YYYY-MM-DD.
 */
export function parseIadbDate(raw) {
    const match = raw.trim().match(/^(\d{1,2})[\s/]([A-Za-z]{3})[\s/](\d{4})$/);
    if (!match)
        return null;
    const day = Number(match[1]);
    const monthAbbrev = match[2]?.toLowerCase() ?? '';
    const year = Number(match[3]);
    const months = {
        jan: 1,
        feb: 2,
        mar: 3,
        apr: 4,
        may: 5,
        jun: 6,
        jul: 7,
        aug: 8,
        sep: 9,
        oct: 10,
        nov: 11,
        dec: 12,
    };
    const month = months[monthAbbrev];
    if (!month || Number.isNaN(day) || Number.isNaN(year))
        return null;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
export function parseIadbValue(raw) {
    const trimmed = raw.trim();
    if (trimmed === '' || trimmed === '-99999' || trimmed === 'ND')
        return null;
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : null;
}
//# sourceMappingURL=bank-rate.js.map