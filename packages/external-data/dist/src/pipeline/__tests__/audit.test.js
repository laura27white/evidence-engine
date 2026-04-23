import { describe, expect, it, vi } from 'vitest';
import { writeAudit } from '../audit';
describe('writeAudit', () => {
    it('inserts a row with all documented fields', async () => {
        const insert = vi.fn().mockResolvedValue({ error: null });
        const client = { from: () => ({ insert }) };
        await writeAudit(client, {
            source: 'ONS',
            endpoint: 'ONS timeseries D7G7',
            status: 'SUCCESS',
            recordsFetched: 24,
            recordsWritten: 24,
            durationMs: 450,
        });
        expect(insert).toHaveBeenCalledWith({
            source: 'ONS',
            endpoint: 'ONS timeseries D7G7',
            status: 'SUCCESS',
            records_fetched: 24,
            records_written: 24,
            error_detail: null,
            duration_ms: 450,
        });
    });
    it('throws when the insert fails', async () => {
        const client = {
            from: () => ({
                insert: () => Promise.resolve({ error: { message: 'boom' } }),
            }),
        };
        await expect(writeAudit(client, {
            source: 'BOE',
            endpoint: 'IADB',
            status: 'FAILURE',
            durationMs: 12,
            errorDetail: 'timeout',
        })).rejects.toThrow(/ingest_audit insert failed/);
    });
});
//# sourceMappingURL=audit.test.js.map