import {
  Badge,
  Card,
  KPI,
  PageHeader,
  SeverityIndicator,
  SourceLink,
  Text,
  Timestamp,
  TraceTimeline,
  type TraceMeasurement,
} from '@tp/design-system';
import { confidence as confidenceLib } from '@tp/intelligence';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { DownstreamTable, type DownstreamRow } from '../../../../components/trace/DownstreamTable';
import { ForecastMethodBreakdown } from '../../../../components/trace/ForecastMethodBreakdown';
import { MeasurementTable } from '../../../../components/trace/MeasurementTable';
import { getAssumption } from '../../../../lib/data/assumptions';
import { listAllCascadeImpacts } from '../../../../lib/data/cascades';
import { getLatestConfidence } from '../../../../lib/data/confidence';
import { getLatestForecast, listMethodForecasts } from '../../../../lib/data/forecasts';
import { getMeasurementsForAssumption } from '../../../../lib/data/measurements';
import { deriveConfidenceBand, deriveSeverity } from '../../../../lib/data/view-models';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { assumptionId: string };
}

export default async function TracePage({ params }: PageProps) {
  const assumption = await getAssumption(params.assumptionId);
  if (assumption === null) notFound();

  const [forecast, confidence, measurements, methodForecasts, allImpacts] = await Promise.all([
    getLatestForecast(assumption.id),
    getLatestConfidence(assumption.id),
    getMeasurementsForAssumption(assumption.id, { limit: 200 }),
    listMethodForecasts(assumption.id),
    listAllCascadeImpacts(),
  ]);

  const severity = deriveSeverity(forecast);
  const band = deriveConfidenceBand(confidence);

  const downstream: DownstreamRow[] = allImpacts
    .filter((i) => i.source_assumption_id === assumption.id)
    .slice(0, 5)
    .map((i) => ({
      id: i.target_assumption_id,
      expectedDriftScore: Number(i.expected_drift_score),
    }));

  const confidenceExplanation = confidence
    ? confidenceLib.explainConfidence({
        score: Number(confidence.score),
        components: {
          recency: Number(confidence.recency_component),
          sourceTier: Number(confidence.source_tier_component),
          agreement: Number(confidence.agreement_component),
          volatility: Number(confidence.volatility_component),
        },
        weights: { recency: 0.3, sourceTier: 0.25, agreement: 0.2, volatility: 0.25 },
        interpretation: band === 'UNKNOWN' ? 'LOW' : band,
        caveats: [],
        computedAt: new Date(confidence.computed_at),
      })
    : 'Confidence score not yet computed. Run Recompute to populate it.';

  return (
    <section style={{ padding: '48px 80px', display: 'flex', flexDirection: 'column', gap: 48 }}>
      <PageHeader
        kicker={assumption.code}
        title={assumption.description}
        subtitle={
          assumption.impact_if_false === null
            ? undefined
            : `Impact if false: ${assumption.impact_if_false}`
        }
        meta={
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Badge variant="neutral">{assumption.category}</Badge>
            <Badge variant="neutral">Source tier {assumption.source_tier}</Badge>
            <SeverityIndicator level={severityLevel(severity)} value={severityLabel(severity)} />
            <Text variant="label" tone="tertiary">
              Owner: {assumption.owner ?? 'unassigned'}
            </Text>
            {assumption.review_date !== null ? (
              <Text variant="label" tone="tertiary">
                Last review: <Timestamp at={assumption.review_date} mode="relative" />
              </Text>
            ) : null}
          </div>
        }
        actions={
          <Link
            href="/horizon"
            style={{ color: 'inherit', textDecoration: 'underline' }}
            aria-label="Open in Horizon"
          >
            Open in Horizon
          </Link>
        }
      />

      {assumption.baseline_value !== null && assumption.baseline_unit !== null ? (
        <TraceTimeline
          assumption={{
            code: assumption.code,
            description: assumption.description,
            baselineValue: Number(assumption.baseline_value),
            baselineUnit: assumption.baseline_unit,
            tolerancePct: Number(assumption.tolerance_pct ?? 25),
            dateLogged: new Date(assumption.date_logged),
          }}
          measurements={measurements.map<TraceMeasurement>((m) => ({
            measuredAt: new Date(m.measured_at),
            observedValue: Number(m.observed_value),
            source: m.source,
            sourceUrl: m.source_url ?? undefined,
          }))}
          forecast={
            forecast === null ||
            forecast.projected_value_30d === null ||
            forecast.projected_value_90d === null ||
            forecast.projected_value_365d === null
              ? null
              : {
                  projected30d: Number(forecast.projected_value_30d),
                  projected90d: Number(forecast.projected_value_90d),
                  projected365d: Number(forecast.projected_value_365d),
                  breachDate: forecast.projected_breach_date
                    ? new Date(forecast.projected_breach_date)
                    : null,
                  confidenceIntervalLower: [],
                  confidenceIntervalUpper: [],
                  computedAt: new Date(forecast.computed_at),
                }
          }
          retrievedAt={new Date()}
        />
      ) : (
        <Card padding="lg">
          <Text variant="bodySmall" tone="tertiary">
            Baseline not configured for this assumption; the timeline cannot be drawn until a
            baseline value, unit, and tolerance are set.
          </Text>
        </Card>
      )}

      {forecast !== null ? (
        <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
          <KPI
            label="Lead time"
            value={forecast.lead_time_days === null ? '--' : forecast.lead_time_days}
            unit={forecast.lead_time_days === null ? undefined : 'days'}
            size="lg"
          />
          <KPI
            label="Projected 90d"
            value={
              forecast.projected_value_90d === null ? '--' : forecast.projected_value_90d.toFixed(2)
            }
            unit={assumption.baseline_unit ?? undefined}
          />
          <KPI
            label="Ensemble agreement"
            value={
              forecast.ensemble_agreement === null
                ? '--'
                : `${(Number(forecast.ensemble_agreement) * 100).toFixed(0)}/100`
            }
          />
        </div>
      ) : null}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
        <Card padding="lg">
          <Text variant="label" tone="tertiary" style={{ marginBottom: 12 }}>
            Confidence breakdown
          </Text>
          {confidence === null ? (
            <Text variant="bodySmall" tone="tertiary">
              No confidence score available.
            </Text>
          ) : (
            <>
              <KPI
                label={band === 'UNKNOWN' ? 'Unknown' : band.toLowerCase()}
                value={Math.round(Number(confidence.score))}
                unit="/100"
              />
              <dl style={{ marginTop: 16, display: 'grid', gap: 8 }}>
                <ComponentRow label="Recency" value={Number(confidence.recency_component)} />
                <ComponentRow
                  label="Source tier"
                  value={Number(confidence.source_tier_component)}
                />
                <ComponentRow label="Agreement" value={Number(confidence.agreement_component)} />
                <ComponentRow label="Volatility" value={Number(confidence.volatility_component)} />
              </dl>
              <Text variant="bodySmall" tone="secondary" style={{ marginTop: 16 }}>
                {confidenceExplanation}
              </Text>
            </>
          )}
        </Card>

        <Card padding="lg">
          <Text variant="label" tone="tertiary" style={{ marginBottom: 12 }}>
            Provenance
          </Text>
          {measurements.length === 0 ? (
            <Text variant="bodySmall" tone="tertiary">
              No measurements recorded yet.
            </Text>
          ) : (
            <ol
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                maxHeight: 320,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              {measurements
                .slice(-12)
                .reverse()
                .map((m) => (
                  <li key={m.id} style={{ borderBottom: '1px solid #E6E1D8', paddingBottom: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text variant="mono" tone="primary">
                        {Number(m.observed_value).toFixed(2)}
                      </Text>
                      <Text variant="label" tone="tertiary">
                        <Timestamp at={m.measured_at} mode="relative" />
                      </Text>
                    </div>
                    <Text variant="bodySmall" tone="tertiary">
                      {m.source}
                      {m.source_url !== null ? (
                        <>
                          {' '}
                          <SourceLink href={m.source_url} label="source" />
                        </>
                      ) : null}
                    </Text>
                  </li>
                ))}
            </ol>
          )}
        </Card>

        <Card padding="lg">
          <Text variant="label" tone="tertiary" style={{ marginBottom: 12 }}>
            Cascade summary
          </Text>
          {downstream.length === 0 ? (
            <Text variant="bodySmall" tone="tertiary">
              No downstream impacts computed.
            </Text>
          ) : (
            <DownstreamTable rows={downstream} />
          )}
          <div style={{ marginTop: 16 }}>
            <Link
              href={`/cascade/${assumption.code}`}
              style={{ color: 'inherit', textDecoration: 'underline' }}
            >
              Open full cascade
            </Link>
          </div>
        </Card>
      </div>

      <details style={{ border: '1px solid #E6E1D8', borderRadius: 4, padding: 16 }}>
        <summary style={{ cursor: 'pointer' }}>
          <Text as="span" variant="label" tone="secondary">
            Raw data: measurements, method forecasts, confidence components
          </Text>
        </summary>
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 32 }}>
          <MeasurementTable measurements={measurements} />
          <ForecastMethodBreakdown forecasts={methodForecasts} />
        </div>
      </details>
    </section>
  );
}

function ComponentRow({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <Text variant="bodySmall" tone="secondary">
        {label}
      </Text>
      <Text variant="mono" tone="primary">
        {Math.round(value)}/100
      </Text>
    </div>
  );
}

function severityLevel(s: 'SAFE' | 'WARNING' | 'CRITICAL'): 'safe' | 'warning' | 'critical' {
  if (s === 'CRITICAL') return 'critical';
  if (s === 'WARNING') return 'warning';
  return 'safe';
}

function severityLabel(s: 'SAFE' | 'WARNING' | 'CRITICAL'): string {
  if (s === 'CRITICAL') return 'Critical';
  if (s === 'WARNING') return 'Warning';
  return 'Safe';
}
