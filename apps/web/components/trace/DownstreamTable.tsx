'use client';

import { DataTable, Text, type Column } from '@tp/design-system';

export interface DownstreamRow {
  id: string;
  expectedDriftScore: number;
}

export function DownstreamTable({ rows }: { rows: DownstreamRow[] }) {
  return (
    <DataTable
      rows={rows}
      columns={columns}
      getRowId={(r) => r.id}
      caption={`Top ${rows.length} downstream assumptions by expected drift`}
      emptyState={
        <Text variant="bodySmall" tone="tertiary">
          No downstream impacts.
        </Text>
      }
    />
  );
}

const columns: Column<DownstreamRow>[] = [
  { key: 'id', header: 'Target', kind: 'mono', render: (r) => r.id.slice(0, 8) },
  {
    key: 'score',
    header: 'Drift',
    kind: 'number',
    render: (r) => r.expectedDriftScore.toFixed(2),
  },
];
