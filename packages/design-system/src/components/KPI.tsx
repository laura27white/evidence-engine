/**
 * KPI: editorial number display.
 *
 * Large display-size value, small uppercase label above, optional trend indicator and
 * confidence interval underneath. Used on the Horizon view and in the Portfolio roll-up
 * once Prompt 7 lands.
 */
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

import { colour } from '../../tokens/colour';
import { space } from '../../tokens/space';
import { fontFamily, scaleStyle } from '../foundations/style-utils';

export type KPITrend = 'up' | 'down' | 'flat';

export interface KPIProps extends HTMLAttributes<HTMLDivElement> {
  /** Uppercase label above the number (e.g. "Lead time"). */
  label: ReactNode;
  /** Primary numeric value; formatted by the caller. */
  value: ReactNode;
  /** Unit shown in smaller mono type to the right of the value (e.g. "days"). */
  unit?: ReactNode;
  /** Trend indicator. Colour follows the semantics: up for good is not inherent, so the caller decides. */
  trend?: KPITrend;
  /** Override the trend colour. Default: up = safe, down = critical, flat = tertiary ink. */
  trendTone?: 'positive' | 'negative' | 'neutral';
  /** Optional confidence interval shown in mono beneath. */
  confidenceInterval?: ReactNode;
  /** Size modifier. */
  size?: 'md' | 'lg';
}

const trendIcon: Record<KPITrend, typeof ArrowUp> = {
  up: ArrowUp,
  down: ArrowDown,
  flat: Minus,
};

function trendColour(trend: KPITrend, tone?: KPIProps['trendTone']): string {
  if (tone === 'positive') return colour.severity.safe;
  if (tone === 'negative') return colour.severity.critical;
  if (tone === 'neutral') return colour.ink.tertiary;
  if (trend === 'up') return colour.severity.safe;
  if (trend === 'down') return colour.severity.critical;
  return colour.ink.tertiary;
}

export const KPI = forwardRef<HTMLDivElement, KPIProps>(function KPI(
  { label, value, unit, trend, trendTone, confidenceInterval, size = 'md', style, ...rest },
  ref,
) {
  const TrendIcon = trend ? trendIcon[trend] : null;
  const trendTint = trend ? trendColour(trend, trendTone) : undefined;
  return (
    <div
      ref={ref}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: space.scale['2'],
        ...style,
      }}
      {...rest}
    >
      <span
        style={{
          ...scaleStyle('label'),
          fontFamily: fontFamily.body,
          color: colour.ink.tertiary,
        }}
      >
        {label}
      </span>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: space.scale['3'] }}>
        <span
          style={{
            ...scaleStyle(size === 'lg' ? 'displayLarge' : 'displayMedium'),
            fontFamily: fontFamily.display,
            color: colour.ink.primary,
          }}
        >
          {value}
        </span>
        {unit ? (
          <span
            style={{
              ...scaleStyle('mono'),
              fontFamily: fontFamily.mono,
              color: colour.ink.tertiary,
            }}
          >
            {unit}
          </span>
        ) : null}
        {TrendIcon && trendTint ? (
          <span
            aria-label={`Trend ${trend}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: space.scale['1'],
              color: trendTint,
              fontFamily: fontFamily.mono,
              ...scaleStyle('monoSmall'),
            }}
          >
            <TrendIcon size={14} aria-hidden />
          </span>
        ) : null}
      </div>
      {confidenceInterval ? (
        <span
          style={{
            ...scaleStyle('monoSmall'),
            fontFamily: fontFamily.mono,
            color: colour.ink.tertiary,
          }}
        >
          {confidenceInterval}
        </span>
      ) : null}
    </div>
  );
});
