import { type HTMLAttributes } from 'react';
export type SeverityLevel = 'safe' | 'warning' | 'critical';
export interface SeverityIndicatorProps extends HTMLAttributes<HTMLSpanElement> {
    level: SeverityLevel;
    /** The short data value, e.g. "+0.8pp" or "42%". */
    value: string;
    /** Human-readable label for screen readers. */
    label?: string;
}
export declare const SeverityIndicator: import("react").ForwardRefExoticComponent<SeverityIndicatorProps & import("react").RefAttributes<HTMLSpanElement>>;
//# sourceMappingURL=SeverityIndicator.d.ts.map