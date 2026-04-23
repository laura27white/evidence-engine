import { describe, expect, it } from 'vitest';
import { forecastEwma } from '../methods/ewma';
import { FIXED_NOW, baseline, linearSeries } from './fixtures';
describe('forecastEwma', () => {
    it('with alpha=1 degenerates to tracking the latest observation closely', () => {
        const measurements = linearSeries({ n: 12, slope: 0.3, intercept: 100, startDaysAgo: 330 });
        const result = forecastEwma(measurements, baseline(100, 15), {
            nowOverride: FIXED_NOW,
            alpha: 1,
            beta: 0,
        });
        const lastObs = measurements[measurements.length - 1].observedValue;
        expect(result.projected30d).toBeGreaterThanOrEqual(lastObs - 1);
    });
    it('produces a non-degraded forecast with six or more observations', () => {
        const measurements = linearSeries({ n: 8, slope: 0.2, intercept: 100, startDaysAgo: 210 });
        const result = forecastEwma(measurements, baseline(100, 10), { nowOverride: FIXED_NOW });
        expect(result.degraded).toBe(false);
        expect(result.residualStdError).toBeGreaterThanOrEqual(0);
        expect(Number.isFinite(result.projected90d)).toBe(true);
    });
    it('degrades honestly when below minimum measurements', () => {
        const measurements = linearSeries({ n: 3, slope: 0.2, intercept: 100, startDaysAgo: 60 });
        const result = forecastEwma(measurements, baseline(), { nowOverride: FIXED_NOW });
        expect(result.degraded).toBe(true);
    });
});
//# sourceMappingURL=ewma.test.js.map