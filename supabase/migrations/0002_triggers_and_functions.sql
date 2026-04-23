-- 0002_triggers_and_functions.sql
-- Trigger helpers. Currently just an updated_at touch trigger reused across tables.
-- Reverse: drop the triggers, then `drop function evidence_engine.touch_updated_at()`.

create or replace function evidence_engine.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
comment on function evidence_engine.touch_updated_at() is
  'Sets updated_at to now() on row update. Attach to any table with an updated_at column.';

create trigger projects_touch_updated_at
  before update on evidence_engine.projects
  for each row
  execute function evidence_engine.touch_updated_at();

create trigger assumptions_touch_updated_at
  before update on evidence_engine.assumptions
  for each row
  execute function evidence_engine.touch_updated_at();
