import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * LoadingState: skeleton shimmer.
 *
 * Not a spinner; skeleton blocks stand in for expected content so the page does not
 * jump when data arrives. Respects `prefers-reduced-motion`: the shimmer collapses to
 * a static tint when the user has asked not to be animated.
 */
import { forwardRef } from 'react';
import { colour } from '../../tokens/colour';
import { space } from '../../tokens/space';
export const LoadingState = forwardRef(function LoadingState({ rows = 3, rowHeight = '14px', label = 'Loading', style, ...rest }, ref) {
    return (_jsxs("div", { ref: ref, role: "status", "aria-live": "polite", "aria-label": label, style: {
            display: 'flex',
            flexDirection: 'column',
            gap: space.scale['3'],
            padding: space.scale['4'],
            ...style,
        }, ...rest, children: [Array.from({ length: rows }).map((_, idx) => (_jsx("div", { "aria-hidden": true, style: {
                    height: rowHeight,
                    width: idx === rows - 1 ? '70%' : '100%',
                    borderRadius: space.radius.sm,
                    background: `linear-gradient(90deg, ${colour.line.hairline} 0%, ${colour.paper.creamElevated} 50%, ${colour.line.hairline} 100%)`,
                    backgroundSize: '200% 100%',
                    animation: 'tp-shimmer 1.6s infinite linear',
                } }, idx))), _jsx("style", { children: `
          @keyframes tp-shimmer {
            0%   { background-position: 100% 0; }
            100% { background-position: -100% 0; }
          }
          @media (prefers-reduced-motion: reduce) {
            [data-tp-skeleton="reduced"] {
              animation: none !important;
              background: ${colour.line.hairline} !important;
            }
          }
        ` })] }));
});
//# sourceMappingURL=LoadingState.js.map