/**
 * Single-source and all-pairs propagation.
 *
 * Paths are enumerated with depth-limited DFS (all paths in a DAG are simple by
 * construction). Cumulative expected drift per target is summed across paths with a
 * saturation cap at 1 to honour the [0, 1] type invariant on drift scores.
 */
import { DEFAULT_PROPAGATE_OPTIONS, } from './types';
export function propagateFromSource(graph, sourceId, options = {}, nowOverride) {
    if (!graph.nodes.has(sourceId)) {
        return { ok: false, error: { kind: 'UNKNOWN_SOURCE', sourceId } };
    }
    const maxDepth = options.maxDepth ?? DEFAULT_PROPAGATE_OPTIONS.maxDepth;
    const saturationCap = options.saturationCap ?? DEFAULT_PROPAGATE_OPTIONS.saturationCap;
    const source = graph.nodes.get(sourceId);
    const sourceDrift = clamp01(source.currentDriftScore);
    const pathsByTarget = new Map();
    const stack = { nodes: [sourceId], weights: [] };
    dfs(graph, sourceId, stack, pathsByTarget, maxDepth);
    const impacts = [];
    for (const [targetId, paths] of pathsByTarget) {
        paths.sort((a, b) => b.pathProduct - a.pathProduct);
        const summed = paths.reduce((acc, p) => acc + p.pathProduct * sourceDrift, 0);
        impacts.push({
            sourceId,
            targetId,
            expectedDriftScore: Math.min(saturationCap, summed),
            paths,
        });
    }
    impacts.sort((a, b) => b.expectedDriftScore - a.expectedDriftScore);
    const total = impacts.reduce((acc, i) => acc + i.expectedDriftScore, 0);
    return {
        ok: true,
        value: {
            sourceId,
            sourceDriftScore: sourceDrift,
            impacts,
            totalDownstreamDrift: total,
            computedAt: nowOverride ?? new Date(),
        },
    };
}
export function propagateAllPairs(graph, options = {}, nowOverride) {
    const out = new Map();
    for (const id of graph.nodes.keys()) {
        const result = propagateFromSource(graph, id, options, nowOverride);
        if (result.ok)
            out.set(id, result.value);
    }
    return out;
}
function dfs(graph, current, stack, out, maxDepth) {
    if (stack.nodes.length - 1 >= maxDepth)
        return;
    for (const edge of graph.outgoing.get(current) ?? []) {
        const next = edge.targetId;
        if (stack.nodes.includes(next))
            continue;
        stack.nodes.push(next);
        stack.weights.push(edge.weight);
        const product = stack.weights.reduce((acc, w) => acc * w, 1);
        const path = {
            nodes: [...stack.nodes],
            weights: [...stack.weights],
            pathProduct: product,
        };
        const existing = out.get(next) ?? [];
        existing.push(path);
        out.set(next, existing);
        dfs(graph, next, stack, out, maxDepth);
        stack.nodes.pop();
        stack.weights.pop();
    }
}
function clamp01(v) {
    if (!Number.isFinite(v))
        return 0;
    return Math.max(0, Math.min(1, v));
}
//# sourceMappingURL=propagate.js.map