/**
 * AppShell: top nav, main, footer scaffold used by the Next.js dashboard layout.
 *
 * Renders semantic `<header>`, `<main>`, `<footer>`. Emits a skip-to-content link as
 * the first focusable element; focus styles are visible, AAA-compliant. The active nav
 * item is controlled by the caller via the `activePath` prop so the shell works for
 * any router.
 */
import { forwardRef, type AnchorHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react';

import { colour } from '../../tokens/colour';
import { space } from '../../tokens/space';
import { Wordmark } from '../brand/Wordmark';
import { fontFamily, scaleStyle } from '../foundations/style-utils';

export interface NavItem {
  label: string;
  href: string;
}

export interface AppShellProps extends HTMLAttributes<HTMLDivElement> {
  /** Navigation items shown in the top bar. */
  navItems: NavItem[];
  /** The current route, used to mark the active item. Pass exactly as in `NavItem.href`. */
  activePath?: string;
  /** Optional right-aligned header slot (theme toggle, user menu). */
  headerActions?: ReactNode;
  /** Footer content; left blank renders a minimal copyright line. */
  footer?: ReactNode;
  /** Custom anchor component (e.g., Next.js Link). Defaults to plain `<a>`. */
  NavAnchor?: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => JSX.Element;
  children?: ReactNode;
}

function DefaultAnchor({
  children,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement>): JSX.Element {
  return <a {...rest}>{children}</a>;
}

export const AppShell = forwardRef<HTMLDivElement, AppShellProps>(function AppShell(
  {
    navItems,
    activePath,
    headerActions,
    footer,
    NavAnchor = DefaultAnchor,
    style,
    children,
    ...rest
  },
  ref,
) {
  return (
    <div
      ref={ref}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: colour.paper.cream,
        color: colour.ink.primary,
        ...style,
      }}
      {...rest}
    >
      <a
        href="#main"
        style={{
          position: 'absolute',
          top: '-100px',
          left: 0,
          padding: `${space.scale['3']} ${space.scale['5']}`,
          background: colour.ink.primary,
          color: colour.ink.inverse,
          fontFamily: fontFamily.body,
          fontWeight: 600,
          zIndex: 100,
          textDecoration: 'none',
        }}
        onFocus={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.top = '0';
        }}
        onBlur={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.top = '-100px';
        }}
      >
        Skip to main content
      </a>
      <header
        role="banner"
        aria-label="Primary"
        style={{
          borderBottom: `1px solid ${colour.line.hairline}`,
          background: colour.paper.cream,
        }}
      >
        <div
          style={{
            maxWidth: space.container.maxWidth,
            margin: '0 auto',
            padding: `${space.scale['5']} ${space.container.margin}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: space.scale['8'],
          }}
        >
          <NavAnchor
            href="/"
            aria-label="Evidence Engine home"
            style={{ display: 'inline-flex', textDecoration: 'none' }}
          >
            <Wordmark height={20} />
          </NavAnchor>
          <nav aria-label="Primary">
            <ul
              style={{
                listStyle: 'none',
                display: 'flex',
                gap: space.scale['8'],
                margin: 0,
                padding: 0,
              }}
            >
              {navItems.map((item) => {
                const active = activePath === item.href;
                return (
                  <li key={item.href}>
                    <NavAnchor
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      style={{
                        fontFamily: fontFamily.body,
                        ...scaleStyle('bodySmall'),
                        fontWeight: active ? 600 : 500,
                        color: active ? colour.ink.primary : colour.ink.secondary,
                        textDecoration: 'none',
                        borderBottom: active
                          ? `2px solid ${colour.accent.teal}`
                          : '2px solid transparent',
                        paddingBottom: space.scale['1'],
                      }}
                    >
                      {item.label}
                    </NavAnchor>
                  </li>
                );
              })}
            </ul>
          </nav>
          {headerActions ? <div>{headerActions}</div> : null}
        </div>
      </header>
      <main
        id="main"
        style={{
          flex: 1,
          maxWidth: space.container.maxWidth,
          margin: '0 auto',
          padding: `${space.scale['16']} ${space.container.margin}`,
          width: '100%',
        }}
      >
        {children}
      </main>
      <footer
        role="contentinfo"
        style={{
          borderTop: `1px solid ${colour.line.hairline}`,
          padding: `${space.scale['8']} ${space.container.margin}`,
          color: colour.ink.secondary,
          fontFamily: fontFamily.body,
          ...scaleStyle('bodySmall'),
        }}
      >
        <div style={{ maxWidth: space.container.maxWidth, margin: '0 auto' }}>
          {footer ?? 'Evidence Engine, MPA Challenge 5, 2026.'}
        </div>
      </footer>
    </div>
  );
});
