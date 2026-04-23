/**
 * Breach-date computation shared by forecast methods.
 *
 * A breach occurs when |value(t) - baseline| >= tolerance, where
 * tolerance = baseline * tolerancePct / 100.
 */
/**
 * Solve analytically for the first day where a linear path value(t) = a + b*t breaches.
 * Returns null if no breach within horizon, or if both slope and starting offset imply no crossing.
 */
export function computeLinearBreach(intercept, slope, baseline, options) {
    const tolerance = Math.abs(baseline.baselineValue) * (baseline.tolerancePct / 100);
    const upper = baseline.baselineValue + tolerance;
    const lower = baseline.baselineValue - tolerance;
    const candidates = [];
    if (slope !== 0) {
        const tUpper = (upper - intercept) / slope;
        const tLower = (lower - intercept) / slope;
        if (Number.isFinite(tUpper) && tUpper >= 0)
            candidates.push(tUpper);
        if (Number.isFinite(tLower) && tLower >= 0)
            candidates.push(tLower);
    }
    if (intercept >= upper || intercept <= lower)
        candidates.push(0);
    if (candidates.length === 0)
        return null;
    const t = Math.min(...candidates);
    if (t > options.horizonDays)
        return null;
    return new Date(options.now.getTime() + Math.ceil(t) * 86_400_000);
}
/**
 * Iterate day by day with a supplied projection function and return the first breach date.
 * Used by AR(1) because its forecast is non-linear in h.
 */
export function computeIterativeBreach(project, baseline, options) {
    const tolerance = Math.abs(baseline.baselineValue) * (baseline.tolerancePct / 100);
    for (let h = 0; h <= options.horizonDays; h += 1) {
        const value = project(h);
        if (Math.abs(value - baseline.baselineValue) >= tolerance) {
            return new Date(options.now.getTime() + h * 86_400_000);
        }
    }
    return null;
}
/**
 * Compute a breach-date confidence interval from a symmetric SE on the breach-day estimate.
 * Clamps lower bound to "now" and upper bound to horizon.
 */
export function breachCI(breachDate, dayStdError, options) {
    if (breachDate === null || !Number.isFinite(dayStdError) || dayStdError < 0)
        return null;
    const centre = (breachDate.getTime() - options.now.getTime()) / 86_400_000;
    const lowerDays = Math.max(0, centre - 1.96 * dayStdError);
    const upperDays = Math.min(options.horizonDays, centre + 1.96 * dayStdError);
    const lower = new Date(options.now.getTime() + lowerDays * 86_400_000);
    const upper = new Date(options.now.getTime() + upperDays * 86_400_000);
    return [lower, upper];
}
//# sourceMappingURL=breach.js.map