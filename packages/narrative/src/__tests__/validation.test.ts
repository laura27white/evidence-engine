import { describe, expect, it } from 'vitest';

import { validateNarrative } from '../validation';

const GOOD = Array.from({ length: 120 }, (_, i) => `word${i}`).join(' ');

describe('validateNarrative', () => {
  it('accepts a plain 120-word narrative', () => {
    expect(validateNarrative(GOOD)).toEqual({ ok: true, reason: null });
  });

  it('rejects em dashes', () => {
    const text = `${GOOD} and \u2014 extra.`;
    const result = validateNarrative(text);
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/em dash/);
  });

  it('rejects banned phrases', () => {
    const text = `${GOOD} As an AI language model I cannot.`;
    const result = validateNarrative(text);
    expect(result.ok).toBe(false);
  });

  it('rejects empty text', () => {
    expect(validateNarrative('   ').ok).toBe(false);
  });

  it('rejects too-short text', () => {
    expect(validateNarrative('short').ok).toBe(false);
  });
});
