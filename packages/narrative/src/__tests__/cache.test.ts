import { describe, expect, it } from 'vitest';

import { computeCacheKey } from '../cache';

import type { NarrativeInput } from '../types';

function base(): NarrativeInput {
  return {
    project: { code: 'HPO24A01-DEMO', name: 'HPO', description: '' },
    computedAt: new Date('2026-04-22T00:00:00Z'),
    summary: {
      totalAssumptions: 47,
      breachingNow: 2,
      breachingWithin30d: 5,
      breachingWithin90d: 9,
      overallDriftScore: 0.4123,
      globalFragility: 0.3123,
      topDrivers: [{ code: 'A039', description: 'Inflation', driverScore: 1.234 }],
      mostAtRisk: [
        {
          code: 'A015',
          description: 'Supply chain',
          leadTimeDays: 14,
          severity: 'critical',
          confidence: 'MODERATE',
        },
      ],
      externalSignals: [
        {
          code: 'A039',
          description: 'CPI',
          baselineValue: 2,
          currentValue: 2.9,
          driftPct: 45,
          lastRetrievedAt: new Date('2026-04-22T05:00:00Z'),
        },
      ],
    },
  };
}

describe('computeCacheKey', () => {
  it('returns a stable 16-character hex string', () => {
    const key = computeCacheKey(base());
    expect(key).toMatch(/^[0-9a-f]{16}$/);
  });

  it('ignores changes in computedAt', () => {
    const a = computeCacheKey(base());
    const modified = base();
    modified.computedAt = new Date('2030-01-01T00:00:00Z');
    expect(computeCacheKey(modified)).toBe(a);
  });

  it('changes when the summary changes', () => {
    const a = computeCacheKey(base());
    const modified = base();
    modified.summary.breachingNow = 3;
    expect(computeCacheKey(modified)).not.toBe(a);
  });

  it('is not perturbed by trivial floating-point noise below 0.001', () => {
    const a = computeCacheKey(base());
    const modified = base();
    modified.summary.overallDriftScore = 0.41231999999;
    expect(computeCacheKey(modified)).toBe(a);
  });
});
