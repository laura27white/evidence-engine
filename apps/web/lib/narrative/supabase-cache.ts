import 'server-only';

import { createServerClient } from '@tp/db';

import type { BriefCacheAdapter, GeneratedBrief } from '@tp/narrative';

export interface SupabaseCacheOptions {
  projectId: string;
  ttlMs?: number;
}

const DEFAULT_TTL_MS = 60 * 60 * 1000;

/**
 * Cache adapter backed by the evidence_engine.briefs table. The composite key is
 * `(project_id, cache_key)`. On lookup we return a fresh row within TTL; on
 * store we upsert by cache key. Writes use the service-role client because
 * anonymous users cannot INSERT into the briefs table under RLS.
 */
export function createSupabaseBriefCache(options: SupabaseCacheOptions): BriefCacheAdapter {
  const ttlMs = options.ttlMs ?? DEFAULT_TTL_MS;

  async function lookup(cacheKey: string): Promise<GeneratedBrief | null> {
    let client;
    try {
      client = createServerClient();
    } catch {
      return null;
    }
    const { data, error } = await client
      .from('briefs')
      .select('*')
      .eq('project_id', options.projectId)
      .eq('cache_key', cacheKey)
      .order('generated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || data === null) return null;
    const generatedAt = new Date(data.generated_at);
    if (Date.now() - generatedAt.getTime() > ttlMs) return null;
    const payload = data.pda_platform_response_json as Record<string, unknown> | null;
    const source: 'pda-platform' | 'fallback' =
      payload?.source === 'pda-platform' ? 'pda-platform' : 'fallback';
    return {
      narrativeText: data.narrative_text,
      source,
      cacheKey,
      computedAt: generatedAt,
    };
  }

  async function store(brief: GeneratedBrief): Promise<void> {
    let client;
    try {
      client = createServerClient();
    } catch {
      return;
    }
    await client.from('briefs').insert({
      project_id: options.projectId,
      narrative_text: brief.narrativeText,
      cache_key: brief.cacheKey,
      pda_platform_response_json: {
        source: brief.source,
        computedAt: brief.computedAt.toISOString(),
      },
    });
  }

  return { lookup, store };
}
