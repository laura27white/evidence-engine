import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { buildBoeUrl } from '../client';
import { fetchBoeBankRate, parseIadbDate, parseIadbValue } from '../series/bank-rate';
const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
const CSV_SAMPLE = `DATE,IUDSOIA
01 Jan 2025,5.25
02 Jan 2025,5.25
03 Jan 2025,
04 Jan 2025,-99999
05 Jan 2025,5.00
`;
function mockBoeSuccess() {
    server.use(http.get('https://www.bankofengland.co.uk/boeapps/iadb/fromshowcolumns.asp', () => HttpResponse.text(CSV_SAMPLE)));
}
describe('parseIadbDate', () => {
    it('converts DD MMM YYYY to ISO', () => {
        expect(parseIadbDate('01 Jan 2025')).toBe('2025-01-01');
        expect(parseIadbDate('15 DEC 2025')).toBe('2025-12-15');
        expect(parseIadbDate('15/Dec/2025')).toBe('2025-12-15');
    });
    it('returns null for malformed dates', () => {
        expect(parseIadbDate('2025-01-01')).toBeNull();
        expect(parseIadbDate('')).toBeNull();
        expect(parseIadbDate('15 XYZ 2025')).toBeNull();
    });
});
describe('parseIadbValue', () => {
    it('parses numbers and filters sentinels', () => {
        expect(parseIadbValue('5.25')).toBe(5.25);
        expect(parseIadbValue('0')).toBe(0);
        expect(parseIadbValue('')).toBeNull();
        expect(parseIadbValue('-99999')).toBeNull();
        expect(parseIadbValue('ND')).toBeNull();
        expect(parseIadbValue('abc')).toBeNull();
    });
});
describe('fetchBoeBankRate', () => {
    it('returns ExternalSignals for valid rows and drops missing values', async () => {
        mockBoeSuccess();
        const result = await fetchBoeBankRate();
        expect(result.ok).toBe(true);
        if (!result.ok)
            return;
        expect(result.data).toHaveLength(3);
        expect(result.data[0]).toMatchObject({
            source: 'BOE',
            seriesId: 'IUDSOIA',
            unit: '%',
            sourceTier: 1,
            externalRef: 'BOE:IUDSOIA',
            isLeadingIndicator: false,
        });
        expect(result.data.map((s) => s.asOf)).toEqual(['2025-01-01', '2025-01-02', '2025-01-05']);
    });
    it('returns a SCHEMA error when the CSV has no data rows', async () => {
        server.use(http.get('https://www.bankofengland.co.uk/boeapps/iadb/fromshowcolumns.asp', () => HttpResponse.text('DATE,IUDSOIA\n')));
        const result = await fetchBoeBankRate();
        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.error.kind).toBe('SCHEMA');
        }
    });
    it('exposes the upstream URL for reproducibility', () => {
        const url = buildBoeUrl({ seriesId: 'IUDSOIA', fromDate: '2025-01-01', toDate: '2025-01-05' });
        expect(url).toContain('SeriesCodes=IUDSOIA');
        expect(url).toContain('CSVF=TN');
    });
});
//# sourceMappingURL=bank-rate.test.js.map