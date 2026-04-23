/**
 * gov.uk search API client.
 *
 * The search API returns a paginated result list plus a `total` count. For tax-policy
 * signalling we treat the count as the primary signal and attach the matched document
 * titles / URLs to `revisionNote` so reviewers can follow the trail.
 */
import { fetchJson } from '../../common/http';
import { err, ok } from '../../common/types';
import { govukSearchResponseSchema } from './schemas';
const GOVUK_SEARCH_ROOT = 'https://www.gov.uk/api/search.json';
export function buildGovukUrl(query) {
    const params = new URLSearchParams();
    params.append('filter_content_store_document_type', query.documentType);
    for (const org of query.organisations ?? []) {
        params.append('filter_organisations[]', org);
    }
    if (query.sinceDate) {
        params.append('filter_public_timestamp[from]', query.sinceDate);
    }
    params.append('order', '-public_timestamp');
    params.append('count', String(query.count ?? 100));
    return `${GOVUK_SEARCH_ROOT}?${params.toString()}`;
}
export async function fetchGovukSearch(query) {
    const url = buildGovukUrl(query);
    const response = await fetchJson(url);
    if (!response.ok) {
        return err(response.error);
    }
    const parsed = govukSearchResponseSchema.safeParse(response.body);
    if (!parsed.success) {
        return err({
            kind: 'SCHEMA',
            message: `gov.uk response failed schema validation: ${describeZodError(parsed.error)}`,
            cause: parsed.error,
            retryable: false,
            sourceUrl: url,
        });
    }
    return ok({ body: parsed.data, sourceUrl: url, fetchedAt: response.meta.fetchedAt });
}
function describeZodError(error) {
    return error.issues
        .slice(0, 5)
        .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
        .join('; ');
}
//# sourceMappingURL=client.js.map