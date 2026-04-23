import { describe, expect, it } from 'vitest';
import { HPO_CASCADE_LINKS } from '../scripts/hpo-cascade-links';
describe('HPO_CASCADE_LINKS', () => {
    it('has the expected shape for each entry', () => {
        for (const link of HPO_CASCADE_LINKS) {
            expect(link.source_code).toMatch(/^A\d{3,4}$/);
            expect(link.target_code).toMatch(/^A\d{3,4}$/);
            expect(typeof link.rationale).toBe('string');
            expect(link.rationale.length).toBeGreaterThan(20);
        }
    });
    it('carries weights in [0, 1]', () => {
        for (const link of HPO_CASCADE_LINKS) {
            expect(link.propagation_weight).toBeGreaterThanOrEqual(0);
            expect(link.propagation_weight).toBeLessThanOrEqual(1);
        }
    });
    it('has no self-loops', () => {
        for (const link of HPO_CASCADE_LINKS) {
            expect(link.source_code).not.toBe(link.target_code);
        }
    });
    it('has no duplicate (source, target) pairs', () => {
        const keys = new Set();
        for (const link of HPO_CASCADE_LINKS) {
            const key = `${link.source_code}->${link.target_code}`;
            expect(keys.has(key), `duplicate edge ${key}`).toBe(false);
            keys.add(key);
        }
    });
    it('sources edges only from the three externally-anchored assumptions', () => {
        const sources = new Set(HPO_CASCADE_LINKS.map((l) => l.source_code));
        expect([...sources].sort()).toEqual(['A046', 'A047', 'A048']);
    });
    it('has at least 10 downstream edges from A046 (primary case study)', () => {
        const a046Edges = HPO_CASCADE_LINKS.filter((l) => l.source_code === 'A046');
        expect(a046Edges.length).toBeGreaterThanOrEqual(10);
    });
    it('spans weights in the paper-relevant [0.3, 0.8] range', () => {
        const weights = HPO_CASCADE_LINKS.map((l) => l.propagation_weight);
        expect(Math.min(...weights)).toBeGreaterThanOrEqual(0.3);
        expect(Math.max(...weights)).toBeLessThanOrEqual(0.8);
    });
});
//# sourceMappingURL=hpo-cascade-links.test.js.map