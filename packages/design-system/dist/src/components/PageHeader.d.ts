/**
 * PageHeader: editorial page-level header.
 *
 * Large serif display title, optional short kicker above in label-mono, optional
 * subtitle below in body, optional meta row (time range, filter chips, data sources).
 * Used at the top of every page to anchor the eye.
 */
import { type HTMLAttributes, type ReactNode } from 'react';
export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
    /** Short label above the title, e.g. "MPA Challenge 5". */
    kicker?: ReactNode;
    /** Primary title; displayed in serif. */
    title: ReactNode;
    /** Optional subtitle in body type. */
    subtitle?: ReactNode;
    /** Optional meta row rendered beneath the subtitle. */
    meta?: ReactNode;
    /** Trailing actions rendered top-right. */
    actions?: ReactNode;
    /** Size modifier controls the title scale. `lg` uses displayLarge, `xl` uses displayMax. */
    size?: 'md' | 'lg' | 'xl';
}
export declare const PageHeader: import("react").ForwardRefExoticComponent<PageHeaderProps & import("react").RefAttributes<HTMLElement>>;
//# sourceMappingURL=PageHeader.d.ts.map