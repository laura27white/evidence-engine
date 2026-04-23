'use client';

import { DataTable, Text, Timestamp, type Column } from '@tp/design-system';

import type { Forecast } from '@tp/db';

export function ForecastMethodBreakdown({ forecasts }: { forecasts: Forecast[] }) {
  if (forecasts.length === 0) {
    return (
      <Text variant="bodySmall" tone="tertiary">
        No method forecasts recorded. Run Recompute to populate.
      </Text>
    );
  }
  return (
    <DataTable
      rows={forecasts}
      columns={columns}
      getRowId={(r) => r.id}
      caption="Forecast by method; ENSEMBLE combines the other three"
    />
  );
}

const columns: Column<Forecast>[] = [
  {
    key: 'method',
    header: 'Method',
    kind: 'badge',
    render: (f) => f.method,
  },
  {
    key: 'computedAt',
    header: 'Computed',
    render: (f) => <Timestamp at={f.computed_at} mode="relative" />,
  },
  {
    key: 'projected30d',
    header: '30d',
    kind: 'number',
    render: (f) =>
      f.projected_value_30d === null ? '--' : Number(f.projected_value_30d).toFixed(2),
  },
  {
    key: 'projected90d',
    header: '90d',
    kind: 'number',
    render: (f) =>
      f.projected_value_90d === null ? '--' : Number(f.projected_value_90d).toFixed(2),
  },
  {
    key: 'projected365d',
    header: '365d',
    kind: 'number',
    render: (f) =>
      f.projected_value_365d === null ? '--' : Number(f.projected_value_365d).toFixed(2),
  },
  {
    key: 'breach',
    header: 'Breach in',
    kind: 'number',
    render: (f) => (f.lead_time_days === null ? '--' : `${f.lead_time_days} days`),
  },
];
