import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Badge: severity-flavoured label with an icon.
 *
 * Per ARCHITECTURE.md section 6.3 we never convey state with colour alone, so every
 * Badge pairs its severity tone with a matching Lucide icon and a text label. Pass
 * `variant="neutral"` for non-severity use (counts, categories).
 */
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import { forwardRef } from 'react';
import { colour } from '../../tokens/colour';
import { space } from '../../tokens/space';
import { fontFamily, scaleStyle } from '../foundations/style-utils';
const variantStyle = {
    safe: {
        background: colour.severity.safeSoft,
        border: `1px solid ${colour.severity.safe}40`,
        color: colour.severity.safe,
    },
    warning: {
        background: colour.severity.warningSoft,
        border: `1px solid ${colour.severity.warning}40`,
        color: colour.severity.warning,
    },
    critical: {
        background: colour.severity.criticalSoft,
        border: `1px solid ${colour.severity.critical}40`,
        color: colour.severity.critical,
    },
    neutral: {
        background: colour.paper.creamElevated,
        border: `1px solid ${colour.line.hairline}`,
        color: colour.ink.secondary,
    },
};
const DefaultIcon = {
    safe: CheckCircle,
    warning: AlertTriangle,
    critical: XCircle,
    neutral: Info,
};
export const Badge = forwardRef(function Badge({ variant = 'neutral', size = 'md', icon, children, style, ...rest }, ref) {
    const { background, border, color } = variantStyle[variant];
    const DefaultIconComponent = DefaultIcon[variant];
    const iconSize = size === 'sm' ? 12 : 14;
    const resolvedIcon = icon === null ? null : (icon ?? _jsx(DefaultIconComponent, { size: iconSize, "aria-hidden": true }));
    const composed = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: space.scale['2'],
        padding: size === 'sm'
            ? `${space.scale['1']} ${space.scale['2']}`
            : `${space.scale['1']} ${space.scale['3']}`,
        borderRadius: space.radius.full,
        border,
        background,
        color,
        fontFamily: fontFamily.body,
        ...scaleStyle(size === 'sm' ? 'label' : 'bodySmall'),
        whiteSpace: 'nowrap',
        ...style,
    };
    return (_jsxs("span", { ref: ref, style: composed, role: "status", "data-variant": variant, ...rest, children: [resolvedIcon, _jsx("span", { children: children })] }));
});
//# sourceMappingURL=Badge.js.map