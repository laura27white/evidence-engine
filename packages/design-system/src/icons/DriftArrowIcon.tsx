/**
 * DriftArrowIcon: a double-stroke arrow indicating drift direction.
 *
 * Unlike Lucide's plain ArrowUp / ArrowDown, the drift arrow is stroked twice so it
 * survives as a recognisable mark when rendered small next to a numeric value. Uses
 * semantic props; pair with an accessible label.
 */
import { forwardRef, type SVGAttributes } from 'react';

export interface DriftArrowIconProps extends Omit<SVGAttributes<SVGSVGElement>, 'direction'> {
  direction: 'up' | 'down' | 'flat';
  size?: number;
}

export const DriftArrowIcon = forwardRef<SVGSVGElement, DriftArrowIconProps>(
  function DriftArrowIcon({ direction, size = 16, ...rest }, ref) {
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
        {direction === 'up' && (
          <>
            <path d="M12 18 V6" />
            <path d="M6 12 L12 6 L18 12" />
            <path d="M9 14 L12 11 L15 14" />
          </>
        )}
        {direction === 'down' && (
          <>
            <path d="M12 6 V18" />
            <path d="M6 12 L12 18 L18 12" />
            <path d="M9 10 L12 13 L15 10" />
          </>
        )}
        {direction === 'flat' && (
          <>
            <path d="M5 12 H19" />
            <path d="M7 9 H17" />
          </>
        )}
      </svg>
    );
  },
);
