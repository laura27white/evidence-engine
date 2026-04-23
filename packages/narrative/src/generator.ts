/**
 * Top-level narrative generator. Accepts a NarrativeInput, consults cache,
 * calls PDA Platform, validates the response, and falls back on failure.
 * Pure orchestration; the caller is expected to hand in a PdaClient and a
 * cache adapter.
 */

import { computeCacheKey } from './cache';
import { generateFallbackNarrative } from './fallback';
import { validateNarrative } from './validation';

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

export async function generateBrief(
  input: NarrativeInput,
  options: GenerateBriefOptions,
): Promise<GeneratedBrief> {
  const cacheKey = computeCacheKey(input);
  const now = options.now ?? new Date();

  if (!options.forceFresh && options.cache != null) {
    const cached = await options.cache.lookup(cacheKey);
    if (cached !== null) return cached;
  }

  if (options.client !== null) {
    const pdaResult = await options.client.generateNarrative(input);
    if (pdaResult.ok) {
      const validation = validateNarrative(pdaResult.value);
      if (validation.ok) {
        const brief: GeneratedBrief = {
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

  const brief: GeneratedBrief = {
    narrativeText: generateFallbackNarrative(input),
    source: 'fallback',
    cacheKey,
    computedAt: now,
  };
  await options.cache?.store(brief);
  return brief;
}
