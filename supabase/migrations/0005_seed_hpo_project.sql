-- 0005_seed_hpo_project.sql
-- Inserts the HPO24A01-DEMO project row that judges and public visitors will see via anon
-- access. The 47 assumptions are loaded separately by `pnpm db:import-hpo`.
-- Reverse: `delete from evidence_engine.projects where code = 'HPO24A01-DEMO';`

insert into evidence_engine.projects (code, name, description, org_id)
values (
  'HPO24A01-DEMO',
  'HPO24A01 Holographic Project Office',
  'Synthetic programme used as the reference dataset for MPA Challenge 5. Forty-seven assumptions loaded from the HPO register; three (A046 Inflation, A047 Interest Rates, A048 Tax Policy) anchored to live UK public data.',
  null
)
on conflict (code) do nothing;
