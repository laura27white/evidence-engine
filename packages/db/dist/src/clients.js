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
import { createClient } from '@supabase/supabase-js';
const DEFAULT_SCHEMA = 'evidence_engine';
function readEnv(name) {
    const value = process.env[name];
    if (!value || value.length === 0) {
        throw new Error(`Missing required env var ${name}. See .env.example for the full list of expected values.`);
    }
    return value;
}
export function createServerClient(options = {}) {
    const url = options.url ?? readEnv('NEXT_PUBLIC_SUPABASE_URL');
    const key = options.key ?? readEnv('SUPABASE_SERVICE_ROLE_KEY');
    return createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
        db: { schema: DEFAULT_SCHEMA },
        global: { headers: { 'X-Client-Info': 'tp-server' } },
    });
}
export function createAnonClient(options = {}) {
    const url = options.url ?? readEnv('NEXT_PUBLIC_SUPABASE_URL');
    const key = options.key ?? readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    return createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
        db: { schema: DEFAULT_SCHEMA },
        global: { headers: { 'X-Client-Info': 'tp-anon' } },
    });
}
//# sourceMappingURL=clients.js.map