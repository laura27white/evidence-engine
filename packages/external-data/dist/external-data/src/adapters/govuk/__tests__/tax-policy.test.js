import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { buildGovukUrl, fetchGovukSearch } from '../client';
import { fetchGovukTaxPolicy } from '../series/tax-policy';
const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
function mockSuccess() {
    server.use(http.get('https://www.gov.uk/api/search.json', () => HttpResponse.json({
        total: 3,
        results: [
            { title: 'Policy A', link: '/government/publications/policy-a' },
            { title: 'Policy B', link: '/government/publications/policy-b' },
            { title: 'Policy C', link: '/government/publications/policy-c' },
        ],
    })));
}
describe('buildGovukUrl', () => {
    it('includes every required filter', () => {
        const url = buildGovukUrl({
            documentType: 'policy_paper',
            organisations: ['hm-revenue-customs'],
            sinceDate: '2025-06-01',
            count: 50,
        });
        expect(url).toContain('filter_content_store_document_type=policy_paper');
        expect(url).toContain('filter_organisations%5B%5D=hm-revenue-customs');
        expect(url).toContain('filter_public_timestamp%5Bfrom%5D=2025-06-01');
        expect(url).toContain('order=-public_timestamp');
        expect(url).toContain('count=50');
    });
});
describe('fetchGovukSearch', () => {
    it('returns the parsed body plus provenance on success', async () => {
        mockSuccess();
        const result = await fetchGovukSearch({ documentType: 'policy_paper', count: 10 });
        expect(result.ok).toBe(true);
        if (!result.ok)
            return;
        expect(result.data.body.total).toBe(3);
        expect(result.data.sourceUrl).toContain('api/search.json');
        expect(result.data.fetchedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
    it('returns a SCHEMA error when the payload is missing required fields', async () => {
        server.use(http.get('https://www.gov.uk/api/search.json', () => HttpResponse.json({ results: 'not-an-array' })));
        const result = await fetchGovukSearch({ documentType: 'policy_paper' });
        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.error.kind).toBe('SCHEMA');
        }
    });
});
describe('fetchGovukTaxPolicy', () => {
    it('returns a single ExternalSignal whose value is the total count', async () => {
        mockSuccess();
        const result = await fetchGovukTaxPolicy({ sinceDate: '2025-06-01' });
        expect(result.ok).toBe(true);
        if (!result.ok)
            return;
        expect(result.data).toHaveLength(1);
        const signal = result.data[0];
        expect(signal.source).toBe('GOVUK');
        expect(signal.value).toBe(3);
        expect(signal.unit).toBe('count');
        expect(signal.sourceTier).toBe(1);
        expect(signal.externalRef).toBe('GOVUK:hmrc-tax-policy-announcements');
        expect(signal.revisionNote).toContain('Policy A');
        expect(signal.revisionNote).toContain('https://www.gov.uk/government/publications/policy-a');
    });
    it('surfaces upstream HTTP errors without throwing', async () => {
        server.use(http.get('https://www.gov.uk/api/search.json', () => HttpResponse.json({}, { status: 500 })));
        const result = await fetchGovukTaxPolicy({ sinceDate: '2025-06-01' });
        expect(result.ok).toBe(false);
    });
});
//# sourceMappingURL=tax-policy.test.js.map