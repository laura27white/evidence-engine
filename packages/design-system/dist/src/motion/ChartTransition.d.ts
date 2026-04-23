import { type HTMLAttributes, type ReactNode } from 'react';
export interface ChartTransitionProps extends HTMLAttributes<HTMLDivElement> {
    /** Unique key for the current chart state. Changing this triggers the transition. */
    transitionKey: string | number;
    children: ReactNode;
}
export declare function ChartTransition({ transitionKey, children, ...rest }: ChartTransitionProps): JSX.Element;
//# sourceMappingURL=ChartTransition.d.ts.map