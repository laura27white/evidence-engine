/**
 * Volatility component. High CV of recent measurements erodes confidence.
 *
 * Fewer than three measurements -> 50 (insufficient data to judge volatility).
 * CV <= 0.05 -> 100. CV >= 0.50 -> 0. Linear interpolation between.
 * Window: defaults to "last 90 days" relative to now.
 */
const LOW_CV = 0.05;
const HIGH_CV = 0.5;
const WINDOW_DAYS = 90;
export function computeVolatility(measurements, now) {
    const cutoff = now.getTime() - WINDOW_DAYS * 86_400_000;
    const recent = measurements.filter((m) => m.measuredAt.getTime() >= cutoff);
    if (recent.length < 3)
        return 50;
    const xs = recent.map((m) => m.observedValue);
    const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
    const variance = xs.reduce((acc, x) => acc + (x - mean) ** 2, 0) / xs.length;
    const sd = Math.sqrt(variance);
    const cv = mean === 0 ? sd : sd / Math.abs(mean);
    if (cv <= LOW_CV)
        return 100;
    if (cv >= HIGH_CV)
        return 0;
    return 100 - ((cv - LOW_CV) / (HIGH_CV - LOW_CV)) * 100;
}
//# sourceMappingURL=volatility.js.map