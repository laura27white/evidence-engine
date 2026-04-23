import { describe, expect, it } from 'vitest';

import { layoutCascadeGraph } from '../CascadeGraph/helpers';
import { layoutSankey } from '../CascadeSankey/helpers';
import { horizonBarDescription } from '../HorizonChart/helpers';
import { linearScale, niceTicks, niceTimeTicks } from '../shared/scales';
import { describeTimeline, forecastEnvelope } from '../TraceTimeline/helpers';

describe('linearScale', () => {
  it('maps domain to range and inverts correctly', () => {
    const s = linearScale([0, 10], [0, 100]);
    expect(s(5)).toBe(50);
    expect(s.invert(75)).toBe(7.5);
  });
});

describe('niceTicks', () => {
  it('produces ascending evenly spaced ticks', () => {
    const ticks = niceTicks([0, 100], 5);
    expect(ticks.length).toBeGreaterThan(0);
    for (let i = 1; i < ticks.length; i += 1) expect(ticks[i]).toBeGreaterThan(ticks[i - 1]!);
  });
});

describe('niceTimeTicks', () => {
  it('spans the domain', () => {
    const ticks = niceTimeTicks([new Date('2026-01-01'), new Date('2026-06-01')], 6);
    expect(ticks.length).toBeGreaterThan(0);
  });
});

describe('forecastEnvelope', () => {
  it('returns one envelope point per 7-day step across 365 days', () => {
    const envelope = forecastEnvelope(
      {
        projected30d: 2,
        projected90d: 2.5,
        projected365d: 3.5,
        breachDate: null,
        confidenceIntervalLower: [1.8, 2.1, 2.8],
        confidenceIntervalUpper: [2.2, 2.9, 4.2],
        computedAt: new Date('2026-04-22'),
      },
      new Date('2026-04-22'),
    );
    expect(envelope.length).toBeGreaterThan(40);
    expect(envelope[0]!.lower).toBeLessThan(envelope[0]!.upper);
  });
});

describe('describeTimeline', () => {
  it('mentions breach date when present', () => {
    const prose = describeTimeline({
      code: 'A039',
      description: 'CPI inflation returns to target',
      baselineValue: 2,
      baselineUnit: '% YoY',
      tolerancePct: 25,
      measurementCount: 8,
      firstMeasuredAt: new Date('2025-01-01'),
      lastMeasuredAt: new Date('2026-04-01'),
      latestValue: 2.9,
      forecastBreachDate: new Date('2026-07-01'),
      leadTimeDays: 70,
    });
    expect(prose.toLowerCase()).toContain('breach');
  });
});

describe('horizonBarDescription', () => {
  it('includes severity, confidence, and lead time', () => {
    const prose = horizonBarDescription({
      assumptionId: 'a1',
      code: 'A039',
      description: 'CPI returns to target',
      leadTimeDays: 45,
      severity: 'warning',
      breachDate: null,
      confidence: 'MODERATE',
      category: 'Economic',
      driftScore: 0.4,
    });
    expect(prose).toContain('45 days');
    expect(prose.toLowerCase()).toContain('warning');
    expect(prose.toLowerCase()).toContain('moderate');
  });
});

describe('layoutSankey', () => {
  it('positions nodes by level and produces a cubic Bezier path for each link', () => {
    const layout = layoutSankey(
      [
        { id: 'a', code: 'A', level: 0, totalDrift: 1 },
        { id: 'b', code: 'B', level: 1, totalDrift: 0.5 },
      ],
      [{ sourceId: 'a', targetId: 'b', value: 0.5, pathDescription: 'a -> b' }],
      { width: 600, height: 300 },
    );
    expect(layout.nodes.length).toBe(2);
    expect(layout.links.length).toBe(1);
    expect(layout.links[0]!.path.startsWith('M ')).toBe(true);
    expect(layout.links[0]!.path).toMatch(/C /);
  });
});

describe('layoutCascadeGraph', () => {
  it('arranges nodes by category column', () => {
    const layout = layoutCascadeGraph(
      [
        { id: '1', code: 'A1', category: 'Economic', highlighted: false },
        { id: '2', code: 'A2', category: 'Operational', highlighted: true },
      ],
      [{ source: '1', target: '2', weight: 0.5, highlighted: true }],
      { width: 600, height: 300 },
    );
    expect(layout.nodes.length).toBe(2);
    expect(layout.edges.length).toBe(1);
  });
});
