import { type FetchResult } from '../../common/types';
export interface BoeSeriesPath {
    /** BoE series identifier, e.g. 'IUDSOIA' for the Bank Rate. */
    seriesId: string;
    /** Optional lower bound on observation date (DD/MMM/YYYY or ISO YYYY-MM-DD). */
    fromDate?: string;
    /** Optional upper bound on observation date. */
    toDate?: string;
}
export declare function buildBoeUrl(path: BoeSeriesPath): string;
export declare function fetchBoeCsv(path: BoeSeriesPath): Promise<FetchResult<{
    rows: Array<{
        date: string;
        value: string;
    }>;
    sourceUrl: string;
    fetchedAt: string;
}>>;
//# sourceMappingURL=client.d.ts.map