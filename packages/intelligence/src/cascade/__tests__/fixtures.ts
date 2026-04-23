import type { AssumptionNode, CascadeEdge } from '../types';

export function node(id: string, drift = 1, category = 'Economic'): AssumptionNode {
  return {
    id,
    code: id,
    category,
    isExternal: false,
    currentDriftScore: drift,
  };
}

export function edge(source: string, target: string, weight: number): CascadeEdge {
  return {
    sourceId: source,
    targetId: target,
    weight,
    rationale: `${source} drives ${target} with coefficient ${weight}`,
  };
}
