import { NextResponse } from 'next/server';

import { getDbClient } from '../../../lib/data/client';

/**
 * GET /api/diagnostic
 *
 * Reports whether the server runtime has working Supabase credentials and can
 * reach the evidence_engine schema. Temporary while we triage the live deploy.
 */
export async function GET() {
  const urlPresent =
    typeof process.env.NEXT_PUBLIC_SUPABASE_URL === 'string' &&
    process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0;
  const keyPresent =
    typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'string' &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0;

  const client = getDbClient();
  let projectsCount: number | null = null;
  let assumptionsCount: number | null = null;
  let error: string | null = null;

  if (client !== null) {
    try {
      const { count: pc, error: pErr } = await client
        .from('projects')
        .select('*', { count: 'exact', head: true });
      if (pErr) error = `projects: ${pErr.message} (${pErr.code ?? ''})`;
      projectsCount = pc;

      const { count: ac, error: aErr } = await client
        .from('assumptions')
        .select('*', { count: 'exact', head: true });
      if (aErr) error = `${error ?? ''}; assumptions: ${aErr.message} (${aErr.code ?? ''})`;
      assumptionsCount = ac;
    } catch (cause) {
      error = cause instanceof Error ? cause.message : 'unknown';
    }
  }

  return NextResponse.json({
    env: {
      NEXT_PUBLIC_SUPABASE_URL: urlPresent,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: keyPresent,
      urlValue: urlPresent ? process.env.NEXT_PUBLIC_SUPABASE_URL : null,
      keyPrefix:
        keyPresent && typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'string'
          ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.slice(0, 18) + '...'
          : null,
    },
    client: {
      instantiated: client !== null,
    },
    query: {
      projectsCount,
      assumptionsCount,
      error,
    },
  });
}

export const dynamic = 'force-dynamic';
