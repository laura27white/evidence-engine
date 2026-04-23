/** Forecast domain types. Pure; no I/O. */
export const DEFAULT_FORECAST_CONFIG = {
    horizonDays: 365,
    minMeasurementsRequired: 6,
};
export class ForecastInputError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ForecastInputError';
    }
}
//# sourceMappingURL=types.js.map