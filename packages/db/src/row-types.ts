/**
 * Convenience aliases for the row, insert, and update shapes of every table in the
 * `evidence_engine` schema. Centralising these means callers do not need to thread the
 * full Database / schema / table key dance through their own code.
 */
import type { Database } from '../types/database';

type Tables = Database['evidence_engine']['Tables'];

export type Project = Tables['projects']['Row'];
export type ProjectInsert = Tables['projects']['Insert'];
export type ProjectUpdate = Tables['projects']['Update'];

export type Assumption = Tables['assumptions']['Row'];
export type AssumptionInsert = Tables['assumptions']['Insert'];
export type AssumptionUpdate = Tables['assumptions']['Update'];

export type DriftMeasurement = Tables['drift_measurements']['Row'];
export type DriftMeasurementInsert = Tables['drift_measurements']['Insert'];

export type CascadeLink = Tables['cascade_links']['Row'];
export type CascadeLinkInsert = Tables['cascade_links']['Insert'];

export type Forecast = Tables['forecasts']['Row'];
export type ForecastInsert = Tables['forecasts']['Insert'];

export type CascadeImpact = Tables['cascade_impacts']['Row'];
export type CascadeImpactInsert = Tables['cascade_impacts']['Insert'];

export type ConfidenceScore = Tables['confidence_scores']['Row'];
export type ConfidenceScoreInsert = Tables['confidence_scores']['Insert'];

export type Brief = Tables['briefs']['Row'];
export type BriefInsert = Tables['briefs']['Insert'];

export type IngestAudit = Tables['ingest_audit']['Row'];
export type IngestAuditInsert = Tables['ingest_audit']['Insert'];
