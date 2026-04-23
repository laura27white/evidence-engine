/**
 * AR(1) with drift: y_t - mu = phi * (y_{t-1} - mu) + epsilon_t.
 *
 * Phi and mu estimated by method of moments: mu is the sample mean, phi is the lag-1
 * sample autocorrelation. When the implied process is non-stationary (|phi| >= 1) we
 * fall back to a random-walk-with-drift and record the fallback in model params.
 *
 * Breach date is iterated day-by-day because the expected forecast trajectory is
 * non-linear in h.
 */
import { computeIterativeBreach, breachCI } from '../breach';
import { DEFAULT_FORECAST_CONFIG, } from '../types';
import { prepareSeries, rootMeanSquare } from '../validate';
const RELIABLE_SAMPLE_THRESHOLD = 20;
export function forecastAr1(measurements, baseline, config = {}) {
    const horizonDays = config.horizonDays ?? DEFAULT_FORECAST_CONFIG.horizonDays;
    const minRequired = config.minMeasurementsRequired ?? DEFAULT_FORECAST_CONFIG.minMeasurementsRequired;
    const now = config.nowOverride ?? new Date();
    const { sorted, y } = prepareSeries(measurements, now);
    if (measurements.length < minRequired) {
        const last = sorted[sorted.length - 1].observedValue;
        const tolerance = Math.abs(baseline.baselineValue) * (baseline.tolerancePct / 100);
        const alreadyBreached = Math.abs(last - baseline.baselineValue) >= tolerance;
        return {
            method: 'AR1',
            projected30d: last,
            projected90d: last,
            projected365d: last,
            breachDate: alreadyBreached ? now : null,
            breachConfidenceInterval: null,
            modelParams: { note: 'insufficient-measurements' },
            residualStdError: Infinity,
            degraded: true,
        };
    }
    const n = y.length;
    const mu = y.reduce((a, b) => a + b, 0) / n;
    const centred = y.map((v) => v - mu);
    let num = 0;
    let den = 0;
    for (let i = 1; i < n; i += 1) {
        num += centred[i] * centred[i - 1];
    }
    for (let i = 0; i < n; i += 1) {
        den += centred[i] * centred[i];
    }
    let phi = den === 0 ? 0 : num / den;
    let fallback = 'none';
    if (!(phi > -1 && phi < 1)) {
        phi = 1;
        fallback = 'random-walk';
    }
    const last = y[n - 1];
    const drift = fallback === 'random-walk' ? (y[n - 1] - y[0]) / Math.max(1, n - 1) : 0;
    const residuals = [];
    for (let i = 1; i < n; i += 1) {
        const pred = fallback === 'random-walk' ? y[i - 1] + drift : mu + phi * (y[i - 1] - mu);
        residuals.push(y[i] - pred);
    }
    const residualStdError = rootMeanSquare(residuals);
    const project = (h) => {
        if (fallback === 'random-walk')
            return last + drift * h;
        return mu + Math.pow(phi, h) * (last - mu);
    };
    const breachDate = computeIterativeBreach(project, baseline, { horizonDays, now });
    const breachDaySE = n < RELIABLE_SAMPLE_THRESHOLD ? horizonDays / 4 : residualStdError * 5;
    return {
        method: 'AR1',
        projected30d: project(30),
        projected90d: project(90),
        projected365d: project(365),
        breachDate,
        breachConfidenceInterval: breachCI(breachDate, breachDaySE, { horizonDays, now }),
        modelParams: {
            phi,
            mu,
            drift,
            fallback,
            n,
            sampleWarning: n < RELIABLE_SAMPLE_THRESHOLD ? 'below-reliable-sample-threshold' : null,
        },
        residualStdError,
        degraded: false,
    };
}
//# sourceMappingURL=ar1.js.map