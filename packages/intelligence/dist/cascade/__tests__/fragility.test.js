import { describe, expect, it } from 'vitest';
import { computeSystemFragility } from '../fragility';
import { buildGraph } from '../graph';
import { edge, node } from './fixtures';
describe('computeSystemFragility', () => {
    it('identifies the top upstream driver on a chain', () => {
        const g = buildGraph([node('A'), node('B'), node('C'), node('D')], [edge('A', 'B', 0.8), edge('B', 'C', 0.8), edge('C', 'D', 0.8)]);
        expect(g.ok).toBe(true);
        if (!g.ok)
            return;
        const fragility = computeSystemFragility(g.value);
        expect(fragility.topUpstreamDrivers[0].id).toBe('A');
    });
    it('keeps every nodeFragility in [0, 1]', () => {
        const g = buildGraph([node('A'), node('B'), node('C'), node('D')], [edge('A', 'B', 0.5), edge('A', 'C', 0.5), edge('B', 'D', 0.5), edge('C', 'D', 0.5)]);
        expect(g.ok).toBe(true);
        if (!g.ok)
            return;
        const fragility = computeSystemFragility(g.value);
        for (const v of fragility.nodeFragility.values()) {
            expect(v).toBeGreaterThanOrEqual(0);
            expect(v).toBeLessThanOrEqual(1);
        }
        expect(fragility.globalFragilityScore).toBeGreaterThanOrEqual(0);
        expect(fragility.globalFragilityScore).toBeLessThanOrEqual(1);
    });
    it('yields zero global fragility on a graph with no edges', () => {
        const g = buildGraph([node('A'), node('B')], []);
        expect(g.ok).toBe(true);
        if (!g.ok)
            return;
        const fragility = computeSystemFragility(g.value);
        expect(fragility.globalFragilityScore).toBe(0);
    });
});
//# sourceMappingURL=fragility.test.js.map