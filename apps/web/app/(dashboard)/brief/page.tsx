import { Badge, Card, PageHeader, Text, Timestamp } from '@tp/design-system';
import { generateBrief, type GeneratedBrief, PdaClient } from '@tp/narrative';

import { BriefRefreshButton } from '../../../components/brief/BriefRefreshButton';
import { getLatestBrief } from '../../../lib/data/briefs';
import { loadNarrativeInput } from '../../../lib/data/narrative-inputs';
import { getProject } from '../../../lib/data/project';
import { createSupabaseBriefCache } from '../../../lib/narrative/supabase-cache';

export const dynamic = 'force-dynamic';

async function resolveBrief(): Promise<GeneratedBrief | null> {
  const existing = await getLatestBrief().catch(() => null);
  if (existing !== null) {
    const payload = existing.pda_platform_response_json as Record<string, unknown> | null;
    const source: GeneratedBrief['source'] =
      payload?.source === 'pda-platform' ? 'pda-platform' : 'fallback';
    return {
      narrativeText: existing.narrative_text,
      source,
      cacheKey: existing.cache_key,
      computedAt: new Date(existing.generated_at),
    };
  }

  const now = new Date();
  const input = await loadNarrativeInput(undefined, now).catch(() => null);
  if (input === null) return null;
  const project = await getProject().catch(() => null);
  const pdaClient = buildPdaClient();
  const cache = project === null ? null : createSupabaseBriefCache({ projectId: project.id });
  try {
    return await generateBrief(input, { client: pdaClient, cache, now });
  } catch {
    return null;
  }
}

function buildPdaClient(): PdaClient | null {
  const mcpUrl = process.env.PDA_PLATFORM_MCP_URL;
  if (typeof mcpUrl !== 'string' || mcpUrl.length === 0) return null;
  return new PdaClient({ mcpUrl });
}

export default async function BriefPage() {
  const brief = await resolveBrief();
  const totalAssumptions = await countAssumptions();

  return (
    <section style={{ padding: '48px 80px' }}>
      <PageHeader
        kicker="Brief"
        title="Board-ready narrative"
        subtitle="A one-page summary of drift, lead time, cascade exposure, and the evidence behind every claim."
        meta={
          brief === null ? (
            <Text variant="label" tone="tertiary">
              No brief generated yet.
            </Text>
          ) : (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <Text variant="label" tone="tertiary">
                Generated <Timestamp at={brief.computedAt} mode="relative" />
              </Text>
              <Badge variant={brief.source === 'pda-platform' ? 'safe' : 'warning'}>
                {brief.source === 'pda-platform' ? 'Narrative engine' : 'Deterministic fallback'}
              </Badge>
              <Text variant="label" tone="tertiary">
                Based on {totalAssumptions} assumptions
              </Text>
            </div>
          )
        }
        actions={<BriefRefreshButton />}
      />

      <article
        style={{
          maxWidth: 720,
          margin: '48px auto',
          fontFamily: 'var(--font-display), Georgia, serif',
          fontSize: 17,
          lineHeight: 1.6,
          color: '#1A1A1A',
        }}
      >
        {brief === null ? (
          <Card padding="lg">
            <Text variant="body">
              A brief has not been generated yet. Click &ldquo;Refresh brief&rdquo; above to build a
              fresh narrative from the latest forecasts, cascades, and confidence scores.
            </Text>
          </Card>
        ) : (
          <>
            {brief.narrativeText.split(/\n{2,}/).map((paragraph, index) => (
              <p key={index} style={{ marginTop: index === 0 ? 0 : 16 }}>
                {paragraph}
              </p>
            ))}
          </>
        )}
      </article>

      <footer style={{ borderTop: '1px solid #E6E1D8', paddingTop: 24, marginTop: 48 }}>
        <Text variant="label" tone="tertiary">
          Sources: ONS CPI, Bank of England Bank Rate, gov.uk tax policy register, and internal
          assumption register. Methodology: ensemble forecast (linear + EWMA + AR1), cascade
          propagation with saturation cap, four-component confidence score. See
          packages/intelligence/METHODOLOGY.md for derivations.
        </Text>
      </footer>
    </section>
  );
}

async function countAssumptions(): Promise<number> {
  const input = await loadNarrativeInput().catch(() => null);
  return input?.summary.totalAssumptions ?? 0;
}
