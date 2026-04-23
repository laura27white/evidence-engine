/**
 * HMRC tax-policy signal for A048 Tax Policy.
 *
 * Returns a single ExternalSignal whose value is the count of HMRC policy papers since a
 * baseline date. Individual paper titles and links are attached to `revisionNote` so
 * downstream views can list them as annotations on the timeline.
 */
import { type ExternalSignal, type FetchResult } from '../../../common/types';
export interface FetchTaxPolicyOptions {
    /** Inclusive lower bound on `public_timestamp`, ISO 8601 date. */
    sinceDate: string;
}
export declare function fetchGovukTaxPolicy(options: FetchTaxPolicyOptions): Promise<FetchResult<ExternalSignal[]>>;
//# sourceMappingURL=tax-policy.d.ts.map