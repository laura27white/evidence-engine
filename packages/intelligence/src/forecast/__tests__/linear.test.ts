import { describe, expect, it } from 'vitest';

import { forecastLinear } from '../methods/linear';
import { ForecastInputError } from '../types';

import { FIXED_NOW, baseline, constantSeries, linearSeries } from './fixtures';

describe('forecastLinear', () => {
  it('recovers slope and intercept on a perfectly linear series', () => {
    const measurements = linearSeries({ n: 12, slope: 0.5, intercept: 100, startDaysAgo: 330 });
    const result = forecastLinear(measurements, baseline(100, 10), { nowOverride: FIXED_NOW });
    expect(result.degraded).toBe(false);
    const { slope, intercept } = result.modelParams as { slope: number; intercept: number };
    expect(slope).toBeCloseTo(0.5, 5);
    expect(intercept).toBeCloseTo(100, 5);
    expect(result.residualStdError).toBeLessThan(1e-6);
  });

  it('projects a breach date when the trend crosses tolerance within horizon', () => {
    const measurements = linearSeries({
      n: 8,
      slope: 0.1,
      intercept: 100,
      startDaysAgo: 90,
      cadenceDays: 12,
    });
    const result = forecastLinear(measurements, baseline(100, 10), { nowOverride: FIXED_NOW });
    expect(result.breachDate).not.toBeNull();
    expect(result.breachDate!.getTime()).toBeGreaterThanOrEqual(FIXED_NOW.getTime());
  });

  it('returns a flat degraded forecast when there are fewer than minMeasurementsRequired', () => {
    const measurements = linearSeries({ n: 3, slope: 0.5, intercept: 100, startDaysAgo: 60 });
    const result = forecastLinear(measurements, baseline(100, 10), { nowOverride: FIXED_NOW });
    expect(result.degraded).toBe(true);
    expect(result.residualStdError).toBe(Infinity);
    expect(result.projected30d).toBe(measurements[measurements.length - 1]!.observedValue);
  });

  it('handles constant series without spurious breach', () => {
    const measurements = constantSeries(10, 100);
    const result = forecastLinear(measurements, baseline(100, 10), { nowOverride: FIXED_NOW });
    expect(result.breachDate).toBeNull();
    expect(result.projected30d).toBeCloseTo(100, 5);
  });

  it('reports already-breached when a constant series lies outside tolerance', () => {
    const measurements = constantSeries(10, 130);
    const result = forecastLinear(measurements, baseline(100, 10), { nowOverride: FIXED_NOW });
    expect(result.breachDate).not.toBeNull();
  });

  it('rejects non-finite measurements rather than silently filtering', () => {
    const measurements = linearSeries({ n: 8, slope: 0.5, intercept: 100, startDaysAgo: 210 });
    measurements[3]!.observedValue = Number.NaN;
    expect(() => forecastLinear(measurements, baseline(), { nowOverride: FIXED_NOW })).toThrow(
      ForecastInputError,
    );
  });
});
