import { describe, expect, it } from 'vitest';
import { computeAgreement } from '../components/agreement';
import { computeRecency } from '../components/recency';
import { computeSourceTier } from '../components/source-tier';
import { computeVolatility } from '../components/volatility';
const NOW = new Date('2026-04-22T00:00:00Z');
describe('computeRecency', () => {
    it('returns 100 when reviewed within cadence', () => {
        const reviewed = new Date(NOW.getTime() - 30 * 86_400_000);
        expect(computeRecency(reviewed, 90, NOW)).toBe(100);
    });
    it('returns 20 at d = 3c', () => {
        const reviewed = new Date(NOW.getTime() - 270 * 86_400_000);
        expect(computeRecency(reviewed, 90, NOW)).toBeCloseTo(20, 6);
    });
    it('decays exponentially beyond 3c without reaching zero', () => {
        const reviewed = new Date(NOW.getTime() - 900 * 86_400_000);
        const result = computeRecency(reviewed, 90, NOW);
        expect(result).toBeGreaterThan(0);
        expect(result).toBeLessThan(20);
    });
    it('returns 50 when no review date is known', () => {
        expect(computeRecency(null, 90, NOW)).toBe(50);
    });
    it('guards against zero cadence by returning 50', () => {
        expect(computeRecency(new Date(), 0, NOW)).toBe(50);
    });
});
describe('computeSourceTier', () => {
    it('maps tiers correctly', () => {
        expect(computeSourceTier(1)).toBe(100);
        expect(computeSourceTier(2)).toBe(70);
        expect(computeSourceTier(3)).toBe(40);
    });
});
describe('computeAgreement', () => {
    it('returns null with fewer than two values', () => {
        expect(computeAgreement(undefined)).toBeNull();
        expect(computeAgreement([{ source: 'A', value: 1, asOf: NOW }])).toBeNull();
    });
    it('returns 100 when values agree closely', () => {
        const agreement = computeAgreement([
            { source: 'A', value: 100, asOf: NOW },
            { source: 'B', value: 100.5, asOf: NOW },
        ]);
        expect(agreement).toBe(100);
    });
    it('returns 0 when values disagree by 20% or more', () => {
        const agreement = computeAgreement([
            { source: 'A', value: 80, asOf: NOW },
            { source: 'B', value: 120, asOf: NOW },
        ]);
        expect(agreement).toBe(0);
    });
});
describe('computeVolatility', () => {
    function measurement(daysAgo, value) {
        return {
            assumptionId: 'A',
            measuredAt: new Date(NOW.getTime() - daysAgo * 86_400_000),
            observedValue: value,
            source: 'EXTERNAL_API',
        };
    }
    it('returns 50 with fewer than three recent measurements', () => {
        expect(computeVolatility([measurement(10, 100), measurement(20, 101)], NOW)).toBe(50);
    });
    it('returns 100 for a low-variance series', () => {
        const ms = [100, 100.5, 100.2, 100.1, 100.3].map((v, i) => measurement(i * 10, v));
        expect(computeVolatility(ms, NOW)).toBe(100);
    });
    it('returns 0 for a high-variance series', () => {
        const ms = [100, 200, 50, 250, 80].map((v, i) => measurement(i * 10, v));
        expect(computeVolatility(ms, NOW)).toBe(0);
    });
});
//# sourceMappingURL=components.test.js.map