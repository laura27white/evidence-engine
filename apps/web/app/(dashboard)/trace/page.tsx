import { Card, PageHeader, Text } from '@tp/design-system';
import Link from 'next/link';

import { listAssumptions } from '../../../lib/data/assumptions';
import { listLatestForecasts } from '../../../lib/data/forecasts';
import { deriveSeverity } from '../../../lib/data/view-models';

export const dynamic = 'force-dynamic';

export default async function TraceLandingPage() {
  const [assumptions, forecasts] = await Promise.all([listAssumptions(), listLatestForecasts()]);
  const byId = forecasts;
  const sorted = [...assumptions].sort((a, b) => {
    const sa = deriveSeverity(byId.get(a.id) ?? null);
    const sb = deriveSeverity(byId.get(b.id) ?? null);
    const rank = (x: string) => (x === 'CRITICAL' ? 0 : x === 'WARNING' ? 1 : 2);
    return rank(sa) - rank(sb);
  });

  return (
    <section style={{ padding: '48px 80px', display: 'flex', flexDirection: 'column', gap: 48 }}>
      <PageHeader
        kicker="Trace"
        title="Pick an assumption to drill into"
        subtitle="Trace is the hero view. Pick any assumption to see its full story: baseline, measurements, forecast cone, provenance, and downstream cascade."
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
        {sorted.map((a) => (
          <Link
            key={a.id}
            href={`/trace/${a.code}`}
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            <Card padding="md">
              <Text variant="mono" tone="tertiary">
                {a.code}
              </Text>
              <Text variant="body" style={{ marginTop: 8 }}>
                {a.description}
              </Text>
              <Text variant="label" tone="tertiary" style={{ marginTop: 12 }}>
                {a.category} &middot; tier {a.source_tier}
              </Text>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
