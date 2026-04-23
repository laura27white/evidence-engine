import { describe, expect, it } from 'vitest';

import { buildGraph } from '../graph';
import { propagateAllPairs, propagateFromSource } from '../propagate';

import { edge, node } from './fixtures';

describe('propagateFromSource', () => {
  it('propagates through a simple chain with the product of weights', () => {
    const g = buildGraph(
      [node('A'), node('B'), node('C')],
      [edge('A', 'B', 0.5), edge('B', 'C', 0.6)],
    );
    expect(g.ok).toBe(true);
    if (!g.ok) return;
    const result = propagateFromSource(g.value, 'A');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const impactB = result.value.impacts.find((i) => i.targetId === 'B')!;
    const impactC = result.value.impacts.find((i) => i.targetId === 'C')!;
    expect(impactB.expectedDriftScore).toBeCloseTo(0.5, 6);
    expect(impactC.expectedDriftScore).toBeCloseTo(0.3, 6);
  });

  it('sums across paths in a diamond with saturation', () => {
    const g = buildGraph(
      [node('A'), node('B'), node('C'), node('D')],
      [edge('A', 'B', 0.5), edge('A', 'C', 0.5), edge('B', 'D', 0.5), edge('C', 'D', 0.5)],
    );
    expect(g.ok).toBe(true);
    if (!g.ok) return;
    const result = propagateFromSource(g.value, 'A');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const impactD = result.value.impacts.find((i) => i.targetId === 'D')!;
    expect(impactD.expectedDriftScore).toBeCloseTo(0.5, 6);
    expect(impactD.paths.length).toBe(2);
  });

  it('caps cumulative drift at the saturation cap', () => {
    const g = buildGraph([node('A'), node('D')], [edge('A', 'D', 1)]);
    expect(g.ok).toBe(true);
    if (!g.ok) return;
    const src = g.value.nodes.get('A')!;
    src.currentDriftScore = 5;
    const result = propagateFromSource(g.value, 'A');
    expect(result.ok).toBe(true);
    if (result.ok) {
      const impact = result.value.impacts.find((i) => i.targetId === 'D')!;
      expect(impact.expectedDriftScore).toBeLessThanOrEqual(1);
    }
  });

  it('returns no impact entry for unreachable nodes', () => {
    const g = buildGraph([node('A'), node('B'), node('X')], [edge('A', 'B', 0.5)]);
    expect(g.ok).toBe(true);
    if (!g.ok) return;
    const result = propagateFromSource(g.value, 'A');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.impacts.find((i) => i.targetId === 'X')).toBeUndefined();
    }
  });

  it('errors on unknown source', () => {
    const g = buildGraph([node('A')], []);
    expect(g.ok).toBe(true);
    if (!g.ok) return;
    const result = propagateFromSource(g.value, 'Z');
    expect(result.ok).toBe(false);
  });
});

describe('propagateAllPairs', () => {
  it('produces one entry per node', () => {
    const g = buildGraph(
      [node('A'), node('B'), node('C')],
      [edge('A', 'B', 0.5), edge('B', 'C', 0.6)],
    );
    expect(g.ok).toBe(true);
    if (!g.ok) return;
    const result = propagateAllPairs(g.value);
    expect(result.size).toBe(3);
  });

  it('keeps every expectedDriftScore in [0, 1]', () => {
    const g = buildGraph(
      [node('A'), node('B'), node('C'), node('D')],
      [edge('A', 'B', 0.9), edge('A', 'C', 0.9), edge('B', 'D', 0.9), edge('C', 'D', 0.9)],
    );
    expect(g.ok).toBe(true);
    if (!g.ok) return;
    const all = propagateAllPairs(g.value);
    for (const prop of all.values()) {
      for (const impact of prop.impacts) {
        expect(impact.expectedDriftScore).toBeGreaterThanOrEqual(0);
        expect(impact.expectedDriftScore).toBeLessThanOrEqual(1);
      }
    }
  });
});
