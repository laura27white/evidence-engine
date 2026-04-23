import { describe, expect, it } from 'vitest';

import { computeConfidence } from '../score';

import type { Measurement } from '../../forecast/types';

const NOW = new Date('2026-04-22T00:00:00Z');

function stableMeasurements(n: number, value: number): Measurement[] {
  const out: Measurement[] = [];
  for (let i = 0; i < n; i += 1) {
    out.push({
      assumptionId: 'A',
      measuredAt: new Date(NOW.getTime() - i * 10 * 86_400_000),
      observedValue: value + (i % 2 === 0 ? 0.1 : -0.1),
      source: 'EXTERNAL_API',
    });
  }
  return out;
}

describe('computeConfidence', () => {
  it('scores 100 when every component is perfect', () => {
    const result = computeConfidence({
      lastReviewDate: new Date(NOW.getTime() - 10 * 86_400_000),
      reviewCadenceDays: 90,
      sourceTier: 1,
      measurements: stableMeasurements(6, 100),
      crossSourceValues: [
        { source: 'ONS', value: 100, asOf: NOW },
        { source: 'WorldBank', value: 100.1, asOf: NOW },
      ],
      nowOverride: NOW,
    });
    expect(result.score).toBeCloseTo(100, 0);
    expect(result.interpretation).toBe('HIGH');
  });

  it('redistributes weights when agreement is null', () => {
    const result = computeConfidence({
      lastReviewDate: new Date(NOW.getTime() - 10 * 86_400_000),
      reviewCadenceDays: 90,
      sourceTier: 1,
      measurements: stableMeasurements(6, 100),
      nowOverride: NOW,
    });
    const sum = result.weights.recency + result.weights.sourceTier + result.weights.volatility;
    expect(sum).toBeCloseTo(1, 6);
    expect(result.weights.agreement).toBe(0);
    expect(result.score).toBeCloseTo(100, 0);
  });

  it('returns LOW interpretation when the profile is poor', () => {
    const result = computeConfidence({
      lastReviewDate: new Date(NOW.getTime() - 1000 * 86_400_000),
      reviewCadenceDays: 90,
      sourceTier: 3,
      measurements: [],
      nowOverride: NOW,
    });
    expect(result.interpretation).toBe('LOW');
    expect(result.caveats.length).toBeGreaterThan(0);
  });

  it('orders caveats worst-first', () => {
    const result = computeConfidence({
      lastReviewDate: new Date(NOW.getTime() - 1000 * 86_400_000),
      reviewCadenceDays: 90,
      sourceTier: 3,
      measurements: [],
      nowOverride: NOW,
    });
    expect(result.caveats[0]).toMatch(/Last review/);
  });
});
