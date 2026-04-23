/**
 * CascadeNodeIcon: three-dot cascade glyph used by the Cascade view legend.
 *
 * Reads as "one event, two outcomes" without depending on the upstream Lucide catalogue.
 */
import { forwardRef, type SVGAttributes } from 'react';

export interface CascadeNodeIconProps extends SVGAttributes<SVGSVGElement> {
  size?: number;
}

export const CascadeNodeIcon = forwardRef<SVGSVGElement, CascadeNodeIconProps>(
  function CascadeNodeIcon({ size = 16, ...rest }, ref) {
    return (
      <svg
        ref={ref}
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        {...rest}
      >
        <circle cx={4} cy={12} r={2.5} />
        <circle cx={20} cy={6} r={2.5} />
        <circle cx={20} cy={18} r={2.5} />
        <path d="M6.5 11 L17.5 6.5" />
        <path d="M6.5 13 L17.5 17.5" />
      </svg>
    );
  },
);
