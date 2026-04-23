#!/usr/bin/env tsx
/**
 * Seed drift_measurements with nine months of backdated observations for every HPO24A01
 * assumption.
 *
 * For the three externally-anchored assumptions (A046 Inflation, A047 Interest Rates,
 * A048 Tax Policy) this ships a stub of hardcoded historical values. Once Prompt 3
 * (external-data adapters) has merged, replace these with live fetches via the ONS, BoE,
 * and gov.uk adapters. The stub values are plausible 2025 UK series, documented inline.
 *
 * For the other 44 assumptions we generate synthetic trajectories using a deterministic
 * Gaussian drift parameterised by likelihood_of_failure. Reproducibility is guaranteed by
 * a fixed seed. See packages/db/SYNTHETIC_DATA.md for the method and limitations.
 *
 * Idempotent: without `--reset`, existing measurements are left alone. With `--reset`, all
 * drift_measurements for the HPO24A01-DEMO project are deleted first.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in the environment.
 */
import process from 'node:process';

import { createServerClient } from '../src/clients';

import type { DriftMeasurementInsert } from '../src/row-types';

const HPO_PROJECT_CODE = 'HPO24A01-DEMO';
const SEED = 20260422;
const MEASUREMENT_COUNT = 9;

const DRIFT_PARAMS: Record<'LOW' | 'MEDIUM' | 'HIGH', { mu: number; sigma: number }> = {
  LOW: { mu: 0, sigma: 0.01 },
  MEDIUM: { mu: 0.002, sigma: 0.02 },
  HIGH: { mu: 0.005, sigma: 0.03 },
};

// Hardcoded UK historical stubs for the three externally-anchored assumptions. Replace
// with live ONS/BoE/gov.uk adapters once Prompt 3 merges. Each value is monthly. Oldest
// to newest.
const ECONOMIC_STUBS: Record<string, readonly { value: number; url: string; ref: string }[]> = {
  A046: [
    {
      value: 3.2,
      url: 'https://www.ons.gov.uk/economy/inflationandpriceindices/timeseries/d7g7/mm23',
      ref: 'ONS:D7G7 2025-07',
    },
    {
      value: 3.0,
      url: 'https://www.ons.gov.uk/economy/inflationandpriceindices/timeseries/d7g7/mm23',
      ref: 'ONS:D7G7 2025-08',
    },
    {
      value: 2.8,
      url: 'https://www.ons.gov.uk/economy/inflationandpriceindices/timeseries/d7g7/mm23',
      ref: 'ONS:D7G7 2025-09',
    },
    {
      value: 2.7,
      url: 'https://www.ons.gov.uk/economy/inflationandpriceindices/timeseries/d7g7/mm23',
      ref: 'ONS:D7G7 2025-10',
    },
    {
      value: 2.6,
      url: 'https://www.ons.gov.uk/economy/inflationandpriceindices/timeseries/d7g7/mm23',
      ref: 'ONS:D7G7 2025-11',
    },
    {
      value: 2.5,
      url: 'https://www.ons.gov.uk/economy/inflationandpriceindices/timeseries/d7g7/mm23',
      ref: 'ONS:D7G7 2025-12',
    },
    {
      value: 2.7,
      url: 'https://www.ons.gov.uk/economy/inflationandpriceindices/timeseries/d7g7/mm23',
      ref: 'ONS:D7G7 2026-01',
    },
    {
      value: 2.9,
      url: 'https://www.ons.gov.uk/economy/inflationandpriceindices/timeseries/d7g7/mm23',
      ref: 'ONS:D7G7 2026-02',
    },
    {
      value: 3.1,
      url: 'https://www.ons.gov.uk/economy/inflationandpriceindices/timeseries/d7g7/mm23',
      ref: 'ONS:D7G7 2026-03',
    },
  ],
  A047: [
    {
      value: 5.25,
      url: 'https://www.bankofengland.co.uk/boeapps/database/',
      ref: 'BOE:IUDSOIA 2025-07',
    },
    {
      value: 5.0,
      url: 'https://www.bankofengland.co.uk/boeapps/database/',
      ref: 'BOE:IUDSOIA 2025-08',
    },
    {
      value: 4.75,
      url: 'https://www.bankofengland.co.uk/boeapps/database/',
      ref: 'BOE:IUDSOIA 2025-09',
    },
    {
      value: 4.75,
      url: 'https://www.bankofengland.co.uk/boeapps/database/',
      ref: 'BOE:IUDSOIA 2025-10',
    },
    {
      value: 4.5,
      url: 'https://www.bankofengland.co.uk/boeapps/database/',
      ref: 'BOE:IUDSOIA 2025-11',
    },
    {
      value: 4.5,
      url: 'https://www.bankofengland.co.uk/boeapps/database/',
      ref: 'BOE:IUDSOIA 2025-12',
    },
    {
      value: 4.25,
      url: 'https://www.bankofengland.co.uk/boeapps/database/',
      ref: 'BOE:IUDSOIA 2026-01',
    },
    {
      value: 4.25,
      url: 'https://www.bankofengland.co.uk/boeapps/database/',
      ref: 'BOE:IUDSOIA 2026-02',
    },
    {
      value: 4.5,
      url: 'https://www.bankofengland.co.uk/boeapps/database/',
      ref: 'BOE:IUDSOIA 2026-03',
    },
  ],
  // A048 Tax Policy is a boolean-style assumption ("no new corporate taxes"). Value 0
  // means policy stable, 1 means a new tax has been announced. Stub stays at 0; the real
  // adapter counts gov.uk HMRC policy announcements.
  A048: [
    {
      value: 0,
      url: 'https://www.gov.uk/api/search.json?filter_content_store_document_type=policy_paper',
      ref: 'GOVUK:hmrc-tax-policy-announcements 2025-07',
    },
    {
      value: 0,
      url: 'https://www.gov.uk/api/search.json?filter_content_store_document_type=policy_paper',
      ref: 'GOVUK:hmrc-tax-policy-announcements 2025-08',
    },
    {
      value: 0,
      url: 'https://www.gov.uk/api/search.json?filter_content_store_document_type=policy_paper',
      ref: 'GOVUK:hmrc-tax-policy-announcements 2025-09',
    },
    {
      value: 0,
      url: 'https://www.gov.uk/api/search.json?filter_content_store_document_type=policy_paper',
      ref: 'GOVUK:hmrc-tax-policy-announcements 2025-10',
    },
    {
      value: 0,
      url: 'https://www.gov.uk/api/search.json?filter_content_store_document_type=policy_paper',
      ref: 'GOVUK:hmrc-tax-policy-announcements 2025-11',
    },
    {
      value: 0,
      url: 'https://www.gov.uk/api/search.json?filter_content_store_document_type=policy_paper',
      ref: 'GOVUK:hmrc-tax-policy-announcements 2025-12',
    },
    {
      value: 0,
      url: 'https://www.gov.uk/api/search.json?filter_content_store_document_type=policy_paper',
      ref: 'GOVUK:hmrc-tax-policy-announcements 2026-01',
    },
    {
      value: 0,
      url: 'https://www.gov.uk/api/search.json?filter_content_store_document_type=policy_paper',
      ref: 'GOVUK:hmrc-tax-policy-announcements 2026-02',
    },
    {
      value: 0,
      url: 'https://www.gov.uk/api/search.json?filter_content_store_document_type=policy_paper',
      ref: 'GOVUK:hmrc-tax-policy-announcements 2026-03',
    },
  ],
};

/** Deterministic linear-congruential RNG for reproducibility. */
function makeRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

/** Box-Muller transform to draw from N(mu, sigma). */
function gaussian(rng: () => number, mu: number, sigma: number): number {
  const u1 = Math.max(rng(), 1e-12);
  const u2 = rng();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mu + sigma * z;
}

function monthAnchors(today: Date): Date[] {
  const anchors: Date[] = [];
  for (let i = MEASUREMENT_COUNT - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setUTCMonth(d.getUTCMonth() - i);
    d.setUTCDate(1);
    d.setUTCHours(12, 0, 0, 0);
    anchors.push(d);
  }
  return anchors;
}

type AssumptionRow = {
  id: string;
  code: string;
  baseline_value: number | null;
  likelihood_of_failure: 'LOW' | 'MEDIUM' | 'HIGH' | null;
};

function synthesiseSeries(row: AssumptionRow, rng: () => number): number[] {
  const baseline = row.baseline_value ?? 100;
  const params = DRIFT_PARAMS[row.likelihood_of_failure ?? 'LOW'];
  const daysPerMonth = 30;
  const series: number[] = [];
  let last = baseline;
  for (let i = 0; i < MEASUREMENT_COUNT; i += 1) {
    const dailyDriftSum = Array.from({ length: daysPerMonth }, () =>
      gaussian(rng, params.mu, params.sigma),
    ).reduce((sum, d) => sum + d, 0);
    last = last * (1 + dailyDriftSum);
    series.push(Number(last.toFixed(6)));
  }
  return series;
}

async function main(): Promise<void> {
  const reset = process.argv.includes('--reset');
  const client = createServerClient();

  const { data: project, error: projectErr } = await client
    .from('projects')
    .select('id')
    .eq('code', HPO_PROJECT_CODE)
    .single();
  if (projectErr || !project) {
    throw new Error(`Could not find project ${HPO_PROJECT_CODE}: ${projectErr?.message}`);
  }

  const { data: assumptions, error: aErr } = await client
    .from('assumptions')
    .select('id, code, baseline_value, likelihood_of_failure')
    .eq('project_id', project.id)
    .returns<AssumptionRow[]>();
  if (aErr || !assumptions) {
    throw new Error(`Could not read assumptions: ${aErr?.message}`);
  }

  if (reset) {
    const { error: delErr } = await client
      .from('drift_measurements')
      .delete()
      .in(
        'assumption_id',
        assumptions.map((a) => a.id),
      );
    if (delErr) {
      throw new Error(`Reset delete failed: ${delErr.message}`);
    }
  } else {
    const { count, error: cErr } = await client
      .from('drift_measurements')
      .select('id', { count: 'exact', head: true });
    if (cErr) {
      throw new Error(`Could not count drift_measurements: ${cErr.message}`);
    }
    if ((count ?? 0) > 0) {
      console.log(
        `[seed-drift] ${count} measurements already present; skipping. Re-run with --reset to rebuild.`,
      );
      return;
    }
  }

  const today = new Date();
  const anchors = monthAnchors(today);
  const rng = makeRng(SEED);
  const inserts: DriftMeasurementInsert[] = [];

  for (const row of assumptions) {
    const stub = ECONOMIC_STUBS[row.code];
    if (stub) {
      for (let i = 0; i < MEASUREMENT_COUNT; i += 1) {
        const entry = stub[i];
        const anchor = anchors[i];
        if (!entry || !anchor) continue;
        inserts.push({
          assumption_id: row.id,
          measured_at: anchor.toISOString(),
          observed_value: entry.value,
          source: 'EXTERNAL_API',
          source_url: entry.url,
          external_data_ref: entry.ref,
          notes: 'Stub historical value. Replace with live adapter fetch after Prompt 3.',
        });
      }
    } else {
      const series = synthesiseSeries(row, rng);
      for (let i = 0; i < MEASUREMENT_COUNT; i += 1) {
        const anchor = anchors[i];
        const value = series[i];
        if (!anchor || value === undefined) continue;
        inserts.push({
          assumption_id: row.id,
          measured_at: anchor.toISOString(),
          observed_value: value,
          source: 'SYSTEM_DERIVED',
          source_url: null,
          external_data_ref: null,
          notes:
            'Synthetic. Gaussian drift seeded by likelihood_of_failure; see SYNTHETIC_DATA.md.',
        });
      }
    }
  }

  const { error: insErr } = await client.from('drift_measurements').insert(inserts);
  if (insErr) {
    throw new Error(`Insert failed: ${insErr.message}`);
  }

  console.log(
    `[seed-drift] inserted ${inserts.length} measurements across ${assumptions.length} assumptions.`,
  );
}

main().catch((err: unknown) => {
  console.error('[seed-drift] failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
