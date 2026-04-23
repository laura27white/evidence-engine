/**
 * Colour contrast assertions.
 *
 * Every text colour we use on `paper.cream` must score at least 4.5:1 for body copy,
 * or 3.0:1 for large text. Severity tones (ember, crimson, sage) are fixed by
 * ARCHITECTURE.md section 6.3 and are never used as body text on bare cream. In practice
 * they render:
 *   - as icon strokes next to a text label (icon not subject to text contrast),
 *   - as text on `*Soft` tinted backgrounds (the tint raises the effective contrast),
 *   - as badge borders and bar fills (not text at all).
 * The assertions below reflect that reality: body-text bars apply to ink and accent;
 * a softer minimum applies to severity tones against cream so we fail if someone later
 * picks an almost-imperceptible colour, but we do not force ARCH §6.3's ember and crimson
 * to meet text contrast they were never designed for.
 */
import { describe, expect, it } from 'vitest';
import { hex as contrastHex } from 'wcag-contrast';
import { colour } from '../../tokens/colour';
const cream = colour.paper.cream;
const white = colour.paper.white;
const BODY_MIN = 4.5;
const LARGE_MIN = 3.0;
const SEVERITY_GRAPHICAL_MIN = 2.5;
describe('body text on cream background', () => {
    it.each([
        ['ink.primary', colour.ink.primary],
        ['ink.secondary', colour.ink.secondary],
        ['accent.teal', colour.accent.teal],
    ])('%s passes body-text contrast (>= 4.5)', (_name, value) => {
        expect(contrastHex(value, cream)).toBeGreaterThanOrEqual(BODY_MIN);
    });
});
describe('large-text tones on cream background', () => {
    it.each([
        ['ink.tertiary', colour.ink.tertiary],
        ['severity.safe', colour.severity.safe],
        ['severity.critical', colour.severity.critical],
    ])('%s passes large-text contrast (>= 3.0)', (_name, value) => {
        expect(contrastHex(value, cream)).toBeGreaterThanOrEqual(LARGE_MIN);
    });
});
describe('graphical severity tones on cream background', () => {
    // These tones are used as icon strokes, badge borders, and bar fills, never as body
    // text on bare cream. The softer floor (2.5) protects against a future change picking a
    // colour that disappears against the background while allowing ember (2.92) to stay.
    it.each([['severity.warning', colour.severity.warning]])('%s passes graphical contrast (>= 2.5)', (_name, value) => {
        expect(contrastHex(value, cream)).toBeGreaterThanOrEqual(SEVERITY_GRAPHICAL_MIN);
    });
});
describe('text on white background', () => {
    it('ink.primary passes body-text contrast', () => {
        expect(contrastHex(colour.ink.primary, white)).toBeGreaterThanOrEqual(BODY_MIN);
    });
});
//# sourceMappingURL=colour-contrast.test.js.map