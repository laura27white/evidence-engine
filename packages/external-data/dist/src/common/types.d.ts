/**
 * Cross-adapter types. Every adapter returns `ExternalSignal[]` wrapped in a `FetchResult`
 * so callers never have to catch exceptions from the adapter layer; errors are values.
 */
export type SourceTier = 1 | 2 | 3;
export type SignalSource = 'ONS' | 'BOE' | 'GOVUK' | 'WORLDBANK';
export interface ExternalSignal {
    /** Upstream data source. */
    source: SignalSource;
    /** Upstream series identifier (e.g. 'D7G7' for ONS CPI 12-month rate). */
    seriesId: string;
    /** Human-readable metric name, e.g. 'CPI all items 12-month rate'. */
    metric: string;
    /** Observed numeric value for this measurement. */
    value: number;
    /** Unit of measurement, e.g. '% YoY', '%', 'count'. */
    unit: string;
    /** Observation date in ISO 8601 (YYYY-MM-DD), from the upstream payload. */
    asOf: string;
    /** Fetch timestamp in ISO 8601, when this adapter pulled the value. */
    fetchedAt: string;
    /** Exact URL the value came from; a paper reviewer can replay this. */
    sourceUrl: string;
    /** Tier 1 = official statistics, 2 = reputable secondary, 3 = internal. */
    sourceTier: SourceTier;
    /** Many ONS series are provisional until confirmed later. */
    provisional: boolean;
    /** Optional revision note attached to the observation. */
    revisionNote?: string;
    /** True for leading-indicator series; display-only, do not feed the forecast. */
    isLeadingIndicator: boolean;
    /** External reference key used to match this measurement to an assumption. */
    externalRef: string;
}
export type FetchResult<T> = {
    readonly ok: true;
    readonly data: T;
} | {
    readonly ok: false;
    readonly error: FetchError;
};
export type FetchErrorKind = 'NETWORK' | 'HTTP' | 'SCHEMA' | 'RATE_LIMIT' | 'NOT_FOUND' | 'UNKNOWN';
export interface FetchError {
    kind: FetchErrorKind;
    message: string;
    cause?: unknown;
    retryable: boolean;
    sourceUrl?: string;
}
/** Successful fetch-result constructor. */
export declare function ok<T>(data: T): FetchResult<T>;
/** Failed fetch-result constructor. */
export declare function err<T>(error: FetchError): FetchResult<T>;
//# sourceMappingURL=types.d.ts.map