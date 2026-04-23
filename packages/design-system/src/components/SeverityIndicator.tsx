/**
 * SeverityIndicator: drift-severity pill.
 *
 * Combines a Badge-style severity colour with a compact numeric or text value. Used on
 * Horizon cards and on the Trace view timeline. Accessible label always includes both
 * the severity name and the value so screen readers read the full state.
 */
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { forwardRef, type HTMLAttributes } from 'react';

import { colour } from '../../tokens/colour';
import { space } from '../../tokens/space';
import { fontFamily, scaleStyle } from '../foundations/style-utils';

export type SeverityLevel = 'safe' | 'warning' | 'critical';

export interface SeverityIndicatorProps extends HTMLAttributes<HTMLSpanElement> {
  level: SeverityLevel;
  /** The short data value, e.g. "+0.8pp" or "42%". */
  value: string;
  /** Human-readable label for screen readers. */
  label?: string;
}

const tone: Record<
  SeverityLevel,
  { border: string; background: string; text: string; Icon: typeof CheckCircle; label: string }
> = {
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

export const SeverityIndicator = forwardRef<HTMLSpanElement, SeverityIndicatorProps>(
  function SeverityIndicator({ level, value, label, style, ...rest }, ref) {
    const { border, background, text, Icon, label: defaultLabel } = tone[level];
    const composedLabel = label ?? defaultLabel;
    return (
      <span
        ref={ref}
        role="status"
        aria-label={`${composedLabel}: ${value}`}
        style={{
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
        }}
        {...rest}
      >
        <Icon size={14} aria-hidden />
        <span style={{ fontFamily: fontFamily.mono, ...scaleStyle('monoSmall'), color: text }}>
          {value}
        </span>
        <span style={{ ...scaleStyle('label'), color: text }}>{composedLabel}</span>
      </span>
    );
  },
);
