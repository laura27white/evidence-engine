import { describe, expect, it } from 'vitest';

import { buildGraph, topologicalSort } from '../graph';

import { edge, node } from './fixtures';

describe('buildGraph', () => {
  it('accepts an empty graph', () => {
    const result = buildGraph([], []);
    expect(result.ok).toBe(true);
  });

  it('rejects a self-loop', () => {
    const result = buildGraph([node('A')], [edge('A', 'A', 0.5)]);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.kind).toBe('SELF_LOOP');
  });

  it('rejects a duplicate edge', () => {
    const result = buildGraph([node('A'), node('B')], [edge('A', 'B', 0.5), edge('A', 'B', 0.4)]);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.kind).toBe('DUPLICATE_EDGE');
  });

  it('rejects an out-of-range weight', () => {
    const result = buildGraph([node('A'), node('B')], [edge('A', 'B', 1.5)]);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.kind).toBe('WEIGHT_OUT_OF_RANGE');
  });

  it('rejects an edge referencing an unknown node', () => {
    const result = buildGraph([node('A')], [edge('A', 'B', 0.5)]);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.kind).toBe('UNKNOWN_NODE');
  });

  it('rejects a cycle and reports the cycle path', () => {
    const result = buildGraph(
      [node('A'), node('B'), node('C')],
      [edge('A', 'B', 0.5), edge('B', 'C', 0.5), edge('C', 'A', 0.5)],
    );
    expect(result.ok).toBe(false);
    if (!result.ok && result.error.kind === 'CYCLE') {
      expect(result.error.path.length).toBeGreaterThan(2);
      expect(result.error.path[0]).toBe(result.error.path[result.error.path.length - 1]);
    }
  });
});

describe('topologicalSort', () => {
  it('orders a chain correctly', () => {
    const result = buildGraph(
      [node('A'), node('B'), node('C')],
      [edge('A', 'B', 0.5), edge('B', 'C', 0.5)],
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      const order = topologicalSort(result.value);
      expect(order.indexOf('A')).toBeLessThan(order.indexOf('B'));
      expect(order.indexOf('B')).toBeLessThan(order.indexOf('C'));
    }
  });
});
