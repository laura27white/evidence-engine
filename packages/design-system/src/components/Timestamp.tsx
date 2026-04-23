'use client';

/**
 * Timestamp: renders relative time with an absolute tooltip and accessible long form.
 *
 * Uses mono font. The rendered text updates every 15 seconds while the document is
 * visible so the "14 seconds ago" string stays fresh; paused when the tab is hidden to
 * avoid useless work.
 */
import { forwardRef, useEffect, useState, type HTMLAttributes } from 'react';

import { colour } from '../../tokens/colour';
import { fontFamily, scaleStyle } from '../foundations/style-utils';

export interface TimestampProps extends HTMLAttributes<HTMLTimeElement> {
  /** ISO 8601 timestamp; Date is also accepted for convenience. */
  at: string | Date;
  /** How often to refresh, in ms. Defaults to 15s. */
  refreshMs?: number;
  /** Force the display mode. Default is relative ("14s ago") with absolute tooltip. */
  mode?: 'relative' | 'absolute' | 'both';
}

function toDate(at: string | Date): Date {
  return at instanceof Date ? at : new Date(at);
}

function formatRelative(target: Date, now: Date): string {
  const delta = target.getTime() - now.getTime();
  const sign = delta < 0 ? 'ago' : 'from now';
  const abs = Math.abs(delta);
  const seconds = Math.round(abs / 1000);
  if (seconds < 60) return `${seconds}s ${sign}`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ${sign}`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ${sign}`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ${sign}`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months}mo ${sign}`;
  const years = Math.round(months / 12);
  return `${years}y ${sign}`;
}

function formatAbsolute(target: Date): string {
  return target
    .toISOString()
    .replace('T', ' ')
    .replace(/\.\d{3}Z$/, 'Z');
}

export const Timestamp = forwardRef<HTMLTimeElement, TimestampProps>(function Timestamp(
  { at, refreshMs = 15_000, mode = 'relative', style, ...rest },
  ref,
) {
  const target = toDate(at);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    const tick = () => setNow(new Date());
    const start = () => {
      if (interval) return;
      interval = setInterval(tick, refreshMs);
    };
    const stop = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        tick();
        start();
      } else {
        stop();
      }
    };
    start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [refreshMs]);

  const relative = formatRelative(target, now);
  const absolute = formatAbsolute(target);
  const display =
    mode === 'absolute' ? absolute : mode === 'both' ? `${relative} (${absolute})` : relative;
  return (
    <time
      ref={ref}
      dateTime={target.toISOString()}
      title={absolute}
      aria-label={`${relative}, ${absolute}`}
      style={{
        fontFamily: fontFamily.mono,
        ...scaleStyle('monoSmall'),
        color: colour.ink.tertiary,
        ...style,
      }}
      {...rest}
    >
      {display}
    </time>
  );
});
