import { describe, expect, it, vi } from 'vitest';
import { writeSignals } from '../writer';
function makeClient(state) {
    return {
        from(_table) {
            const context = {
                _op: null,
                _payload: null,
                _filters: new Map(),
                select(_cols) {
                    context._op = 'select';
                    return context;
                },
                eq(col, value) {
                    context._filters.set(col, value);
                    return context;
                },
                async limit(_n) {
                    const key = `${String(context._filters.get('assumption_id'))}|${String(context._filters.get('measured_at'))}|${String(context._filters.get('external_data_ref'))}`;
                    if (state.existingKeys.has(key)) {
                        return { data: [{ id: 'existing' }], error: null };
                    }
                    return { data: [], error: null };
                },
                async insert(payload) {
                    state.inserted.push(payload);
                    return { error: null };
                },
            };
            return context;
        },
    };
}
function signal(overrides = {}) {
    return {
        source: 'ONS',
        seriesId: 'D7G7',
        metric: 'CPI',
        value: 2.5,
        unit: '% YoY',
        asOf: '2025-12-01',
        fetchedAt: '2026-04-22T00:00:00.000Z',
        sourceUrl: 'https://example',
        sourceTier: 1,
        provisional: false,
        isLeadingIndicator: false,
        externalRef: 'ONS:D7G7',
        ...overrides,
    };
}
describe('writeSignals', () => {
    it('inserts a row for each signal whose external_ref maps to an assumption', async () => {
        const state = { existingKeys: new Set(), inserted: [] };
        const client = makeClient(state);
        const result = await writeSignals(client, [signal(), signal({ asOf: '2025-11-01' })], {
            assumptionIdByRef: new Map([['ONS:D7G7', 'assumption-uuid']]),
        });
        expect(result.inserted).toBe(2);
        expect(result.skippedExisting).toBe(0);
        expect(result.skippedNoAssumption).toBe(0);
        expect(state.inserted).toHaveLength(2);
    });
    it('skips signals whose external_ref is not in the map', async () => {
        const state = { existingKeys: new Set(), inserted: [] };
        const client = makeClient(state);
        const result = await writeSignals(client, [signal({ externalRef: 'ONS:UNKNOWN' })], {
            assumptionIdByRef: new Map([['ONS:D7G7', 'assumption-uuid']]),
        });
        expect(result.inserted).toBe(0);
        expect(result.skippedNoAssumption).toBe(1);
        expect(state.inserted).toHaveLength(0);
    });
    it('skips rows that already exist, preserving append-only idempotency', async () => {
        const state = {
            existingKeys: new Set(['assumption-uuid|2025-12-01T00:00:00.000Z|ONS:D7G7 2025-12-01']),
            inserted: [],
        };
        const client = makeClient(state);
        const result = await writeSignals(client, [signal()], {
            assumptionIdByRef: new Map([['ONS:D7G7', 'assumption-uuid']]),
        });
        expect(result.inserted).toBe(0);
        expect(result.skippedExisting).toBe(1);
        expect(state.inserted).toHaveLength(0);
    });
    it('propagates lookup errors as thrown exceptions', async () => {
        const client = {
            from() {
                return {
                    select() {
                        return this;
                    },
                    eq() {
                        return this;
                    },
                    limit: vi.fn().mockResolvedValue({ data: null, error: { message: 'db down' } }),
                };
            },
        };
        await expect(writeSignals(client, [signal()], {
            assumptionIdByRef: new Map([['ONS:D7G7', 'assumption-uuid']]),
        })).rejects.toThrow(/db down/);
    });
});
//# sourceMappingURL=writer.test.js.map