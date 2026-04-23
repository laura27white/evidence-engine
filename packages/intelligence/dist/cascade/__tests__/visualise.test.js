import { describe, expect, it } from 'vitest';
import { buildGraph } from '../graph';
import { propagateFromSource } from '../propagate';
import { toCytoscapeData, toSankeyData } from '../visualise';
import { edge, node } from './fixtures';
describe('toSankeyData', () => {
    it('produces nodes and links for a single-source propagation', () => {
        const g = buildGraph([node('A'), node('B'), node('C')], [edge('A', 'B', 0.5), edge('B', 'C', 0.6)]);
        expect(g.ok).toBe(true);
        if (!g.ok)
            return;
        const prop = propagateFromSource(g.value, 'A');
        expect(prop.ok).toBe(true);
        if (!prop.ok)
            return;
        const sankey = toSankeyData(prop.value, g.value);
        expect(sankey.nodes.length).toBe(3);
        expect(sankey.links.length).toBe(2);
    });
});
describe('toCytoscapeData', () => {
    it('includes every node and edge', () => {
        const g = buildGraph([node('A'), node('B'), node('C')], [edge('A', 'B', 0.5), edge('B', 'C', 0.6)]);
        expect(g.ok).toBe(true);
        if (!g.ok)
            return;
        const cyto = toCytoscapeData(g.value);
        const nodeEls = cyto.elements.filter((e) => !('source' in e.data));
        const edgeEls = cyto.elements.filter((e) => 'source' in e.data);
        expect(nodeEls.length).toBe(3);
        expect(edgeEls.length).toBe(2);
    });
    it('marks highlighted elements when a source and reachable set are supplied', () => {
        const g = buildGraph([node('A'), node('B'), node('C')], [edge('A', 'B', 0.5), edge('B', 'C', 0.6)]);
        expect(g.ok).toBe(true);
        if (!g.ok)
            return;
        const cyto = toCytoscapeData(g.value, { sourceId: 'A', reachable: new Set(['B', 'C']) });
        for (const el of cyto.elements) {
            expect(el.data.highlighted).toBe(true);
        }
    });
});
//# sourceMappingURL=visualise.test.js.map