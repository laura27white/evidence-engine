/**
 * HorizonBar: the primitive for the Horizon view.
 *
 * A horizontal bar representing a 12-month horizon from `today` into the future. The
 * bar carries four visual elements:
 *   1. A coloured severity segment from the start of the horizon to `currentPosition`
 *      (0..1), showing drift accumulated to date.
 *   2. A dashed extension to the right of `currentPosition` showing the forecast cone.
 *   3. A vertical tick at `projectedBreach` (0..1 or null) marking the projected breach
 *      date.
 *   4. An accessible long-form description in an adjacent `<span>` so screen readers
 *      receive the full data rather than just the bar.
 */
import { type HTMLAttributes } from 'react';
export interface HorizonBarProps extends HTMLAttributes<HTMLDivElement> {
    /** Fraction along the horizon of the current observed position, in [0, 1]. */
    currentPosition: number;
    /** Fraction at which the forecast predicts breach, or null if no breach projected. */
    projectedBreach?: number | null;
    /** Severity of the current drift state. Controls the fill colour. */
    severity: 'safe' | 'warning' | 'critical';
    /** Total horizon duration label, displayed at the far right. Example: "12 months". */
    horizonLabel?: string;
    /** Accessible description. Always rendered in an off-screen span. */
    description: string;
}
export declare const HorizonBar: import("react").ForwardRefExoticComponent<HorizonBarProps & import("react").RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=HorizonBar.d.ts.map