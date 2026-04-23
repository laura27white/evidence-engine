/**
 * Bank of England Interactive Database (IADB) client.
 *
 * The IADB returns CSV. The URL template below is the current (2026-04) shape for the
 * `csv=yes` export; see METHODOLOGY.md for the full parameter list. Missing observations
 * are empty strings or `-99999`; rows failing either filter are dropped by the mapper.
 */
import { parse } from 'csv-parse/sync';
import { fetchText } from '../../common/http';
import { err, ok } from '../../common/types';
const BOE_ROOT = 'https://www.bankofengland.co.uk/boeapps/iadb/fromshowcolumns.asp';
export function buildBoeUrl(path) {
    const params = new URLSearchParams({
        csv: 'yes',
        Datefrom: isoToIadbDate(path.fromDate ?? '01/Jan/1990'),
        Dateto: isoToIadbDate(path.toDate ?? 'now'),
        SeriesCodes: path.seriesId,
        UsingCodes: 'Y',
        VPD: 'Y',
        VFD: 'N',
        CSVF: 'TN',
    });
    return `${BOE_ROOT}?${params.toString()}`;
}
export async function fetchBoeCsv(path) {
    const url = buildBoeUrl(path);
    const response = await fetchText(url);
    if (!response.ok) {
        return err(response.error);
    }
    let records;
    try {
        records = parse(response.body, {
            columns: false,
            skip_empty_lines: true,
            relax_column_count: true,
        });
    }
    catch (cause) {
        return err({
            kind: 'SCHEMA',
            message: `Could not parse BoE CSV: ${cause instanceof Error ? cause.message : String(cause)}`,
            cause,
            retryable: false,
            sourceUrl: url,
        });
    }
    if (records.length < 2) {
        return err({
            kind: 'SCHEMA',
            message: 'BoE CSV returned no data rows',
            retryable: false,
            sourceUrl: url,
        });
    }
    const [header, ...dataRows] = records;
    if (!header || header.length < 2) {
        return err({
            kind: 'SCHEMA',
            message: 'BoE CSV header is missing expected columns',
            retryable: false,
            sourceUrl: url,
        });
    }
    const rows = [];
    for (const row of dataRows) {
        if (row.length < 2)
            continue;
        const date = (row[0] ?? '').trim();
        const value = (row[1] ?? '').trim();
        if (!date)
            continue;
        rows.push({ date, value });
    }
    return ok({ rows, sourceUrl: url, fetchedAt: response.meta.fetchedAt });
}
function isoToIadbDate(input) {
    if (input === 'now') {
        const today = new Date();
        return toDdMmmYyyy(today);
    }
    if (/^\d{2}\/[A-Za-z]{3}\/\d{4}$/.test(input))
        return input;
    const parsed = new Date(input);
    if (Number.isNaN(parsed.getTime()))
        return input;
    return toDdMmmYyyy(parsed);
}
function toDdMmmYyyy(date) {
    const day = String(date.getUTCDate()).padStart(2, '0');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getUTCMonth()] ?? 'Jan';
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
}
//# sourceMappingURL=client.js.map