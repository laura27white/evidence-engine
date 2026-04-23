/**
 * Zod schemas for gov.uk search API responses.
 *
 * We only care about the `total` count and the result titles + links that go into
 * `revisionNote`. The search API returns many other fields; we ignore them.
 */
import { z } from 'zod';
export declare const govukSearchResultSchema: z.ZodObject<{
    title: z.ZodString;
    link: z.ZodString;
    public_timestamp: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title: string;
    link: string;
    public_timestamp?: string | undefined;
}, {
    title: string;
    link: string;
    public_timestamp?: string | undefined;
}>;
export declare const govukSearchResponseSchema: z.ZodObject<{
    results: z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        link: z.ZodString;
        public_timestamp: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        link: string;
        public_timestamp?: string | undefined;
    }, {
        title: string;
        link: string;
        public_timestamp?: string | undefined;
    }>, "many">;
    total: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    total: number;
    results: {
        title: string;
        link: string;
        public_timestamp?: string | undefined;
    }[];
}, {
    total: number;
    results: {
        title: string;
        link: string;
        public_timestamp?: string | undefined;
    }[];
}>;
export type GovukSearchResult = z.infer<typeof govukSearchResultSchema>;
export type GovukSearchResponse = z.infer<typeof govukSearchResponseSchema>;
//# sourceMappingURL=schemas.d.ts.map