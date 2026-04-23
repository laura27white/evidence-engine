import { describe, expect, it } from 'vitest';

import { generateFallbackNarrative } from '../fallback';

import type { NarrativeInput } from '../types';

function sampleInput(): NarrativeInput {
  return {
    project: {
      code: 'HPO24A01-DEMO',
      name: 'Nova Britannia Holographic Project Office',
      description: '',
    },
    computedAt: new Date('2026-04-23T06:00:00Z'),
    summary: {
      totalAssumptions: 47,
      breachingNow: 2,
      breachingWithin30d: 5,
      breachingWithin90d: 9,
      overallDriftScore: 0.42,
      globalFragility: 0.31,
      topDrivers: [{ code: 'A039', description: 'Inflation returns to target', driverScore: 1.23 }],
      mostAtRisk: [
        {
          code: 'A015',
          description: 'Supply chain costs within plan',
          leadTimeDays: 14,
          severity: 'critical',
          confidence: 'MODERATE',
        },
      ],
      externalSignals: [],
    },
  };
}

describe('generateFallbackNarrative', () => {
  it('emits three paragraphs separated by blank lines', () => {
    const narrative = generateFallbackNarrative(sampleInput());
    const paragraphs = narrative.split(/\n\n/);
    expect(paragraphs.length).toBe(3);
    for (const p of paragraphs) expect(p.length).toBeGreaterThan(0);
  });

  it('does not use em dashes', () => {
    const narrative = generateFallbackNarrative(sampleInput());
    expect(narrative.includes('\u2014')).toBe(false);
  });

  it('mentions the most-at-risk assumption code', () => {
    const narrative = generateFallbackNarrative(sampleInput());
    expect(narrative).toContain('A015');
  });

  it('handles an empty most-at-risk list with a stable sentence', () => {
    const input = sampleInput();
    input.summary.mostAtRisk = [];
    input.summary.topDrivers = [];
    input.summary.breachingNow = 0;
    input.summary.breachingWithin30d = 0;
    const narrative = generateFallbackNarrative(input);
    expect(narrative.toLowerCase()).toContain('no single assumption dominates');
  });

  it('is deterministic: same input yields the same output', () => {
    const a = generateFallbackNarrative(sampleInput());
    const b = generateFallbackNarrative(sampleInput());
    expect(a).toBe(b);
  });
});
