import { generateBrief, PdaClient } from '@tp/narrative';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

import { loadNarrativeInput } from '../../../lib/data/narrative-inputs';
import { getProject } from '../../../lib/data/project';
import { createSupabaseBriefCache } from '../../../lib/narrative/supabase-cache';

/**
 * POST /api/brief-generate
 *
 * Builds the latest narrative input from Supabase, consults the briefs cache,
 * calls PDA Platform if configured, and falls back to a deterministic narrative
 * when PDA Platform is unavailable. Caches the result for one hour by default.
 */
export async function POST(request: Request) {
  const url = new URL(request.url);
  const forceFresh = url.searchParams.get('fresh') === '1';
  const now = new Date();

  const input = await loadNarrativeInput(undefined, now);
  if (input === null) {
    return NextResponse.json(
      {
        ok: false,
        error:
          'No narrative input available. Confirm Supabase credentials and that evidence_engine is an exposed REST schema.',
      },
      { status: 503 },
    );
  }

  const project = await getProject();
  const client = buildPdaClient();
  const cache = project === null ? null : createSupabaseBriefCache({ projectId: project.id });

  const brief = await generateBrief(input, { client, cache, now, forceFresh });

  revalidatePath('/brief');

  return NextResponse.json({
    ok: true,
    source: brief.source,
    cacheKey: brief.cacheKey,
    computedAt: brief.computedAt.toISOString(),
    narrativeText: brief.narrativeText,
  });
}

function buildPdaClient(): PdaClient | null {
  const mcpUrl = process.env.PDA_PLATFORM_MCP_URL;
  if (typeof mcpUrl !== 'string' || mcpUrl.length === 0) return null;
  return new PdaClient({ mcpUrl });
}
