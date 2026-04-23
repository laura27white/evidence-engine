/**
 * Wordmark: "EVIDENCE ENGINE" typographic mark as SVG.
 *
 * Rendered as SVG so the identity does not depend on font loading timing and so the
 * wordmark looks identical across browsers. Colour variants follow ARCHITECTURE.md
 * section 6.2.
 */
import { forwardRef, type SVGAttributes } from 'react';

import { colour } from '../../tokens/colour';

export type WordmarkVariant = 'ink' | 'inverse' | 'accent';

export interface WordmarkProps
  extends Omit<SVGAttributes<SVGSVGElement>, 'fill' | 'height' | 'width'> {
  variant?: WordmarkVariant;
  /** Rendered height in px. Aspect ratio is preserved. */
  height?: number;
  /** Alternative text for the mark. Defaults to "Evidence Engine". */
  title?: string;
}

const fillFor: Record<WordmarkVariant, string> = {
  ink: colour.ink.primary,
  inverse: colour.ink.inverse,
  accent: colour.accent.teal,
};

export const Wordmark = forwardRef<SVGSVGElement, WordmarkProps>(function Wordmark(
  { variant = 'ink', height = 24, title = 'Evidence Engine', ...rest },
  ref,
) {
  const width = Math.round(height * 9.2);
  return (
    <svg
      ref={ref}
      role="img"
      aria-label={title}
      viewBox="0 0 460 50"
      height={height}
      width={width}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <title>{title}</title>
      <text
        x={0}
        y={35}
        fontFamily="var(--font-display), 'Source Serif 4', Georgia, serif"
        fontWeight={500}
        fontSize={32}
        letterSpacing="0.12em"
        style={{ fontVariant: 'small-caps' }}
        fill={fillFor[variant]}
      >
        Evidence Engine
      </text>
    </svg>
  );
});

export interface MonogramProps
  extends Omit<SVGAttributes<SVGSVGElement>, 'fill' | 'height' | 'width'> {
  variant?: WordmarkVariant;
  size?: number;
  title?: string;
}

export const Monogram = forwardRef<SVGSVGElement, MonogramProps>(function Monogram(
  { variant = 'ink', size = 32, title = 'EE', ...rest },
  ref,
) {
  return (
    <svg
      ref={ref}
      role="img"
      aria-label={title}
      viewBox="0 0 32 32"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <title>{title}</title>
      <rect
        x={0}
        y={0}
        width={32}
        height={32}
        rx={4}
        fill={variant === 'inverse' ? colour.ink.primary : colour.paper.cream}
      />
      <text
        x="50%"
        y="50%"
        fontFamily="var(--font-display), 'Source Serif 4', Georgia, serif"
        fontWeight={500}
        fontSize={20}
        letterSpacing="0.06em"
        style={{ fontVariant: 'small-caps' }}
        dominantBaseline="central"
        textAnchor="middle"
        fill={fillFor[variant]}
      >
        Ee
      </text>
    </svg>
  );
});
