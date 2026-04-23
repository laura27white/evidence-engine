/**
 * Typed Supabase client factories.
 *
 * `createServerClient()` uses the service role key and bypasses RLS. Server-side only;
 * never import from a Client Component or expose the key to the browser.
 *
 * `createAnonClient()` uses the publishable / anon key and is bound by RLS. Safe to use
 * from the browser.
 *
 * Both clients are scoped to the `evidence_engine` schema.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '../types/database';

export type TrueplanClient = SupabaseClient<Database, 'evidence_engine'>;

const DEFAULT_SCHEMA = 'evidence_engine' as const;

function readEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.length === 0) {
    throw new Error(
      `Missing required env var ${name}. See .env.example for the full list of expected values.`,
    );
  }
  return value;
}

export interface ClientOptions {
  /** Override the URL (default: env NEXT_PUBLIC_SUPABASE_URL). */
  url?: string;
  /** Override the auth key (default: env NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY). */
  key?: string;
}

export function createServerClient(options: ClientOptions = {}): TrueplanClient {
  const url = options.url ?? readEnv('NEXT_PUBLIC_SUPABASE_URL');
  const key = options.key ?? readEnv('SUPABASE_SERVICE_ROLE_KEY');
  return createClient<Database, 'evidence_engine'>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: DEFAULT_SCHEMA },
    global: { headers: { 'X-Client-Info': 'tp-server' } },
  });
}

export function createAnonClient(options: ClientOptions = {}): TrueplanClient {
  const url = options.url ?? readEnv('NEXT_PUBLIC_SUPABASE_URL');
  const key = options.key ?? readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  return createClient<Database, 'evidence_engine'>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: DEFAULT_SCHEMA },
    global: { headers: { 'X-Client-Info': 'tp-anon' } },
  });
}
