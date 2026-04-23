import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

/**
 * POST /api/recompute
 *
 * Proxies to the `compute-all` Supabase edge function. When `SUPABASE_COMPUTE_ALL_URL`
 * is not configured, returns a stubbed success payload so the UI remains functional
 * without a deployment (useful for local development and the hackathon demo laptop).
 * A hard failure from the upstream function surfaces the status and message.
 */
export async function POST() {
  const edgeUrl = process.env.SUPABASE_COMPUTE_ALL_URL;
  const edgeToken = process.env.SUPABASE_EDGE_TOKEN;

  if (!edgeUrl || !edgeToken) {
    revalidateAll();
    return NextResponse.json({
      ok: true,
      stubbed: true,
      summary: 'Recompute stub: no edge URL configured',
    });
  }

  const started = Date.now();
  try {
    const upstream = await fetch(edgeUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${edgeToken}`,
      },
      body: JSON.stringify({ trigger: 'web' }),
    });
    if (!upstream.ok) {
      return NextResponse.json(
        { ok: false, error: `Upstream returned ${upstream.status}` },
        { status: 502 },
      );
    }
    const payload = (await upstream.json()) as Record<string, unknown>;
    revalidateAll();
    return NextResponse.json({
      ok: true,
      stubbed: false,
      durationMs: Date.now() - started,
      summary: buildSummary(payload),
      upstream: payload,
    });
  } catch (cause) {
    return NextResponse.json(
      { ok: false, error: cause instanceof Error ? cause.message : 'unknown error' },
      { status: 502 },
    );
  }
}

function revalidateAll(): void {
  revalidatePath('/');
  revalidatePath('/horizon');
  revalidatePath('/cascade');
  revalidatePath('/trace', 'layout');
  revalidatePath('/brief');
}

function buildSummary(payload: Record<string, unknown>): string {
  const f = asNumber(payload.forecastsComputed);
  const c = asNumber(payload.cascadesComputed);
  const cf = asNumber(payload.confidencesComputed);
  if (f === null && c === null && cf === null) return 'Recomputed upstream.';
  return `Recomputed ${f ?? 0} forecasts, ${c ?? 0} cascades, ${cf ?? 0} confidences.`;
}

function asNumber(value: unknown): number | null {
  return typeof value === 'number' ? value : null;
}
