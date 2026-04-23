/**
 * Combines the four confidence components into a single score.
 *
 * When cross-source agreement is absent, its weight is redistributed proportionally
 * across the remaining three components so the final weights still sum to 1. The
 * interpretation bands (HIGH/MODERATE/LOW) are fixed at 75 and 50; see
 * METHODOLOGY.md §6 for the rationale and limitations.
 */
import { computeAgreement } from './components/agreement';
import { computeRecency } from './components/recency';
import { computeSourceTier } from './components/source-tier';
import { computeVolatility } from './components/volatility';
import { DEFAULT_WEIGHTS, } from './types';
export function computeConfidence(inputs, overrides) {
    const now = inputs.nowOverride ?? new Date();
    const weightsBase = { ...DEFAULT_WEIGHTS, ...overrides };
    const recency = computeRecency(inputs.lastReviewDate, inputs.reviewCadenceDays, now);
    const sourceTier = computeSourceTier(inputs.sourceTier);
    const agreement = computeAgreement(inputs.crossSourceValues);
    const volatility = computeVolatility(inputs.measurements, now);
    const activeWeights = agreement === null ? redistribute(weightsBase) : weightsBase;
    const score = recency * activeWeights.recency +
        sourceTier * activeWeights.sourceTier +
        (agreement ?? 0) * activeWeights.agreement +
        volatility * activeWeights.volatility;
    const caveats = generateCaveats({
        recency,
        sourceTier: inputs.sourceTier,
        agreement,
        volatility,
        inputs,
        now,
    });
    const interpretation = score >= 75 ? 'HIGH' : score >= 50 ? 'MODERATE' : 'LOW';
    return {
        score,
        components: { recency, sourceTier, agreement, volatility },
        weights: activeWeights,
        interpretation,
        caveats,
        computedAt: now,
    };
}
function redistribute(weights) {
    const remaining = weights.recency + weights.sourceTier + weights.volatility;
    if (remaining === 0)
        return { ...weights, agreement: 0 };
    const scale = 1 / remaining;
    return {
        recency: weights.recency * scale,
        sourceTier: weights.sourceTier * scale,
        agreement: 0,
        volatility: weights.volatility * scale,
    };
}
function generateCaveats(args) {
    const out = [];
    if (args.recency < 40) {
        if (args.inputs.lastReviewDate !== null) {
            const days = Math.round((args.now.getTime() - args.inputs.lastReviewDate.getTime()) / 86_400_000);
            out.push({
                severity: args.recency,
                text: `Last review was ${days} days ago; cadence is ${args.inputs.reviewCadenceDays} days.`,
            });
        }
        else {
            out.push({
                severity: args.recency,
                text: 'No last-review date recorded for this assumption.',
            });
        }
    }
    if (args.sourceTier === 3) {
        out.push({
            severity: 40,
            text: 'Assumption relies on an internal estimate; no external validation source.',
        });
    }
    if (args.agreement !== null && args.agreement < 50) {
        out.push({
            severity: args.agreement,
            text: 'Primary and secondary sources disagree by more than 10 per cent.',
        });
    }
    if (args.volatility < 50) {
        out.push({
            severity: args.volatility,
            text: 'Drift series is volatile; confidence in the current state is reduced.',
        });
    }
    return out.sort((a, b) => a.severity - b.severity).map((c) => c.text);
}
//# sourceMappingURL=score.js.map