/**
 * Build a NarrativeInput from already-fetched database rows. Pure; no I/O.
 *
 * Row shapes are declared locally rather than imported from @tp/db so the
 * narrative package can be typechecked in isolation without pulling the
 * database package's source tree into its rootDir.
 */
import type { ConfidenceBand, NarrativeInput, Severity } from './types';
export interface AssumptionRow {
    id: string;
    code: string;
    description: string;
    category: string;
    baseline_value: number | string | null;
    tolerance_pct: number | string | null;
    is_external: boolean;
}
export interface ProjectRow {
    id: string;
    code: string;
    name: string;
    description: string | null;
}
export interface ForecastRow {
    assumption_id: string;
    lead_time_days: number | null;
    ensemble_agreement: number | string | null;
}
export interface ConfidenceRow {
    assumption_id: string;
    score: number | string;
}
export interface DriftMeasurementRow {
    assumption_id: string;
    measured_at: string;
    observed_value: number | string;
}
export interface CascadeImpactRow {
    source_assumption_id: string;
    target_assumption_id: string;
    expected_drift_score: number | string;
}
export interface SummariserInputs {
    project: ProjectRow;
    computedAt: Date;
    assumptions: AssumptionRow[];
    forecastsByAssumptionId: Map<string, ForecastRow>;
    confidencesByAssumptionId: Map<string, ConfidenceRow>;
    impacts: CascadeImpactRow[];
    externalMeasurements: Map<string, DriftMeasurementRow>;
}
export declare function buildNarrativeInput(inputs: SummariserInputs): NarrativeInput;
export declare function deriveSeverity(leadTimeDays: number | null): Severity;
export declare function deriveConfidenceBand(score: number | string | null): ConfidenceBand;
//# sourceMappingURL=summariser.d.ts.map