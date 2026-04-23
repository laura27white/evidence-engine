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
export function computeRecency(lastReviewDate, reviewCadenceDays, now) {
    if (lastReviewDate === null)
        return 50;
    if (reviewCadenceDays <= 0)
        return 50;
    const daysSince = Math.max(0, (now.getTime() - lastReviewDate.getTime()) / 86_400_000);
    const c = reviewCadenceDays;
    if (daysSince <= c)
        return 100;
    if (daysSince <= 3 * c) {
        const fraction = (daysSince - c) / (2 * c);
        return 100 - fraction * 80;
    }
    return 20 * Math.exp(-(daysSince - 3 * c) / c);
}
//# sourceMappingURL=recency.js.map