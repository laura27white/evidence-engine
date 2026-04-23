export async function writeSignals(client, signals, options) {
    const result = { inserted: 0, skippedExisting: 0, skippedNoAssumption: 0 };
    for (const signal of signals) {
        const assumptionId = options.assumptionIdByRef.get(signal.externalRef);
        if (!assumptionId) {
            result.skippedNoAssumption += 1;
            continue;
        }
        const measuredAt = `${signal.asOf}T00:00:00.000Z`;
        const { data: existing, error: lookupErr } = await client
            .from('drift_measurements')
            .select('id')
            .eq('assumption_id', assumptionId)
            .eq('measured_at', measuredAt)
            .eq('external_data_ref', buildRef(signal))
            .limit(1);
        if (lookupErr) {
            throw new Error(`drift_measurements lookup failed: ${lookupErr.message}`);
        }
        if (existing && existing.length > 0) {
            result.skippedExisting += 1;
            continue;
        }
        const { error: insertErr } = await client.from('drift_measurements').insert({
            assumption_id: assumptionId,
            measured_at: measuredAt,
            observed_value: signal.value,
            source: 'EXTERNAL_API',
            source_url: signal.sourceUrl,
            external_data_ref: buildRef(signal),
            notes: signal.revisionNote ?? null,
            is_leading_indicator: signal.isLeadingIndicator,
        });
        if (insertErr) {
            throw new Error(`drift_measurements insert failed: ${insertErr.message}`);
        }
        result.inserted += 1;
    }
    return result;
}
function buildRef(signal) {
    return `${signal.externalRef} ${signal.asOf}`;
}
//# sourceMappingURL=writer.js.map