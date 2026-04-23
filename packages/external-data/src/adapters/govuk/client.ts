/**
 * gov.uk search API client.
 *
 * The search API returns a paginated result list plus a `total` count. For tax-policy
 * signalling we treat the count as the primary signal and attach the matched document
 * titles / URLs to `revisionNote` so reviewers can follow the trail.
 */

import { fetchJson } from '../../common/http';
import { err, ok, type FetchResult } from '../../common/types';

import { govukSearchResponseSchema, type GovukSearchResponse } from './schemas';

import type { z } from 'zod';

const GOVUK_SEARCH_ROOT = 'https://www.gov.uk/api/search.json';

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

export function buildGovukUrl(query: GovukSearchQuery): string {
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

export async function fetchGovukSearch(
  query: GovukSearchQuery,
): Promise<FetchResult<{ body: GovukSearchResponse; sourceUrl: string; fetchedAt: string }>> {
  const url = buildGovukUrl(query);
  const response = await fetchJson<unknown>(url);
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

function describeZodError(error: z.ZodError): string {
  return error.issues
    .slice(0, 5)
    .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('; ');
}
