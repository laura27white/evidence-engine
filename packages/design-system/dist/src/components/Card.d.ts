/**
 * Card: paper surface primitive.
 *
 * Variants: `default` (flat, hairline), `elevated` (soft shadow, used on hover or
 * emphasis), `outlined` (stronger line, no background tint), `flush` (no padding, used
 * when children render their own spacing). Always render a `<section>` or `<article>`
 * element; pass `as` to override.
 */
import { type ElementType, type HTMLAttributes, type ReactNode } from 'react';
export type CardVariant = 'default' | 'elevated' | 'outlined' | 'flush';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';
export interface CardProps extends HTMLAttributes<HTMLElement> {
    variant?: CardVariant;
    padding?: CardPadding;
    as?: ElementType;
    children?: ReactNode;
}
export declare const Card: import("react").ForwardRefExoticComponent<CardProps & import("react").RefAttributes<HTMLElement>>;
//# sourceMappingURL=Card.d.ts.map