/**
 * Ensemble combination of LINEAR + EWMA + AR(1).
 *
 * Projected values at each horizon use the median across methods (robust to a single
 * method going wild). Breach date is the median of method breach dates, but only when
 * at least two methods project a breach within horizon; otherwise null. Ensemble
 * agreement is exp(-cv) where cv is the coefficient of variation of the method breach
 * days, substituting the horizon when a method projects no breach (see
 * METHODOLOGY.md §6 for derivation).
 */
import { type AssumptionBaseline, type EnsembleForecast, type ForecastConfig, type Measurement } from './types';
export declare function ensembleForecast(measurements: Measurement[], baseline: AssumptionBaseline, config?: ForecastConfig): EnsembleForecast;
/**
 * Ensemble agreement = exp(-cv), where cv is the coefficient of variation of the
 * method breach days. A method that projects no breach within horizon contributes the
 * horizon value, treating "no breach" as the latest possible event. Returns 1 when all
 * three methods agree perfectly (cv = 0) and approaches 0 as disagreement grows.
 */
export declare function computeEnsembleAgreement(breachDates: Array<Date | null>, now: Date, horizonDays: number): number;
//# sourceMappingURL=ensemble.d.ts.map