#!/usr/bin/env tsx
/**
 * Import the 47 HPO assumptions plus cascade links from the committed xlsx into Supabase.
 *
 * Idempotent: upserts on (project_id, code) for assumptions and on
 * (source_assumption_id, target_assumption_id) for cascade_links.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in the environment.
 *
 * Usage:
 *   pnpm --filter @tp/db import:hpo
 *   pnpm --filter @tp/db import:hpo --xlsx=./path/to/other.xlsx
 *
 * Mapping and parsing helpers live in ./hpo-mapping.ts so they can be unit-tested.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';

import * as XLSX from 'xlsx';

import { createServerClient } from '../src/clients';

import { HPO_CASCADE_LINKS } from './hpo-cascade-links';
import { mapRow, xlsxRowSchema } from './hpo-mapping';

import type { XlsxRow } from './hpo-mapping';
import type { AssumptionInsert, CascadeLinkInsert } from '../src/row-types';

const HPO_PROJECT_CODE = 'HPO24A01-DEMO';

function parseArg(name: string, fallback: string): string {
  const prefix = `--${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : fallback;
}

export function parseXlsx(path: string): XlsxRow[] {
  const workbook = XLSX.read(readFileSync(path), { type: 'buffer' });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) throw new Error(`No sheet found in ${path}`);
  const firstSheet = workbook.Sheets[firstSheetName];
  if (!firstSheet) throw new Error(`Sheet ${firstSheetName} missing from ${path}`);
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, { defval: null });
  return rawRows.map((raw, index) => {
    const parsed = xlsxRowSchema.safeParse(raw);
    if (!parsed.success) {
      throw new Error(
        `Row ${index + 2} failed validation: ${parsed.error.issues
          .map((i) => `${i.path.join('.')} ${i.message}`)
          .join('; ')}`,
      );
    }
    return parsed.data;
  });
}

async function main(): Promise<void> {
  const xlsxPath = resolve(parseArg('xlsx', './data/HPO_All_Assumptions_Register_Approved.xlsx'));
  const rows = parseXlsx(xlsxPath);

  const client = createServerClient();

  const { data: project, error: projectErr } = await client
    .from('projects')
    .select('id')
    .eq('code', HPO_PROJECT_CODE)
    .single();
  if (projectErr || !project) {
    throw new Error(`Could not find project ${HPO_PROJECT_CODE}: ${projectErr?.message}`);
  }
  const projectId = project.id;

  const inserts: AssumptionInsert[] = rows.map((row) => mapRow(row, projectId));

  const { error: upsertErr } = await client
    .from('assumptions')
    .upsert(inserts, { onConflict: 'project_id,code', ignoreDuplicates: false });
  if (upsertErr) {
    throw new Error(`Assumption upsert failed: ${upsertErr.message}`);
  }

  const { data: inserted, error: readErr } = await client
    .from('assumptions')
    .select('id, code')
    .eq('project_id', projectId);
  if (readErr || !inserted) {
    throw new Error(`Could not read back assumptions: ${readErr?.message}`);
  }
  const idByCode = new Map(inserted.map((row) => [row.code, row.id]));

  const cascadeInserts: CascadeLinkInsert[] = [];
  for (const link of HPO_CASCADE_LINKS) {
    const source = idByCode.get(link.source_code);
    const target = idByCode.get(link.target_code);
    if (!source || !target) {
      throw new Error(
        `Cascade link references unknown code: ${link.source_code} -> ${link.target_code}`,
      );
    }
    cascadeInserts.push({
      source_assumption_id: source,
      target_assumption_id: target,
      propagation_weight: link.propagation_weight,
      rationale: link.rationale,
    });
  }

  const { error: cascadeErr } = await client.from('cascade_links').upsert(cascadeInserts, {
    onConflict: 'source_assumption_id,target_assumption_id',
    ignoreDuplicates: false,
  });
  if (cascadeErr) {
    throw new Error(`Cascade link upsert failed: ${cascadeErr.message}`);
  }

  console.log(
    `[import-hpo] ${inserts.length} assumptions upserted, ${cascadeInserts.length} cascade links upserted.`,
  );
}

const isDirectRun = process.argv[1] === import.meta.filename;
if (isDirectRun) {
  main().catch((err: unknown) => {
    console.error('[import-hpo] failed:', err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
