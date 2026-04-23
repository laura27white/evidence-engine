/**
 * DAG construction, validation, and indexing.
 *
 * Errors are returned as Result values rather than thrown so that callers can present
 * graph-building failures to operators without an exception boundary. Cycle detection
 * uses Kahn's algorithm and reports the residual node set (the cycle path is surfaced
 * with a DFS walk).
 */

import {
  type CascadeEdge,
  type CascadeGraph,
  type AssumptionNode,
  type GraphError,
  type Result,
} from './types';

export function buildGraph(
  nodes: AssumptionNode[],
  edges: CascadeEdge[],
): Result<CascadeGraph, GraphError> {
  const nodeMap = new Map<string, AssumptionNode>();
  for (const n of nodes) nodeMap.set(n.id, n);

  const seen = new Set<string>();
  for (const e of edges) {
    if (e.sourceId === e.targetId) return { ok: false, error: { kind: 'SELF_LOOP', edge: e } };
    if (e.weight < 0 || e.weight > 1 || !Number.isFinite(e.weight)) {
      return { ok: false, error: { kind: 'WEIGHT_OUT_OF_RANGE', edge: e } };
    }
    if (!nodeMap.has(e.sourceId)) {
      return { ok: false, error: { kind: 'UNKNOWN_NODE', edge: e, missingId: e.sourceId } };
    }
    if (!nodeMap.has(e.targetId)) {
      return { ok: false, error: { kind: 'UNKNOWN_NODE', edge: e, missingId: e.targetId } };
    }
    const key = `${e.sourceId}->${e.targetId}`;
    if (seen.has(key)) return { ok: false, error: { kind: 'DUPLICATE_EDGE', edge: e } };
    seen.add(key);
  }

  const outgoing = new Map<string, CascadeEdge[]>();
  const incoming = new Map<string, CascadeEdge[]>();
  for (const n of nodes) {
    outgoing.set(n.id, []);
    incoming.set(n.id, []);
  }
  for (const e of edges) {
    outgoing.get(e.sourceId)!.push(e);
    incoming.get(e.targetId)!.push(e);
  }

  const cycle = detectCycle(nodeMap, outgoing);
  if (cycle !== null) return { ok: false, error: { kind: 'CYCLE', path: cycle } };

  return { ok: true, value: { nodes: nodeMap, edges, outgoing, incoming } };
}

function detectCycle(
  nodes: Map<string, AssumptionNode>,
  outgoing: Map<string, CascadeEdge[]>,
): string[] | null {
  const WHITE = 0;
  const GREY = 1;
  const BLACK = 2;
  const colour = new Map<string, number>();
  for (const id of nodes.keys()) colour.set(id, WHITE);

  let cyclePath: string[] | null = null;
  const stack: string[] = [];

  const visit = (id: string): boolean => {
    colour.set(id, GREY);
    stack.push(id);
    for (const edge of outgoing.get(id) ?? []) {
      const next = edge.targetId;
      if (colour.get(next) === GREY) {
        const startIdx = stack.indexOf(next);
        cyclePath = stack.slice(startIdx).concat(next);
        return true;
      }
      if (colour.get(next) === WHITE && visit(next)) return true;
    }
    stack.pop();
    colour.set(id, BLACK);
    return false;
  };

  for (const id of nodes.keys()) {
    if (colour.get(id) === WHITE && visit(id)) return cyclePath;
  }
  return null;
}

/**
 * Topological sort. Assumes the input is a DAG (callers are expected to have validated
 * via buildGraph). Returns node IDs in an order such that every edge goes from earlier
 * to later in the list.
 */
export function topologicalSort(graph: CascadeGraph): string[] {
  const inDegree = new Map<string, number>();
  for (const id of graph.nodes.keys()) {
    inDegree.set(id, graph.incoming.get(id)?.length ?? 0);
  }
  const queue: string[] = [];
  for (const [id, d] of inDegree) if (d === 0) queue.push(id);
  const order: string[] = [];
  while (queue.length > 0) {
    const id = queue.shift()!;
    order.push(id);
    for (const edge of graph.outgoing.get(id) ?? []) {
      const next = edge.targetId;
      const d = (inDegree.get(next) ?? 0) - 1;
      inDegree.set(next, d);
      if (d === 0) queue.push(next);
    }
  }
  return order;
}
