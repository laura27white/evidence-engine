import { type HTMLAttributes, type ReactNode } from 'react';
export type KPITrend = 'up' | 'down' | 'flat';
export interface KPIProps extends HTMLAttributes<HTMLDivElement> {
    /** Uppercase label above the number (e.g. "Lead time"). */
    label: ReactNode;
    /** Primary numeric value; formatted by the caller. */
    value: ReactNode;
    /** Unit shown in smaller mono type to the right of the value (e.g. "days"). */
    unit?: ReactNode;
    /** Trend indicator. Colour follows the semantics: up for good is not inherent, so the caller decides. */
    trend?: KPITrend;
    /** Override the trend colour. Default: up = safe, down = critical, flat = tertiary ink. */
    trendTone?: 'positive' | 'negative' | 'neutral';
    /** Optional confidence interval shown in mono beneath. */
    confidenceInterval?: ReactNode;
    /** Size modifier. */
    size?: 'md' | 'lg';
}
export declare const KPI: import("react").ForwardRefExoticComponent<KPIProps & import("react").RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=KPI.d.ts.map