/**
 * Post-generation validation. If the PDA Platform response violates one of our
 * house rules (em dash, excessive length, banned phrase), we fall back rather
 * than show a broken brief.
 */
export interface ValidationOutcome {
    ok: boolean;
    reason: string | null;
}
export declare function validateNarrative(narrative: string): ValidationOutcome;
//# sourceMappingURL=validation.d.ts.map