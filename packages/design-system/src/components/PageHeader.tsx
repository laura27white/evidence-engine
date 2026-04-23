/**
 * PageHeader: editorial page-level header.
 *
 * Large serif display title, optional short kicker above in label-mono, optional
 * subtitle below in body, optional meta row (time range, filter chips, data sources).
 * Used at the top of every page to anchor the eye.
 */
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

import { colour } from '../../tokens/colour';
import { space } from '../../tokens/space';
import { fontFamily, scaleStyle } from '../foundations/style-utils';

export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Short label above the title, e.g. "MPA Challenge 5". */
  kicker?: ReactNode;
  /** Primary title; displayed in serif. */
  title: ReactNode;
  /** Optional subtitle in body type. */
  subtitle?: ReactNode;
  /** Optional meta row rendered beneath the subtitle. */
  meta?: ReactNode;
  /** Trailing actions rendered top-right. */
  actions?: ReactNode;
  /** Size modifier controls the title scale. `lg` uses displayLarge, `xl` uses displayMax. */
  size?: 'md' | 'lg' | 'xl';
}

export const PageHeader = forwardRef<HTMLElement, PageHeaderProps>(function PageHeader(
  { kicker, title, subtitle, meta, actions, size = 'lg', style, ...rest },
  ref,
) {
  const titleVariant =
    size === 'xl' ? 'displayMax' : size === 'md' ? 'displayMedium' : 'displayLarge';
  return (
    <header
      ref={ref}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: space.scale['4'],
        paddingBottom: space.scale['8'],
        borderBottom: `1px solid ${colour.line.hairline}`,
        marginBottom: space.scale['10'],
        ...style,
      }}
      {...rest}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: space.scale['3'] }}>
        {kicker ? (
          <span
            style={{
              ...scaleStyle('label'),
              fontFamily: fontFamily.body,
              color: colour.accent.teal,
            }}
          >
            {kicker}
          </span>
        ) : null}
        <h1
          style={{
            ...scaleStyle(titleVariant),
            fontFamily: fontFamily.display,
            color: colour.ink.primary,
            margin: 0,
            maxWidth: '22ch',
          }}
        >
          {title}
        </h1>
        {subtitle ? (
          <p
            style={{
              ...scaleStyle('bodyLarge'),
              fontFamily: fontFamily.body,
              color: colour.ink.secondary,
              margin: 0,
              maxWidth: '65ch',
            }}
          >
            {subtitle}
          </p>
        ) : null}
        {meta ? (
          <div
            style={{
              marginTop: space.scale['2'],
              display: 'flex',
              gap: space.scale['4'],
              flexWrap: 'wrap',
            }}
          >
            {meta}
          </div>
        ) : null}
      </div>
      {actions ? <div style={{ alignSelf: 'start' }}>{actions}</div> : null}
    </header>
  );
});
