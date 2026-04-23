/**
 * Text: typographic primitive.
 *
 * Renders any semantic element with a scale from the typography tokens. Use via
 *   <Text variant="displayLarge" as="h1" tone="primary">Hello</Text>
 * The default element is <p>; for headings pass `as="h1"` through `h6"`.
 */
import { forwardRef, type ElementType, type HTMLAttributes, type ReactNode } from 'react';

import { colour } from '../../tokens/colour';
import { fontFamily, scaleStyle } from '../foundations/style-utils';

import type { TypographyScale } from '../../tokens/typography';

export type TextTone = 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'accent';

export interface TextProps extends HTMLAttributes<HTMLElement> {
  /** Semantic element to render. Defaults to `p`. */
  as?: ElementType;
  /** Typography scale key from `typography.scale`. */
  variant?: TypographyScale;
  /** Ink colour. `accent` = teal. */
  tone?: TextTone;
  /** Truncates to one line with ellipsis when true. */
  truncate?: boolean;
  children?: ReactNode;
}

const toneColour: Record<TextTone, string> = {
  primary: colour.ink.primary,
  secondary: colour.ink.secondary,
  tertiary: colour.ink.tertiary,
  inverse: colour.ink.inverse,
  accent: colour.accent.teal,
};

const variantFamily: Partial<Record<TypographyScale, string>> = {
  displayMax: fontFamily.display,
  displayLarge: fontFamily.display,
  displayMedium: fontFamily.display,
  displaySmall: fontFamily.display,
  monoLarge: fontFamily.mono,
  mono: fontFamily.mono,
  monoSmall: fontFamily.mono,
};

export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  { as: Component = 'p', variant = 'body', tone = 'primary', truncate, style, children, ...rest },
  ref,
) {
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
          whiteSpace: 'nowrap' as const,
        }
      : {}),
  };
  return (
    <Component ref={ref} style={{ ...baseStyle, ...style }} {...rest}>
      {children}
    </Component>
  );
});
