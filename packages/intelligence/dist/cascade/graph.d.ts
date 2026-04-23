/**
 * DAG construction, validation, and indexing.
 *
 * Errors are returned as Result values rather than thrown so that callers can present
 * graph-building failures to operators without an exception boundary. Cycle detection
 * uses Kahn's algorithm and reports the residual node set (the cycle path is surfaced
 * with a DFS walk).
 */
import { type CascadeEdge, type CascadeGraph, type AssumptionNode, type GraphError, type Result } from './types';
export declare function buildGraph(nodes: AssumptionNode[], edges: CascadeEdge[]): Result<CascadeGraph, GraphError>;
/**
 * Topological sort. Assumes the input is a DAG (callers are expected to have validated
 * via buildGraph). Returns node IDs in an order such that every edge goes from earlier
 * to later in the list.
 */
export declare function topologicalSort(graph: CascadeGraph): string[];
//# sourceMappingURL=graph.d.ts.map