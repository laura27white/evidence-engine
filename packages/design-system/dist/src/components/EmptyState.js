import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * EmptyState: intentional no-data surface.
 *
 * Serif display heading, body explanation, optional action. Should feel like a
 * considered editorial choice rather than a broken screen.
 */
import { forwardRef } from 'react';
import { colour } from '../../tokens/colour';
import { space } from '../../tokens/space';
import { fontFamily, scaleStyle } from '../foundations/style-utils';
export const EmptyState = forwardRef(function EmptyState({ title, description, action, icon, style, ...rest }, ref) {
    return (_jsxs("div", { ref: ref, role: "status", style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: space.scale['4'],
            padding: space.scale['16'],
            textAlign: 'center',
            border: `1px dashed ${colour.line.regular}`,
            borderRadius: space.radius.md,
            background: colour.paper.creamElevated,
            ...style,
        }, ...rest, children: [icon ? (_jsx("div", { "aria-hidden": true, style: { color: colour.ink.tertiary }, children: icon })) : null, _jsx("h2", { style: {
                    ...scaleStyle('displaySmall'),
                    fontFamily: fontFamily.display,
                    color: colour.ink.primary,
                    margin: 0,
                }, children: title }), description ? (_jsx("p", { style: {
                    ...scaleStyle('body'),
                    fontFamily: fontFamily.body,
                    color: colour.ink.secondary,
                    margin: 0,
                    maxWidth: '60ch',
                }, children: description })) : null, action ? _jsx("div", { style: { marginTop: space.scale['2'] }, children: action }) : null] }));
});
//# sourceMappingURL=EmptyState.js.map