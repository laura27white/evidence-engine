/**
 * Text: typographic primitive.
 *
 * Renders any semantic element with a scale from the typography tokens. Use via
 *   <Text variant="displayLarge" as="h1" tone="primary">Hello</Text>
 * The default element is <p>; for headings pass `as="h1"` through `h6"`.
 */
import { type ElementType, type HTMLAttributes, type ReactNode } from 'react';
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
export declare const Text: import("react").ForwardRefExoticComponent<TextProps & import("react").RefAttributes<HTMLElement>>;
//# sourceMappingURL=Text.d.ts.map