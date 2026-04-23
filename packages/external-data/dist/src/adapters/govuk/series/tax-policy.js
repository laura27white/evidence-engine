/**
 * HMRC tax-policy signal for A048 Tax Policy.
 *
 * Returns a single ExternalSignal whose value is the count of HMRC policy papers since a
 * baseline date. Individual paper titles and links are attached to `revisionNote` so
 * downstream views can list them as annotations on the timeline.
 */
import { err, ok } from '../../../common/types';
import { fetchGovukSearch } from '../client';
const EXTERNAL_REF = 'GOVUK:hmrc-tax-policy-announcements';
const METRIC = 'HMRC policy papers since baseline';
const ORG_SLUG = 'hm-revenue-customs';
const DOCUMENT_TYPE = 'policy_paper';
export async function fetchGovukTaxPolicy(options) {
    const response = await fetchGovukSearch({
        documentType: DOCUMENT_TYPE,
        organisations: [ORG_SLUG],
        sinceDate: options.sinceDate,
        count: 100,
    });
    if (!response.ok) {
        return err(response.error);
    }
    const { body, sourceUrl, fetchedAt } = response.data;
    const revisionNote = body.results
        .slice(0, 20)
        .map((result) => `- ${result.title} https://www.gov.uk${result.link}`)
        .join('\n');
    const signal = {
        source: 'GOVUK',
        seriesId: 'hmrc-policy-papers',
        metric: METRIC,
        value: body.total,
        unit: 'count',
        asOf: new Date().toISOString().slice(0, 10),
        fetchedAt,
        sourceUrl,
        sourceTier: 1,
        provisional: false,
        isLeadingIndicator: false,
        externalRef: EXTERNAL_REF,
        ...(revisionNote.length > 0 ? { revisionNote } : {}),
    };
    return ok([signal]);
}
//# sourceMappingURL=tax-policy.js.map