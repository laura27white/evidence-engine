/**
 * System fragility summary metrics.
 *
 * Per-node fragility is the sum of unit-drift impacts arriving from all sources,
 * normalised by the maximum observed fragility across nodes so the result lies in
 * [0, 1]. Global fragility is the mean of per-node fragility restricted to
 * downstream nodes (nodes with at least one inbound edge) to avoid inflating the
 * denominator with isolated source nodes.
 */
import { propagateAllPairs } from './propagate';
export function computeSystemFragility(graph, allPairs, options, nowOverride) {
    const effectivePairs = allPairs ?? unitDriftAllPairs(graph, options, nowOverride);
    const raw = new Map();
    for (const id of graph.nodes.keys())
        raw.set(id, 0);
    for (const [sourceId, prop] of effectivePairs) {
        for (const impact of prop.impacts) {
            if (impact.targetId === sourceId)
                continue;
            raw.set(impact.targetId, (raw.get(impact.targetId) ?? 0) + impact.expectedDriftScore);
        }
    }
    let max = 0;
    for (const v of raw.values())
        if (v > max)
            max = v;
    const normalised = new Map();
    for (const [id, v] of raw)
        normalised.set(id, max === 0 ? 0 : v / max);
    let downstreamSum = 0;
    let downstreamCount = 0;
    for (const [id, v] of normalised) {
        if ((graph.incoming.get(id)?.length ?? 0) > 0) {
            downstreamSum += v;
            downstreamCount += 1;
        }
    }
    const globalFragilityScore = downstreamCount === 0 ? 0 : downstreamSum / downstreamCount;
    const drivers = [];
    for (const [sourceId, prop] of effectivePairs) {
        const score = prop.impacts.reduce((acc, i) => acc + i.expectedDriftScore, 0);
        drivers.push({ id: sourceId, score });
    }
    drivers.sort((a, b) => b.score - a.score);
    return {
        nodeFragility: normalised,
        globalFragilityScore,
        topUpstreamDrivers: drivers,
        computedAt: nowOverride ?? new Date(),
    };
}
/**
 * Fragility is topology-only: every source contributes unit drift. We clone the node
 * map, force each driftScore to 1, then run propagation with those dummies.
 */
function unitDriftAllPairs(graph, options, nowOverride) {
    const unitNodes = new Map();
    for (const [id, n] of graph.nodes)
        unitNodes.set(id, { ...n, currentDriftScore: 1 });
    const unitGraph = {
        nodes: unitNodes,
        edges: graph.edges,
        outgoing: graph.outgoing,
        incoming: graph.incoming,
    };
    return propagateAllPairs(unitGraph, options, nowOverride);
}
//# sourceMappingURL=fragility.js.map