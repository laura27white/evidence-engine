/**
 * Zod schemas for gov.uk search API responses.
 *
 * We only care about the `total` count and the result titles + links that go into
 * `revisionNote`. The search API returns many other fields; we ignore them.
 */
import { z } from 'zod';
export const govukSearchResultSchema = z.object({
    title: z.string(),
    link: z.string(),
    public_timestamp: z.string().optional(),
});
export const govukSearchResponseSchema = z.object({
    results: z.array(govukSearchResultSchema),
    total: z.number(),
});
//# sourceMappingURL=schemas.js.map