/**
 * Shared validation helpers for forecast methods.
 *
 * Measurements are rejected loudly (ForecastInputError) when they contain non-finite
 * values or when the input array is empty. Silent filtering would hide upstream data
 * quality issues.
 */
import { type Measurement } from './types';
export interface PreparedSeries {
    /** Sorted measurements ascending by measuredAt. */
    sorted: Measurement[];
    /** Days since first measurement (aligned with sorted[i]). */
    xDays: number[];
    /** Observed values (aligned with sorted[i]). */
    y: number[];
    /** Days from first measurement to "now". */
    daysToNow: number;
    /** Reference time origin: first measurement timestamp. */
    t0: Date;
}
export declare function prepareSeries(measurements: Measurement[], now: Date): PreparedSeries;
/** Root mean square of residuals; returns 0 when the series length is 1. */
export declare function rootMeanSquare(residuals: number[]): number;
/**
 * SHA-256-equivalent hash for input series. Implemented with a deterministic fold that
 * avoids a runtime dependency on Node's crypto module inside purely logical code paths,
 * while still producing a stable hex string for change detection. Collisions are not a
 * security concern here: the hash gates re-forecast decisions, nothing more.
 */
export declare function hashSeries(measurements: Measurement[]): string;
//# sourceMappingURL=validate.d.ts.map