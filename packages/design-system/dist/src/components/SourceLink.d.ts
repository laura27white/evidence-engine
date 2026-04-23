import { type AnchorHTMLAttributes, type ReactNode } from 'react';
export interface SourceLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
    /** Destination URL. Required. */
    href: string;
    /** Short label; e.g. "ONS:D7G7" or the document title. */
    label: ReactNode;
    /** Visual emphasis. `muted` stays tertiary; `default` is accent teal. */
    tone?: 'default' | 'muted';
    /** Size modifier. */
    size?: 'sm' | 'md';
}
export declare const SourceLink: import("react").ForwardRefExoticComponent<SourceLinkProps & import("react").RefAttributes<HTMLAnchorElement>>;
//# sourceMappingURL=SourceLink.d.ts.map