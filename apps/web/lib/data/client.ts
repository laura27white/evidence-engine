import 'server-only';
import { createAnonClient, type TrueplanClient } from '@tp/db';

let cached: TrueplanClient | null = null;

function hasEnv(): boolean {
  return (
    typeof process.env.NEXT_PUBLIC_SUPABASE_URL === 'string' &&
    process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
    typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'string' &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0
  );
}

/**
 * Returns a cached anonymous Supabase client scoped to the evidence_engine schema.
 * Safe for RSC usage; RLS permits read access to the demo project for anonymous
 * callers. Never expose the service-role key from the web app.
 *
 * Returns null when Supabase env vars are missing. Callers are expected to treat
 * this as an "empty project" signal and render a graceful empty state. This keeps
 * CI builds green without requiring secrets and lets `pnpm build` produce static
 * artefacts for environments that will later bind Supabase credentials at runtime.
 */
export function getDbClient(): TrueplanClient | null {
  if (!hasEnv()) return null;
  if (cached !== null) return cached;
  cached = createAnonClient();
  return cached;
}

export class MissingDataError extends Error {
  readonly reason: unknown;
  constructor(message: string, reason: unknown) {
    super(message);
    this.name = 'MissingDataError';
    this.reason = reason;
  }
}

/**
 * Common REST-level failure modes that should render an empty state rather than
 * surface as a 500. PGRST125 means the evidence_engine schema is not yet exposed
 * in the Supabase project's API config; PGRST301 covers missing relation errors
 * on a fresh project. We log and continue with empty data so the UI stays up.
 */
export function shouldSwallowRestError(error: unknown): boolean {
  if (error === null || typeof error !== 'object') return false;
  const record = error as { code?: unknown; status?: unknown };
  if (typeof record.code === 'string') {
    const code = record.code;
    if (code === 'PGRST125' || code === 'PGRST301' || code === 'PGRST204') return true;
    if (code === '42P01') return true; // undefined_table
  }
  return false;
}
