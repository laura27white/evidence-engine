/**
 * Zod schemas for ONS Beta API responses.
 *
 * The ONS API wraps each observation in an object with the numeric value stored as a
 * string. Missing values are represented as '' or '-'. The schema validates shape only;
 * value-level cleaning (string-to-number, blank-to-null) happens in the mapper.
 */
import { z } from 'zod';

export const onsObservationSchema = z.object({
  date: z.string().min(4),
  value: z.string(),
});

export const onsTimeseriesSchema = z.object({
  description: z
    .object({
      title: z.string().optional(),
      unit: z.string().optional(),
      cdid: z.string().optional(),
    })
    .optional(),
  months: z.array(onsObservationSchema).optional().default([]),
  quarters: z.array(onsObservationSchema).optional().default([]),
  years: z.array(onsObservationSchema).optional().default([]),
});

export type OnsObservation = z.infer<typeof onsObservationSchema>;
export type OnsTimeseries = z.infer<typeof onsTimeseriesSchema>;
