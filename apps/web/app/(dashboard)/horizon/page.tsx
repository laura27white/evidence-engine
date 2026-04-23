import { KPI, PageHeader, Text, Timestamp } from '@tp/design-system';

import { HorizonChartClient } from '../../../components/horizon/HorizonChartClient';
import {
  HorizonDataTable,
  type HorizonTableRow,
} from '../../../components/horizon/HorizonDataTable';
import { loadHorizonData } from '../../../lib/data/view-models';

import type { HorizonDatum } from '@tp/design-system';

export const dynamic = 'force-dynamic';

export default async function HorizonPage() {
  const { rows, summary } = await loadHorizonData();

  const tableRows: HorizonTableRow[] = rows.map((row) => ({
    id: row.assumption.id,
    code: row.assumption.code,
    description: row.assumption.description,
    severity: row.severity,
    leadTimeDays: row.forecast?.lead_time_days ?? null,
    confidenceScore: row.confidence?.score ?? null,
  }));

  const chartData: HorizonDatum[] = rows.map((row) => ({
    assumptionId: row.assumption.id,
    code: row.assumption.code,
    description: row.assumption.description,
    leadTimeDays: row.forecast?.lead_time_days ?? null,
    severity:
      row.severity === 'CRITICAL' ? 'critical' : row.severity === 'WARNING' ? 'warning' : 'safe',
    breachDate: row.forecast?.projected_breach_date
      ? new Date(row.forecast.projected_breach_date)
      : null,
    confidence: row.confidenceBand === 'UNKNOWN' ? 'LOW' : row.confidenceBand,
    category: row.assumption.category,
    driftScore: Number(row.forecast?.ensemble_agreement ?? 0),
  }));

  return (
    <section style={{ padding: '48px 80px', display: 'flex', flexDirection: 'column', gap: 48 }}>
      <PageHeader
        kicker="Horizon"
        title="All assumptions, forecasted lead time"
        subtitle="Where each assumption sits on the 12-month horizon, ranked by severity then by lead time."
        meta={
          summary.latestComputedAt !== null ? (
            <Text variant="label" tone="tertiary">
              Data as of <Timestamp at={summary.latestComputedAt} mode="relative" /> &middot;
              computing from {summary.assumptionCount} assumptions
            </Text>
          ) : (
            <Text variant="label" tone="tertiary">
              No forecast data yet. Run Recompute to populate this view.
            </Text>
          )
        }
      />

      <dl
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 32,
          borderTop: '1px solid #E6E1D8',
          borderBottom: '1px solid #E6E1D8',
          padding: '24px 0',
        }}
      >
        <KPI
          label="Average lead time"
          value={summary.averageLeadTime === null ? '--' : Math.round(summary.averageLeadTime)}
          unit="days"
        />
        <KPI
          label="Assumptions in breach"
          value={summary.assumptionsInBreach}
          trend={summary.assumptionsInBreach > 0 ? 'down' : 'flat'}
        />
        <KPI
          label="Within 30 days"
          value={summary.assumptionsWithin30Days}
          trend={summary.assumptionsWithin30Days > 0 ? 'down' : 'flat'}
        />
        <KPI label="Low confidence" value={summary.assumptionsWithLowConfidence} />
      </dl>

      {chartData.length > 0 ? (
        <HorizonChartClient data={chartData} />
      ) : (
        <div style={{ padding: 32, border: '1px dashed #D3CDC2', borderRadius: 4 }}>
          <Text variant="label" tone="tertiary">
            No assumptions available for this project.
          </Text>
        </div>
      )}

      <HorizonDataTable rows={tableRows} />
    </section>
  );
}
