/**
 * BoE Bank Rate (series IUDSOIA). Primary signal for A047 Interest Rates.
 *
 * Returns daily observations as ExternalSignal objects. The IADB uses `-99999` to mark
 * "no data"; any such row is dropped at the mapper level.
 */
import { type ExternalSignal, type FetchResult } from '../../../common/types';
export interface FetchBankRateOptions {
    fromDate?: string;
    toDate?: string;
}
export declare function fetchBoeBankRate(options?: FetchBankRateOptions): Promise<FetchResult<ExternalSignal[]>>;
/**
 * Parses IADB date strings ('DD MMM YYYY' or 'DD/MMM/YYYY') into ISO YYYY-MM-DD.
 */
export declare function parseIadbDate(raw: string): string | null;
export declare function parseIadbValue(raw: string): number | null;
//# sourceMappingURL=bank-rate.d.ts.map