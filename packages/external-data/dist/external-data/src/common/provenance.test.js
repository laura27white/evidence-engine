import { describe, expect, it } from 'vitest';
import { hashPayload } from './provenance';
describe('hashPayload', () => {
    it('produces a deterministic SHA-256 hex for string input', () => {
        expect(hashPayload('hello')).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
    });
    it('produces the same hash for equivalent object and stringified forms', () => {
        const obj = { a: 1, b: [2, 3] };
        expect(hashPayload(obj)).toBe(hashPayload(JSON.stringify(obj)));
    });
    it('distinguishes different payloads', () => {
        expect(hashPayload('a')).not.toBe(hashPayload('b'));
    });
    it('handles Uint8Array input', () => {
        const bytes = new Uint8Array([104, 101, 108, 108, 111]);
        expect(hashPayload(bytes)).toBe(hashPayload('hello'));
    });
});
//# sourceMappingURL=provenance.test.js.map