import { describe, expect, it } from 'vitest';
import { generateBrief } from '../generator';
import { PdaClient } from '../pda-client';
function makeInput() {
    return {
        project: { code: 'HPO24A01-DEMO', name: 'HPO', description: '' },
        computedAt: new Date('2026-04-23T06:00:00Z'),
        summary: {
            totalAssumptions: 47,
            breachingNow: 2,
            breachingWithin30d: 5,
            breachingWithin90d: 9,
            overallDriftScore: 0.4,
            globalFragility: 0.3,
            topDrivers: [{ code: 'A039', description: 'Inflation', driverScore: 1.2 }],
            mostAtRisk: [
                {
                    code: 'A015',
                    description: 'Supply chain',
                    leadTimeDays: 14,
                    severity: 'critical',
                    confidence: 'MODERATE',
                },
            ],
            externalSignals: [],
        },
    };
}
class InMemoryCache {
    rows = new Map();
    async lookup(key) {
        return this.rows.get(key) ?? null;
    }
    async store(brief) {
        this.rows.set(brief.cacheKey, brief);
    }
}
class StubPdaClient extends PdaClient {
    behaviour;
    constructor(behaviour) {
        super({ mcpUrl: 'https://invalid.invalid/sse' });
        this.behaviour = behaviour;
    }
    async generateNarrative() {
        return this.behaviour;
    }
}
describe('generateBrief', () => {
    it('returns a fallback brief when no client is provided', async () => {
        const brief = await generateBrief(makeInput(), { client: null });
        expect(brief.source).toBe('fallback');
        expect(brief.narrativeText.length).toBeGreaterThan(0);
    });
    it('uses a cached brief when available', async () => {
        const cache = new InMemoryCache();
        const first = await generateBrief(makeInput(), { client: null, cache });
        const second = await generateBrief(makeInput(), { client: null, cache });
        expect(second).toEqual(first);
        expect(cache.rows.size).toBe(1);
    });
    it('falls back when the PDA response fails validation', async () => {
        const client = new StubPdaClient({ ok: true, value: 'short' });
        const brief = await generateBrief(makeInput(), { client });
        expect(brief.source).toBe('fallback');
    });
    it('returns pda-platform source on a successful generation', async () => {
        const narrative = Array.from({ length: 100 }, (_, i) => `word${i}`).join(' ');
        const client = new StubPdaClient({ ok: true, value: narrative });
        const brief = await generateBrief(makeInput(), { client });
        expect(brief.source).toBe('pda-platform');
        expect(brief.narrativeText).toBe(narrative);
    });
});
//# sourceMappingURL=generator.test.js.map