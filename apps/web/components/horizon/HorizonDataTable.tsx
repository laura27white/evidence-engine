'use client';

import { DataTable, SeverityIndicator, Text, type Column } from '@tp/design-system';
import Link from 'next/link';

import type { Severity } from '../../lib/data/view-models';

export interface HorizonTableRow {
  id: string;
  code: string;
  description: string;
  severity: Severity;
  leadTimeDays: number | null;
  confidenceScore: number | null;
}

export function HorizonDataTable({ rows }: { rows: HorizonTableRow[] }) {
  return (
    <DataTable
      rows={rows}
      columns={columns}
      getRowId={(r) => r.id}
      caption="Assumptions ranked by severity and lead time"
      emptyState={
        <Text variant="bodySmall" tone="tertiary">
          No rows to display. Recompute to populate forecasts and confidence scores.
        </Text>
      }
    />
  );
}

const columns: Column<HorizonTableRow>[] = [
  {
    key: 'code',
    header: 'Code',
    kind: 'mono',
    render: (row) => (
      <Link href={`/trace/${row.code}`} style={{ color: 'inherit', textDecoration: 'underline' }}>
        {row.code}
      </Link>
    ),
    sortable: true,
    compare: (a, b) => a.code.localeCompare(b.code),
  },
  {
    key: 'description',
    header: 'Assumption',
    render: (row) => row.description,
    sortable: true,
    compare: (a, b) => a.description.localeCompare(b.description),
  },
  {
    key: 'severity',
    header: 'Severity',
    kind: 'badge',
    render: (row) => (
      <SeverityIndicator level={severityLevel(row.severity)} value={severityLabel(row.severity)} />
    ),
    sortable: true,
    compare: (a, b) => severityOrder(a.severity) - severityOrder(b.severity),
  },
  {
    key: 'leadTime',
    header: 'Lead time',
    kind: 'number',
    render: (row) => (row.leadTimeDays === null ? '--' : `${row.leadTimeDays} days`),
    sortable: true,
    compare: (a, b) =>
      (a.leadTimeDays ?? Number.MAX_SAFE_INTEGER) - (b.leadTimeDays ?? Number.MAX_SAFE_INTEGER),
  },
  {
    key: 'confidence',
    header: 'Confidence',
    kind: 'number',
    render: (row) =>
      row.confidenceScore === null ? '--' : `${Math.round(row.confidenceScore)}/100`,
    sortable: true,
    compare: (a, b) => (a.confidenceScore ?? -1) - (b.confidenceScore ?? -1),
  },
];

function severityLevel(s: Severity): 'safe' | 'warning' | 'critical' {
  if (s === 'CRITICAL') return 'critical';
  if (s === 'WARNING') return 'warning';
  return 'safe';
}

function severityLabel(s: Severity): string {
  if (s === 'CRITICAL') return 'Critical';
  if (s === 'WARNING') return 'Warning';
  return 'Safe';
}

function severityOrder(s: Severity): number {
  if (s === 'CRITICAL') return 0;
  if (s === 'WARNING') return 1;
  return 2;
}
