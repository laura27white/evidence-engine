/**
 * Holt's linear method (double exponential smoothing).
 *
 * level_t = alpha * y_t + (1 - alpha) * (level_{t-1} + trend_{t-1})
 * trend_t = beta  * (level_t - level_{t-1}) + (1 - beta) * trend_{t-1}
 *
 * Forecast at t+h: level_t + h * trend_t. Because the projection is linear in h,
 * breach date is solved analytically via computeLinearBreach.
 */
import { type AssumptionBaseline, type ForecastConfig, type Measurement, type MethodForecast } from '../types';
export interface EwmaConfig extends ForecastConfig {
    alpha?: number;
    beta?: number;
}
export declare function forecastEwma(measurements: Measurement[], baseline: AssumptionBaseline, config?: EwmaConfig): MethodForecast;
//# sourceMappingURL=ewma.d.ts.map