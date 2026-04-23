/**
 * Pure helpers for mapping an HPO register xlsx row to an assumptions table row.
 *
 * Extracted from the importer so they can be unit-tested without a Supabase client or a
 * real xlsx file. The importer (`import-hpo.ts`) composes these helpers with the I/O.
 */
import { z } from 'zod';
import type { AssumptionInsert } from '../src/row-types';
export declare const EXTERNAL_CATEGORY_STARTS: readonly ["Economic /"];
export declare const EXTERNAL_CATEGORY_EXACT: Set<string>;
export declare const ECONOMIC_REFS: Readonly<Record<string, {
    external_ref: string;
    baseline_value: number | null;
    baseline_unit: string | null;
    tolerance_pct: number | null;
}>>;
export declare const xlsxRowSchema: z.ZodObject<{
    ID: z.ZodString;
    'Assumption Description': z.ZodString;
    Category: z.ZodString;
    'Date Logged': z.ZodString;
    Owner: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    'Impact if False': z.ZodNullable<z.ZodOptional<z.ZodString>>;
    'Likelihood of Failure': z.ZodNullable<z.ZodOptional<z.ZodEnum<["Low", "Medium", "High", "LOW", "MEDIUM", "HIGH"]>>>;
    'Source / Rationale': z.ZodNullable<z.ZodOptional<z.ZodString>>;
    'Validation Plan': z.ZodNullable<z.ZodOptional<z.ZodString>>;
    Status: z.ZodString;
    'Review Date': z.ZodNullable<z.ZodOptional<z.ZodString>>;
    'Linked Items': z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    ID: string;
    'Assumption Description': string;
    Category: string;
    'Date Logged': string;
    Status: string;
    Owner?: string | null | undefined;
    'Impact if False'?: string | null | undefined;
    'Likelihood of Failure'?: "Low" | "Medium" | "High" | "LOW" | "MEDIUM" | "HIGH" | null | undefined;
    'Source / Rationale'?: string | null | undefined;
    'Validation Plan'?: string | null | undefined;
    'Review Date'?: string | null | undefined;
    'Linked Items'?: string | null | undefined;
}, {
    ID: string;
    'Assumption Description': string;
    Category: string;
    'Date Logged': string;
    Status: string;
    Owner?: string | null | undefined;
    'Impact if False'?: string | null | undefined;
    'Likelihood of Failure'?: "Low" | "Medium" | "High" | "LOW" | "MEDIUM" | "HIGH" | null | undefined;
    'Source / Rationale'?: string | null | undefined;
    'Validation Plan'?: string | null | undefined;
    'Review Date'?: string | null | undefined;
    'Linked Items'?: string | null | undefined;
}>;
export type XlsxRow = z.infer<typeof xlsxRowSchema>;
export declare function isExternal(category: string): boolean;
export declare function normaliseLikelihood(value: string | null | undefined): 'LOW' | 'MEDIUM' | 'HIGH' | null;
export declare function normaliseStatus(value: string): 'OPEN' | 'CLOSED' | 'RETIRED';
export declare function parseLinkedItems(value: string | null | undefined): string[] | null;
export declare function mapRow(row: XlsxRow, projectId: string): AssumptionInsert;
//# sourceMappingURL=hpo-mapping.d.ts.map