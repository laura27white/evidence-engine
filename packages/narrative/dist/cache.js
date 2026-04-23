/**
 * Deterministic cache-key computation for NarrativeInput.
 *
 * The hash covers every field that should invalidate the cache when it changes;
 * computedAt is excluded so re-running the pipeline over unchanged data re-uses
 * the same key. 16 hex chars is plenty for uniqueness in our ~50-assumption
 * scale, and keeps the briefs.cache_key column compact.
 */
import { createHash } from 'node:crypto';
export function computeCacheKey(input) {
    const canonical = canonicalise(input);
    return createHash('sha256').update(canonical).digest('hex').slice(0, 16);
}
function canonicalise(input) {
    const payload = {
        project: input.project,
        summary: {
            ...input.summary,
            externalSignals: input.summary.externalSignals.map((s) => ({
                code: s.code,
                description: s.description,
                baselineValue: round(s.baselineValue),
                currentValue: round(s.currentValue),
                driftPct: round(s.driftPct),
                lastRetrievedAt: s.lastRetrievedAt.toISOString(),
            })),
            overallDriftScore: round(input.summary.overallDriftScore),
            globalFragility: round(input.summary.globalFragility),
            topDrivers: input.summary.topDrivers.map((d) => ({
                code: d.code,
                description: d.description,
                driverScore: round(d.driverScore),
            })),
            mostAtRisk: input.summary.mostAtRisk.map((r) => ({
                code: r.code,
                description: r.description,
                leadTimeDays: r.leadTimeDays,
                severity: r.severity,
                confidence: r.confidence,
            })),
        },
    };
    return stableStringify(payload);
}
function stableStringify(value) {
    if (value === null || typeof value !== 'object')
        return JSON.stringify(value);
    if (Array.isArray(value)) {
        return `[${value.map((item) => stableStringify(item)).join(',')}]`;
    }
    const record = value;
    const keys = Object.keys(record).sort();
    const parts = keys.map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`);
    return `{${parts.join(',')}}`;
}
function round(value) {
    return Math.round(value * 1000) / 1000;
}
//# sourceMappingURL=cache.js.map