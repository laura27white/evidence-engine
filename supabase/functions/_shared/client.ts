// Supabase client helper for edge functions. Uses the service role so RLS is bypassed,
// which is appropriate for scheduled compute runs writing derived rows.
// @ts-expect-error Deno remote import resolved at runtime by Supabase edge functions.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

import { readEnv } from './env.ts';

// deno-lint-ignore no-explicit-any
export function createAdminClient(): any {
  const url = readEnv('SUPABASE_URL');
  const key = readEnv('SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: 'evidence_engine' },
  });
}
