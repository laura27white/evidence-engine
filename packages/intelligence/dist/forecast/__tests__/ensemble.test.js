import { describe, expect, it } from 'vitest';
import { computeEnsembleAgreement, ensembleForecast } from '../ensemble';
import { FIXED_NOW, baseline, constantSeries, linearSeries } from './fixtures';
describe('ensembleForecast', () => {
    it('produces deterministic output for identical input (stable hash)', () => {
        const measurements = linearSeries({ n: 18, slope: 0.4, intercept: 100, startDaysAgo: 540 });
        const a = ensembleForecast(measurements, baseline(100, 15), { nowOverride: FIXED_NOW });
        const b = ensembleForecast(measurements, baseline(100, 15), { nowOverride: FIXED_NOW });
        expect(a.inputSeriesHash).toBe(b.inputSeriesHash);
        expect(a.projected90d).toBeCloseTo(b.projected90d, 10);
        expect(a.ensembleAgreement).toBeCloseTo(b.ensembleAgreement, 10);
    });
    it('keeps ensembleAgreement in [0, 1]', () => {
        const measurements = linearSeries({ n: 24, slope: 0.25, intercept: 100, startDaysAgo: 700 });
        const result = ensembleForecast(measurements, baseline(100, 15), { nowOverride: FIXED_NOW });
        expect(result.ensembleAgreement).toBeGreaterThanOrEqual(0);
        expect(result.ensembleAgreement).toBeLessThanOrEqual(1);
    });
    it('keeps leadTimeDays consistent with breachDate arithmetic', () => {
        const measurements = linearSeries({ n: 12, slope: 2.5, intercept: 100, startDaysAgo: 330 });
        const result = ensembleForecast(measurements, baseline(100, 10), { nowOverride: FIXED_NOW });
        if (result.breachDate !== null && result.leadTimeDays !== null) {
            const delta = Math.floor((result.breachDate.getTime() - FIXED_NOW.getTime()) / 86_400_000);
            expect(result.leadTimeDays).toBe(delta);
        }
        else {
            expect(result.leadTimeDays).toBeNull();
        }
    });
    it('returns null ensemble breachDate when fewer than two methods project a breach', () => {
        const measurements = constantSeries(24, 100);
        const result = ensembleForecast(measurements, baseline(100, 10), { nowOverride: FIXED_NOW });
        expect(result.breachDate).toBeNull();
        expect(result.leadTimeDays).toBeNull();
    });
});
describe('computeEnsembleAgreement', () => {
    it('is 1 when all methods agree perfectly', () => {
        const d = new Date(FIXED_NOW.getTime() + 120 * 86_400_000);
        const agreement = computeEnsembleAgreement([d, d, d], FIXED_NOW, 365);
        expect(agreement).toBeCloseTo(1, 10);
    });
    it('is less than 1 when methods disagree', () => {
        const a = new Date(FIXED_NOW.getTime() + 30 * 86_400_000);
        const b = new Date(FIXED_NOW.getTime() + 180 * 86_400_000);
        const c = new Date(FIXED_NOW.getTime() + 300 * 86_400_000);
        const agreement = computeEnsembleAgreement([a, b, c], FIXED_NOW, 365);
        expect(agreement).toBeGreaterThan(0);
        expect(agreement).toBeLessThan(1);
    });
    it('treats null breachDate as horizon-day for agreement purposes', () => {
        const d = new Date(FIXED_NOW.getTime() + 365 * 86_400_000);
        const agreement = computeEnsembleAgreement([d, null, null], FIXED_NOW, 365);
        expect(agreement).toBeCloseTo(1, 6);
    });
});
//# sourceMappingURL=ensemble.test.js.map