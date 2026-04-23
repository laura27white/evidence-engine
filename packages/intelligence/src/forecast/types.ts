/** Forecast domain types. Pure; no I/O. */

export interface Measurement {
  assumptionId: string;
  measuredAt: Date;
  observedValue: number;
  source?: 'EXTERNAL_API' | 'MANUAL' | 'SYSTEM_DERIVED';
  externalDataRef?: string;
}

export interface AssumptionBaseline {
  /** Numeric baseline the tolerance is defined against. */
  baselineValue: number;
  /** Human-readable unit, e.g. '% YoY'. */
  baselineUnit: string;
  /** Tolerance as a percentage of baseline; e.g. 25 means drift breaches at +/-25%. */
  tolerancePct: number;
}

export type ForecastMethod = 'LINEAR' | 'EWMA' | 'AR1';

export interface MethodForecast {
  method: ForecastMethod;
  projected30d: number;
  projected90d: number;
  projected365d: number;
  /** Null if the method projects no breach within horizon. */
  breachDate: Date | null;
  /** Approximate CI for the breach date, or null when unavailable. */
  breachConfidenceInterval: [Date, Date] | null;
  modelParams: Record<string, unknown>;
  /** Root-mean-square of in-sample residuals. */
  residualStdError: number;
  /** Set to true when the method could not fit; forecasts fall through to flat projection. */
  degraded: boolean;
}

export interface EnsembleForecast {
  projected30d: number;
  projected90d: number;
  projected365d: number;
  breachDate: Date | null;
  breachConfidenceInterval: [Date, Date] | null;
  leadTimeDays: number | null;
  /** [0, 1]: 1 = perfect agreement, 0 = maximum disagreement. */
  ensembleAgreement: number;
  memberForecasts: MethodForecast[];
  computedAt: Date;
  /** SHA-256 of the sorted input series; used to detect when a re-forecast is needed. */
  inputSeriesHash: string;
}

export interface ForecastConfig {
  /** Horizon in days; default 365. */
  horizonDays?: number;
  /** Minimum measurements required to run the method without degradation; default 6. */
  minMeasurementsRequired?: number;
  /** Override 'now' for deterministic tests. */
  nowOverride?: Date;
}

export const DEFAULT_FORECAST_CONFIG: Required<
  Pick<ForecastConfig, 'horizonDays' | 'minMeasurementsRequired'>
> = {
  horizonDays: 365,
  minMeasurementsRequired: 6,
};

export class ForecastInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ForecastInputError';
  }
}
