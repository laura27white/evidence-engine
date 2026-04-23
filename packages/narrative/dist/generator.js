/**
 * Top-level narrative generator. Accepts a NarrativeInput, consults cache,
 * calls PDA Platform, validates the response, and falls back on failure.
 * Pure orchestration; the caller is expected to hand in a PdaClient and a
 * cache adapter.
 */
import { computeCacheKey } from './cache';
import { generateFallbackNarrative } from './fallback';
import { validateNarrative } from './validation';
export async function generateBrief(input, options) {
    const cacheKey = computeCacheKey(input);
    const now = options.now ?? new Date();
    if (!options.forceFresh && options.cache != null) {
        const cached = await options.cache.lookup(cacheKey);
        if (cached !== null)
            return cached;
    }
    if (options.client !== null) {
        const pdaResult = await options.client.generateNarrative(input);
        if (pdaResult.ok) {
            const validation = validateNarrative(pdaResult.value);
            if (validation.ok) {
                const brief = {
                    narrativeText: pdaResult.value,
                    source: 'pda-platform',
                    cacheKey,
                    computedAt: now,
                };
                await options.cache?.store(brief);
                return brief;
            }
        }
    }
    const brief = {
        narrativeText: generateFallbackNarrative(input),
        source: 'fallback',
        cacheKey,
        computedAt: now,
    };
    await options.cache?.store(brief);
    return brief;
}
//# sourceMappingURL=generator.js.map