import { describe, expect, it } from 'vitest';

import { breachCI, computeIterativeBreach, computeLinearBreach } from '../breach';
import { computeLeadTime } from '../leadtime';

import { FIXED_NOW, baseline } from './fixtures';

describe('computeLeadTime', () => {
  it('floors positive gaps to whole days', () => {
    const future = new Date(FIXED_NOW.getTime() + 42 * 86_400_000 + 1000);
    expect(computeLeadTime(future, FIXED_NOW)).toBe(42);
  });
  it('returns null when breachDate is null', () => {
    expect(computeLeadTime(null, FIXED_NOW)).toBeNull();
  });
  it('handles past breach dates by returning a negative number', () => {
    const past = new Date(FIXED_NOW.getTime() - 5 * 86_400_000);
    expect(computeLeadTime(past, FIXED_NOW)).toBeLessThanOrEqual(-5);
  });
});

describe('computeLinearBreach', () => {
  it('returns null when slope and intercept imply no crossing', () => {
    const result = computeLinearBreach(100, 0, baseline(100, 10), {
      horizonDays: 365,
      now: FIXED_NOW,
    });
    expect(result).toBeNull();
  });
  it('returns now when the starting value is already outside tolerance', () => {
    const result = computeLinearBreach(130, -0.1, baseline(100, 10), {
      horizonDays: 365,
      now: FIXED_NOW,
    });
    expect(result?.getTime()).toBeGreaterThanOrEqual(FIXED_NOW.getTime() - 86_400_000);
  });
});

describe('computeIterativeBreach', () => {
  it('finds the first h where projection crosses tolerance', () => {
    const result = computeIterativeBreach((h) => 100 + h, baseline(100, 10), {
      horizonDays: 365,
      now: FIXED_NOW,
    });
    expect(result).not.toBeNull();
    const days = Math.round((result!.getTime() - FIXED_NOW.getTime()) / 86_400_000);
    expect(days).toBeGreaterThanOrEqual(9);
    expect(days).toBeLessThanOrEqual(11);
  });
});

describe('breachCI', () => {
  it('returns null when breachDate is null or SE is invalid', () => {
    expect(breachCI(null, 10, { horizonDays: 365, now: FIXED_NOW })).toBeNull();
    expect(breachCI(new Date(), Number.NaN, { horizonDays: 365, now: FIXED_NOW })).toBeNull();
  });
  it('clamps the interval within [now, horizon]', () => {
    const b = new Date(FIXED_NOW.getTime() + 200 * 86_400_000);
    const ci = breachCI(b, 500, { horizonDays: 365, now: FIXED_NOW });
    expect(ci).not.toBeNull();
    expect(ci![0].getTime()).toBeGreaterThanOrEqual(FIXED_NOW.getTime());
    expect(ci![1].getTime()).toBeLessThanOrEqual(FIXED_NOW.getTime() + 365 * 86_400_000);
  });
});
