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
import { type AssumptionBaseline, type ForecastConfig, type Measurement, type MethodForecast } from '../types';
export declare function forecastAr1(measurements: Measurement[], baseline: AssumptionBaseline, config?: ForecastConfig): MethodForecast;
//# sourceMappingURL=ar1.d.ts.map