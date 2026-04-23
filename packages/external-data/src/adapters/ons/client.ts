/**
 * ONS Beta API client. Returns a FetchResult over the raw timeseries document so
 * series-specific mappers can translate to ExternalSignal objects.
 */

import { fetchJson } from '../../common/http';
import { err, ok, type FetchResult } from '../../common/types';

import { onsTimeseriesSchema, type OnsTimeseries } from './schemas';

import type { z } from 'zod';

const ONS_ROOT = 'https://api.beta.ons.gov.uk/v1';

export interface OnsSeriesPath {
  /** CDID / series identifier e.g. 'D7G7'. */
  seriesId: string;
  /** Dataset slug as exposed on the Beta API, e.g. 'cpih01' for CPI. */
  dataset: string;
}

export function buildOnsUrl(path: OnsSeriesPath): string {
  // ONS Beta exposes the observation list via
  //   /timeseries/{cdid}/dataset/{dataset}/data
  // The CDID goes lower-case in the URL per current ONS convention.
  const cdid = path.seriesId.toLowerCase();
  return `${ONS_ROOT}/timeseries/${encodeURIComponent(cdid)}/dataset/${encodeURIComponent(
    path.dataset,
  )}/data`;
}

export async function fetchOnsTimeseries(
  path: OnsSeriesPath,
): Promise<FetchResult<{ body: OnsTimeseries; sourceUrl: string; fetchedAt: string }>> {
  const url = buildOnsUrl(path);
  const response = await fetchJson<unknown>(url);
  if (!response.ok) {
    return err(response.error);
  }

  const parsed = onsTimeseriesSchema.safeParse(response.body);
  if (!parsed.success) {
    return err({
      kind: 'SCHEMA',
      message: `ONS response for ${path.seriesId} failed schema validation: ${describeZodError(parsed.error)}`,
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
