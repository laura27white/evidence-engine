import { type HTMLAttributes, type ReactNode } from 'react';
export type BadgeVariant = 'safe' | 'warning' | 'critical' | 'neutral';
export type BadgeSize = 'sm' | 'md';
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
    size?: BadgeSize;
    /** Overrides the default icon for the variant. Pass `null` to render icon-less. */
    icon?: ReactNode | null;
    /** The visible label; required for accessibility. */
    children: ReactNode;
}
export declare const Badge: import("react").ForwardRefExoticComponent<BadgeProps & import("react").RefAttributes<HTMLSpanElement>>;
//# sourceMappingURL=Badge.d.ts.map