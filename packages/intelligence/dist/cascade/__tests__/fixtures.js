export function node(id, drift = 1, category = 'Economic') {
    return {
        id,
        code: id,
        category,
        isExternal: false,
        currentDriftScore: drift,
    };
}
export function edge(source, target, weight) {
    return {
        sourceId: source,
        targetId: target,
        weight,
        rationale: `${source} drives ${target} with coefficient ${weight}`,
    };
}
//# sourceMappingURL=fixtures.js.map