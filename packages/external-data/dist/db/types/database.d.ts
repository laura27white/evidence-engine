/**
 * Project Trueplan Supabase database types.
 *
 * The `evidence_engine` schema portion is hand-written because the Supabase MCP / CLI
 * type generators only emit the schemas exposed via the project's API config (defaults
 * to `public`). Once an admin adds `evidence_engine` to Project Settings > API >
 * Exposed schemas in the dashboard, `pnpm db:gen-types` will produce equivalent output
 * and can replace this file. The `public` block below mirrors the generator stub.
 *
 * Source of truth: supabase/migrations/0001_create_schema_and_tables.sql
 */
export type Json = string | number | boolean | null | {
    [key: string]: Json | undefined;
} | Json[];
export type Database = {
    __InternalSupabase: {
        PostgrestVersion: '14.5';
    };
    public: {
        Tables: {
            [_ in never]: never;
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
    evidence_engine: {
        Tables: {
            projects: {
                Row: {
                    id: string;
                    code: string;
                    name: string;
                    description: string | null;
                    org_id: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    code: string;
                    name: string;
                    description?: string | null;
                    org_id?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    code?: string;
                    name?: string;
                    description?: string | null;
                    org_id?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            assumptions: {
                Row: {
                    id: string;
                    project_id: string;
                    code: string;
                    description: string;
                    category: string;
                    owner: string | null;
                    baseline_value: number | null;
                    baseline_unit: string | null;
                    tolerance_pct: number | null;
                    review_cadence_days: number;
                    source_tier: 1 | 2 | 3;
                    external_ref: string | null;
                    is_external: boolean;
                    is_portfolio_level: boolean;
                    pda_platform_id: string | null;
                    date_logged: string;
                    review_date: string | null;
                    status: 'OPEN' | 'CLOSED' | 'RETIRED';
                    impact_if_false: string | null;
                    likelihood_of_failure: 'LOW' | 'MEDIUM' | 'HIGH' | null;
                    source_rationale: string | null;
                    validation_plan: string | null;
                    linked_items: string[] | null;
                    leading_indicator_refs: string[] | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    project_id: string;
                    code: string;
                    description: string;
                    category: string;
                    owner?: string | null;
                    baseline_value?: number | null;
                    baseline_unit?: string | null;
                    tolerance_pct?: number | null;
                    review_cadence_days?: number;
                    source_tier: 1 | 2 | 3;
                    external_ref?: string | null;
                    is_external?: boolean;
                    is_portfolio_level?: boolean;
                    pda_platform_id?: string | null;
                    date_logged: string;
                    review_date?: string | null;
                    status?: 'OPEN' | 'CLOSED' | 'RETIRED';
                    impact_if_false?: string | null;
                    likelihood_of_failure?: 'LOW' | 'MEDIUM' | 'HIGH' | null;
                    source_rationale?: string | null;
                    validation_plan?: string | null;
                    linked_items?: string[] | null;
                    leading_indicator_refs?: string[] | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    project_id?: string;
                    code?: string;
                    description?: string;
                    category?: string;
                    owner?: string | null;
                    baseline_value?: number | null;
                    baseline_unit?: string | null;
                    tolerance_pct?: number | null;
                    review_cadence_days?: number;
                    source_tier?: 1 | 2 | 3;
                    external_ref?: string | null;
                    is_external?: boolean;
                    is_portfolio_level?: boolean;
                    pda_platform_id?: string | null;
                    date_logged?: string;
                    review_date?: string | null;
                    status?: 'OPEN' | 'CLOSED' | 'RETIRED';
                    impact_if_false?: string | null;
                    likelihood_of_failure?: 'LOW' | 'MEDIUM' | 'HIGH' | null;
                    source_rationale?: string | null;
                    validation_plan?: string | null;
                    linked_items?: string[] | null;
                    leading_indicator_refs?: string[] | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'assumptions_project_id_fkey';
                        columns: ['project_id'];
                        isOneToOne: false;
                        referencedRelation: 'projects';
                        referencedColumns: ['id'];
                    }
                ];
            };
            drift_measurements: {
                Row: {
                    id: string;
                    assumption_id: string;
                    measured_at: string;
                    observed_value: number;
                    source: 'EXTERNAL_API' | 'MANUAL' | 'SYSTEM_DERIVED';
                    source_url: string | null;
                    external_data_ref: string | null;
                    notes: string | null;
                    is_leading_indicator: boolean;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    assumption_id: string;
                    measured_at: string;
                    observed_value: number;
                    source: 'EXTERNAL_API' | 'MANUAL' | 'SYSTEM_DERIVED';
                    source_url?: string | null;
                    external_data_ref?: string | null;
                    notes?: string | null;
                    is_leading_indicator?: boolean;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    assumption_id?: string;
                    measured_at?: string;
                    observed_value?: number;
                    source?: 'EXTERNAL_API' | 'MANUAL' | 'SYSTEM_DERIVED';
                    source_url?: string | null;
                    external_data_ref?: string | null;
                    notes?: string | null;
                    is_leading_indicator?: boolean;
                    created_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'drift_measurements_assumption_id_fkey';
                        columns: ['assumption_id'];
                        isOneToOne: false;
                        referencedRelation: 'assumptions';
                        referencedColumns: ['id'];
                    }
                ];
            };
            cascade_links: {
                Row: {
                    id: string;
                    source_assumption_id: string;
                    target_assumption_id: string;
                    propagation_weight: number;
                    rationale: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    source_assumption_id: string;
                    target_assumption_id: string;
                    propagation_weight: number;
                    rationale: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    source_assumption_id?: string;
                    target_assumption_id?: string;
                    propagation_weight?: number;
                    rationale?: string;
                    created_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'cascade_links_source_assumption_id_fkey';
                        columns: ['source_assumption_id'];
                        isOneToOne: false;
                        referencedRelation: 'assumptions';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'cascade_links_target_assumption_id_fkey';
                        columns: ['target_assumption_id'];
                        isOneToOne: false;
                        referencedRelation: 'assumptions';
                        referencedColumns: ['id'];
                    }
                ];
            };
            forecasts: {
                Row: {
                    id: string;
                    assumption_id: string;
                    computed_at: string;
                    method: 'LINEAR' | 'EWMA' | 'AR1' | 'ENSEMBLE';
                    projected_value_30d: number | null;
                    projected_value_90d: number | null;
                    projected_value_365d: number | null;
                    projected_breach_date: string | null;
                    lead_time_days: number | null;
                    confidence_interval_lower: number | null;
                    confidence_interval_upper: number | null;
                    ensemble_agreement: number | null;
                    model_params: Json | null;
                    input_series_hash: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    assumption_id: string;
                    computed_at?: string;
                    method: 'LINEAR' | 'EWMA' | 'AR1' | 'ENSEMBLE';
                    projected_value_30d?: number | null;
                    projected_value_90d?: number | null;
                    projected_value_365d?: number | null;
                    projected_breach_date?: string | null;
                    lead_time_days?: number | null;
                    confidence_interval_lower?: number | null;
                    confidence_interval_upper?: number | null;
                    ensemble_agreement?: number | null;
                    model_params?: Json | null;
                    input_series_hash: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    assumption_id?: string;
                    computed_at?: string;
                    method?: 'LINEAR' | 'EWMA' | 'AR1' | 'ENSEMBLE';
                    projected_value_30d?: number | null;
                    projected_value_90d?: number | null;
                    projected_value_365d?: number | null;
                    projected_breach_date?: string | null;
                    lead_time_days?: number | null;
                    confidence_interval_lower?: number | null;
                    confidence_interval_upper?: number | null;
                    ensemble_agreement?: number | null;
                    model_params?: Json | null;
                    input_series_hash?: string;
                    created_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'forecasts_assumption_id_fkey';
                        columns: ['assumption_id'];
                        isOneToOne: false;
                        referencedRelation: 'assumptions';
                        referencedColumns: ['id'];
                    }
                ];
            };
            cascade_impacts: {
                Row: {
                    id: string;
                    source_assumption_id: string;
                    target_assumption_id: string;
                    computed_at: string;
                    expected_drift_score: number;
                    paths: Json;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    source_assumption_id: string;
                    target_assumption_id: string;
                    computed_at?: string;
                    expected_drift_score: number;
                    paths: Json;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    source_assumption_id?: string;
                    target_assumption_id?: string;
                    computed_at?: string;
                    expected_drift_score?: number;
                    paths?: Json;
                    created_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'cascade_impacts_source_assumption_id_fkey';
                        columns: ['source_assumption_id'];
                        isOneToOne: false;
                        referencedRelation: 'assumptions';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'cascade_impacts_target_assumption_id_fkey';
                        columns: ['target_assumption_id'];
                        isOneToOne: false;
                        referencedRelation: 'assumptions';
                        referencedColumns: ['id'];
                    }
                ];
            };
            confidence_scores: {
                Row: {
                    id: string;
                    assumption_id: string;
                    computed_at: string;
                    score: number;
                    recency_component: number;
                    source_tier_component: number;
                    agreement_component: number;
                    volatility_component: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    assumption_id: string;
                    computed_at?: string;
                    score: number;
                    recency_component: number;
                    source_tier_component: number;
                    agreement_component: number;
                    volatility_component: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    assumption_id?: string;
                    computed_at?: string;
                    score?: number;
                    recency_component?: number;
                    source_tier_component?: number;
                    agreement_component?: number;
                    volatility_component?: number;
                    created_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'confidence_scores_assumption_id_fkey';
                        columns: ['assumption_id'];
                        isOneToOne: false;
                        referencedRelation: 'assumptions';
                        referencedColumns: ['id'];
                    }
                ];
            };
            briefs: {
                Row: {
                    id: string;
                    project_id: string;
                    generated_at: string;
                    narrative_text: string;
                    pda_platform_response_json: Json | null;
                    cache_key: string;
                };
                Insert: {
                    id?: string;
                    project_id: string;
                    generated_at?: string;
                    narrative_text: string;
                    pda_platform_response_json?: Json | null;
                    cache_key: string;
                };
                Update: {
                    id?: string;
                    project_id?: string;
                    generated_at?: string;
                    narrative_text?: string;
                    pda_platform_response_json?: Json | null;
                    cache_key?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'briefs_project_id_fkey';
                        columns: ['project_id'];
                        isOneToOne: false;
                        referencedRelation: 'projects';
                        referencedColumns: ['id'];
                    }
                ];
            };
            ingest_audit: {
                Row: {
                    id: string;
                    run_at: string;
                    source: string;
                    endpoint: string;
                    status: 'SUCCESS' | 'FAILURE' | 'PARTIAL';
                    records_fetched: number | null;
                    records_written: number | null;
                    error_detail: string | null;
                    duration_ms: number | null;
                };
                Insert: {
                    id?: string;
                    run_at?: string;
                    source: string;
                    endpoint: string;
                    status: 'SUCCESS' | 'FAILURE' | 'PARTIAL';
                    records_fetched?: number | null;
                    records_written?: number | null;
                    error_detail?: string | null;
                    duration_ms?: number | null;
                };
                Update: {
                    id?: string;
                    run_at?: string;
                    source?: string;
                    endpoint?: string;
                    status?: 'SUCCESS' | 'FAILURE' | 'PARTIAL';
                    records_fetched?: number | null;
                    records_written?: number | null;
                    error_detail?: string | null;
                    duration_ms?: number | null;
                };
                Relationships: [];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            jwt_project_ids: {
                Args: Record<string, never>;
                Returns: string[];
            };
            demo_project_id: {
                Args: Record<string, never>;
                Returns: string;
            };
            touch_updated_at: {
                Args: Record<string, never>;
                Returns: unknown;
            };
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
};
//# sourceMappingURL=database.d.ts.map