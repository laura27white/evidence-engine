/**
 * Build a NarrativeInput from already-fetched database rows. Pure; no I/O.
 *
 * Row shapes are declared locally rather than imported from @tp/db so the
 * narrative package can be typechecked in isolation without pulling the
 * database package's source tree into its rootDir.
 */
export function buildNarrativeInput(inputs) {
    const { project, computedAt, assumptions, forecastsByAssumptionId, confidencesByAssumptionId, impacts, externalMeasurements, } = inputs;
    let breachingNow = 0;
    let breachingWithin30d = 0;
    let breachingWithin90d = 0;
    let driftSum = 0;
    let driftCount = 0;
    const atRisk = [];
    for (const a of assumptions) {
        const forecast = forecastsByAssumptionId.get(a.id);
        if (forecast !== undefined && forecast.ensemble_agreement !== null) {
            driftSum += 1 - Number(forecast.ensemble_agreement);
            driftCount += 1;
        }
        const leadTime = forecast?.lead_time_days ?? null;
        if (leadTime !== null && leadTime <= 0)
            breachingNow += 1;
        if (leadTime !== null && leadTime > 0 && leadTime <= 30)
            breachingWithin30d += 1;
        if (leadTime !== null && leadTime > 0 && leadTime <= 90)
            breachingWithin90d += 1;
        const severity = deriveSeverity(leadTime);
        const confidence = deriveConfidenceBand(confidencesByAssumptionId.get(a.id)?.score ?? null);
        if (leadTime !== null && leadTime <= 180) {
            atRisk.push({
                code: a.code,
                description: a.description,
                leadTimeDays: leadTime,
                severity,
                confidence,
            });
        }
    }
    atRisk.sort((a, b) => a.leadTimeDays - b.leadTimeDays);
    const driverScoreById = new Map();
    for (const impact of impacts) {
        driverScoreById.set(impact.source_assumption_id, (driverScoreById.get(impact.source_assumption_id) ?? 0) + Number(impact.expected_drift_score));
    }
    const topDrivers = [];
    for (const a of assumptions) {
        const score = driverScoreById.get(a.id);
        if (score === undefined || score === 0)
            continue;
        topDrivers.push({ code: a.code, description: a.description, driverScore: score });
    }
    topDrivers.sort((a, b) => b.driverScore - a.driverScore);
    const totalDriverScore = topDrivers.reduce((acc, d) => acc + d.driverScore, 0);
    const globalFragility = topDrivers.length === 0 ? 0 : Math.min(1, totalDriverScore / Math.max(1, assumptions.length));
    const externalSignals = [];
    for (const a of assumptions.filter((x) => x.is_external)) {
        const measurement = externalMeasurements.get(a.id);
        if (measurement === undefined || a.baseline_value === null)
            continue;
        const baseline = Number(a.baseline_value);
        const current = Number(measurement.observed_value);
        const driftPct = baseline === 0 ? 0 : ((current - baseline) / Math.abs(baseline)) * 100;
        externalSignals.push({
            code: a.code,
            description: a.description,
            baselineValue: baseline,
            currentValue: current,
            driftPct,
            lastRetrievedAt: new Date(measurement.measured_at),
        });
    }
    return {
        project: { code: project.code, name: project.name, description: project.description ?? '' },
        computedAt,
        summary: {
            totalAssumptions: assumptions.length,
            breachingNow,
            breachingWithin30d,
            breachingWithin90d,
            overallDriftScore: driftCount === 0 ? 0 : driftSum / driftCount,
            globalFragility,
            topDrivers: topDrivers.slice(0, 5),
            mostAtRisk: atRisk.slice(0, 5),
            externalSignals,
        },
    };
}
export function deriveSeverity(leadTimeDays) {
    if (leadTimeDays === null)
        return 'safe';
    if (leadTimeDays <= 0)
        return 'critical';
    if (leadTimeDays <= 90)
        return 'warning';
    return 'safe';
}
export function deriveConfidenceBand(score) {
    if (score === null)
        return 'LOW';
    const numeric = Number(score);
    if (numeric >= 75)
        return 'HIGH';
    if (numeric >= 50)
        return 'MODERATE';
    return 'LOW';
}
//# sourceMappingURL=summariser.js.map