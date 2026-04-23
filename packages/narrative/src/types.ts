/**
 * Narrative domain types. Pure; no I/O.
 */

export type Severity = 'safe' | 'warning' | 'critical';
export type ConfidenceBand = 'HIGH' | 'MODERATE' | 'LOW';

export interface NarrativeSummary {
  totalAssumptions: number;
  breachingNow: number;
  breachingWithin30d: number;
  breachingWithin90d: number;
  overallDriftScore: number;
  globalFragility: number;
  topDrivers: Array<{ code: string; description: string; driverScore: number }>;
  mostAtRisk: Array<{
    code: string;
    description: string;
    leadTimeDays: number;
    severity: Severity;
    confidence: ConfidenceBand;
  }>;
  externalSignals: Array<{
    code: string;
    description: string;
    baselineValue: number;
    currentValue: number;
    driftPct: number;
    lastRetrievedAt: Date;
  }>;
}

export interface NarrativeInput {
  project: { code: string; name: string; description: string };
  computedAt: Date;
  summary: NarrativeSummary;
}

export type NarrativeSource = 'pda-platform' | 'fallback';

export interface GeneratedBrief {
  narrativeText: string;
  source: NarrativeSource;
  cacheKey: string;
  computedAt: Date;
  pdaResponse?: unknown;
}

export type PdaError =
  | { kind: 'TIMEOUT'; elapsedMs: number }
  | { kind: 'NETWORK'; message: string }
  | { kind: 'PROTOCOL'; message: string }
  | { kind: 'VALIDATION'; message: string };

export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
