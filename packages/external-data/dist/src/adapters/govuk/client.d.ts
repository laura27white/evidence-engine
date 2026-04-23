/**
 * gov.uk search API client.
 *
 * The search API returns a paginated result list plus a `total` count. For tax-policy
 * signalling we treat the count as the primary signal and attach the matched document
 * titles / URLs to `revisionNote` so reviewers can follow the trail.
 */
import { type FetchResult } from '../../common/types';
import { type GovukSearchResponse } from './schemas';
export interface GovukSearchQuery {
    /** `policy_paper`, `consultation`, etc. */
    documentType: string;
    /** Filter by one or more organisation slugs. */
    organisations?: string[];
    /** Inclusive from-date for `public_timestamp`. ISO 8601 date. */
    sinceDate?: string;
    /** Max results per request; gov.uk caps at 1500. */
    count?: number;
}
export declare function buildGovukUrl(query: GovukSearchQuery): string;
export declare function fetchGovukSearch(query: GovukSearchQuery): Promise<FetchResult<{
    body: GovukSearchResponse;
    sourceUrl: string;
    fetchedAt: string;
}>>;
//# sourceMappingURL=client.d.ts.map