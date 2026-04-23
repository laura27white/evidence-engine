import 'server-only';

import { listAssumptions } from './assumptions';
import { listLatestConfidences } from './confidence';
import { DEMO_PROJECT_CODE } from './constants';
import { listLatestForecasts } from './forecasts';

import type { Assumption, ConfidenceScore, Forecast } from '@tp/db';

export type Severity = 'SAFE' | 'WARNING' | 'CRITICAL';
export type ConfidenceBand = 'HIGH' | 'MODERATE' | 'LOW' | 'UNKNOWN';

export interface HorizonRow {
  assumption: Assumption;
  forecast: Forecast | null;
  confidence: ConfidenceScore | null;
  severity: Severity;
  confidenceBand: ConfidenceBand;
}

export interface HorizonSummary {
  averageLeadTime: number | null;
  assumptionsInBreach: number;
  assumptionsWithin30Days: number;
  assumptionsWithLowConfidence: number;
  assumptionCount: number;
  latestComputedAt: Date | null;
}

export interface HorizonData {
  rows: HorizonRow[];
  summary: HorizonSummary;
}

export async function loadHorizonData(
  projectCode: string = DEMO_PROJECT_CODE,
): Promise<HorizonData> {
  const [assumptions, forecastsById, confidencesById] = await Promise.all([
    listAssumptions(projectCode),
    listLatestForecasts(projectCode),
    listLatestConfidences(projectCode),
  ]);

  const rows: HorizonRow[] = assumptions.map((assumption) => {
    const forecast = forecastsById.get(assumption.id) ?? null;
    const confidence = confidencesById.get(assumption.id) ?? null;
    return {
      assumption,
      forecast,
      confidence,
      severity: deriveSeverity(forecast),
      confidenceBand: deriveConfidenceBand(confidence),
    };
  });

  rows.sort((a, b) => severityRank(a, b));

  const leadTimes = rows
    .map((r) => r.forecast?.lead_time_days ?? null)
    .filter((v): v is number => v !== null);
  const summary: HorizonSummary = {
    averageLeadTime:
      leadTimes.length === 0 ? null : leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length,
    assumptionsInBreach: rows.filter((r) => r.severity === 'CRITICAL').length,
    assumptionsWithin30Days: rows.filter(
      (r) => r.forecast?.lead_time_days !== null && (r.forecast?.lead_time_days ?? 9999) <= 30,
    ).length,
    assumptionsWithLowConfidence: rows.filter((r) => r.confidenceBand === 'LOW').length,
    assumptionCount: rows.length,
    latestComputedAt:
      rows
        .map((r) => (r.forecast ? new Date(r.forecast.computed_at) : null))
        .filter((d): d is Date => d !== null)
        .sort((a, b) => b.getTime() - a.getTime())[0] ?? null,
  };

  return { rows, summary };
}

export function deriveSeverity(forecast: Forecast | null): Severity {
  if (forecast === null) return 'SAFE';
  const lead = forecast.lead_time_days;
  if (lead === null) return 'SAFE';
  if (lead <= 0) return 'CRITICAL';
  if (lead <= 90) return 'WARNING';
  return 'SAFE';
}

export function deriveConfidenceBand(confidence: ConfidenceScore | null): ConfidenceBand {
  if (confidence === null) return 'UNKNOWN';
  if (confidence.score >= 75) return 'HIGH';
  if (confidence.score >= 50) return 'MODERATE';
  return 'LOW';
}

function severityRank(a: HorizonRow, b: HorizonRow): number {
  const scoreA = severityWeight(a.severity) * 10_000 + (a.forecast?.lead_time_days ?? 9999);
  const scoreB = severityWeight(b.severity) * 10_000 + (b.forecast?.lead_time_days ?? 9999);
  return scoreA - scoreB;
}

function severityWeight(s: Severity): number {
  if (s === 'CRITICAL') return 0;
  if (s === 'WARNING') return 1;
  return 2;
}
