import { Card, PageHeader, Text } from '@tp/design-system';
import { cascade as cascadeLib } from '@tp/intelligence';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import {
  CascadeImpactTable,
  type ImpactTableRow,
} from '../../../../components/cascade/CascadeImpactTable';
import { CascadeSankeyClient } from '../../../../components/cascade/CascadeSankeyClient';
import { getAssumption, listAssumptions } from '../../../../lib/data/assumptions';
import { listCascadeLinks } from '../../../../lib/data/cascades';
import { listLatestForecasts } from '../../../../lib/data/forecasts';

import type { SankeyLinkInput, SankeyNodeInput } from '@tp/design-system';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { assumptionId: string };
}

export default async function CascadeSourcePage({ params }: PageProps) {
  const source = await getAssumption(params.assumptionId);
  if (source === null) notFound();

  const [assumptions, edges, forecastsById] = await Promise.all([
    listAssumptions(),
    listCascadeLinks(),
    listLatestForecasts(),
  ]);
  const assumptionsById = new Map(assumptions.map((a) => [a.id, a]));

  const nodes = assumptions.map((a) => ({
    id: a.id,
    code: a.code,
    category: a.category,
    isExternal: a.is_external,
    currentDriftScore: a.id === source.id ? 1 : (forecastsById.get(a.id)?.ensemble_agreement ?? 0),
  }));
  const cascadeEdges = edges.map((e) => ({
    sourceId: e.source_assumption_id,
    targetId: e.target_assumption_id,
    weight: Number(e.propagation_weight),
    rationale: e.rationale,
  }));

  const graphResult = cascadeLib.buildGraph(nodes, cascadeEdges);
  const rows: ImpactTableRow[] = [];
  const sankeyNodes: SankeyNodeInput[] = [];
  const sankeyLinks: SankeyLinkInput[] = [];
  if (graphResult.ok) {
    const prop = cascadeLib.propagateFromSource(graphResult.value, source.id);
    if (prop.ok) {
      sankeyNodes.push({ id: source.id, code: source.code, level: 0, totalDrift: 1 });
      const seenTargets = new Set<string>([source.id]);
      for (const impact of prop.value.impacts) {
        const a = assumptionsById.get(impact.targetId);
        if (!a) continue;
        const topPath = impact.paths[0];
        const pathLabel = topPath
          ? topPath.nodes.map((n) => assumptionsById.get(n)?.code ?? n).join(' -> ')
          : '--';
        rows.push({
          id: impact.targetId,
          code: a.code,
          description: a.description,
          expectedDriftScore: impact.expectedDriftScore,
          pathLabel,
        });
        if (!seenTargets.has(impact.targetId)) {
          seenTargets.add(impact.targetId);
          sankeyNodes.push({
            id: impact.targetId,
            code: a.code,
            level: Math.max(1, topPath?.nodes.length ? topPath.nodes.length - 1 : 1),
            totalDrift: impact.expectedDriftScore,
          });
        }
        if (topPath) {
          for (let i = 0; i < topPath.nodes.length - 1; i += 1) {
            const srcId = topPath.nodes[i]!;
            const tgtId = topPath.nodes[i + 1]!;
            sankeyLinks.push({
              sourceId: srcId,
              targetId: tgtId,
              value: impact.expectedDriftScore,
              pathDescription: `${assumptionsById.get(srcId)?.code ?? srcId} -> ${
                assumptionsById.get(tgtId)?.code ?? tgtId
              } via weight ${topPath.weights[i]!.toFixed(2)}`,
            });
          }
        }
      }
    }
  }

  return (
    <section style={{ padding: '48px 80px', display: 'flex', flexDirection: 'column', gap: 48 }}>
      <PageHeader
        kicker={source.code}
        title={source.description}
        subtitle="What downstream assumptions does this source touch, and with what strength?"
        meta={
          <Text variant="label" tone="tertiary">
            {rows.length} reachable downstream assumptions &middot; {source.category} &middot;
            source tier {source.source_tier}
          </Text>
        }
        actions={
          <Link href="/cascade" style={{ color: 'inherit', textDecoration: 'underline' }}>
            Back to Cascade overview
          </Link>
        }
      />

      {sankeyNodes.length > 1 ? (
        <CascadeSankeyClient nodes={sankeyNodes} links={sankeyLinks} />
      ) : (
        <Card padding="lg">
          <Text variant="bodySmall" tone="tertiary">
            No downstream propagation paths computed for this source yet.
          </Text>
        </Card>
      )}

      <CascadeImpactTable rows={rows} />
    </section>
  );
}
