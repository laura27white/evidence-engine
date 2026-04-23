'use client';

import { Button } from '@tp/design-system';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

export interface RecomputeButtonProps {
  /** Shown under the button once the last compute finishes. */
  initialSummary?: string;
}

export function RecomputeButton({ initialSummary }: RecomputeButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [summary, setSummary] = useState<string | null>(initialSummary ?? null);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setError(null);
    try {
      const res = await fetch('/api/recompute', { method: 'POST' });
      if (!res.ok) {
        setError(`Recompute failed (${res.status})`);
        return;
      }
      const payload = (await res.json()) as { summary?: string };
      if (typeof payload.summary === 'string') setSummary(payload.summary);
      startTransition(() => router.refresh());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Recompute failed');
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
      <Button size="sm" variant="secondary" onClick={onClick} disabled={isPending}>
        {isPending ? 'Recomputing...' : 'Recompute'}
      </Button>
      {summary !== null && !isPending ? (
        <span style={{ fontSize: 12, color: '#4A4A4A' }}>{summary}</span>
      ) : null}
      {error !== null ? <span style={{ fontSize: 12, color: '#B3261E' }}>{error}</span> : null}
    </div>
  );
}
