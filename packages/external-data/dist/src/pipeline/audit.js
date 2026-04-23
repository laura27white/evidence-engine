export async function writeAudit(client, row) {
    const { error } = await client.from('ingest_audit').insert({
        source: row.source,
        endpoint: row.endpoint,
        status: row.status,
        records_fetched: row.recordsFetched ?? null,
        records_written: row.recordsWritten ?? null,
        error_detail: row.errorDetail ?? null,
        duration_ms: row.durationMs,
    });
    if (error) {
        throw new Error(`ingest_audit insert failed: ${error.message}`);
    }
}
//# sourceMappingURL=audit.js.map