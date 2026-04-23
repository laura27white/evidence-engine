/**
 * AppShell: top nav, main, footer scaffold used by the Next.js dashboard layout.
 *
 * Renders semantic `<header>`, `<main>`, `<footer>`. Emits a skip-to-content link as
 * the first focusable element; focus styles are visible, AAA-compliant. The active nav
 * item is controlled by the caller via the `activePath` prop so the shell works for
 * any router.
 */
import { type AnchorHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react';
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
export declare const AppShell: import("react").ForwardRefExoticComponent<AppShellProps & import("react").RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=AppShell.d.ts.map