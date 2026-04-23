import { type CSSProperties, type ReactNode } from 'react';
export interface PageTransitionProps {
    /** Unique key for the page, typically the pathname. */
    pathname: string;
    children: ReactNode;
    /** Optional class name applied to the wrapping div. */
    className?: string;
    /** Optional style applied to the wrapping div. */
    style?: CSSProperties;
}
export declare function PageTransition({ pathname, children, className, style, }: PageTransitionProps): JSX.Element;
//# sourceMappingURL=PageTransition.d.ts.map