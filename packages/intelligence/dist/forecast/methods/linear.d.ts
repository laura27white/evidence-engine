/**
 * Linear trend via ordinary least squares.
 *
 * Regresses observedValue on daysSinceFirstMeasurement. The breach date is computed
 * analytically from the fitted line. Confidence on the breach day is propagated from
 * the slope standard error via the delta method.
 */
import { type AssumptionBaseline, type ForecastConfig, type Measurement, type MethodForecast } from '../types';
export declare function forecastLinear(measurements: Measurement[], baseline: AssumptionBaseline, config?: ForecastConfig): MethodForecast;
//# sourceMappingURL=linear.d.ts.map