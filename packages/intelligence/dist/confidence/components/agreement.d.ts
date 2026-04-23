/**
 * Cross-source agreement component.
 *
 * Fewer than two sources -> null (weight redistributed by the aggregator).
 * Coefficient of variation <= 0.02 -> 100.
 * Coefficient of variation >= 0.20 -> 0.
 * Linear interpolation in between.
 *
 * When the sample mean is exactly zero the CV is undefined; we fall back to the
 * absolute standard deviation in place of CV so a flat-zero series does not produce
 * NaN.
 */
import type { CrossSourceValue } from '../types';
export declare function computeAgreement(values: CrossSourceValue[] | undefined): number | null;
//# sourceMappingURL=agreement.d.ts.map