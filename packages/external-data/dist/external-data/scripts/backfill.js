#!/usr/bin/env tsx
/**
 * Backfill runner. Runs the ingestion pipeline for the three primary signals against the
 * HPO24A01-DEMO assumptions register. Safe to re-run; the writer is idempotent.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in the environment.
 */
import { createServerClient } from '@tp/db';
import { runIngest } from '../src/pipeline/ingest';
async function main() {
    const client = createServerClient();
    const baseline = process.argv.find((a) => a.startsWith('--from='))?.slice('--from='.length);
    const summary = await runIngest(client, baseline ? { baselineDate: baseline } : {});
    console.log(JSON.stringify(summary, null, 2));
}
main().catch((err) => {
    console.error('[backfill] failed:', err instanceof Error ? err.message : err);
    process.exit(1);
});
//# sourceMappingURL=backfill.js.map