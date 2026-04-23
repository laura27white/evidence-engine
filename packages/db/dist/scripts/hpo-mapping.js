/**
 * Pure helpers for mapping an HPO register xlsx row to an assumptions table row.
 *
 * Extracted from the importer so they can be unit-tested without a Supabase client or a
 * real xlsx file. The importer (`import-hpo.ts`) composes these helpers with the I/O.
 */
import { z } from 'zod';
// Categories that make an assumption external per the Prompt 1 section 1.6 inference rule.
export const EXTERNAL_CATEGORY_STARTS = ['Economic /'];
export const EXTERNAL_CATEGORY_EXACT = new Set(['Regulatory', 'Political', 'Compliance', 'Legal']);
// Three economic assumptions get tier 1 with documented external_refs. The codes are
// A046 (Inflation), A047 (Interest Rates), A048 (Tax Policy). The Prompt 1 spec referenced
// A039/A040/A041; the actual HPO register ships them as A046/A047/A048 with the same
// semantic meaning.
export const ECONOMIC_REFS = {
    A046: {
        external_ref: 'ONS:D7G7',
        baseline_value: 2.5,
        baseline_unit: '% YoY',
        tolerance_pct: 40,
    },
    A047: {
        external_ref: 'BOE:IUDSOIA',
        baseline_value: 4.25,
        baseline_unit: '%',
        tolerance_pct: 25,
    },
    A048: {
        external_ref: 'GOVUK:hmrc-tax-policy-announcements',
        baseline_value: null,
        baseline_unit: null,
        tolerance_pct: null,
    },
};
export const xlsxRowSchema = z.object({
    ID: z.string().regex(/^A\d{3,4}$/, 'ID must match /^A\\d{3,4}$/'),
    'Assumption Description': z.string().min(1),
    Category: z.string().min(1),
    'Date Logged': z.string().min(1),
    Owner: z.string().min(1).optional().nullable(),
    'Impact if False': z.string().min(1).optional().nullable(),
    'Likelihood of Failure': z
        .enum(['Low', 'Medium', 'High', 'LOW', 'MEDIUM', 'HIGH'])
        .optional()
        .nullable(),
    'Source / Rationale': z.string().optional().nullable(),
    'Validation Plan': z.string().optional().nullable(),
    Status: z.string().min(1),
    'Review Date': z.string().optional().nullable(),
    'Linked Items': z.string().optional().nullable(),
});
export function isExternal(category) {
    if (EXTERNAL_CATEGORY_EXACT.has(category))
        return true;
    return EXTERNAL_CATEGORY_STARTS.some((start) => category.startsWith(start));
}
export function normaliseLikelihood(value) {
    if (!value)
        return null;
    const upper = value.toUpperCase();
    if (upper === 'LOW' || upper === 'MEDIUM' || upper === 'HIGH')
        return upper;
    return null;
}
export function normaliseStatus(value) {
    const upper = value.toUpperCase();
    if (upper === 'OPEN' || upper === 'CLOSED' || upper === 'RETIRED')
        return upper;
    throw new Error(`Unexpected Status value: ${value}`);
}
export function parseLinkedItems(value) {
    if (!value)
        return null;
    const parts = value
        .split(/[,;]/)
        .map((part) => part.trim())
        .filter(Boolean);
    return parts.length > 0 ? parts : null;
}
export function mapRow(row, projectId) {
    const economic = ECONOMIC_REFS[row.ID];
    const external = isExternal(row.Category);
    const sourceTier = economic ? 1 : 3;
    return {
        project_id: projectId,
        code: row.ID,
        description: row['Assumption Description'],
        category: row.Category,
        owner: row.Owner ?? null,
        baseline_value: economic?.baseline_value ?? null,
        baseline_unit: economic?.baseline_unit ?? null,
        tolerance_pct: economic?.tolerance_pct ?? null,
        source_tier: sourceTier,
        external_ref: economic?.external_ref ?? null,
        is_external: external,
        date_logged: row['Date Logged'],
        review_date: row['Review Date'] ?? null,
        status: normaliseStatus(row.Status),
        impact_if_false: row['Impact if False'] ?? null,
        likelihood_of_failure: normaliseLikelihood(row['Likelihood of Failure'] ?? null),
        source_rationale: row['Source / Rationale'] ?? null,
        validation_plan: row['Validation Plan'] ?? null,
        linked_items: parseLinkedItems(row['Linked Items'] ?? null),
    };
}
//# sourceMappingURL=hpo-mapping.js.map