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
export declare const DEFAULT_WEIGHTS: ConfidenceWeights;
export declare const TIER_SCORES: Record<SourceTier, number>;
//# sourceMappingURL=types.d.ts.map