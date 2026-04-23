import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Wordmark: "PROJECT TRUEPLAN" typographic mark as SVG.
 *
 * Rendered as SVG so the identity does not depend on font loading timing and so the
 * wordmark looks identical across browsers. Colour variants follow ARCHITECTURE.md
 * section 6.2.
 */
import { forwardRef } from 'react';
import { colour } from '../../tokens/colour';
const fillFor = {
    ink: colour.ink.primary,
    inverse: colour.ink.inverse,
    accent: colour.accent.teal,
};
export const Wordmark = forwardRef(function Wordmark({ variant = 'ink', height = 24, title = 'Project Trueplan', ...rest }, ref) {
    const width = Math.round(height * 9.2);
    return (_jsxs("svg", { ref: ref, role: "img", "aria-label": title, viewBox: "0 0 460 50", height: height, width: width, xmlns: "http://www.w3.org/2000/svg", ...rest, children: [_jsx("title", { children: title }), _jsx("text", { x: 0, y: 35, fontFamily: "var(--font-display), 'Source Serif 4', Georgia, serif", fontWeight: 500, fontSize: 32, letterSpacing: "0.12em", style: { fontVariant: 'small-caps' }, fill: fillFor[variant], children: "Project Trueplan" })] }));
});
export const Monogram = forwardRef(function Monogram({ variant = 'ink', size = 32, title = 'PT', ...rest }, ref) {
    return (_jsxs("svg", { ref: ref, role: "img", "aria-label": title, viewBox: "0 0 32 32", width: size, height: size, xmlns: "http://www.w3.org/2000/svg", ...rest, children: [_jsx("title", { children: title }), _jsx("rect", { x: 0, y: 0, width: 32, height: 32, rx: 4, fill: variant === 'inverse' ? colour.ink.primary : colour.paper.cream }), _jsx("text", { x: "50%", y: "50%", fontFamily: "var(--font-display), 'Source Serif 4', Georgia, serif", fontWeight: 500, fontSize: 20, letterSpacing: "0.06em", style: { fontVariant: 'small-caps' }, dominantBaseline: "central", textAnchor: "middle", fill: fillFor[variant], children: "Pt" })] }));
});
//# sourceMappingURL=Wordmark.js.map