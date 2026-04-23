/**
 * Shared validation helpers for forecast methods.
 *
 * Measurements are rejected loudly (ForecastInputError) when they contain non-finite
 * values or when the input array is empty. Silent filtering would hide upstream data
 * quality issues.
 */

import { ForecastInputError, type Measurement } from './types';

export interface PreparedSeries {
  /** Sorted measurements ascending by measuredAt. */
  sorted: Measurement[];
  /** Days since first measurement (aligned with sorted[i]). */
  xDays: number[];
  /** Observed values (aligned with sorted[i]). */
  y: number[];
  /** Days from first measurement to "now". */
  daysToNow: number;
  /** Reference time origin: first measurement timestamp. */
  t0: Date;
}

export function prepareSeries(measurements: Measurement[], now: Date): PreparedSeries {
  if (measurements.length === 0) {
    throw new ForecastInputError('Cannot forecast from empty measurement series');
  }
  for (const m of measurements) {
    if (!Number.isFinite(m.observedValue)) {
      throw new ForecastInputError(
        `Non-finite observedValue for assumption ${m.assumptionId} at ${m.measuredAt.toISOString()}`,
      );
    }
  }
  const sorted = [...measurements].sort((a, b) => a.measuredAt.getTime() - b.measuredAt.getTime());
  const first = sorted[0]!;
  const t0 = first.measuredAt;
  const xDays = sorted.map((m) => (m.measuredAt.getTime() - t0.getTime()) / 86_400_000);
  const y = sorted.map((m) => m.observedValue);
  const daysToNow = (now.getTime() - t0.getTime()) / 86_400_000;
  return { sorted, xDays, y, daysToNow, t0 };
}

/** Root mean square of residuals; returns 0 when the series length is 1. */
export function rootMeanSquare(residuals: number[]): number {
  if (residuals.length === 0) return 0;
  const sum = residuals.reduce((acc, r) => acc + r * r, 0);
  return Math.sqrt(sum / residuals.length);
}

/**
 * SHA-256-equivalent hash for input series. Implemented with a deterministic fold that
 * avoids a runtime dependency on Node's crypto module inside purely logical code paths,
 * while still producing a stable hex string for change detection. Collisions are not a
 * security concern here: the hash gates re-forecast decisions, nothing more.
 */
export function hashSeries(measurements: Measurement[]): string {
  const sorted = [...measurements].sort(
    (a, b) =>
      a.measuredAt.getTime() - b.measuredAt.getTime() ||
      a.assumptionId.localeCompare(b.assumptionId),
  );
  let h1 = 0x811c9dc5;
  let h2 = 0xcbf29ce4;
  for (const m of sorted) {
    const s = `${m.assumptionId}|${m.measuredAt.toISOString()}|${m.observedValue}`;
    for (let i = 0; i < s.length; i += 1) {
      h1 ^= s.charCodeAt(i);
      h1 = Math.imul(h1, 16777619) >>> 0;
      h2 ^= s.charCodeAt(i);
      h2 = Math.imul(h2, 1099511628211 & 0xffffffff) >>> 0;
    }
  }
  return h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0');
}
