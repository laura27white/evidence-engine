/**
 * LoadingState: skeleton shimmer.
 *
 * Not a spinner; skeleton blocks stand in for expected content so the page does not
 * jump when data arrives. Respects `prefers-reduced-motion`: the shimmer collapses to
 * a static tint when the user has asked not to be animated.
 */
import { forwardRef, type HTMLAttributes } from 'react';

import { colour } from '../../tokens/colour';
import { space } from '../../tokens/space';

export interface LoadingStateProps extends HTMLAttributes<HTMLDivElement> {
  /** Number of skeleton rows. Defaults to 3. */
  rows?: number;
  /** Row height; CSS length. Defaults to 14px. */
  rowHeight?: string;
  /** Accessible label read when content is loading. */
  label?: string;
}

export const LoadingState = forwardRef<HTMLDivElement, LoadingStateProps>(function LoadingState(
  { rows = 3, rowHeight = '14px', label = 'Loading', style, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      aria-label={label}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: space.scale['3'],
        padding: space.scale['4'],
        ...style,
      }}
      {...rest}
    >
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          aria-hidden
          style={{
            height: rowHeight,
            width: idx === rows - 1 ? '70%' : '100%',
            borderRadius: space.radius.sm,
            background: `linear-gradient(90deg, ${colour.line.hairline} 0%, ${colour.paper.creamElevated} 50%, ${colour.line.hairline} 100%)`,
            backgroundSize: '200% 100%',
            animation: 'tp-shimmer 1.6s infinite linear',
          }}
        />
      ))}
      <style>
        {`
          @keyframes tp-shimmer {
            0%   { background-position: 100% 0; }
            100% { background-position: -100% 0; }
          }
          @media (prefers-reduced-motion: reduce) {
            [data-tp-skeleton="reduced"] {
              animation: none !important;
              background: ${colour.line.hairline} !important;
            }
          }
        `}
      </style>
    </div>
  );
});
