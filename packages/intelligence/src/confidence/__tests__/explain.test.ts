import { describe, expect, it } from 'vitest';

import { explainConfidence } from '../explain';
import { computeConfidence } from '../score';

const NOW = new Date('2026-04-22T00:00:00Z');

describe('explainConfidence', () => {
  it('is deterministic for the same inputs', () => {
    const score = computeConfidence({
      lastReviewDate: new Date(NOW.getTime() - 60 * 86_400_000),
      reviewCadenceDays: 90,
      sourceTier: 3,
      measurements: [],
      nowOverride: NOW,
    });
    expect(explainConfidence(score)).toBe(explainConfidence(score));
  });

  it('stays under 400 characters', () => {
    const score = computeConfidence({
      lastReviewDate: new Date(NOW.getTime() - 400 * 86_400_000),
      reviewCadenceDays: 90,
      sourceTier: 3,
      measurements: [],
      nowOverride: NOW,
    });
    expect(explainConfidence(score).length).toBeLessThanOrEqual(400);
  });

  it('omits em dashes', () => {
    const score = computeConfidence({
      lastReviewDate: new Date(NOW.getTime() - 10 * 86_400_000),
      reviewCadenceDays: 90,
      sourceTier: 1,
      measurements: [],
      nowOverride: NOW,
    });
    const text = explainConfidence(score);
    expect(text.includes('\u2014')).toBe(false);
  });
});
