/**
 * HorizonBar: the primitive for the Horizon view.
 *
 * A horizontal bar representing a 12-month horizon from `today` into the future. The
 * bar carries four visual elements:
 *   1. A coloured severity segment from the start of the horizon to `currentPosition`
 *      (0..1), showing drift accumulated to date.
 *   2. A dashed extension to the right of `currentPosition` showing the forecast cone.
 *   3. A vertical tick at `projectedBreach` (0..1 or null) marking the projected breach
 *      date.
 *   4. An accessible long-form description in an adjacent `<span>` so screen readers
 *      receive the full data rather than just the bar.
 */
import { forwardRef, type HTMLAttributes } from 'react';

import { colour, type SeverityTone } from '../../tokens/colour';
import { space } from '../../tokens/space';

export interface HorizonBarProps extends HTMLAttributes<HTMLDivElement> {
  /** Fraction along the horizon of the current observed position, in [0, 1]. */
  currentPosition: number;
  /** Fraction at which the forecast predicts breach, or null if no breach projected. */
  projectedBreach?: number | null;
  /** Severity of the current drift state. Controls the fill colour. */
  severity: 'safe' | 'warning' | 'critical';
  /** Total horizon duration label, displayed at the far right. Example: "12 months". */
  horizonLabel?: string;
  /** Accessible description. Always rendered in an off-screen span. */
  description: string;
}

function clamp(n: number): number {
  return Math.min(1, Math.max(0, n));
}

const severityTone: Record<SeverityTone, string> = {
  safe: colour.severity.safe,
  safeSoft: colour.severity.safeSoft,
  warning: colour.severity.warning,
  warningSoft: colour.severity.warningSoft,
  critical: colour.severity.critical,
  criticalSoft: colour.severity.criticalSoft,
};

export const HorizonBar = forwardRef<HTMLDivElement, HorizonBarProps>(function HorizonBar(
  {
    currentPosition,
    projectedBreach,
    severity,
    horizonLabel = '12 months',
    description,
    style,
    ...rest
  },
  ref,
) {
  const fillFrac = clamp(currentPosition);
  const breachFrac =
    projectedBreach === null || projectedBreach === undefined ? null : clamp(projectedBreach);
  const fillColour = severityTone[severity];
  const softKey = (severity + 'Soft') as SeverityTone;
  const softColour = severityTone[softKey] ?? colour.line.hairline;

  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        width: '100%',
        ...style,
      }}
      {...rest}
    >
      <div
        role="img"
        aria-label={description}
        style={{
          position: 'relative',
          width: '100%',
          height: '20px',
          background: softColour,
          border: `1px solid ${colour.line.hairline}`,
          borderRadius: space.radius.sm,
          overflow: 'hidden',
        }}
      >
        {/* Current drift segment */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${fillFrac * 100}%`,
            background: fillColour,
            transition: 'width 250ms ease-out',
          }}
        />
        {/* Forecast cone (dashed) */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: `${fillFrac * 100}%`,
            height: '100%',
            width: `${(1 - fillFrac) * 100}%`,
            background: `repeating-linear-gradient(90deg, ${fillColour}55 0 4px, transparent 4px 8px)`,
          }}
        />
        {/* Breach tick */}
        {breachFrac !== null ? (
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: '-4px',
              bottom: '-4px',
              left: `calc(${breachFrac * 100}% - 1px)`,
              width: '2px',
              background: colour.ink.primary,
            }}
          />
        ) : null}
      </div>
      <div
        aria-hidden
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: space.scale['1'],
          fontFamily: 'var(--font-mono), Consolas, monospace',
          fontSize: '11px',
          lineHeight: '14px',
          color: colour.ink.tertiary,
        }}
      >
        <span>Today</span>
        <span>{horizonLabel}</span>
      </div>
    </div>
  );
});
