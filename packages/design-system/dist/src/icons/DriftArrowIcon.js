import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * DriftArrowIcon: a double-stroke arrow indicating drift direction.
 *
 * Unlike Lucide's plain ArrowUp / ArrowDown, the drift arrow is stroked twice so it
 * survives as a recognisable mark when rendered small next to a numeric value. Uses
 * semantic props; pair with an accessible label.
 */
import { forwardRef } from 'react';
export const DriftArrowIcon = forwardRef(function DriftArrowIcon({ direction, size = 16, ...rest }, ref) {
    return (_jsxs("svg", { ref: ref, viewBox: "0 0 24 24", width: size, height: size, fill: "none", stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", ...rest, children: [direction === 'up' && (_jsxs(_Fragment, { children: [_jsx("path", { d: "M12 18 V6" }), _jsx("path", { d: "M6 12 L12 6 L18 12" }), _jsx("path", { d: "M9 14 L12 11 L15 14" })] })), direction === 'down' && (_jsxs(_Fragment, { children: [_jsx("path", { d: "M12 6 V18" }), _jsx("path", { d: "M6 12 L12 18 L18 12" }), _jsx("path", { d: "M9 10 L12 13 L15 10" })] })), direction === 'flat' && (_jsxs(_Fragment, { children: [_jsx("path", { d: "M5 12 H19" }), _jsx("path", { d: "M7 9 H17" })] }))] }));
});
//# sourceMappingURL=DriftArrowIcon.js.map