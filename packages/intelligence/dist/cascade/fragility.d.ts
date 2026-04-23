/**
 * System fragility summary metrics.
 *
 * Per-node fragility is the sum of unit-drift impacts arriving from all sources,
 * normalised by the maximum observed fragility across nodes so the result lies in
 * [0, 1]. Global fragility is the mean of per-node fragility restricted to
 * downstream nodes (nodes with at least one inbound edge) to avoid inflating the
 * denominator with isolated source nodes.
 */
import { type CascadeGraph, type PropagateOptions, type SingleSourcePropagation, type SystemFragility } from './types';
export declare function computeSystemFragility(graph: CascadeGraph, allPairs?: Map<string, SingleSourcePropagation>, options?: PropagateOptions, nowOverride?: Date): SystemFragility;
//# sourceMappingURL=fragility.d.ts.map