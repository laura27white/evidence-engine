import { Card, PageHeader, Text } from '@tp/design-system';
import { cascade as cascadeLib } from '@tp/intelligence';

import {
  DriverTable,
  ExposedTable,
  type DriverRow,
  type ExposedRow,
} from '../../../components/cascade/CascadeDriverTables';
import { CascadeGraphClient } from '../../../components/cascade/CascadeGraphClient';
import { listAssumptions } from '../../../lib/data/assumptions';
import { listAllCascadeImpacts, listCascadeLinks } from '../../../lib/data/cascades';
import { listLatestConfidences } from '../../../lib/data/confidence';
import { listLatestForecasts } from '../../../lib/data/forecasts';

import type { GraphEdgeInput, GraphNodeInput } from '@tp/design-system';

export const dynamic = 'force-dynamic';

export default async function CascadePage() {
  const [assumptions, edges, impacts, forecastsById] = await Promise.all([
    listAssumptions(),
    listCascadeLinks(),
    listAllCascadeImpacts(),
    listLatestForecasts(),
  ]);

  const assumptionsById = new Map(assumptions.map((a) => [a.id, a]));
  const nodes = assumptions.map((a) => {
    const driftScore = forecastsById.get(a.id)?.ensemble_agreement ?? 0;
    return {
      id: a.id,
      code: a.code,
      category: a.category,
      isExternal: a.is_external,
      currentDriftScore: driftScore,
    };
  });
  const cascadeEdges = edges.map((e) => ({
    sourceId: e.source_assumption_id,
    targetId: e.target_assumption_id,
    weight: Number(e.propagation_weight),
    rationale: e.rationale,
  }));

  const graphResult = cascadeLib.buildGraph(nodes, cascadeEdges);
  const drivers: DriverRow[] = [];
  const exposed: ExposedRow[] = [];
  let globalFragility: number | null = null;

  if (graphResult.ok) {
    const fragility = cascadeLib.computeSystemFragility(graphResult.value);
    globalFragility = fragility.globalFragilityScore;
    for (const driver of fragility.topUpstreamDrivers.slice(0, 8)) {
      const a = assumptionsById.get(driver.id);
      if (!a) continue;
      drivers.push({
        id: driver.id,
        code: a.code,
        description: a.description,
        driverScore: driver.score,
      });
    }
    const nodeFragilityEntries: ExposedRow[] = [];
    for (const [id, value] of fragility.nodeFragility) {
      const a = assumptionsById.get(id);
      if (!a) continue;
      nodeFragilityEntries.push({ id, code: a.code, description: a.description, fragility: value });
    }
    nodeFragilityEntries.sort((a, b) => b.fragility - a.fragility);
    exposed.push(...nodeFragilityEntries.slice(0, 8));
  }

  const confidenceCount = (await listLatestConfidences()).size;

  return (
    <section style={{ padding: '48px 80px', display: 'flex', flexDirection: 'column', gap: 48 }}>
      <PageHeader
        kicker="Cascade"
        title="Dependency network and system fragility"
        subtitle="Every cascade link captures a linearised propagation coefficient. Drift from upstream assumptions accumulates across paths, bounded at unity."
        meta={
          <Text variant="label" tone="tertiary">
            {edges.length} edges &middot; {assumptions.length} nodes &middot; {impacts.length}{' '}
            computed impacts &middot; {confidenceCount} confidence rows
            {globalFragility !== null ? (
              <> &middot; global fragility {(globalFragility * 100).toFixed(0)}/100</>
            ) : null}
          </Text>
        }
      />

      {!graphResult.ok ? (
        <Card>
          <Text variant="body">
            Graph could not be constructed:{' '}
            {graphResult.error.kind.toLowerCase().replace(/_/g, ' ')}.
          </Text>
        </Card>
      ) : null}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 48 }}>
        <div>
          {(() => {
            const graphNodes: GraphNodeInput[] = assumptions.map((a) => ({
              id: a.id,
              code: a.code,
              category: a.category,
              highlighted: drivers.some((d) => d.id === a.id),
            }));
            const graphEdges: GraphEdgeInput[] = edges.map((e) => ({
              source: e.source_assumption_id,
              target: e.target_assumption_id,
              weight: Number(e.propagation_weight),
              highlighted: drivers.some((d) => d.id === e.source_assumption_id),
            }));
            const codeById = Object.fromEntries(assumptions.map((a) => [a.id, a.code]));
            return graphNodes.length === 0 ? (
              <Card padding="lg">
                <Text variant="bodySmall" tone="tertiary">
                  No assumptions available to render the graph.
                </Text>
              </Card>
            ) : (
              <CascadeGraphClient nodes={graphNodes} edges={graphEdges} codeById={codeById} />
            );
          })()}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          <div>
            <Text variant="label" tone="tertiary" style={{ marginBottom: 12 }}>
              Top upstream drivers
            </Text>
            <DriverTable rows={drivers} />
          </div>
          <div>
            <Text variant="label" tone="tertiary" style={{ marginBottom: 12 }}>
              Most exposed downstream
            </Text>
            <ExposedTable rows={exposed} />
          </div>
        </div>
      </div>
    </section>
  );
}
