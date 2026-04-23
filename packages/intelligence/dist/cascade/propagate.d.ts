/**
 * Single-source and all-pairs propagation.
 *
 * Paths are enumerated with depth-limited DFS (all paths in a DAG are simple by
 * construction). Cumulative expected drift per target is summed across paths with a
 * saturation cap at 1 to honour the [0, 1] type invariant on drift scores.
 */
import { type CascadeGraph, type PropagateOptions, type PropagationError, type Result, type SingleSourcePropagation } from './types';
export declare function propagateFromSource(graph: CascadeGraph, sourceId: string, options?: PropagateOptions, nowOverride?: Date): Result<SingleSourcePropagation, PropagationError>;
export declare function propagateAllPairs(graph: CascadeGraph, options?: PropagateOptions, nowOverride?: Date): Map<string, SingleSourcePropagation>;
//# sourceMappingURL=propagate.d.ts.map