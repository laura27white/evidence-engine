/**
 * ONS Beta API client. Returns a FetchResult over the raw timeseries document so
 * series-specific mappers can translate to ExternalSignal objects.
 */
import { type FetchResult } from '../../common/types';
import { type OnsTimeseries } from './schemas';
export interface OnsSeriesPath {
    /** CDID / series identifier e.g. 'D7G7'. */
    seriesId: string;
    /** Dataset slug as exposed on the Beta API, e.g. 'cpih01' for CPI. */
    dataset: string;
}
export declare function buildOnsUrl(path: OnsSeriesPath): string;
export declare function fetchOnsTimeseries(path: OnsSeriesPath): Promise<FetchResult<{
    body: OnsTimeseries;
    sourceUrl: string;
    fetchedAt: string;
}>>;
//# sourceMappingURL=client.d.ts.map