/**
 * Observability bootstrap. Wraps Sentry and PostHog so callers do not need to
 * check env vars themselves. No-ops cleanly when DSN or key is missing, so
 * local dev and tests run without any keys configured.
 *
 * Per ARCHITECTURE.md section 5: Sentry for errors, PostHog for product analytics.
 */
import * as SentryBrowser from '@sentry/nextjs';

import type { PostHog as ClientPostHog } from 'posthog-js';
import type { PostHog as ServerPostHog } from 'posthog-node';

let clientPostHog: ClientPostHog | null = null;
let serverPostHog: ServerPostHog | null = null;

export function isSentryEnabled(): boolean {
  return Boolean(process.env.SENTRY_DSN);
}

export function isPostHogEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY);
}

export async function initBrowserObservability(): Promise<void> {
  if (typeof window === 'undefined') return;

  if (isSentryEnabled()) {
    SentryBrowser.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 1.0,
    });
  }

  if (isPostHogEnabled() && !clientPostHog) {
    const { default: posthog } = await import('posthog-js');
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://eu.posthog.com',
      capture_pageview: true,
      person_profiles: 'identified_only',
    });
    clientPostHog = posthog;
  }
}

export async function getServerPostHog(): Promise<ServerPostHog | null> {
  if (!isPostHogEnabled()) return null;
  if (serverPostHog) return serverPostHog;
  const { PostHog } = await import('posthog-node');
  serverPostHog = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://eu.posthog.com',
  });
  return serverPostHog;
}

export function captureException(error: unknown, context?: Record<string, unknown>): void {
  if (!isSentryEnabled()) {
    console.error('[observability] captureException (sentry disabled):', error, context);
    return;
  }
  SentryBrowser.captureException(error, { extra: context });
}
