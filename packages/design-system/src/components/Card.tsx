/**
 * Card: paper surface primitive.
 *
 * Variants: `default` (flat, hairline), `elevated` (soft shadow, used on hover or
 * emphasis), `outlined` (stronger line, no background tint), `flush` (no padding, used
 * when children render their own spacing). Always render a `<section>` or `<article>`
 * element; pass `as` to override.
 */
import { forwardRef, type ElementType, type HTMLAttributes, type ReactNode } from 'react';

import { colour } from '../../tokens/colour';
import { space } from '../../tokens/space';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'flush';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  as?: ElementType;
  children?: ReactNode;
}

const paddingMap: Record<CardPadding, string> = {
  none: '0',
  sm: space.scale['4'],
  md: space.scale['6'],
  lg: space.scale['8'],
};

const variantStyle: Record<CardVariant, { background: string; border: string; boxShadow: string }> =
  {
    default: {
      background: colour.paper.creamElevated,
      border: `1px solid ${colour.line.hairline}`,
      boxShadow: space.shadow.hairline,
    },
    elevated: {
      background: colour.paper.white,
      border: `1px solid ${colour.line.hairline}`,
      boxShadow: space.shadow.soft,
    },
    outlined: {
      background: 'transparent',
      border: `1px solid ${colour.line.regular}`,
      boxShadow: 'none',
    },
    flush: {
      background: colour.paper.creamElevated,
      border: 'none',
      boxShadow: 'none',
    },
  };

export const Card = forwardRef<HTMLElement, CardProps>(function Card(
  { variant = 'default', padding = 'md', as: Component = 'section', style, children, ...rest },
  ref,
) {
  const { background, border, boxShadow } = variantStyle[variant];
  const composed = {
    background,
    border,
    borderRadius: space.radius.sm,
    boxShadow,
    padding: paddingMap[padding],
    color: colour.ink.primary,
    ...style,
  };
  return (
    <Component ref={ref} style={composed} {...rest}>
      {children}
    </Component>
  );
});
