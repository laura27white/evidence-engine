'use client';

import { Button } from '@tp/design-system';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

export function BriefRefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setError(null);
    try {
      const res = await fetch('/api/brief-generate', { method: 'POST' });
      if (!res.ok) {
        setError(`Brief generation failed (${res.status})`);
        return;
      }
      startTransition(() => router.refresh());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Brief generation failed');
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
      <Button variant="secondary" size="sm" onClick={onClick} disabled={isPending}>
        {isPending ? 'Generating...' : 'Refresh brief'}
      </Button>
      {error !== null ? <span style={{ color: '#B3261E', fontSize: 12 }}>{error}</span> : null}
    </div>
  );
}
