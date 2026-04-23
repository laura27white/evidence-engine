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
import { type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';
export type TrueplanClient = SupabaseClient<Database, 'evidence_engine'>;
export interface ClientOptions {
    /** Override the URL (default: env NEXT_PUBLIC_SUPABASE_URL). */
    url?: string;
    /** Override the auth key (default: env NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY). */
    key?: string;
}
export declare function createServerClient(options?: ClientOptions): TrueplanClient;
export declare function createAnonClient(options?: ClientOptions): TrueplanClient;
//# sourceMappingURL=clients.d.ts.map