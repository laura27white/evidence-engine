export type { ExternalSignal, FetchResult, FetchError, FetchErrorKind, SourceTier, SignalSource, } from './common/types';
export { ok, err } from './common/types';
export { fetchJson, fetchText, type HttpOptions, type HttpResult } from './common/http';
export { hashPayload } from './common/provenance';
export { fetchOnsCpi, fetchOnsTimeseries, buildOnsUrl, parseMonthDate, parseOnsValue, onsObservationSchema, onsTimeseriesSchema, } from './adapters/ons';
export type { FetchCpiOptions, OnsObservation, OnsTimeseries, OnsSeriesPath } from './adapters/ons';
export { fetchBoeBankRate, fetchBoeCsv, buildBoeUrl, parseIadbDate, parseIadbValue, boeCsvRowSchema, } from './adapters/boe';
export type { BoeCsvRow, BoeSeriesPath, FetchBankRateOptions } from './adapters/boe';
export { fetchGovukTaxPolicy, fetchGovukSearch, buildGovukUrl, govukSearchResponseSchema, govukSearchResultSchema, } from './adapters/govuk';
export type { FetchTaxPolicyOptions, GovukSearchQuery, GovukSearchResponse, GovukSearchResult, } from './adapters/govuk';
export { runIngest, defaultAdapters, type AdapterDef, type IngestRunSummary, type AdapterSummary, type IngestOptions, } from './pipeline/ingest';
export { writeSignals, type WriteResult, type WriterOptions } from './pipeline/writer';
export { writeAudit, type AuditRow } from './pipeline/audit';
//# sourceMappingURL=index.d.ts.map