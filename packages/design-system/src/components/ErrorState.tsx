/**
 * ErrorState: error surface at section or page level.
 *
 * Uses the `warning` severity colour, not `critical`. Crimson is reserved for severe
 * drift on assumptions; error UI at this layer is a recoverable, operator-facing event.
 * Always pairs the warning tone with an icon and explicit text.
 */
import { AlertTriangle } from 'lucide-react';
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

import { colour } from '../../tokens/colour';
import { space } from '../../tokens/space';
import { fontFamily, scaleStyle } from '../foundations/style-utils';

export interface ErrorStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: ReactNode;
  description?: ReactNode;
  /** Action slot, typically a retry Button. */
  action?: ReactNode;
  /** Optional technical detail, shown in a <details> so it does not dominate the layout. */
  technicalDetail?: ReactNode;
}

export const ErrorState = forwardRef<HTMLDivElement, ErrorStateProps>(function ErrorState(
  { title, description, action, technicalDetail, style, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      role="alert"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: space.scale['3'],
        padding: space.scale['6'],
        background: colour.severity.warningSoft,
        border: `1px solid ${colour.severity.warning}40`,
        borderRadius: space.radius.md,
        color: colour.ink.primary,
        ...style,
      }}
      {...rest}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: space.scale['3'] }}>
        <AlertTriangle size={20} aria-hidden color={colour.severity.warning} />
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
      </div>
      {description ? (
        <p
          style={{
            ...scaleStyle('body'),
            fontFamily: fontFamily.body,
            color: colour.ink.secondary,
            margin: 0,
            maxWidth: '65ch',
          }}
        >
          {description}
        </p>
      ) : null}
      {action ? <div>{action}</div> : null}
      {technicalDetail ? (
        <details
          style={{
            marginTop: space.scale['2'],
            fontFamily: fontFamily.mono,
            ...scaleStyle('monoSmall'),
            color: colour.ink.tertiary,
          }}
        >
          <summary style={{ cursor: 'pointer' }}>Technical detail</summary>
          <pre style={{ marginTop: space.scale['2'], whiteSpace: 'pre-wrap' }}>
            {technicalDetail}
          </pre>
        </details>
      ) : null}
    </div>
  );
});
