/**
 * Linear trend via ordinary least squares.
 *
 * Regresses observedValue on daysSinceFirstMeasurement. The breach date is computed
 * analytically from the fitted line. Confidence on the breach day is propagated from
 * the slope standard error via the delta method.
 */
import { computeLinearBreach, breachCI } from '../breach';
import { DEFAULT_FORECAST_CONFIG, } from '../types';
import { prepareSeries, rootMeanSquare } from '../validate';
const MIN_BREACH_DAYSE = 0.5;
export function forecastLinear(measurements, baseline, config = {}) {
    const horizonDays = config.horizonDays ?? DEFAULT_FORECAST_CONFIG.horizonDays;
    const minRequired = config.minMeasurementsRequired ?? DEFAULT_FORECAST_CONFIG.minMeasurementsRequired;
    const now = config.nowOverride ?? new Date();
    const { xDays, y, daysToNow } = prepareSeries(measurements, now);
    if (measurements.length < minRequired) {
        return degraded(measurements[measurements.length - 1].observedValue, baseline, now, horizonDays);
    }
    const n = xDays.length;
    const meanX = xDays.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;
    let sxx = 0;
    let sxy = 0;
    for (let i = 0; i < n; i += 1) {
        const dx = xDays[i] - meanX;
        sxx += dx * dx;
        sxy += dx * (y[i] - meanY);
    }
    if (sxx === 0) {
        return {
            method: 'LINEAR',
            projected30d: meanY,
            projected90d: meanY,
            projected365d: meanY,
            breachDate: computeLinearBreach(meanY, 0, baseline, { horizonDays, now }),
            breachConfidenceInterval: null,
            modelParams: { slope: 0, intercept: meanY, n, note: 'zero-variance-x' },
            residualStdError: 0,
            degraded: false,
        };
    }
    const slope = sxy / sxx;
    const intercept = meanY - slope * meanX;
    const residuals = y.map((yi, i) => yi - (intercept + slope * xDays[i]));
    const residualStdError = rootMeanSquare(residuals);
    const projectedAt = (days) => intercept + slope * (daysToNow + days);
    const breachDate = computeLinearBreach(intercept + slope * daysToNow, slope, baseline, {
        horizonDays,
        now,
    });
    const slopeSE = n > 2 ? Math.sqrt(residualStdError ** 2 / sxx) : 0;
    const dayStdError = slope !== 0 ? Math.max(MIN_BREACH_DAYSE, Math.abs(slopeSE / slope) * 30) : Infinity;
    return {
        method: 'LINEAR',
        projected30d: projectedAt(30),
        projected90d: projectedAt(90),
        projected365d: projectedAt(365),
        breachDate,
        breachConfidenceInterval: breachCI(breachDate, dayStdError, { horizonDays, now }),
        modelParams: { slope, intercept, n, slopeStdError: slopeSE },
        residualStdError,
        degraded: false,
    };
}
function degraded(flatValue, baseline, now, _horizonDays) {
    const tolerance = Math.abs(baseline.baselineValue) * (baseline.tolerancePct / 100);
    const alreadyBreached = Math.abs(flatValue - baseline.baselineValue) >= tolerance;
    return {
        method: 'LINEAR',
        projected30d: flatValue,
        projected90d: flatValue,
        projected365d: flatValue,
        breachDate: alreadyBreached ? now : null,
        breachConfidenceInterval: null,
        modelParams: { note: 'insufficient-measurements', flatValue },
        residualStdError: Infinity,
        degraded: true,
    };
}
//# sourceMappingURL=linear.js.map