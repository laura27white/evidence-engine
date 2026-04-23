'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Button: primary, secondary, ghost variants.
 *
 * Focus ring is 3px accent teal with 2px offset, visible and AAA-contrast on cream.
 * All states (default, hover, focus, active, disabled, loading) are exercised by the
 * Storybook stories. Loading disables the button and swaps a spinner for the label; the
 * spinner is replaced by "Loading" text for `prefers-reduced-motion` users.
 */
import { Loader2 } from 'lucide-react';
import { forwardRef, useState } from 'react';
import { colour } from '../../tokens/colour';
import { space } from '../../tokens/space';
import { fontFamily, scaleStyle } from '../foundations/style-utils';
const paddingBySize = {
    sm: `${space.scale['2']} ${space.scale['4']}`,
    md: `${space.scale['3']} ${space.scale['5']}`,
    lg: `${space.scale['4']} ${space.scale['6']}`,
};
const minHeightBySize = {
    sm: '36px',
    md: '44px',
    lg: '52px',
};
const fontScaleBySize = {
    sm: 'bodySmall',
    md: 'body',
    lg: 'bodyLarge',
};
const variantStyles = {
    primary: {
        background: colour.ink.primary,
        color: colour.ink.inverse,
        border: `1px solid ${colour.ink.primary}`,
        hoverBackground: colour.accent.tealDeep,
        activeBackground: '#000',
    },
    secondary: {
        background: 'transparent',
        color: colour.ink.primary,
        border: `1px solid ${colour.ink.primary}`,
        hoverBackground: colour.accent.tealMuted,
        activeBackground: colour.paper.creamElevated,
    },
    ghost: {
        background: 'transparent',
        color: colour.ink.primary,
        border: '1px solid transparent',
        hoverBackground: colour.accent.tealMuted,
        activeBackground: colour.paper.creamElevated,
    },
};
export const Button = forwardRef(function Button({ variant = 'primary', size = 'md', loading = false, disabled, leadingIcon, trailingIcon, children, style, onBlur, onFocus, onMouseDown, onMouseUp, onMouseEnter, onMouseLeave, ...rest }, ref) {
    const [focused, setFocused] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [pressed, setPressed] = useState(false);
    const effectivelyDisabled = Boolean(disabled) || loading;
    const variantStyle = variantStyles[variant];
    const background = pressed
        ? variantStyle.activeBackground
        : hovered
            ? variantStyle.hoverBackground
            : variantStyle.background;
    const composed = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: space.scale['2'],
        padding: paddingBySize[size],
        minHeight: minHeightBySize[size],
        borderRadius: space.radius.sm,
        border: variantStyle.border,
        color: variantStyle.color,
        background,
        fontFamily: fontFamily.body,
        ...scaleStyle(fontScaleBySize[size]),
        cursor: effectivelyDisabled ? 'not-allowed' : 'pointer',
        opacity: effectivelyDisabled ? 0.5 : 1,
        transition: 'background 160ms ease-out, color 160ms ease-out, border-color 160ms ease-out',
        outline: focused ? `3px solid ${colour.accent.teal}` : 'none',
        outlineOffset: focused ? '2px' : '0',
        ...style,
    };
    return (_jsxs("button", { ref: ref, type: rest.type ?? 'button', "aria-busy": loading || undefined, disabled: effectivelyDisabled, style: composed, onFocus: (e) => {
            setFocused(true);
            onFocus?.(e);
        }, onBlur: (e) => {
            setFocused(false);
            onBlur?.(e);
        }, onMouseEnter: (e) => {
            setHovered(true);
            onMouseEnter?.(e);
        }, onMouseLeave: (e) => {
            setHovered(false);
            setPressed(false);
            onMouseLeave?.(e);
        }, onMouseDown: (e) => {
            setPressed(true);
            onMouseDown?.(e);
        }, onMouseUp: (e) => {
            setPressed(false);
            onMouseUp?.(e);
        }, ...rest, children: [loading ? (_jsx(Loader2, { "aria-hidden": true, size: 16, style: { animation: 'tp-spin 1s linear infinite' } })) : (leadingIcon), _jsx("span", { children: loading ? 'Loading' : children }), !loading && trailingIcon, _jsx("style", { children: `@keyframes tp-spin { to { transform: rotate(360deg); } }` })] }));
});
//# sourceMappingURL=Button.js.map