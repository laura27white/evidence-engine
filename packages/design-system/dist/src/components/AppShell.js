import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * AppShell: top nav, main, footer scaffold used by the Next.js dashboard layout.
 *
 * Renders semantic `<header>`, `<main>`, `<footer>`. Emits a skip-to-content link as
 * the first focusable element; focus styles are visible, AAA-compliant. The active nav
 * item is controlled by the caller via the `activePath` prop so the shell works for
 * any router.
 */
import { forwardRef } from 'react';
import { colour } from '../../tokens/colour';
import { space } from '../../tokens/space';
import { Wordmark } from '../brand/Wordmark';
import { fontFamily, scaleStyle } from '../foundations/style-utils';
function DefaultAnchor({ children, ...rest }) {
    return _jsx("a", { ...rest, children: children });
}
export const AppShell = forwardRef(function AppShell({ navItems, activePath, headerActions, footer, NavAnchor = DefaultAnchor, style, children, ...rest }, ref) {
    return (_jsxs("div", { ref: ref, style: {
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            background: colour.paper.cream,
            color: colour.ink.primary,
            ...style,
        }, ...rest, children: [_jsx("a", { href: "#main", style: {
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
                }, onFocus: (e) => {
                    e.currentTarget.style.top = '0';
                }, onBlur: (e) => {
                    e.currentTarget.style.top = '-100px';
                }, children: "Skip to main content" }), _jsx("header", { role: "banner", "aria-label": "Primary", style: {
                    borderBottom: `1px solid ${colour.line.hairline}`,
                    background: colour.paper.cream,
                }, children: _jsxs("div", { style: {
                        maxWidth: space.container.maxWidth,
                        margin: '0 auto',
                        padding: `${space.scale['5']} ${space.container.margin}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: space.scale['8'],
                    }, children: [_jsx(NavAnchor, { href: "/", "aria-label": "Project Trueplan home", style: { display: 'inline-flex', textDecoration: 'none' }, children: _jsx(Wordmark, { height: 20 }) }), _jsx("nav", { "aria-label": "Primary", children: _jsx("ul", { style: {
                                    listStyle: 'none',
                                    display: 'flex',
                                    gap: space.scale['8'],
                                    margin: 0,
                                    padding: 0,
                                }, children: navItems.map((item) => {
                                    const active = activePath === item.href;
                                    return (_jsx("li", { children: _jsx(NavAnchor, { href: item.href, "aria-current": active ? 'page' : undefined, style: {
                                                fontFamily: fontFamily.body,
                                                ...scaleStyle('bodySmall'),
                                                fontWeight: active ? 600 : 500,
                                                color: active ? colour.ink.primary : colour.ink.secondary,
                                                textDecoration: 'none',
                                                borderBottom: active
                                                    ? `2px solid ${colour.accent.teal}`
                                                    : '2px solid transparent',
                                                paddingBottom: space.scale['1'],
                                            }, children: item.label }) }, item.href));
                                }) }) }), headerActions ? _jsx("div", { children: headerActions }) : null] }) }), _jsx("main", { id: "main", style: {
                    flex: 1,
                    maxWidth: space.container.maxWidth,
                    margin: '0 auto',
                    padding: `${space.scale['16']} ${space.container.margin}`,
                    width: '100%',
                }, children: children }), _jsx("footer", { role: "contentinfo", style: {
                    borderTop: `1px solid ${colour.line.hairline}`,
                    padding: `${space.scale['8']} ${space.container.margin}`,
                    color: colour.ink.secondary,
                    fontFamily: fontFamily.body,
                    ...scaleStyle('bodySmall'),
                }, children: _jsx("div", { style: { maxWidth: space.container.maxWidth, margin: '0 auto' }, children: footer ?? 'Project Trueplan, MPA Challenge 5, 2026.' }) })] }));
});
//# sourceMappingURL=AppShell.js.map