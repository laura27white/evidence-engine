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

const LOW_CV = 0.02;
const HIGH_CV = 0.2;

export function computeAgreement(values: CrossSourceValue[] | undefined): number | null {
  if (!values || values.length < 2) return null;
  const xs = values.map((v) => v.value);
  const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
  const variance = xs.reduce((acc, x) => acc + (x - mean) ** 2, 0) / xs.length;
  const sd = Math.sqrt(variance);
  const cv = mean === 0 ? sd : sd / Math.abs(mean);
  if (cv <= LOW_CV) return 100;
  if (cv >= HIGH_CV) return 0;
  return 100 - ((cv - LOW_CV) / (HIGH_CV - LOW_CV)) * 100;
}
