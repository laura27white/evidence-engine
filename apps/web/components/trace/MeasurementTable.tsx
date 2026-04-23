'use client';

import { DataTable, SourceLink, Text, Timestamp, type Column } from '@tp/design-system';

import type { DriftMeasurement } from '@tp/db';

export function MeasurementTable({ measurements }: { measurements: DriftMeasurement[] }) {
  if (measurements.length === 0) {
    return (
      <Text variant="bodySmall" tone="tertiary">
        No measurements recorded yet.
      </Text>
    );
  }
  return (
    <DataTable
      rows={measurements}
      columns={columns}
      getRowId={(m) => m.id}
      caption="All drift measurements for this assumption"
    />
  );
}

const columns: Column<DriftMeasurement>[] = [
  {
    key: 'measuredAt',
    header: 'Measured at',
    kind: 'timestamp',
    render: (m) => <Timestamp at={m.measured_at} mode="absolute" />,
    sortable: true,
    compare: (a, b) => a.measured_at.localeCompare(b.measured_at),
  },
  {
    key: 'value',
    header: 'Observed',
    kind: 'number',
    render: (m) => Number(m.observed_value).toFixed(3),
    sortable: true,
    compare: (a, b) => Number(a.observed_value) - Number(b.observed_value),
  },
  {
    key: 'source',
    header: 'Source',
    kind: 'badge',
    render: (m) => m.source,
  },
  {
    key: 'url',
    header: 'Provenance',
    render: (m) =>
      m.source_url === null ? (
        <Text variant="bodySmall" tone="tertiary">
          --
        </Text>
      ) : (
        <SourceLink href={m.source_url} label="open" />
      ),
  },
];
