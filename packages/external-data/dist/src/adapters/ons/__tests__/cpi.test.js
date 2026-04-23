import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { buildOnsUrl } from '../client';
import { fetchOnsCpi, parseMonthDate, parseOnsValue } from '../series/cpi';
const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
const FIXTURE = {
    description: { title: 'CPI ANNUAL RATE', unit: '%', cdid: 'D7G7' },
    months: [
        { date: '2025 SEP', value: '2.6' },
        { date: '2025 OCT', value: '2.5' },
        { date: '2025 NOV', value: '' },
        { date: '2025 DEC', value: '2.7' },
        { date: 'bad row', value: '9' },
    ],
};
function mockOnsSuccess() {
    server.use(http.get(buildOnsUrl({ seriesId: 'D7G7', dataset: 'mm23' }), () => HttpResponse.json(FIXTURE)));
}
describe('parseMonthDate', () => {
    it('maps ONS month-codes to ISO YYYY-MM-01', () => {
        expect(parseMonthDate('2025 JAN')).toBe('2025-01-01');
        expect(parseMonthDate('2025 dec')).toBe('2025-12-01');
    });
    it('returns null for malformed dates', () => {
        expect(parseMonthDate('January 2025')).toBeNull();
        expect(parseMonthDate('2025-01')).toBeNull();
        expect(parseMonthDate('')).toBeNull();
        expect(parseMonthDate('2025 XYZ')).toBeNull();
    });
});
describe('parseOnsValue', () => {
    it('parses numeric strings', () => {
        expect(parseOnsValue({ date: '2025 JAN', value: '2.5' })).toBe(2.5);
        expect(parseOnsValue({ date: '2025 JAN', value: '0' })).toBe(0);
    });
    it('treats empty and dash as null', () => {
        expect(parseOnsValue({ date: '2025 JAN', value: '' })).toBeNull();
        expect(parseOnsValue({ date: '2025 JAN', value: '-' })).toBeNull();
        expect(parseOnsValue({ date: '2025 JAN', value: 'not a number' })).toBeNull();
    });
});
describe('fetchOnsCpi', () => {
    it('returns ExternalSignals for all parseable month rows, skipping blanks', async () => {
        mockOnsSuccess();
        const result = await fetchOnsCpi();
        expect(result.ok).toBe(true);
        if (!result.ok)
            return;
        expect(result.data).toHaveLength(3);
        expect(result.data[0]).toMatchObject({
            source: 'ONS',
            seriesId: 'D7G7',
            unit: '% YoY',
            sourceTier: 1,
            isLeadingIndicator: false,
            externalRef: 'ONS:D7G7',
        });
        expect(result.data.map((s) => s.asOf)).toEqual(['2025-09-01', '2025-10-01', '2025-12-01']);
        expect(result.data.every((s) => typeof s.value === 'number')).toBe(true);
    });
    it('filters observations by fromDate and toDate', async () => {
        mockOnsSuccess();
        const result = await fetchOnsCpi({ fromDate: '2025-10-01', toDate: '2025-11-30' });
        expect(result.ok).toBe(true);
        if (!result.ok)
            return;
        expect(result.data.map((s) => s.asOf)).toEqual(['2025-10-01']);
    });
    it('returns a SCHEMA error when the upstream payload is wrong shape', async () => {
        server.use(http.get(buildOnsUrl({ seriesId: 'D7G7', dataset: 'mm23' }), () => HttpResponse.json({ months: 'not-an-array' })));
        const result = await fetchOnsCpi();
        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.error.kind).toBe('SCHEMA');
        }
    });
    it('propagates HTTP errors from the client', async () => {
        server.use(http.get(buildOnsUrl({ seriesId: 'D7G7', dataset: 'mm23' }), () => HttpResponse.json({}, { status: 404 })));
        const result = await fetchOnsCpi();
        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.error.kind).toBe('NOT_FOUND');
        }
    });
});
//# sourceMappingURL=cpi.test.js.map