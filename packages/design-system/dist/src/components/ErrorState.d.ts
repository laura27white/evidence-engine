import { type HTMLAttributes, type ReactNode } from 'react';
export interface ErrorStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
    title: ReactNode;
    description?: ReactNode;
    /** Action slot, typically a retry Button. */
    action?: ReactNode;
    /** Optional technical detail, shown in a <details> so it does not dominate the layout. */
    technicalDetail?: ReactNode;
}
export declare const ErrorState: import("react").ForwardRefExoticComponent<ErrorStateProps & import("react").RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=ErrorState.d.ts.map