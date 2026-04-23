import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * PageHeader: editorial page-level header.
 *
 * Large serif display title, optional short kicker above in label-mono, optional
 * subtitle below in body, optional meta row (time range, filter chips, data sources).
 * Used at the top of every page to anchor the eye.
 */
import { forwardRef } from 'react';
import { colour } from '../../tokens/colour';
import { space } from '../../tokens/space';
import { fontFamily, scaleStyle } from '../foundations/style-utils';
export const PageHeader = forwardRef(function PageHeader({ kicker, title, subtitle, meta, actions, size = 'lg', style, ...rest }, ref) {
    const titleVariant = size === 'xl' ? 'displayMax' : size === 'md' ? 'displayMedium' : 'displayLarge';
    return (_jsxs("header", { ref: ref, style: {
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: space.scale['4'],
            paddingBottom: space.scale['8'],
            borderBottom: `1px solid ${colour.line.hairline}`,
            marginBottom: space.scale['10'],
            ...style,
        }, ...rest, children: [_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: space.scale['3'] }, children: [kicker ? (_jsx("span", { style: {
                            ...scaleStyle('label'),
                            fontFamily: fontFamily.body,
                            color: colour.accent.teal,
                        }, children: kicker })) : null, _jsx("h1", { style: {
                            ...scaleStyle(titleVariant),
                            fontFamily: fontFamily.display,
                            color: colour.ink.primary,
                            margin: 0,
                            maxWidth: '22ch',
                        }, children: title }), subtitle ? (_jsx("p", { style: {
                            ...scaleStyle('bodyLarge'),
                            fontFamily: fontFamily.body,
                            color: colour.ink.secondary,
                            margin: 0,
                            maxWidth: '65ch',
                        }, children: subtitle })) : null, meta ? (_jsx("div", { style: {
                            marginTop: space.scale['2'],
                            display: 'flex',
                            gap: space.scale['4'],
                            flexWrap: 'wrap',
                        }, children: meta })) : null] }), actions ? _jsx("div", { style: { alignSelf: 'start' }, children: actions }) : null] }));
});
//# sourceMappingURL=PageHeader.js.map