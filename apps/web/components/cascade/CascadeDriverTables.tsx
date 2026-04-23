'use client';

import { DataTable, Text, type Column } from '@tp/design-system';
import Link from 'next/link';

export interface DriverRow {
  id: string;
  code: string;
  description: string;
  driverScore: number;
}

export interface ExposedRow {
  id: string;
  code: string;
  description: string;
  fragility: number;
}

export function DriverTable({ rows }: { rows: DriverRow[] }) {
  return (
    <DataTable
      rows={rows}
      columns={driverColumns}
      getRowId={(r) => r.id}
      caption="Top upstream drivers ranked by driver score"
      emptyState={
        <Text variant="bodySmall" tone="tertiary">
          No drivers yet.
        </Text>
      }
    />
  );
}

export function ExposedTable({ rows }: { rows: ExposedRow[] }) {
  return (
    <DataTable
      rows={rows}
      columns={exposedColumns}
      getRowId={(r) => r.id}
      caption="Most exposed downstream nodes by normalised fragility"
      emptyState={
        <Text variant="bodySmall" tone="tertiary">
          No fragility computed.
        </Text>
      }
    />
  );
}

const driverColumns: Column<DriverRow>[] = [
  {
    key: 'code',
    header: 'Source',
    kind: 'mono',
    render: (r) => (
      <Link href={`/cascade/${r.code}`} style={{ color: 'inherit', textDecoration: 'underline' }}>
        {r.code}
      </Link>
    ),
  },
  { key: 'description', header: 'Assumption', render: (r) => r.description },
  {
    key: 'driverScore',
    header: 'Driver score',
    kind: 'number',
    render: (r) => r.driverScore.toFixed(2),
  },
];

const exposedColumns: Column<ExposedRow>[] = [
  {
    key: 'code',
    header: 'Node',
    kind: 'mono',
    render: (r) => (
      <Link href={`/trace/${r.code}`} style={{ color: 'inherit', textDecoration: 'underline' }}>
        {r.code}
      </Link>
    ),
  },
  { key: 'description', header: 'Assumption', render: (r) => r.description },
  {
    key: 'fragility',
    header: 'Fragility',
    kind: 'number',
    render: (r) => `${(r.fragility * 100).toFixed(0)}/100`,
  },
];
