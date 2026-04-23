/**
 * Zod schemas for ONS Beta API responses.
 *
 * The ONS API wraps each observation in an object with the numeric value stored as a
 * string. Missing values are represented as '' or '-'. The schema validates shape only;
 * value-level cleaning (string-to-number, blank-to-null) happens in the mapper.
 */
import { z } from 'zod';
export declare const onsObservationSchema: z.ZodObject<{
    date: z.ZodString;
    value: z.ZodString;
}, "strip", z.ZodTypeAny, {
    date: string;
    value: string;
}, {
    date: string;
    value: string;
}>;
export declare const onsTimeseriesSchema: z.ZodObject<{
    description: z.ZodOptional<z.ZodObject<{
        title: z.ZodOptional<z.ZodString>;
        unit: z.ZodOptional<z.ZodString>;
        cdid: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        unit?: string | undefined;
        title?: string | undefined;
        cdid?: string | undefined;
    }, {
        unit?: string | undefined;
        title?: string | undefined;
        cdid?: string | undefined;
    }>>;
    months: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        date: z.ZodString;
        value: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        date: string;
        value: string;
    }, {
        date: string;
        value: string;
    }>, "many">>>;
    quarters: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        date: z.ZodString;
        value: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        date: string;
        value: string;
    }, {
        date: string;
        value: string;
    }>, "many">>>;
    years: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodObject<{
        date: z.ZodString;
        value: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        date: string;
        value: string;
    }, {
        date: string;
        value: string;
    }>, "many">>>;
}, "strip", z.ZodTypeAny, {
    months: {
        date: string;
        value: string;
    }[];
    quarters: {
        date: string;
        value: string;
    }[];
    years: {
        date: string;
        value: string;
    }[];
    description?: {
        unit?: string | undefined;
        title?: string | undefined;
        cdid?: string | undefined;
    } | undefined;
}, {
    description?: {
        unit?: string | undefined;
        title?: string | undefined;
        cdid?: string | undefined;
    } | undefined;
    months?: {
        date: string;
        value: string;
    }[] | undefined;
    quarters?: {
        date: string;
        value: string;
    }[] | undefined;
    years?: {
        date: string;
        value: string;
    }[] | undefined;
}>;
export type OnsObservation = z.infer<typeof onsObservationSchema>;
export type OnsTimeseries = z.infer<typeof onsTimeseriesSchema>;
//# sourceMappingURL=schemas.d.ts.map