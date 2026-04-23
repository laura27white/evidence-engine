-- 0006_grants_and_function_hardening.sql
-- Two concerns:
--   (a) Pin the search_path on the three SQL/plpgsql helper functions so they cannot be
--       hijacked by a writable search_path (Supabase advisor 0011).
--   (b) Grant the API roles (anon, authenticated, service_role) USAGE on the schema and
--       SELECT on every table so PostgREST can route requests to evidence_engine. RLS still
--       enforces row visibility.
-- Reverse: revoke grants, reset functions to no search_path.

-- (a) Function hardening.
alter function evidence_engine.touch_updated_at() set search_path = pg_catalog, public;
alter function evidence_engine.jwt_project_ids() set search_path = pg_catalog, public;
alter function evidence_engine.demo_project_id() set search_path = pg_catalog, evidence_engine;

-- (b) Schema and table grants.
grant usage on schema evidence_engine to anon, authenticated, service_role;

grant select on all tables in schema evidence_engine to anon, authenticated, service_role;
grant insert, update, delete on all tables in schema evidence_engine to service_role;

-- drift_measurements is special: authenticated may INSERT (via edge functions or future
-- client-side write paths), but UPDATE and DELETE were revoked in 0004 and stay revoked.
grant insert on evidence_engine.drift_measurements to authenticated;

-- Default privileges so that future tables created in this schema inherit the same grants.
alter default privileges in schema evidence_engine
  grant select on tables to anon, authenticated, service_role;
alter default privileges in schema evidence_engine
  grant insert, update, delete on tables to service_role;

-- Functions called from RLS policies must be executable by the role evaluating the policy.
grant execute on function evidence_engine.jwt_project_ids() to anon, authenticated, service_role;
grant execute on function evidence_engine.demo_project_id() to anon, authenticated, service_role;
