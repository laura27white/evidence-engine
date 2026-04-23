import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * KPI: editorial number display.
 *
 * Large display-size value, small uppercase label above, optional trend indicator and
 * confidence interval underneath. Used on the Horizon view and in the Portfolio roll-up
 * once Prompt 7 lands.
 */
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { forwardRef } from 'react';
import { colour } from '../../tokens/colour';
import { space } from '../../tokens/space';
import { fontFamily, scaleStyle } from '../foundations/style-utils';
const trendIcon = {
    up: ArrowUp,
    down: ArrowDown,
    flat: Minus,
};
function trendColour(trend, tone) {
    if (tone === 'positive')
        return colour.severity.safe;
    if (tone === 'negative')
        return colour.severity.critical;
    if (tone === 'neutral')
        return colour.ink.tertiary;
    if (trend === 'up')
        return colour.severity.safe;
    if (trend === 'down')
        return colour.severity.critical;
    return colour.ink.tertiary;
}
export const KPI = forwardRef(function KPI({ label, value, unit, trend, trendTone, confidenceInterval, size = 'md', style, ...rest }, ref) {
    const TrendIcon = trend ? trendIcon[trend] : null;
    const trendTint = trend ? trendColour(trend, trendTone) : undefined;
    return (_jsxs("div", { ref: ref, style: {
            display: 'flex',
            flexDirection: 'column',
            gap: space.scale['2'],
            ...style,
        }, ...rest, children: [_jsx("span", { style: {
                    ...scaleStyle('label'),
                    fontFamily: fontFamily.body,
                    color: colour.ink.tertiary,
                }, children: label }), _jsxs("div", { style: { display: 'flex', alignItems: 'baseline', gap: space.scale['3'] }, children: [_jsx("span", { style: {
                            ...scaleStyle(size === 'lg' ? 'displayLarge' : 'displayMedium'),
                            fontFamily: fontFamily.display,
                            color: colour.ink.primary,
                        }, children: value }), unit ? (_jsx("span", { style: {
                            ...scaleStyle('mono'),
                            fontFamily: fontFamily.mono,
                            color: colour.ink.tertiary,
                        }, children: unit })) : null, TrendIcon && trendTint ? (_jsx("span", { "aria-label": `Trend ${trend}`, style: {
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: space.scale['1'],
                            color: trendTint,
                            fontFamily: fontFamily.mono,
                            ...scaleStyle('monoSmall'),
                        }, children: _jsx(TrendIcon, { size: 14, "aria-hidden": true }) })) : null] }), confidenceInterval ? (_jsx("span", { style: {
                    ...scaleStyle('monoSmall'),
                    fontFamily: fontFamily.mono,
                    color: colour.ink.tertiary,
                }, children: confidenceInterval })) : null] }));
});
//# sourceMappingURL=KPI.js.map