/**
 * Holt's linear method (double exponential smoothing).
 *
 * level_t = alpha * y_t + (1 - alpha) * (level_{t-1} + trend_{t-1})
 * trend_t = beta  * (level_t - level_{t-1}) + (1 - beta) * trend_{t-1}
 *
 * Forecast at t+h: level_t + h * trend_t. Because the projection is linear in h,
 * breach date is solved analytically via computeLinearBreach.
 */
import { computeLinearBreach, breachCI } from '../breach';
import { DEFAULT_FORECAST_CONFIG, } from '../types';
import { prepareSeries, rootMeanSquare } from '../validate';
const DEFAULT_ALPHA = 0.3;
const DEFAULT_BETA = 0.1;
export function forecastEwma(measurements, baseline, config = {}) {
    const alpha = clamp(config.alpha ?? DEFAULT_ALPHA, 0, 1);
    const beta = clamp(config.beta ?? DEFAULT_BETA, 0, 1);
    const horizonDays = config.horizonDays ?? DEFAULT_FORECAST_CONFIG.horizonDays;
    const minRequired = config.minMeasurementsRequired ?? DEFAULT_FORECAST_CONFIG.minMeasurementsRequired;
    const now = config.nowOverride ?? new Date();
    const { sorted, y, xDays, daysToNow } = prepareSeries(measurements, now);
    if (measurements.length < minRequired) {
        const last = sorted[sorted.length - 1].observedValue;
        const tolerance = Math.abs(baseline.baselineValue) * (baseline.tolerancePct / 100);
        const alreadyBreached = Math.abs(last - baseline.baselineValue) >= tolerance;
        return {
            method: 'EWMA',
            projected30d: last,
            projected90d: last,
            projected365d: last,
            breachDate: alreadyBreached ? now : null,
            breachConfidenceInterval: null,
            modelParams: { alpha, beta, note: 'insufficient-measurements' },
            residualStdError: Infinity,
            degraded: true,
        };
    }
    let level = y[0];
    let trendDaily = y.length >= 2 ? (y[1] - y[0]) / Math.max(1, xDays[1] - xDays[0]) : 0;
    const predictions = [level];
    for (let i = 1; i < y.length; i += 1) {
        const dt = Math.max(1, xDays[i] - xDays[i - 1]);
        const forecast = level + trendDaily * dt;
        predictions.push(forecast);
        const newLevel = alpha * y[i] + (1 - alpha) * forecast;
        const newTrendDaily = (beta * (newLevel - level)) / dt + (1 - beta) * trendDaily;
        level = newLevel;
        trendDaily = newTrendDaily;
    }
    const residuals = y.map((yi, i) => yi - predictions[i]);
    const residualStdError = rootMeanSquare(residuals);
    const daysFromLastObs = daysToNow - xDays[xDays.length - 1];
    const intercept = level + trendDaily * daysFromLastObs;
    const projectAt = (h) => intercept + trendDaily * h;
    const breachDate = computeLinearBreach(intercept, trendDaily, baseline, { horizonDays, now });
    const dayStdError = trendDaily !== 0 ? residualStdError / Math.abs(trendDaily) : Infinity;
    return {
        method: 'EWMA',
        projected30d: projectAt(30),
        projected90d: projectAt(90),
        projected365d: projectAt(365),
        breachDate,
        breachConfidenceInterval: breachCI(breachDate, dayStdError, { horizonDays, now }),
        modelParams: { alpha, beta, level, trendPerDay: trendDaily, n: y.length },
        residualStdError,
        degraded: false,
    };
}
function clamp(value, lo, hi) {
    return Math.min(hi, Math.max(lo, value));
}
//# sourceMappingURL=ewma.js.map