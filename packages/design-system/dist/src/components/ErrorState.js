import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * ErrorState: error surface at section or page level.
 *
 * Uses the `warning` severity colour, not `critical`. Crimson is reserved for severe
 * drift on assumptions; error UI at this layer is a recoverable, operator-facing event.
 * Always pairs the warning tone with an icon and explicit text.
 */
import { AlertTriangle } from 'lucide-react';
import { forwardRef } from 'react';
import { colour } from '../../tokens/colour';
import { space } from '../../tokens/space';
import { fontFamily, scaleStyle } from '../foundations/style-utils';
export const ErrorState = forwardRef(function ErrorState({ title, description, action, technicalDetail, style, ...rest }, ref) {
    return (_jsxs("div", { ref: ref, role: "alert", style: {
            display: 'flex',
            flexDirection: 'column',
            gap: space.scale['3'],
            padding: space.scale['6'],
            background: colour.severity.warningSoft,
            border: `1px solid ${colour.severity.warning}40`,
            borderRadius: space.radius.md,
            color: colour.ink.primary,
            ...style,
        }, ...rest, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: space.scale['3'] }, children: [_jsx(AlertTriangle, { size: 20, "aria-hidden": true, color: colour.severity.warning }), _jsx("h2", { style: {
                            ...scaleStyle('displaySmall'),
                            fontFamily: fontFamily.display,
                            color: colour.ink.primary,
                            margin: 0,
                        }, children: title })] }), description ? (_jsx("p", { style: {
                    ...scaleStyle('body'),
                    fontFamily: fontFamily.body,
                    color: colour.ink.secondary,
                    margin: 0,
                    maxWidth: '65ch',
                }, children: description })) : null, action ? _jsx("div", { children: action }) : null, technicalDetail ? (_jsxs("details", { style: {
                    marginTop: space.scale['2'],
                    fontFamily: fontFamily.mono,
                    ...scaleStyle('monoSmall'),
                    color: colour.ink.tertiary,
                }, children: [_jsx("summary", { style: { cursor: 'pointer' }, children: "Technical detail" }), _jsx("pre", { style: { marginTop: space.scale['2'], whiteSpace: 'pre-wrap' }, children: technicalDetail })] })) : null] }));
});
//# sourceMappingURL=ErrorState.js.map