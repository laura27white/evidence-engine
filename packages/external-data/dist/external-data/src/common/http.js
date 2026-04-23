/**
 * Rate-limited, retrying HTTP client shared across adapters.
 *
 * Per-origin token buckets via `bottleneck`. ONS gets 10 req/s, BoE and gov.uk get a
 * polite 1 req/s. Retries with exponential backoff on 5xx and network errors up to three
 * times; never retries 4xx (schema or auth issues do not resolve by retrying). All calls
 * send the configured User-Agent header (from EXTERNAL_DATA_USER_AGENT, defaulted).
 */
import Bottleneck from 'bottleneck';
const DEFAULT_USER_AGENT = 'ProjectTrueplan/0.1 (hackathon@tortoiseai.co.uk)';
const DEFAULT_RETRIES = 3;
const BASE_BACKOFF_MS = 250;
const limiters = new Map();
function limiterFor(host) {
    let limiter = limiters.get(host);
    if (!limiter) {
        if (host.endsWith('ons.gov.uk')) {
            limiter = new Bottleneck({ minTime: 100, maxConcurrent: 2 });
        }
        else {
            limiter = new Bottleneck({ minTime: 1000, maxConcurrent: 1 });
        }
        limiters.set(host, limiter);
    }
    return limiter;
}
function userAgent() {
    return process.env['EXTERNAL_DATA_USER_AGENT'] ?? DEFAULT_USER_AGENT;
}
async function sleep(ms) {
    await new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
export async function fetchJson(url, options = {}) {
    return fetchWith(url, 'json', options);
}
export async function fetchText(url, options = {}) {
    return fetchWith(url, 'text', options);
}
async function fetchWith(url, parseAs, options) {
    const retries = options.retries ?? DEFAULT_RETRIES;
    let host;
    try {
        host = new URL(url).hostname;
    }
    catch (cause) {
        return {
            ok: false,
            error: { kind: 'UNKNOWN', message: `Invalid URL: ${url}`, cause, retryable: false },
        };
    }
    const limiter = limiterFor(host);
    const run = async () => {
        let lastError = null;
        for (let attempt = 0; attempt <= retries; attempt += 1) {
            const started = new Date().toISOString();
            try {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'User-Agent': userAgent(),
                        Accept: parseAs === 'json' ? 'application/json' : 'text/plain, text/csv;q=0.9',
                        ...options.headers,
                    },
                    ...(options.signal ? { signal: options.signal } : {}),
                });
                if (response.status === 429) {
                    lastError = {
                        kind: 'RATE_LIMIT',
                        message: `Rate limited by ${host} (status 429)`,
                        retryable: true,
                        sourceUrl: url,
                    };
                }
                else if (response.status === 404) {
                    return {
                        ok: false,
                        error: {
                            kind: 'NOT_FOUND',
                            message: `Not found: ${url}`,
                            retryable: false,
                            sourceUrl: url,
                        },
                    };
                }
                else if (response.status >= 500) {
                    lastError = {
                        kind: 'HTTP',
                        message: `Upstream ${host} returned ${response.status}`,
                        retryable: true,
                        sourceUrl: url,
                    };
                }
                else if (!response.ok) {
                    return {
                        ok: false,
                        error: {
                            kind: 'HTTP',
                            message: `Upstream ${host} returned ${response.status}`,
                            retryable: false,
                            sourceUrl: url,
                        },
                    };
                }
                else {
                    const body = parseAs === 'json'
                        ? (await response.json())
                        : (await response.text());
                    return {
                        ok: true,
                        body,
                        meta: { status: response.status, url, fetchedAt: started },
                    };
                }
            }
            catch (cause) {
                lastError = {
                    kind: 'NETWORK',
                    message: cause instanceof Error ? cause.message : 'Network error',
                    cause,
                    retryable: true,
                    sourceUrl: url,
                };
            }
            if (attempt < retries) {
                const backoff = BASE_BACKOFF_MS * 2 ** attempt;
                await sleep(backoff);
            }
        }
        return {
            ok: false,
            error: lastError ?? {
                kind: 'UNKNOWN',
                message: 'Exhausted retries with no recorded error',
                retryable: false,
                sourceUrl: url,
            },
        };
    };
    return limiter.schedule(run);
}
//# sourceMappingURL=http.js.map