/**
 * Combines the four confidence components into a single score.
 *
 * When cross-source agreement is absent, its weight is redistributed proportionally
 * across the remaining three components so the final weights still sum to 1. The
 * interpretation bands (HIGH/MODERATE/LOW) are fixed at 75 and 50; see
 * METHODOLOGY.md §6 for the rationale and limitations.
 */
import { type ConfidenceInputs, type ConfidenceScore, type ConfidenceWeights } from './types';
export declare function computeConfidence(inputs: ConfidenceInputs, overrides?: Partial<ConfidenceWeights>): ConfidenceScore;
//# sourceMappingURL=score.d.ts.map