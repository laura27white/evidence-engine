/**
 * Static sanity tests on the migration files. We cannot run them without a Postgres
 * instance, but we can assert the set is well-numbered, in the expected directory, and
 * structured as the Prompt 1 spec requires. The live application of migrations is
 * verified via MCP in the PR description.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(here, '..', '..', '..', 'supabase', 'migrations');

function migrationFiles(): string[] {
  return readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();
}

describe('supabase/migrations', () => {
  it('contains the numbered migrations in order with contiguous prefixes', () => {
    const files = migrationFiles();
    const prefixes = files.map((f) => f.slice(0, 4));
    expect(prefixes.length).toBeGreaterThanOrEqual(6);
    for (let i = 0; i < prefixes.length; i += 1) {
      expect(prefixes[i]).toBe(String(i + 1).padStart(4, '0'));
    }
    expect(files).toContain('0001_create_schema_and_tables.sql');
    expect(files).toContain('0002_triggers_and_functions.sql');
    expect(files).toContain('0003_rls_policies.sql');
    expect(files).toContain('0004_revoke_destructive_privileges.sql');
    expect(files).toContain('0005_seed_hpo_project.sql');
    expect(files).toContain('0006_grants_and_function_hardening.sql');
  });

  it('0001 creates the evidence_engine schema and nine tables', () => {
    const sql = readFileSync(join(migrationsDir, '0001_create_schema_and_tables.sql'), 'utf8');
    expect(sql).toContain('create schema if not exists evidence_engine');
    for (const table of [
      'projects',
      'assumptions',
      'drift_measurements',
      'cascade_links',
      'forecasts',
      'cascade_impacts',
      'confidence_scores',
      'briefs',
      'ingest_audit',
    ]) {
      expect(sql).toContain(`create table evidence_engine.${table}`);
    }
  });

  it('0003 enables RLS on every table and adds the anon demo policy', () => {
    const sql = readFileSync(join(migrationsDir, '0003_rls_policies.sql'), 'utf8');
    expect(sql).toContain('HPO24A01-DEMO');
    expect(sql).toMatch(/enable row level security/i);
    expect(sql).toMatch(/force row level security/i);
  });

  it('0004 revokes update and delete on drift_measurements from non-service roles', () => {
    const sql = readFileSync(join(migrationsDir, '0004_revoke_destructive_privileges.sql'), 'utf8');
    expect(sql).toMatch(
      /revoke update, delete on evidence_engine\.drift_measurements from authenticated/i,
    );
    expect(sql).toMatch(/revoke update, delete on evidence_engine\.drift_measurements from anon/i);
  });

  it('0005 seeds the HPO24A01-DEMO project with on-conflict do nothing', () => {
    const sql = readFileSync(join(migrationsDir, '0005_seed_hpo_project.sql'), 'utf8');
    expect(sql).toContain('HPO24A01-DEMO');
    expect(sql).toContain('on conflict (code) do nothing');
  });

  it('0006 pins function search_paths and grants API-role access', () => {
    const sql = readFileSync(join(migrationsDir, '0006_grants_and_function_hardening.sql'), 'utf8');
    expect(sql).toContain('set search_path');
    expect(sql).toContain(
      'grant usage on schema evidence_engine to anon, authenticated, service_role',
    );
  });
});
