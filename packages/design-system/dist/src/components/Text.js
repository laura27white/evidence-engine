import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Text: typographic primitive.
 *
 * Renders any semantic element with a scale from the typography tokens. Use via
 *   <Text variant="displayLarge" as="h1" tone="primary">Hello</Text>
 * The default element is <p>; for headings pass `as="h1"` through `h6"`.
 */
import { forwardRef } from 'react';
import { colour } from '../../tokens/colour';
import { fontFamily, scaleStyle } from '../foundations/style-utils';
const toneColour = {
    primary: colour.ink.primary,
    secondary: colour.ink.secondary,
    tertiary: colour.ink.tertiary,
    inverse: colour.ink.inverse,
    accent: colour.accent.teal,
};
const variantFamily = {
    displayMax: fontFamily.display,
    displayLarge: fontFamily.display,
    displayMedium: fontFamily.display,
    displaySmall: fontFamily.display,
    monoLarge: fontFamily.mono,
    mono: fontFamily.mono,
    monoSmall: fontFamily.mono,
};
export const Text = forwardRef(function Text({ as: Component = 'p', variant = 'body', tone = 'primary', truncate, style, children, ...rest }, ref) {
    const resolvedFamily = variantFamily[variant] ?? fontFamily.body;
    const baseStyle = {
        ...scaleStyle(variant),
        color: toneColour[tone],
        fontFamily: resolvedFamily,
        margin: 0,
        ...(truncate
            ? {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
            }
            : {}),
    };
    return (_jsx(Component, { ref: ref, style: { ...baseStyle, ...style }, ...rest, children: children }));
});
//# sourceMappingURL=Text.js.map