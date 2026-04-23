'use client';

import { DataTable, Text, type Column } from '@tp/design-system';
import Link from 'next/link';

export interface ImpactTableRow {
  id: string;
  code: string;
  description: string;
  expectedDriftScore: number;
  pathLabel: string;
}

export function CascadeImpactTable({ rows }: { rows: ImpactTableRow[] }) {
  return (
    <DataTable
      rows={rows}
      columns={columns}
      getRowId={(r) => r.id}
      caption="Downstream assumptions affected by drift in this source"
      emptyState={
        <Text variant="bodySmall" tone="tertiary">
          No downstream impacts.
        </Text>
      }
    />
  );
}

const columns: Column<ImpactTableRow>[] = [
  {
    key: 'code',
    header: 'Target',
    kind: 'mono',
    render: (r) => (
      <Link href={`/trace/${r.code}`} style={{ color: 'inherit', textDecoration: 'underline' }}>
        {r.code}
      </Link>
    ),
  },
  { key: 'description', header: 'Assumption', render: (r) => r.description },
  {
    key: 'score',
    header: 'Expected drift',
    kind: 'number',
    render: (r) => r.expectedDriftScore.toFixed(2),
  },
  {
    key: 'path',
    header: 'Shortest path',
    kind: 'mono',
    render: (r) => r.pathLabel,
  },
];
