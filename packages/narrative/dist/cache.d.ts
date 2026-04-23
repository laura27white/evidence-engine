/**
 * Deterministic cache-key computation for NarrativeInput.
 *
 * The hash covers every field that should invalidate the cache when it changes;
 * computedAt is excluded so re-running the pipeline over unchanged data re-uses
 * the same key. 16 hex chars is plenty for uniqueness in our ~50-assumption
 * scale, and keeps the briefs.cache_key column compact.
 */
import type { NarrativeInput } from './types';
export declare function computeCacheKey(input: NarrativeInput): string;
//# sourceMappingURL=cache.d.ts.map