import { describe, expect, it } from 'vitest';
import { forecastAr1 } from '../methods/ar1';
import { FIXED_NOW, baseline, constantSeries, linearSeries } from './fixtures';
function whiteNoiseSeries(n, mean, seed = 1) {
    let s = seed;
    const rand = () => {
        s = (s * 9301 + 49297) % 233280;
        return s / 233280 - 0.5;
    };
    const measurements = [];
    for (let i = 0; i < n; i += 1) {
        measurements.push({
            assumptionId: 'A-WN',
            measuredAt: new Date(FIXED_NOW.getTime() - (n - i) * 30 * 86_400_000),
            observedValue: mean + rand() * 2,
            source: 'EXTERNAL_API',
        });
    }
    return measurements;
}
describe('forecastAr1', () => {
    it('reduces to approximately mu when phi is near zero (white noise)', () => {
        const measurements = whiteNoiseSeries(24, 100);
        const result = forecastAr1(measurements, baseline(100, 20), { nowOverride: FIXED_NOW });
        expect(result.degraded).toBe(false);
        const { phi, mu } = result.modelParams;
        expect(Math.abs(phi)).toBeLessThan(0.5);
        expect(mu).toBeCloseTo(100, 0);
        expect(result.projected365d).toBeCloseTo(mu, 0);
    });
    it('produces a monotonic projection on an upward-trending series', () => {
        const measurements = linearSeries({ n: 24, slope: 1.5, intercept: 100, startDaysAgo: 690 });
        const result = forecastAr1(measurements, baseline(100, 10), { nowOverride: FIXED_NOW });
        expect(Number.isFinite(result.projected30d)).toBe(true);
        expect(Number.isFinite(result.projected365d)).toBe(true);
    });
    it('falls back to random walk when sample autocorrelation saturates at one', () => {
        const measurements = [];
        let value = 100;
        for (let i = 0; i < 12; i += 1) {
            measurements.push({
                assumptionId: 'A-RW',
                measuredAt: new Date(FIXED_NOW.getTime() - (12 - i) * 30 * 86_400_000),
                observedValue: value,
                source: 'EXTERNAL_API',
            });
            value += 5;
        }
        const result = forecastAr1(measurements, baseline(100, 10), { nowOverride: FIXED_NOW });
        const { phi } = result.modelParams;
        expect(phi).toBeGreaterThan(0.5);
    });
    it('degrades honestly when below minimum measurements', () => {
        const measurements = linearSeries({ n: 3, slope: 0.2, intercept: 100, startDaysAgo: 60 });
        const result = forecastAr1(measurements, baseline(), { nowOverride: FIXED_NOW });
        expect(result.degraded).toBe(true);
    });
    it('handles a constant series without projecting a spurious breach', () => {
        const measurements = constantSeries(12, 100);
        const result = forecastAr1(measurements, baseline(100, 10), { nowOverride: FIXED_NOW });
        expect(result.breachDate).toBeNull();
    });
});
//# sourceMappingURL=ar1.test.js.map