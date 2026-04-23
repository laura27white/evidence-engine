/**
 * EmptyState: intentional no-data surface.
 *
 * Serif display heading, body explanation, optional action. Should feel like a
 * considered editorial choice rather than a broken screen.
 */
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

import { colour } from '../../tokens/colour';
import { space } from '../../tokens/space';
import { fontFamily, scaleStyle } from '../foundations/style-utils';

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: ReactNode;
  description?: ReactNode;
  /** Action slot, typically a Button. */
  action?: ReactNode;
  /** Optional decorative icon above the title. */
  icon?: ReactNode;
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState(
  { title, description, action, icon, style, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      role="status"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: space.scale['4'],
        padding: space.scale['16'],
        textAlign: 'center',
        border: `1px dashed ${colour.line.regular}`,
        borderRadius: space.radius.md,
        background: colour.paper.creamElevated,
        ...style,
      }}
      {...rest}
    >
      {icon ? (
        <div aria-hidden style={{ color: colour.ink.tertiary }}>
          {icon}
        </div>
      ) : null}
      <h2
        style={{
          ...scaleStyle('displaySmall'),
          fontFamily: fontFamily.display,
          color: colour.ink.primary,
          margin: 0,
        }}
      >
        {title}
      </h2>
      {description ? (
        <p
          style={{
            ...scaleStyle('body'),
            fontFamily: fontFamily.body,
            color: colour.ink.secondary,
            margin: 0,
            maxWidth: '60ch',
          }}
        >
          {description}
        </p>
      ) : null}
      {action ? <div style={{ marginTop: space.scale['2'] }}>{action}</div> : null}
    </div>
  );
});
