/**
 * Volatility component. High CV of recent measurements erodes confidence.
 *
 * Fewer than three measurements -> 50 (insufficient data to judge volatility).
 * CV <= 0.05 -> 100. CV >= 0.50 -> 0. Linear interpolation between.
 * Window: defaults to "last 90 days" relative to now.
 */
import type { Measurement } from '../../forecast/types';
export declare function computeVolatility(measurements: Measurement[], now: Date): number;
//# sourceMappingURL=volatility.d.ts.map