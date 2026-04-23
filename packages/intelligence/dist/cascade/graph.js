/**
 * DAG construction, validation, and indexing.
 *
 * Errors are returned as Result values rather than thrown so that callers can present
 * graph-building failures to operators without an exception boundary. Cycle detection
 * uses Kahn's algorithm and reports the residual node set (the cycle path is surfaced
 * with a DFS walk).
 */
export function buildGraph(nodes, edges) {
    const nodeMap = new Map();
    for (const n of nodes)
        nodeMap.set(n.id, n);
    const seen = new Set();
    for (const e of edges) {
        if (e.sourceId === e.targetId)
            return { ok: false, error: { kind: 'SELF_LOOP', edge: e } };
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
        if (seen.has(key))
            return { ok: false, error: { kind: 'DUPLICATE_EDGE', edge: e } };
        seen.add(key);
    }
    const outgoing = new Map();
    const incoming = new Map();
    for (const n of nodes) {
        outgoing.set(n.id, []);
        incoming.set(n.id, []);
    }
    for (const e of edges) {
        outgoing.get(e.sourceId).push(e);
        incoming.get(e.targetId).push(e);
    }
    const cycle = detectCycle(nodeMap, outgoing);
    if (cycle !== null)
        return { ok: false, error: { kind: 'CYCLE', path: cycle } };
    return { ok: true, value: { nodes: nodeMap, edges, outgoing, incoming } };
}
function detectCycle(nodes, outgoing) {
    const WHITE = 0;
    const GREY = 1;
    const BLACK = 2;
    const colour = new Map();
    for (const id of nodes.keys())
        colour.set(id, WHITE);
    let cyclePath = null;
    const stack = [];
    const visit = (id) => {
        colour.set(id, GREY);
        stack.push(id);
        for (const edge of outgoing.get(id) ?? []) {
            const next = edge.targetId;
            if (colour.get(next) === GREY) {
                const startIdx = stack.indexOf(next);
                cyclePath = stack.slice(startIdx).concat(next);
                return true;
            }
            if (colour.get(next) === WHITE && visit(next))
                return true;
        }
        stack.pop();
        colour.set(id, BLACK);
        return false;
    };
    for (const id of nodes.keys()) {
        if (colour.get(id) === WHITE && visit(id))
            return cyclePath;
    }
    return null;
}
/**
 * Topological sort. Assumes the input is a DAG (callers are expected to have validated
 * via buildGraph). Returns node IDs in an order such that every edge goes from earlier
 * to later in the list.
 */
export function topologicalSort(graph) {
    const inDegree = new Map();
    for (const id of graph.nodes.keys()) {
        inDegree.set(id, graph.incoming.get(id)?.length ?? 0);
    }
    const queue = [];
    for (const [id, d] of inDegree)
        if (d === 0)
            queue.push(id);
    const order = [];
    while (queue.length > 0) {
        const id = queue.shift();
        order.push(id);
        for (const edge of graph.outgoing.get(id) ?? []) {
            const next = edge.targetId;
            const d = (inDegree.get(next) ?? 0) - 1;
            inDegree.set(next, d);
            if (d === 0)
                queue.push(next);
        }
    }
    return order;
}
//# sourceMappingURL=graph.js.map