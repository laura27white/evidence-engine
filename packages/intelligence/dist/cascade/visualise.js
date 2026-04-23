/**
 * Pure data transformers for UI consumers. These functions do not import any
 * visualisation library; Prompt 8 renders the returned shapes.
 */
export function toSankeyData(propagation, graph) {
    const levels = new Map();
    levels.set(propagation.sourceId, 0);
    const pairSums = new Map();
    for (const impact of propagation.impacts) {
        for (const path of impact.paths) {
            for (let i = 0; i < path.nodes.length - 1; i += 1) {
                const from = path.nodes[i];
                const to = path.nodes[i + 1];
                const key = `${from}->${to}`;
                const contribution = path.pathProduct * propagation.sourceDriftScore;
                pairSums.set(key, (pairSums.get(key) ?? 0) + contribution);
                const nextLevel = (levels.get(from) ?? 0) + 1;
                if ((levels.get(to) ?? -Infinity) < nextLevel)
                    levels.set(to, nextLevel);
            }
        }
    }
    const nodes = [];
    for (const [id, level] of levels) {
        const node = graph.nodes.get(id);
        nodes.push({ id, label: node?.code ?? id, level });
    }
    const links = [];
    for (const [pair, value] of pairSums) {
        const [source, target] = pair.split('->');
        if (source !== undefined && target !== undefined) {
            links.push({ source, target, value });
        }
    }
    return { nodes, links };
}
export function toCytoscapeData(graph, highlight) {
    const elements = [];
    for (const node of graph.nodes.values()) {
        elements.push({
            data: {
                id: node.id,
                label: node.code,
                category: node.category,
                highlighted: highlight !== undefined &&
                    (node.id === highlight.sourceId || highlight.reachable.has(node.id)),
            },
        });
    }
    for (const edge of graph.edges) {
        const highlighted = highlight !== undefined &&
            (edge.sourceId === highlight.sourceId || highlight.reachable.has(edge.sourceId)) &&
            (edge.targetId === highlight.sourceId || highlight.reachable.has(edge.targetId));
        elements.push({
            data: {
                id: `${edge.sourceId}->${edge.targetId}`,
                source: edge.sourceId,
                target: edge.targetId,
                weight: edge.weight,
                highlighted,
            },
        });
    }
    return { elements };
}
//# sourceMappingURL=visualise.js.map