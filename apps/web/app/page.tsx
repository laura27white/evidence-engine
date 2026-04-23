import { KPI, Text, Wordmark } from '@tp/design-system';
import Link from 'next/link';

import { LinkButton } from '../components/LinkButton';
import { loadHorizonData } from '../lib/data/view-models';

export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  const data = await loadHorizonData().catch(() => null);
  const assumptionCount = data?.summary.assumptionCount ?? null;
  const avgLeadTime = data?.summary.averageLeadTime ?? null;
  const lowConfidence = data?.summary.assumptionsWithLowConfidence ?? null;
  const inBreach = data?.summary.assumptionsInBreach ?? null;

  return (
    <main style={{ minHeight: '100vh', padding: '64px 80px', background: '#F7F4EE' }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 96,
        }}
      >
        <Wordmark />
        <Link href="/horizon" style={{ textDecoration: 'underline' }}>
          <Text variant="label" tone="secondary">
            View the dashboard
          </Text>
        </Link>
      </header>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: 32,
          alignItems: 'center',
        }}
      >
        <div style={{ gridColumn: 'span 7' }}>
          <Text variant="label" tone="tertiary" style={{ marginBottom: 16 }}>
            MPA Challenge 5 &middot; Evidence Engine
          </Text>
          <Text as="h1" variant="displayLarge" style={{ margin: 0 }}>
            An early warning system for project assumptions.
          </Text>
          <Text variant="bodyLarge" tone="secondary" style={{ marginTop: 24, maxWidth: '54ch' }}>
            Evidence Engine watches the assumptions your plan is built on. When an external
            statistic drifts toward a threshold that matters, you see it coming. The forecast, the
            cascade, the provenance, and a board-ready brief, all in one place.
          </Text>
          <div style={{ marginTop: 32, display: 'flex', gap: 16 }}>
            <LinkButton href="/horizon" size="lg">
              Open the Horizon
            </LinkButton>
            <LinkButton href="/trace/A039" size="lg" variant="secondary">
              See the Trace view
            </LinkButton>
          </div>
        </div>
        <div style={{ gridColumn: 'span 5' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
            <KPI label="Assumptions tracked" value={assumptionCount ?? '--'} size="md" />
            <KPI
              label="Assumptions in breach"
              value={inBreach ?? '--'}
              trend={inBreach !== null && inBreach > 0 ? 'down' : 'flat'}
              size="md"
            />
            <KPI
              label="Average lead time"
              value={avgLeadTime === null ? '--' : Math.round(avgLeadTime)}
              unit="days"
              size="md"
            />
            <KPI label="Low confidence" value={lowConfidence ?? '--'} size="md" />
          </div>
        </div>
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 48,
          marginTop: 128,
          paddingTop: 48,
          borderTop: '1px solid #E6E1D8',
        }}
      >
        <ColumnBlock
          title="The problem"
          body="Every business case rests on assumptions. Most go unwatched after approval. By the time a programme board is told, the drift has already cost you months of lead time."
        />
        <ColumnBlock
          title="The approach"
          body="Hook assumptions to trustworthy external signals. Forecast each with three independent methods and use the disagreement between them as an honesty dial. Propagate drift through a dependency graph so one change surfaces everywhere it matters."
        />
        <ColumnBlock
          title="What you'll see"
          body="Four views. Horizon for what's coming. Cascade for what's connected. Trace for the deepest drill of one assumption. Brief for the board-ready summary. Evidence is always one click away."
        />
      </section>

      <footer style={{ marginTop: 96, borderTop: '1px solid #E6E1D8', paddingTop: 32 }}>
        <Text variant="label" tone="tertiary">
          Evidence Engine
        </Text>
      </footer>
    </main>
  );
}

function ColumnBlock({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <Text variant="label" tone="tertiary" style={{ marginBottom: 8 }}>
        {title}
      </Text>
      <Text variant="body" tone="primary">
        {body}
      </Text>
    </div>
  );
}
