'use client';

/**
 * Hook that returns the user's prefers-reduced-motion preference.
 *
 * Used by every motion primitive to collapse animations when the user has asked the
 * system not to animate. Server-side rendering returns false so initial markup is
 * stable; the first client effect updates to the real value.
 */
import { useEffect, useState } from 'react';

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (event: MediaQueryListEvent) => setReduced(event.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return reduced;
}
