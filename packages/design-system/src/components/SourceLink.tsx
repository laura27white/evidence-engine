/**
 * SourceLink: inline external-link component.
 *
 * Shows a short source label plus an external-link icon. On click, opens the URL in a
 * new tab with `rel="noreferrer"`. Accessible name always includes the destination so
 * screen readers know where the link goes.
 */
import { ExternalLink } from 'lucide-react';
import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from 'react';

import { colour } from '../../tokens/colour';
import { space } from '../../tokens/space';
import { fontFamily, scaleStyle } from '../foundations/style-utils';

export interface SourceLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  /** Destination URL. Required. */
  href: string;
  /** Short label; e.g. "ONS:D7G7" or the document title. */
  label: ReactNode;
  /** Visual emphasis. `muted` stays tertiary; `default` is accent teal. */
  tone?: 'default' | 'muted';
  /** Size modifier. */
  size?: 'sm' | 'md';
}

export const SourceLink = forwardRef<HTMLAnchorElement, SourceLinkProps>(function SourceLink(
  { href, label, tone = 'default', size = 'sm', style, ...rest },
  ref,
) {
  const destination = (() => {
    try {
      return new URL(href).host;
    } catch {
      return href;
    }
  })();

  return (
    <a
      ref={ref}
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={`${typeof label === 'string' ? label : 'Open source'} (opens in new tab at ${destination})`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: space.scale['1'],
        color: tone === 'default' ? colour.accent.teal : colour.ink.tertiary,
        fontFamily: fontFamily.mono,
        ...scaleStyle(size === 'sm' ? 'monoSmall' : 'mono'),
        textDecoration: 'underline',
        textUnderlineOffset: '2px',
        ...style,
      }}
      {...rest}
    >
      <span>{label}</span>
      <ExternalLink size={size === 'sm' ? 12 : 14} aria-hidden />
    </a>
  );
});
