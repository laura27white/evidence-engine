-- 0003_rls_policies.sql
-- Default-deny, opt-in read. Per-project read for authenticated users whose JWT has a
-- `project_ids` claim containing the row's project_id. Anon read limited to the
-- HPO24A01-DEMO project (the one the judges and public will see). Service role bypasses
-- RLS entirely (Supabase behaviour).
-- Reverse: `drop policy ...` for each, then `alter table ... disable row level security;`.

-- ---------------------------------------------------------------------------
-- Helper: extract project_ids claim from JWT as a uuid array.
-- ---------------------------------------------------------------------------
create or replace function evidence_engine.jwt_project_ids()
returns uuid[]
language sql
stable
as $$
  select coalesce(
    array(
      select (v::text)::uuid
      from jsonb_array_elements_text(
        coalesce(auth.jwt() -> 'project_ids', '[]'::jsonb)
      ) as v
    ),
    array[]::uuid[]
  );
$$;
comment on function evidence_engine.jwt_project_ids() is
  'Returns the authenticated user project_ids claim as a uuid[]. Empty array if absent.';

-- ---------------------------------------------------------------------------
-- Helper: id of the demo project, cached via a stable function so RLS predicates are
-- indexable.
-- ---------------------------------------------------------------------------
create or replace function evidence_engine.demo_project_id()
returns uuid
language sql
stable
as $$
  select id from evidence_engine.projects where code = 'HPO24A01-DEMO' limit 1;
$$;
comment on function evidence_engine.demo_project_id() is
  'Returns the id of the HPO24A01-DEMO project. Used by anon-read policies.';

-- ---------------------------------------------------------------------------
-- Enable RLS on every table.
-- ---------------------------------------------------------------------------
alter table evidence_engine.projects             enable row level security;
alter table evidence_engine.assumptions          enable row level security;
alter table evidence_engine.drift_measurements   enable row level security;
alter table evidence_engine.cascade_links        enable row level security;
alter table evidence_engine.forecasts            enable row level security;
alter table evidence_engine.cascade_impacts      enable row level security;
alter table evidence_engine.confidence_scores    enable row level security;
alter table evidence_engine.briefs               enable row level security;
alter table evidence_engine.ingest_audit         enable row level security;

-- Force RLS on the table owner too, so service role must still go through the bypass path
-- deliberately. Supabase's service role uses `bypassrls` so this is a defence-in-depth move.
alter table evidence_engine.projects             force row level security;
alter table evidence_engine.assumptions          force row level security;
alter table evidence_engine.drift_measurements   force row level security;
alter table evidence_engine.cascade_links        force row level security;
alter table evidence_engine.forecasts            force row level security;
alter table evidence_engine.cascade_impacts      force row level security;
alter table evidence_engine.confidence_scores    force row level security;
alter table evidence_engine.briefs               force row level security;
alter table evidence_engine.ingest_audit         force row level security;

-- ---------------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------------
create policy projects_authenticated_read on evidence_engine.projects
  for select to authenticated
  using (id = any (evidence_engine.jwt_project_ids()));

create policy projects_anon_demo_read on evidence_engine.projects
  for select to anon
  using (code = 'HPO24A01-DEMO');

-- ---------------------------------------------------------------------------
-- assumptions
-- ---------------------------------------------------------------------------
create policy assumptions_authenticated_read on evidence_engine.assumptions
  for select to authenticated
  using (project_id = any (evidence_engine.jwt_project_ids()));

create policy assumptions_anon_demo_read on evidence_engine.assumptions
  for select to anon
  using (project_id = evidence_engine.demo_project_id());

-- ---------------------------------------------------------------------------
-- drift_measurements (join via assumptions)
-- ---------------------------------------------------------------------------
create policy drift_measurements_authenticated_read on evidence_engine.drift_measurements
  for select to authenticated
  using (
    exists (
      select 1 from evidence_engine.assumptions a
      where a.id = drift_measurements.assumption_id
        and a.project_id = any (evidence_engine.jwt_project_ids())
    )
  );

create policy drift_measurements_anon_demo_read on evidence_engine.drift_measurements
  for select to anon
  using (
    exists (
      select 1 from evidence_engine.assumptions a
      where a.id = drift_measurements.assumption_id
        and a.project_id = evidence_engine.demo_project_id()
    )
  );

-- ---------------------------------------------------------------------------
-- cascade_links
-- ---------------------------------------------------------------------------
create policy cascade_links_authenticated_read on evidence_engine.cascade_links
  for select to authenticated
  using (
    exists (
      select 1 from evidence_engine.assumptions a
      where a.id = cascade_links.source_assumption_id
        and a.project_id = any (evidence_engine.jwt_project_ids())
    )
  );

create policy cascade_links_anon_demo_read on evidence_engine.cascade_links
  for select to anon
  using (
    exists (
      select 1 from evidence_engine.assumptions a
      where a.id = cascade_links.source_assumption_id
        and a.project_id = evidence_engine.demo_project_id()
    )
  );

-- ---------------------------------------------------------------------------
-- forecasts
-- ---------------------------------------------------------------------------
create policy forecasts_authenticated_read on evidence_engine.forecasts
  for select to authenticated
  using (
    exists (
      select 1 from evidence_engine.assumptions a
      where a.id = forecasts.assumption_id
        and a.project_id = any (evidence_engine.jwt_project_ids())
    )
  );

create policy forecasts_anon_demo_read on evidence_engine.forecasts
  for select to anon
  using (
    exists (
      select 1 from evidence_engine.assumptions a
      where a.id = forecasts.assumption_id
        and a.project_id = evidence_engine.demo_project_id()
    )
  );

-- ---------------------------------------------------------------------------
-- cascade_impacts
-- ---------------------------------------------------------------------------
create policy cascade_impacts_authenticated_read on evidence_engine.cascade_impacts
  for select to authenticated
  using (
    exists (
      select 1 from evidence_engine.assumptions a
      where a.id = cascade_impacts.source_assumption_id
        and a.project_id = any (evidence_engine.jwt_project_ids())
    )
  );

create policy cascade_impacts_anon_demo_read on evidence_engine.cascade_impacts
  for select to anon
  using (
    exists (
      select 1 from evidence_engine.assumptions a
      where a.id = cascade_impacts.source_assumption_id
        and a.project_id = evidence_engine.demo_project_id()
    )
  );

-- ---------------------------------------------------------------------------
-- confidence_scores
-- ---------------------------------------------------------------------------
create policy confidence_scores_authenticated_read on evidence_engine.confidence_scores
  for select to authenticated
  using (
    exists (
      select 1 from evidence_engine.assumptions a
      where a.id = confidence_scores.assumption_id
        and a.project_id = any (evidence_engine.jwt_project_ids())
    )
  );

create policy confidence_scores_anon_demo_read on evidence_engine.confidence_scores
  for select to anon
  using (
    exists (
      select 1 from evidence_engine.assumptions a
      where a.id = confidence_scores.assumption_id
        and a.project_id = evidence_engine.demo_project_id()
    )
  );

-- ---------------------------------------------------------------------------
-- briefs
-- ---------------------------------------------------------------------------
create policy briefs_authenticated_read on evidence_engine.briefs
  for select to authenticated
  using (project_id = any (evidence_engine.jwt_project_ids()));

create policy briefs_anon_demo_read on evidence_engine.briefs
  for select to anon
  using (project_id = evidence_engine.demo_project_id());

-- ---------------------------------------------------------------------------
-- ingest_audit
-- Audit data is considered operational, not user-facing. No anon read.
-- Authenticated users with at least one project claim can read; we do not expose the source
-- to external integrations with no project association.
-- ---------------------------------------------------------------------------
create policy ingest_audit_authenticated_read on evidence_engine.ingest_audit
  for select to authenticated
  using (array_length(evidence_engine.jwt_project_ids(), 1) is not null);

-- Explicit: no anon read on ingest_audit. Default-deny applies.

-- ---------------------------------------------------------------------------
-- No INSERT/UPDATE/DELETE policies for anon or authenticated. Only the service role
-- (which bypasses RLS) writes to these tables. Edge functions and the import scripts
-- run under the service role; the browser client is read-only.
-- ---------------------------------------------------------------------------
