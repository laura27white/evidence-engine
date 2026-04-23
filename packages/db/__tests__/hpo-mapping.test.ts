import { describe, expect, it } from 'vitest';

import {
  ECONOMIC_REFS,
  EXTERNAL_CATEGORY_EXACT,
  isExternal,
  mapRow,
  normaliseLikelihood,
  normaliseStatus,
  parseLinkedItems,
  xlsxRowSchema,
  type XlsxRow,
} from '../scripts/hpo-mapping';

const PROJECT_ID = '00000000-0000-0000-0000-000000000001';

const validRow: XlsxRow = {
  ID: 'A001',
  'Assumption Description': 'Some assumption.',
  Category: 'Stakeholder Access',
  'Date Logged': '2025-06-12',
  Owner: 'Bid Manager',
  'Impact if False': 'Delay.',
  'Likelihood of Failure': 'Medium',
  'Source / Rationale': 'Rationale.',
  'Validation Plan': 'Validate at kickoff.',
  Status: 'Open',
  'Review Date': '2025-06-30',
  'Linked Items': 'Milestone 1',
};

describe('xlsxRowSchema', () => {
  it('accepts a well-formed row', () => {
    const result = xlsxRowSchema.safeParse(validRow);
    expect(result.success).toBe(true);
  });

  it('rejects a row whose ID does not match the Axxx format', () => {
    const result = xlsxRowSchema.safeParse({ ...validRow, ID: 'B001' });
    expect(result.success).toBe(false);
  });

  it('accepts null Owner and Linked Items', () => {
    const result = xlsxRowSchema.safeParse({
      ...validRow,
      Owner: null,
      'Linked Items': null,
      'Review Date': null,
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty Category', () => {
    const result = xlsxRowSchema.safeParse({ ...validRow, Category: '' });
    expect(result.success).toBe(false);
  });
});

describe('isExternal', () => {
  it('returns true for Economic /* categories', () => {
    expect(isExternal('Economic / Inflation')).toBe(true);
    expect(isExternal('Economic / Interest Rates')).toBe(true);
    expect(isExternal('Economic / Tax Policy')).toBe(true);
  });

  it('returns true for the exact set', () => {
    for (const cat of EXTERNAL_CATEGORY_EXACT) {
      expect(isExternal(cat)).toBe(true);
    }
  });

  it('returns false for internal delivery categories', () => {
    expect(isExternal('Stakeholder Access')).toBe(false);
    expect(isExternal('Technical Quality')).toBe(false);
    expect(isExternal('Commercial')).toBe(false);
    expect(isExternal('Infrastructure')).toBe(false);
  });

  it('does not match Economic without trailing slash path', () => {
    expect(isExternal('Economic')).toBe(false);
  });
});

describe('normaliseLikelihood', () => {
  it('upper-cases Low / Medium / High', () => {
    expect(normaliseLikelihood('Low')).toBe('LOW');
    expect(normaliseLikelihood('Medium')).toBe('MEDIUM');
    expect(normaliseLikelihood('High')).toBe('HIGH');
  });

  it('returns null for unknown values', () => {
    expect(normaliseLikelihood('Very High')).toBeNull();
    expect(normaliseLikelihood('')).toBeNull();
    expect(normaliseLikelihood(null)).toBeNull();
    expect(normaliseLikelihood(undefined)).toBeNull();
  });

  it('preserves already-uppercase values', () => {
    expect(normaliseLikelihood('MEDIUM')).toBe('MEDIUM');
  });
});

describe('normaliseStatus', () => {
  it('upper-cases known values', () => {
    expect(normaliseStatus('Open')).toBe('OPEN');
    expect(normaliseStatus('closed')).toBe('CLOSED');
    expect(normaliseStatus('RETIRED')).toBe('RETIRED');
  });

  it('throws on unknown status', () => {
    expect(() => normaliseStatus('Pending')).toThrow(/Unexpected Status/);
  });
});

describe('parseLinkedItems', () => {
  it('splits on commas and semicolons and trims whitespace', () => {
    expect(parseLinkedItems('Foo, Bar; Baz')).toEqual(['Foo', 'Bar', 'Baz']);
  });

  it('returns null for empty or missing input', () => {
    expect(parseLinkedItems('')).toBeNull();
    expect(parseLinkedItems(null)).toBeNull();
    expect(parseLinkedItems(undefined)).toBeNull();
  });

  it('handles a single item', () => {
    expect(parseLinkedItems('Milestone 1')).toEqual(['Milestone 1']);
  });
});

describe('mapRow', () => {
  it('maps a plain internal row with tier 3 and no external_ref', () => {
    const out = mapRow(validRow, PROJECT_ID);
    expect(out.code).toBe('A001');
    expect(out.project_id).toBe(PROJECT_ID);
    expect(out.source_tier).toBe(3);
    expect(out.external_ref).toBeNull();
    expect(out.baseline_value).toBeNull();
    expect(out.is_external).toBe(false);
    expect(out.status).toBe('OPEN');
    expect(out.likelihood_of_failure).toBe('MEDIUM');
    expect(out.linked_items).toEqual(['Milestone 1']);
  });

  it('tags A046 as tier 1 with ONS external_ref and baseline', () => {
    const out = mapRow(
      {
        ...validRow,
        ID: 'A046',
        Category: 'Economic / Inflation',
        'Likelihood of Failure': 'Medium',
      },
      PROJECT_ID,
    );
    expect(out.source_tier).toBe(1);
    expect(out.external_ref).toBe('ONS:D7G7');
    expect(out.baseline_value).toBe(2.5);
    expect(out.baseline_unit).toBe('% YoY');
    expect(out.tolerance_pct).toBe(40);
    expect(out.is_external).toBe(true);
  });

  it('tags A047 as tier 1 with BOE external_ref', () => {
    const out = mapRow(
      { ...validRow, ID: 'A047', Category: 'Economic / Interest Rates' },
      PROJECT_ID,
    );
    expect(out.source_tier).toBe(1);
    expect(out.external_ref).toBe('BOE:IUDSOIA');
    expect(out.baseline_value).toBe(4.25);
  });

  it('tags A048 as tier 1 with GOVUK external_ref, null baseline', () => {
    const out = mapRow({ ...validRow, ID: 'A048', Category: 'Economic / Tax Policy' }, PROJECT_ID);
    expect(out.source_tier).toBe(1);
    expect(out.external_ref).toBe('GOVUK:hmrc-tax-policy-announcements');
    expect(out.baseline_value).toBeNull();
  });

  it('marks regulatory categories as external but keeps tier 3', () => {
    const out = mapRow({ ...validRow, ID: 'A034', Category: 'Regulatory' }, PROJECT_ID);
    expect(out.is_external).toBe(true);
    expect(out.source_tier).toBe(3);
    expect(out.external_ref).toBeNull();
  });

  it('preserves optional fields that arrive as null', () => {
    const out = mapRow(
      { ...validRow, Owner: null, 'Review Date': null, 'Linked Items': null },
      PROJECT_ID,
    );
    expect(out.owner).toBeNull();
    expect(out.review_date).toBeNull();
    expect(out.linked_items).toBeNull();
  });
});

describe('ECONOMIC_REFS invariants', () => {
  it('has exactly three entries matching A046, A047, A048', () => {
    expect(Object.keys(ECONOMIC_REFS).sort()).toEqual(['A046', 'A047', 'A048']);
  });

  it('ONS inflation row has sensible numeric baseline', () => {
    const r = ECONOMIC_REFS['A046']!;
    expect(r.baseline_value).toBeGreaterThan(0);
    expect(r.baseline_unit).toContain('%');
    expect(r.tolerance_pct).toBeGreaterThan(0);
  });
});
