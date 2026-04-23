/**
 * Top-level narrative generator. Accepts a NarrativeInput, consults cache,
 * calls PDA Platform, validates the response, and falls back on failure.
 * Pure orchestration; the caller is expected to hand in a PdaClient and a
 * cache adapter.
 */
import type { PdaClient } from './pda-client';
import type { GeneratedBrief, NarrativeInput } from './types';
export interface BriefCacheAdapter {
    /** Return a cached narrative if present and fresh. Null otherwise. */
    lookup(cacheKey: string): Promise<GeneratedBrief | null>;
    /** Persist a newly generated brief. Implementations may overwrite existing rows. */
    store(brief: GeneratedBrief): Promise<void>;
}
export interface GenerateBriefOptions {
    client: PdaClient | null;
    cache?: BriefCacheAdapter | null;
    now?: Date;
    forceFresh?: boolean;
}
export declare function generateBrief(input: NarrativeInput, options: GenerateBriefOptions): Promise<GeneratedBrief>;
//# sourceMappingURL=generator.d.ts.map