export const FIXED_NOW = new Date('2026-04-22T00:00:00Z');
export function baseline(value = 100, tolerancePct = 10, unit = '% YoY') {
    return { baselineValue: value, baselineUnit: unit, tolerancePct };
}
export function linearSeries(options) {
    const { n, slope, intercept, startDaysAgo, cadenceDays = 30, assumptionId = 'A-TEST' } = options;
    const measurements = [];
    for (let i = 0; i < n; i += 1) {
        const daysAgo = startDaysAgo - i * cadenceDays;
        const measuredAt = new Date(FIXED_NOW.getTime() - daysAgo * 86_400_000);
        measurements.push({
            assumptionId,
            measuredAt,
            observedValue: intercept + slope * (i * cadenceDays),
            source: 'EXTERNAL_API',
        });
    }
    return measurements;
}
export function constantSeries(n, value, assumptionId = 'A-CONST') {
    const measurements = [];
    for (let i = 0; i < n; i += 1) {
        measurements.push({
            assumptionId,
            measuredAt: new Date(FIXED_NOW.getTime() - (n - i) * 30 * 86_400_000),
            observedValue: value,
            source: 'MANUAL',
        });
    }
    return measurements;
}
//# sourceMappingURL=fixtures.js.map