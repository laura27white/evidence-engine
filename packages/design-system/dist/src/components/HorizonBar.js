import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * HorizonBar: the primitive for the Horizon view.
 *
 * A horizontal bar representing a 12-month horizon from `today` into the future. The
 * bar carries four visual elements:
 *   1. A coloured severity segment from the start of the horizon to `currentPosition`
 *      (0..1), showing drift accumulated to date.
 *   2. A dashed extension to the right of `currentPosition` showing the forecast cone.
 *   3. A vertical tick at `projectedBreach` (0..1 or null) marking the projected breach
 *      date.
 *   4. An accessible long-form description in an adjacent `<span>` so screen readers
 *      receive the full data rather than just the bar.
 */
import { forwardRef } from 'react';
import { colour } from '../../tokens/colour';
import { space } from '../../tokens/space';
function clamp(n) {
    return Math.min(1, Math.max(0, n));
}
const severityTone = {
    safe: colour.severity.safe,
    safeSoft: colour.severity.safeSoft,
    warning: colour.severity.warning,
    warningSoft: colour.severity.warningSoft,
    critical: colour.severity.critical,
    criticalSoft: colour.severity.criticalSoft,
};
export const HorizonBar = forwardRef(function HorizonBar({ currentPosition, projectedBreach, severity, horizonLabel = '12 months', description, style, ...rest }, ref) {
    const fillFrac = clamp(currentPosition);
    const breachFrac = projectedBreach === null || projectedBreach === undefined ? null : clamp(projectedBreach);
    const fillColour = severityTone[severity];
    const softKey = (severity + 'Soft');
    const softColour = severityTone[softKey] ?? colour.line.hairline;
    return (_jsxs("div", { ref: ref, style: {
            position: 'relative',
            width: '100%',
            ...style,
        }, ...rest, children: [_jsxs("div", { role: "img", "aria-label": description, style: {
                    position: 'relative',
                    width: '100%',
                    height: '20px',
                    background: softColour,
                    border: `1px solid ${colour.line.hairline}`,
                    borderRadius: space.radius.sm,
                    overflow: 'hidden',
                }, children: [_jsx("div", { style: {
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            height: '100%',
                            width: `${fillFrac * 100}%`,
                            background: fillColour,
                            transition: 'width 250ms ease-out',
                        } }), _jsx("div", { style: {
                            position: 'absolute',
                            top: 0,
                            left: `${fillFrac * 100}%`,
                            height: '100%',
                            width: `${(1 - fillFrac) * 100}%`,
                            background: `repeating-linear-gradient(90deg, ${fillColour}55 0 4px, transparent 4px 8px)`,
                        } }), breachFrac !== null ? (_jsx("div", { "aria-hidden": true, style: {
                            position: 'absolute',
                            top: '-4px',
                            bottom: '-4px',
                            left: `calc(${breachFrac * 100}% - 1px)`,
                            width: '2px',
                            background: colour.ink.primary,
                        } })) : null] }), _jsxs("div", { "aria-hidden": true, style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: space.scale['1'],
                    fontFamily: 'var(--font-mono), Consolas, monospace',
                    fontSize: '11px',
                    lineHeight: '14px',
                    color: colour.ink.tertiary,
                }, children: [_jsx("span", { children: "Today" }), _jsx("span", { children: horizonLabel })] })] }));
});
//# sourceMappingURL=HorizonBar.js.map