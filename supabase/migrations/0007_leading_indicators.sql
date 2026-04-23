-- 0007_leading_indicators.sql
-- Adds the columns required for distinguishing primary signals from leading indicators.
-- assumptions.leading_indicator_refs lists the external_ref codes of series that lead
-- (but do not feed) the forecast for this assumption. drift_measurements.is_leading_indicator
-- flags rows written from a leading-indicator fetch so the UI can overlay them without
-- feeding them into the forecast ensemble.
-- Reverse: drop the columns.

alter table evidence_engine.assumptions
  add column if not exists leading_indicator_refs text[];

comment on column evidence_engine.assumptions.leading_indicator_refs is
  'Array of external_ref codes (e.g. {"ONS:D7NN","ONS:PLLU"}) pointing at series that lead this assumption. Leading indicators are display context only; they are NOT consumed by the forecast ensemble.';

alter table evidence_engine.drift_measurements
  add column if not exists is_leading_indicator boolean not null default false;

comment on column evidence_engine.drift_measurements.is_leading_indicator is
  'True when this measurement was fetched from a leading-indicator series rather than the assumptions primary signal. Downstream consumers use this to overlay leading indicators on charts without including them in forecast calculations.';

create index if not exists drift_measurements_leading_indicator_idx
  on evidence_engine.drift_measurements(assumption_id, is_leading_indicator, measured_at desc);
