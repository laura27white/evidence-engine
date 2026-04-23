/**
 * EmptyState: intentional no-data surface.
 *
 * Serif display heading, body explanation, optional action. Should feel like a
 * considered editorial choice rather than a broken screen.
 */
import { type HTMLAttributes, type ReactNode } from 'react';
export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
    title: ReactNode;
    description?: ReactNode;
    /** Action slot, typically a Button. */
    action?: ReactNode;
    /** Optional decorative icon above the title. */
    icon?: ReactNode;
}
export declare const EmptyState: import("react").ForwardRefExoticComponent<EmptyStateProps & import("react").RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=EmptyState.d.ts.map