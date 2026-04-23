-- 0004_revoke_destructive_privileges.sql
-- drift_measurements is append-only. Revoke UPDATE and DELETE from the `authenticated` and
-- `anon` roles. Only the service role (which has bypassrls and full grants) may mutate rows;
-- in practice only edge functions and import scripts write here.
-- Reverse: `grant update, delete on evidence_engine.drift_measurements to authenticated;`
-- and likewise for anon if needed.

revoke update, delete on evidence_engine.drift_measurements from authenticated;
revoke update, delete on evidence_engine.drift_measurements from anon;

-- Also revoke INSERT for anon. The ingest path runs under the service role; anon should only
-- ever SELECT demo data.
revoke insert on evidence_engine.drift_measurements from anon;
