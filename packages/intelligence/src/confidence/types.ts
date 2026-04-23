/**
 * Confidence domain types. Pure; no I/O.
 */

import type { Measurement } from '../forecast/types';

export type SourceTier = 1 | 2 | 3;

export interface CrossSourceValue {
  source: string;
  value: number;
  asOf: Date;
}

export interface ConfidenceInputs {
  lastReviewDate: Date | null;
  reviewCadenceDays: number;
  sourceTier: SourceTier;
  measurements: Measurement[];
  crossSourceValues?: CrossSourceValue[];
  nowOverride?: Date;
}

export interface ConfidenceComponents {
  recency: number;
  sourceTier: number;
  /** null when fewer than two cross-source values are supplied. */
  agreement: number | null;
  volatility: number;
}

export interface ConfidenceWeights {
  recency: number;
  sourceTier: number;
  agreement: number;
  volatility: number;
}

export interface ConfidenceScore {
  score: number;
  components: ConfidenceComponents;
  weights: ConfidenceWeights;
  interpretation: 'HIGH' | 'MODERATE' | 'LOW';
  caveats: string[];
  computedAt: Date;
}

export const DEFAULT_WEIGHTS: ConfidenceWeights = {
  recency: 0.3,
  sourceTier: 0.25,
  agreement: 0.2,
  volatility: 0.25,
};

export const TIER_SCORES: Record<SourceTier, number> = {
  1: 100,
  2: 70,
  3: 40,
};
