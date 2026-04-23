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

import { computeLeadTime } from './leadtime';
import { forecastAr1 } from './methods/ar1';
import { forecastEwma } from './methods/ewma';
import { forecastLinear } from './methods/linear';
import {
  DEFAULT_FORECAST_CONFIG,
  type AssumptionBaseline,
  type EnsembleForecast,
  type ForecastConfig,
  type Measurement,
  type MethodForecast,
} from './types';
import { hashSeries } from './validate';

export function ensembleForecast(
  measurements: Measurement[],
  baseline: AssumptionBaseline,
  config: ForecastConfig = {},
): EnsembleForecast {
  const horizonDays = config.horizonDays ?? DEFAULT_FORECAST_CONFIG.horizonDays;
  const now = config.nowOverride ?? new Date();
  const effective: ForecastConfig = { ...config, nowOverride: now };

  const members: MethodForecast[] = [
    forecastLinear(measurements, baseline, effective),
    forecastEwma(measurements, baseline, effective),
    forecastAr1(measurements, baseline, effective),
  ];

  const projected30d = median(members.map((m) => m.projected30d));
  const projected90d = median(members.map((m) => m.projected90d));
  const projected365d = median(members.map((m) => m.projected365d));

  const breachDates = members.map((m) => m.breachDate);
  const membersWithBreach = breachDates.filter((d): d is Date => d !== null);
  const breachDate = membersWithBreach.length >= 2 ? medianDate(membersWithBreach) : null;

  const lowerBounds = members
    .map((m) => m.breachConfidenceInterval?.[0])
    .filter((d): d is Date => d !== undefined);
  const upperBounds = members
    .map((m) => m.breachConfidenceInterval?.[1])
    .filter((d): d is Date => d !== undefined);
  const breachConfidenceInterval: [Date, Date] | null =
    breachDate !== null && lowerBounds.length > 0 && upperBounds.length > 0
      ? [
          new Date(Math.min(...lowerBounds.map((d) => d.getTime()))),
          new Date(Math.max(...upperBounds.map((d) => d.getTime()))),
        ]
      : null;

  const leadTimeDays = computeLeadTime(breachDate, now);
  const ensembleAgreement = computeEnsembleAgreement(breachDates, now, horizonDays);

  return {
    projected30d,
    projected90d,
    projected365d,
    breachDate,
    breachConfidenceInterval,
    leadTimeDays,
    ensembleAgreement,
    memberForecasts: members,
    computedAt: now,
    inputSeriesHash: hashSeries(measurements),
  };
}

/**
 * Ensemble agreement = exp(-cv), where cv is the coefficient of variation of the
 * method breach days. A method that projects no breach within horizon contributes the
 * horizon value, treating "no breach" as the latest possible event. Returns 1 when all
 * three methods agree perfectly (cv = 0) and approaches 0 as disagreement grows.
 */
export function computeEnsembleAgreement(
  breachDates: Array<Date | null>,
  now: Date,
  horizonDays: number,
): number {
  const days = breachDates.map((d) =>
    d === null ? horizonDays : Math.max(0, (d.getTime() - now.getTime()) / 86_400_000),
  );
  const mean = days.reduce((a, b) => a + b, 0) / days.length;
  const variance = days.reduce((acc, d) => acc + (d - mean) ** 2, 0) / days.length;
  const sd = Math.sqrt(variance);
  const cv = sd / Math.max(mean, 1);
  return Math.exp(-cv);
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) return (sorted[mid - 1]! + sorted[mid]!) / 2;
  return sorted[mid]!;
}

function medianDate(dates: Date[]): Date {
  const ms = dates.map((d) => d.getTime()).sort((a, b) => a - b);
  const mid = Math.floor(ms.length / 2);
  const value = ms.length % 2 === 0 ? (ms[mid - 1]! + ms[mid]!) / 2 : ms[mid]!;
  return new Date(value);
}
