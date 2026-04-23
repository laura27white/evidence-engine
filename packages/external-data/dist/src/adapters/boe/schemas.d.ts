/**
 * Zod schemas for Bank of England Interactive Database (IADB) CSV rows.
 *
 * The IADB CSV layout is: the first row is a header, each subsequent row is
 * `DATE,<series code column>` where DATE is DD MMM YYYY. Missing observations are empty
 * strings or `-99999`.
 */
import { z } from 'zod';
export declare const boeCsvRowSchema: z.ZodObject<{
    date: z.ZodString;
    value: z.ZodString;
}, "strip", z.ZodTypeAny, {
    date: string;
    value: string;
}, {
    date: string;
    value: string;
}>;
export type BoeCsvRow = z.infer<typeof boeCsvRowSchema>;
//# sourceMappingURL=schemas.d.ts.map