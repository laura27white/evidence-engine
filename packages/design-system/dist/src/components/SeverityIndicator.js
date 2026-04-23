import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * SeverityIndicator: drift-severity pill.
 *
 * Combines a Badge-style severity colour with a compact numeric or text value. Used on
 * Horizon cards and on the Trace view timeline. Accessible label always includes both
 * the severity name and the value so screen readers read the full state.
 */
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { forwardRef } from 'react';
import { colour } from '../../tokens/colour';
import { space } from '../../tokens/space';
import { fontFamily, scaleStyle } from '../foundations/style-utils';
const tone = {
    safe: {
        border: `${colour.severity.safe}60`,
        background: colour.severity.safeSoft,
        text: colour.severity.safe,
        Icon: CheckCircle,
        label: 'Safe',
    },
    warning: {
        border: `${colour.severity.warning}60`,
        background: colour.severity.warningSoft,
        text: colour.severity.warning,
        Icon: AlertTriangle,
        label: 'Warning',
    },
    critical: {
        border: `${colour.severity.critical}60`,
        background: colour.severity.criticalSoft,
        text: colour.severity.critical,
        Icon: XCircle,
        label: 'Critical',
    },
};
export const SeverityIndicator = forwardRef(function SeverityIndicator({ level, value, label, style, ...rest }, ref) {
    const { border, background, text, Icon, label: defaultLabel } = tone[level];
    const composedLabel = label ?? defaultLabel;
    return (_jsxs("span", { ref: ref, role: "status", "aria-label": `${composedLabel}: ${value}`, style: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: space.scale['2'],
            padding: `${space.scale['1']} ${space.scale['3']}`,
            borderRadius: space.radius.full,
            border: `1px solid ${border}`,
            background,
            color: text,
            fontFamily: fontFamily.body,
            ...scaleStyle('bodySmall'),
            ...style,
        }, ...rest, children: [_jsx(Icon, { size: 14, "aria-hidden": true }), _jsx("span", { style: { fontFamily: fontFamily.mono, ...scaleStyle('monoSmall'), color: text }, children: value }), _jsx("span", { style: { ...scaleStyle('label'), color: text }, children: composedLabel })] }));
});
//# sourceMappingURL=SeverityIndicator.js.map