/**
 * Deterministic human-readable explanation for a ConfidenceScore. British English,
 * no em dashes (enforced by the repo-wide pre-commit check). Kept under 400
 * characters to fit Brief-view layouts.
 */

import type { ConfidenceScore } from './types';

export function explainConfidence(score: ConfidenceScore): string {
  const headline = score.score.toFixed(0);
  const levelWord =
    score.interpretation === 'HIGH'
      ? 'high'
      : score.interpretation === 'MODERATE'
        ? 'moderate'
        : 'low';
  const driver = pickDriver(score);
  const supporting = pickSupport(score, driver);
  const parts = [`Confidence: ${levelWord} (${headline}/100).`];
  if (driver) parts.push(driver);
  if (supporting) parts.push(supporting);
  const output = parts.join(' ');
  return output.length <= 400 ? output : output.slice(0, 397) + '...';
}

function pickDriver(score: ConfidenceScore): string | null {
  const order: Array<{ key: keyof typeof ORDER_TEXT; value: number }> = [
    { key: 'recency', value: score.components.recency },
    { key: 'sourceTier', value: score.components.sourceTier },
    { key: 'volatility', value: score.components.volatility },
  ];
  if (score.components.agreement !== null) {
    order.push({ key: 'agreement', value: score.components.agreement });
  }
  order.sort((a, b) => a.value - b.value);
  const worst = order[0]!;
  if (worst.value >= 75) return null;
  return ORDER_TEXT[worst.key];
}

function pickSupport(score: ConfidenceScore, usedDriver: string | null): string | null {
  const components: Array<{ key: keyof typeof SUPPORT_TEXT; value: number }> = [
    { key: 'recency', value: score.components.recency },
    { key: 'sourceTier', value: score.components.sourceTier },
    { key: 'volatility', value: score.components.volatility },
  ];
  components.sort((a, b) => b.value - a.value);
  const best = components[0]!;
  if (best.value < 75) return null;
  const text = SUPPORT_TEXT[best.key];
  if (usedDriver !== null && usedDriver === ORDER_TEXT[best.key]) return null;
  return text;
}

const ORDER_TEXT = {
  recency: 'The largest factor is recency: review cadence has slipped.',
  sourceTier:
    'The largest factor is source: this value relies on an internal estimate rather than an external statistic.',
  agreement:
    'The largest factor is cross-source agreement: alternative sources report materially different values.',
  volatility: 'The largest factor is volatility: the underlying measurement series is noisy.',
} as const;

const SUPPORT_TEXT = {
  recency: 'Review recency is within cadence.',
  sourceTier: 'The data source is a tier-1 official statistic.',
  volatility: 'The measurement series is stable, supporting the current reading.',
} as const;
