import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * SourceLink: inline external-link component.
 *
 * Shows a short source label plus an external-link icon. On click, opens the URL in a
 * new tab with `rel="noreferrer"`. Accessible name always includes the destination so
 * screen readers know where the link goes.
 */
import { ExternalLink } from 'lucide-react';
import { forwardRef } from 'react';
import { colour } from '../../tokens/colour';
import { space } from '../../tokens/space';
import { fontFamily, scaleStyle } from '../foundations/style-utils';
export const SourceLink = forwardRef(function SourceLink({ href, label, tone = 'default', size = 'sm', style, ...rest }, ref) {
    const destination = (() => {
        try {
            return new URL(href).host;
        }
        catch {
            return href;
        }
    })();
    return (_jsxs("a", { ref: ref, href: href, target: "_blank", rel: "noreferrer noopener", "aria-label": `${typeof label === 'string' ? label : 'Open source'} (opens in new tab at ${destination})`, style: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: space.scale['1'],
            color: tone === 'default' ? colour.accent.teal : colour.ink.tertiary,
            fontFamily: fontFamily.mono,
            ...scaleStyle(size === 'sm' ? 'monoSmall' : 'mono'),
            textDecoration: 'underline',
            textUnderlineOffset: '2px',
            ...style,
        }, ...rest, children: [_jsx("span", { children: label }), _jsx(ExternalLink, { size: size === 'sm' ? 12 : 14, "aria-hidden": true })] }));
});
//# sourceMappingURL=SourceLink.js.map