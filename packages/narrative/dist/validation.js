/**
 * Post-generation validation. If the PDA Platform response violates one of our
 * house rules (em dash, excessive length, banned phrase), we fall back rather
 * than show a broken brief.
 */
const BANNED_PHRASES = ['as an ai', 'as a language model', 'i cannot', "i'm sorry"];
export function validateNarrative(narrative) {
    const trimmed = narrative.trim();
    if (trimmed.length === 0)
        return { ok: false, reason: 'empty narrative' };
    if (trimmed.includes('\u2014'))
        return { ok: false, reason: 'contains em dash' };
    const words = trimmed.split(/\s+/).filter((w) => w.length > 0);
    if (words.length < 80)
        return { ok: false, reason: `too short (${words.length} words)` };
    if (words.length > 320)
        return { ok: false, reason: `too long (${words.length} words)` };
    const lower = trimmed.toLowerCase();
    for (const phrase of BANNED_PHRASES) {
        if (lower.includes(phrase))
            return { ok: false, reason: `banned phrase: ${phrase}` };
    }
    return { ok: true, reason: null };
}
//# sourceMappingURL=validation.js.map