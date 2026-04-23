/**
 * ONS CPI all items 12-month rate (series D7G7). Primary signal for A046 Inflation.
 *
 * Returns monthly observations as `ExternalSignal` objects. Missing values (represented
 * as '' or '-' in the ONS payload) are skipped rather than returned as zero; the domain
 * semantics of "no observation" and "observation of zero" are distinct.
 */
import { type ExternalSignal, type FetchResult } from '../../../common/types';
import type { OnsObservation } from '../schemas';
export interface FetchCpiOptions {
    /** Inclusive lower bound on observation date (ISO YYYY-MM-DD). */
    fromDate?: string;
    /** Inclusive upper bound on observation date. */
    toDate?: string;
}
export declare function fetchOnsCpi(options?: FetchCpiOptions): Promise<FetchResult<ExternalSignal[]>>;
/**
 * ONS monthly observation dates look like "2025 JAN" or "2025 Jan". Returns
 * canonical ISO YYYY-MM-01 so we can index and range-filter without parsing again.
 */
export declare function parseMonthDate(raw: string): string | null;
/**
 * Returns the numeric value, or null for the ONS missing-value sentinels ('' and '-').
 */
export declare function parseOnsValue(obs: OnsObservation): number | null;
//# sourceMappingURL=cpi.d.ts.map