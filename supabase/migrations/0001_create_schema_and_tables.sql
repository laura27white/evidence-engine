-- 0001_create_schema_and_tables.sql
-- Creates the evidence_engine schema and all nine core tables for Project Trueplan.
-- Reverse: `drop schema evidence_engine cascade;`

create schema if not exists evidence_engine;
comment on schema evidence_engine is
  'Project Trueplan core domain tables: projects, assumptions, drift measurements, cascades, forecasts, confidence scores, briefs, and ingest audit.';

-- ---------------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------------
create table evidence_engine.projects (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  description text,
  org_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_code_format check (code ~ '^[A-Z0-9-]{3,32}$')
);
comment on table evidence_engine.projects is
  'One row per project or programme. Multi-tenancy scope for every downstream table.';

-- ---------------------------------------------------------------------------
-- assumptions
-- ---------------------------------------------------------------------------
create table evidence_engine.assumptions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references evidence_engine.projects(id) on delete cascade,
  code text not null,
  description text not null,
  category text not null,
  owner text,
  baseline_value numeric(20, 6),
  baseline_unit text,
  tolerance_pct numeric(8, 4),
  review_cadence_days integer not null default 90,
  source_tier smallint not null check (source_tier in (1, 2, 3)),
  external_ref text,
  is_external boolean not null default false,
  is_portfolio_level boolean not null default false,
  pda_platform_id text,
  date_logged date not null,
  review_date date,
  status text not null default 'OPEN' check (status in ('OPEN','CLOSED','RETIRED')),
  impact_if_false text,
  likelihood_of_failure text check (likelihood_of_failure in ('LOW','MEDIUM','HIGH')),
  source_rationale text,
  validation_plan text,
  linked_items text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, code),
  constraint assumptions_code_format check (code ~ '^A\d{3,4}$')
);
comment on table evidence_engine.assumptions is
  'Assumptions register. One row per stated belief the plan depends on. Categorised, scoped to a project, optionally anchored to an external data source.';

create index assumptions_project_id_idx on evidence_engine.assumptions(project_id);
create index assumptions_category_idx on evidence_engine.assumptions(category);
create index assumptions_is_external_idx on evidence_engine.assumptions(is_external);

-- ---------------------------------------------------------------------------
-- drift_measurements (append-only time series)
-- ---------------------------------------------------------------------------
create table evidence_engine.drift_measurements (
  id uuid primary key default gen_random_uuid(),
  assumption_id uuid not null references evidence_engine.assumptions(id) on delete cascade,
  measured_at timestamptz not null,
  observed_value numeric(20, 6) not null,
  source text not null check (source in ('EXTERNAL_API','MANUAL','SYSTEM_DERIVED')),
  source_url text,
  external_data_ref text,
  notes text,
  created_at timestamptz not null default now()
);
comment on table evidence_engine.drift_measurements is
  'Append-only time-series of observed values per assumption. UPDATE and DELETE are revoked for non-service-role identities in migration 0004.';

create index drift_measurements_assumption_measured_at_idx
  on evidence_engine.drift_measurements(assumption_id, measured_at desc);
create index drift_measurements_source_idx
  on evidence_engine.drift_measurements(source);

-- ---------------------------------------------------------------------------
-- cascade_links
-- ---------------------------------------------------------------------------
create table evidence_engine.cascade_links (
  id uuid primary key default gen_random_uuid(),
  source_assumption_id uuid not null references evidence_engine.assumptions(id) on delete cascade,
  target_assumption_id uuid not null references evidence_engine.assumptions(id) on delete cascade,
  propagation_weight numeric(4, 3) not null check (propagation_weight >= 0 and propagation_weight <= 1),
  rationale text not null,
  created_at timestamptz not null default now(),
  check (source_assumption_id <> target_assumption_id),
  unique (source_assumption_id, target_assumption_id)
);
comment on table evidence_engine.cascade_links is
  'Directed edges in the cascade DAG. Rationale is required because interpretive cascades must be defensible.';

create index cascade_links_source_idx on evidence_engine.cascade_links(source_assumption_id);
create index cascade_links_target_idx on evidence_engine.cascade_links(target_assumption_id);

-- ---------------------------------------------------------------------------
-- forecasts
-- ---------------------------------------------------------------------------
create table evidence_engine.forecasts (
  id uuid primary key default gen_random_uuid(),
  assumption_id uuid not null references evidence_engine.assumptions(id) on delete cascade,
  computed_at timestamptz not null default now(),
  method text not null check (method in ('LINEAR','EWMA','AR1','ENSEMBLE')),
  projected_value_30d numeric(20, 6),
  projected_value_90d numeric(20, 6),
  projected_value_365d numeric(20, 6),
  projected_breach_date date,
  lead_time_days integer,
  confidence_interval_lower numeric(20, 6),
  confidence_interval_upper numeric(20, 6),
  ensemble_agreement numeric(4, 3),
  model_params jsonb,
  input_series_hash text not null,
  created_at timestamptz not null default now()
);
comment on table evidence_engine.forecasts is
  'Computed forecast snapshot per assumption. input_series_hash is a SHA-256 of the sorted measurement series the forecast was computed from.';

create index forecasts_assumption_computed_at_idx
  on evidence_engine.forecasts(assumption_id, computed_at desc);
create index forecasts_method_idx
  on evidence_engine.forecasts(method);

-- ---------------------------------------------------------------------------
-- cascade_impacts
-- ---------------------------------------------------------------------------
create table evidence_engine.cascade_impacts (
  id uuid primary key default gen_random_uuid(),
  source_assumption_id uuid not null references evidence_engine.assumptions(id) on delete cascade,
  target_assumption_id uuid not null references evidence_engine.assumptions(id) on delete cascade,
  computed_at timestamptz not null default now(),
  expected_drift_score numeric(4, 3) not null,
  paths jsonb not null,
  created_at timestamptz not null default now()
);
comment on table evidence_engine.cascade_impacts is
  'Materialised downstream drift per source and target pair. paths is a JSON array of path objects with their weight products.';

create index cascade_impacts_source_idx on evidence_engine.cascade_impacts(source_assumption_id);
create index cascade_impacts_target_idx on evidence_engine.cascade_impacts(target_assumption_id);

-- ---------------------------------------------------------------------------
-- confidence_scores
-- ---------------------------------------------------------------------------
create table evidence_engine.confidence_scores (
  id uuid primary key default gen_random_uuid(),
  assumption_id uuid not null references evidence_engine.assumptions(id) on delete cascade,
  computed_at timestamptz not null default now(),
  score numeric(5, 2) not null check (score >= 0 and score <= 100),
  recency_component numeric(5, 2) not null,
  source_tier_component numeric(5, 2) not null,
  agreement_component numeric(5, 2) not null,
  volatility_component numeric(5, 2) not null,
  created_at timestamptz not null default now()
);
comment on table evidence_engine.confidence_scores is
  'Confidence score per assumption in [0, 100] with its four component contributions. Methodology in packages/intelligence/METHODOLOGY.md.';

create index confidence_scores_assumption_computed_at_idx
  on evidence_engine.confidence_scores(assumption_id, computed_at desc);

-- ---------------------------------------------------------------------------
-- briefs
-- ---------------------------------------------------------------------------
create table evidence_engine.briefs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references evidence_engine.projects(id) on delete cascade,
  generated_at timestamptz not null default now(),
  narrative_text text not null,
  pda_platform_response_json jsonb,
  cache_key text not null,
  unique (project_id, cache_key)
);
comment on table evidence_engine.briefs is
  'Cached narrative briefs generated by PDA Platform. cache_key is a deterministic hash of the inputs so repeat calls return the cached result.';

create index briefs_project_generated_at_idx
  on evidence_engine.briefs(project_id, generated_at desc);

-- ---------------------------------------------------------------------------
-- ingest_audit
-- ---------------------------------------------------------------------------
create table evidence_engine.ingest_audit (
  id uuid primary key default gen_random_uuid(),
  run_at timestamptz not null default now(),
  source text not null,
  endpoint text not null,
  status text not null check (status in ('SUCCESS','FAILURE','PARTIAL')),
  records_fetched integer,
  records_written integer,
  error_detail text,
  duration_ms integer
);
comment on table evidence_engine.ingest_audit is
  'Audit trail for every external-data ingestion run. Supports the paper reproducibility statement.';

create index ingest_audit_run_at_idx on evidence_engine.ingest_audit(run_at desc);
create index ingest_audit_source_status_idx on evidence_engine.ingest_audit(source, status);
