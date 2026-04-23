/**
 * Zod schemas for Bank of England Interactive Database (IADB) CSV rows.
 *
 * The IADB CSV layout is: the first row is a header, each subsequent row is
 * `DATE,<series code column>` where DATE is DD MMM YYYY. Missing observations are empty
 * strings or `-99999`.
 */
import { z } from 'zod';

export const boeCsvRowSchema = z.object({
  date: z.string().min(1),
  value: z.string(),
});

export type BoeCsvRow = z.infer<typeof boeCsvRowSchema>;
