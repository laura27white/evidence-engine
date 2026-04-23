/**
 * Breach-date computation shared by forecast methods.
 *
 * A breach occurs when |value(t) - baseline| >= tolerance, where
 * tolerance = baseline * tolerancePct / 100.
 */
import type { AssumptionBaseline } from './types';
export interface BreachOptions {
    /** Horizon in days; search terminates after this many days. */
    horizonDays: number;
    /** Reference "now" used to project forward. */
    now: Date;
}
/**
 * Solve analytically for the first day where a linear path value(t) = a + b*t breaches.
 * Returns null if no breach within horizon, or if both slope and starting offset imply no crossing.
 */
export declare function computeLinearBreach(intercept: number, slope: number, baseline: AssumptionBaseline, options: BreachOptions): Date | null;
/**
 * Iterate day by day with a supplied projection function and return the first breach date.
 * Used by AR(1) because its forecast is non-linear in h.
 */
export declare function computeIterativeBreach(project: (h: number) => number, baseline: AssumptionBaseline, options: BreachOptions): Date | null;
/**
 * Compute a breach-date confidence interval from a symmetric SE on the breach-day estimate.
 * Clamps lower bound to "now" and upper bound to horizon.
 */
export declare function breachCI(breachDate: Date | null, dayStdError: number, options: BreachOptions): [Date, Date] | null;
//# sourceMappingURL=breach.d.ts.map