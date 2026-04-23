/**
 * Timestamp: renders relative time with an absolute tooltip and accessible long form.
 *
 * Uses mono font. The rendered text updates every 15 seconds while the document is
 * visible so the "14 seconds ago" string stays fresh; paused when the tab is hidden to
 * avoid useless work.
 */
import { type HTMLAttributes } from 'react';
export interface TimestampProps extends HTMLAttributes<HTMLTimeElement> {
    /** ISO 8601 timestamp; Date is also accepted for convenience. */
    at: string | Date;
    /** How often to refresh, in ms. Defaults to 15s. */
    refreshMs?: number;
    /** Force the display mode. Default is relative ("14s ago") with absolute tooltip. */
    mode?: 'relative' | 'absolute' | 'both';
}
export declare const Timestamp: import("react").ForwardRefExoticComponent<TimestampProps & import("react").RefAttributes<HTMLTimeElement>>;
//# sourceMappingURL=Timestamp.d.ts.map