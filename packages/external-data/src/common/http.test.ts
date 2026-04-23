import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { fetchJson, fetchText } from './http';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('fetchJson', () => {
  it('returns ok on a 200 response', async () => {
    server.use(http.get('https://api.example.com/ping', () => HttpResponse.json({ pong: true })));
    const result = await fetchJson<{ pong: boolean }>('https://api.example.com/ping');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.body.pong).toBe(true);
      expect(result.meta.status).toBe(200);
      expect(result.meta.url).toBe('https://api.example.com/ping');
    }
  });

  it('surfaces a 404 as NOT_FOUND without retry', async () => {
    server.use(
      http.get('https://api.example.com/missing', () => HttpResponse.json({}, { status: 404 })),
    );
    const result = await fetchJson('https://api.example.com/missing');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('NOT_FOUND');
      expect(result.error.retryable).toBe(false);
    }
  });

  it('surfaces a non-retryable 4xx as HTTP', async () => {
    server.use(
      http.get('https://api.example.com/bad', () => HttpResponse.json({}, { status: 400 })),
    );
    const result = await fetchJson('https://api.example.com/bad');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('HTTP');
      expect(result.error.retryable).toBe(false);
    }
  });

  it('retries 5xx and eventually surfaces HTTP with retryable=true', async () => {
    let calls = 0;
    server.use(
      http.get('https://api.example.com/flaky', () => {
        calls += 1;
        return HttpResponse.json({}, { status: 503 });
      }),
    );
    const result = await fetchJson('https://api.example.com/flaky', { retries: 1 });
    expect(result.ok).toBe(false);
    expect(calls).toBeGreaterThanOrEqual(2);
    if (!result.ok) {
      expect(result.error.retryable).toBe(true);
    }
  });

  it('rejects an invalid URL with UNKNOWN', async () => {
    const result = await fetchJson('not-a-url');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('UNKNOWN');
    }
  });
});

describe('fetchText', () => {
  it('returns the raw body for a 200 response', async () => {
    server.use(
      http.get('https://api.example.com/csv', () =>
        HttpResponse.text('DATE,VALUE\n01 Jan 2025,5.25\n'),
      ),
    );
    const result = await fetchText('https://api.example.com/csv');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.body).toContain('01 Jan 2025');
    }
  });
});
