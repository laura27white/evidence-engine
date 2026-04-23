/**
 * Recency component: how recently was the assumption reviewed, relative to its cadence?
 *
 * Piecewise:
 *   d <= c        -> 100 (within cadence)
 *   c < d <= 3c   -> linear decay from 100 to 20
 *   d > 3c        -> 20 * exp(-(d - 3c) / c)   tail (never reaches zero)
 *
 * No lastReviewDate -> 50 (no information, not lowest because "unknown" and "known stale"
 * are distinct epistemic states).
 */
export declare function computeRecency(lastReviewDate: Date | null, reviewCadenceDays: number, now: Date): number;
//# sourceMappingURL=recency.d.ts.map