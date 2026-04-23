/**
 * Helpers for TraceTimeline. Pure; unit-testable.
 */

export interface ForecastInput {
  projected30d: number;
  projected90d: number;
  projected365d: number;
  breachDate: Date | null;
  confidenceIntervalLower: number[];
  confidenceIntervalUpper: number[];
  computedAt: Date;
}

export interface ForecastEnvelope {
  t: number;
  lower: number;
  upper: number;
  central: number;
}

/**
 * Build per-day forecast envelope from 30/90/365d anchor points. We linearly
 * interpolate between the three anchors so the timeline can render a smooth cone
 * without requiring a full per-day response payload.
 */
export function forecastEnvelope(forecast: ForecastInput, now: Date): ForecastEnvelope[] {
  const baseline30 = forecast.projected30d;
  const baseline90 = forecast.projected90d;
  const baseline365 = forecast.projected365d;
  const spreadFallback =
    Math.abs(baseline365 - baseline30) * 0.1 || Math.abs(baseline30) * 0.05 || 0.5;
  const lowerByHorizon: [number, number][] = [
    [30, forecast.confidenceIntervalLower[0] ?? baseline30 - spreadFallback * 0.5],
    [90, forecast.confidenceIntervalLower[1] ?? baseline90 - spreadFallback],
    [365, forecast.confidenceIntervalLower[2] ?? baseline365 - spreadFallback * 2],
  ];
  const upperByHorizon: [number, number][] = [
    [30, forecast.confidenceIntervalUpper[0] ?? baseline30 + spreadFallback * 0.5],
    [90, forecast.confidenceIntervalUpper[1] ?? baseline90 + spreadFallback],
    [365, forecast.confidenceIntervalUpper[2] ?? baseline365 + spreadFallback * 2],
  ];
  const centralByHorizon: [number, number][] = [
    [0, (baseline30 + (forecast.computedAt.getTime() === now.getTime() ? 0 : 0)) * 0 + baseline30],
    [30, baseline30],
    [90, baseline90],
    [365, baseline365],
  ];
  const out: ForecastEnvelope[] = [];
  const step = 7;
  for (let day = 0; day <= 365; day += step) {
    out.push({
      t: now.getTime() + day * 86_400_000,
      lower: interpolateAnchor(lowerByHorizon, day, baseline30),
      upper: interpolateAnchor(upperByHorizon, day, baseline30),
      central: interpolateAnchor(centralByHorizon, day, baseline30),
    });
  }
  return out;
}

function interpolateAnchor(anchors: [number, number][], day: number, fallback: number): number {
  if (anchors.length === 0) return fallback;
  if (day <= anchors[0]![0]) return anchors[0]![1];
  for (let i = 0; i < anchors.length - 1; i += 1) {
    const [xa, ya] = anchors[i]!;
    const [xb, yb] = anchors[i + 1]!;
    if (day <= xb) {
      const t = (day - xa) / (xb - xa);
      return ya + t * (yb - ya);
    }
  }
  return anchors[anchors.length - 1]![1];
}

/**
 * Describe the chart in prose for the figcaption fallback so screen readers and
 * printers receive the full data rather than just decorative SVG.
 */
export function describeTimeline(args: {
  code: string;
  description: string;
  baselineValue: number;
  baselineUnit: string;
  tolerancePct: number;
  measurementCount: number;
  firstMeasuredAt: Date | null;
  lastMeasuredAt: Date | null;
  latestValue: number | null;
  forecastBreachDate: Date | null;
  leadTimeDays: number | null;
}): string {
  const parts: string[] = [];
  parts.push(`Assumption ${args.code}: ${args.description}.`);
  parts.push(
    `Baseline ${args.baselineValue} ${args.baselineUnit} with tolerance plus or minus ${args.tolerancePct} per cent.`,
  );
  if (args.measurementCount === 0) {
    parts.push('No measurements recorded.');
  } else {
    parts.push(
      `${args.measurementCount} measurements from ${formatDate(args.firstMeasuredAt)} to ${formatDate(args.lastMeasuredAt)}. Latest value ${args.latestValue ?? '--'}.`,
    );
  }
  if (args.forecastBreachDate !== null) {
    parts.push(
      `Forecast projects a breach on ${formatDate(args.forecastBreachDate)}, ${args.leadTimeDays ?? 0} days from now.`,
    );
  } else {
    parts.push('No breach projected within the 365-day horizon.');
  }
  return parts.join(' ');
}

function formatDate(date: Date | null): string {
  if (date === null) return 'unknown';
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
