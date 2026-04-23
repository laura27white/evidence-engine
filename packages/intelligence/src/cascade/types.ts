/**
 * Cascade domain types. Pure; no I/O.
 */

export interface AssumptionNode {
  id: string;
  code: string;
  category: string;
  isExternal: boolean;
  /** Current drift score in [0, 1] for this node, fed in from forecast or measurement layer. */
  currentDriftScore: number;
}

export interface CascadeEdge {
  sourceId: string;
  targetId: string;
  /** Propagation coefficient in [0, 1]. */
  weight: number;
  rationale: string;
}

export interface CascadeGraph {
  nodes: Map<string, AssumptionNode>;
  edges: CascadeEdge[];
  outgoing: Map<string, CascadeEdge[]>;
  incoming: Map<string, CascadeEdge[]>;
}

export interface CascadePath {
  nodes: string[];
  weights: number[];
  pathProduct: number;
}

export interface CascadeImpact {
  sourceId: string;
  targetId: string;
  expectedDriftScore: number;
  paths: CascadePath[];
}

export interface SingleSourcePropagation {
  sourceId: string;
  sourceDriftScore: number;
  impacts: CascadeImpact[];
  totalDownstreamDrift: number;
  computedAt: Date;
}

export interface SystemFragility {
  nodeFragility: Map<string, number>;
  globalFragilityScore: number;
  topUpstreamDrivers: Array<{ id: string; score: number }>;
  computedAt: Date;
}

export interface PropagateOptions {
  /** Maximum traversal depth; default 6. */
  maxDepth?: number;
  /** Cumulative drift ceiling per target; default 1. */
  saturationCap?: number;
}

export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

export type GraphError =
  | { kind: 'SELF_LOOP'; edge: CascadeEdge }
  | { kind: 'DUPLICATE_EDGE'; edge: CascadeEdge }
  | { kind: 'WEIGHT_OUT_OF_RANGE'; edge: CascadeEdge }
  | { kind: 'UNKNOWN_NODE'; edge: CascadeEdge; missingId: string }
  | { kind: 'CYCLE'; path: string[] };

export type PropagationError = { kind: 'UNKNOWN_SOURCE'; sourceId: string };

export const DEFAULT_PROPAGATE_OPTIONS: Required<PropagateOptions> = {
  maxDepth: 6,
  saturationCap: 1,
};
