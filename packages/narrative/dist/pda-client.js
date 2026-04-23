/**
 * MCP-over-SSE client for PDA Platform.
 *
 * Protocol: GET /sse opens an SSE stream. On connect the server emits an
 * `event: endpoint` frame whose `data:` payload is a session-scoped POST URL
 * of the shape `/messages?session_id=<uuid>`. JSON-RPC requests are POSTed
 * there; responses arrive back on the same SSE stream as `event: message`
 * frames. We open one session per narrative call, initialize, invoke the
 * discovered `generate_narrative` tool, then close. One round-trip is enough
 * for our single-call use case and avoids long-lived connection management
 * inside Netlify Functions.
 *
 * PDA's `generate_narrative` tool has a rigid input schema (narrative_type +
 * project_context with cost-centric fields). We map our assumption-drift
 * NarrativeInput onto the `risk` narrative_type and pack the portfolio
 * summary into the project_name plus an additional_notes free-text block so
 * the tool receives the full context without us having to invent a cost field.
 */
import { buildUserPrompt } from './prompt-templates';
const DEFAULT_TIMEOUT_MS = 45_000;
const DEFAULT_RETRIES = 1;
const DEFAULT_TOOL = 'generate_narrative';
export class PdaClient {
    mcpUrl;
    timeoutMs;
    retryAttempts;
    toolName;
    constructor(config) {
        this.mcpUrl = config.mcpUrl;
        this.timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
        this.retryAttempts = config.retryAttempts ?? DEFAULT_RETRIES;
        this.toolName = config.toolName ?? DEFAULT_TOOL;
    }
    async generateNarrative(input) {
        let lastError = null;
        for (let attempt = 0; attempt <= this.retryAttempts; attempt += 1) {
            const result = await this.attemptOnce(input);
            if (result.ok)
                return result;
            lastError = result.error;
            if (result.error.kind !== 'NETWORK' && result.error.kind !== 'TIMEOUT')
                return result;
        }
        return { ok: false, error: lastError ?? { kind: 'NETWORK', message: 'no attempt succeeded' } };
    }
    async healthCheck() {
        try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 5_000);
            const res = await fetch(this.mcpUrl, { method: 'GET', signal: controller.signal });
            clearTimeout(timer);
            await res.body?.cancel();
            return res.ok;
        }
        catch {
            return false;
        }
    }
    async warmPing() {
        await this.healthCheck();
    }
    async attemptOnce(input) {
        const startedAt = Date.now();
        const controller = new AbortController();
        const overallTimer = setTimeout(() => controller.abort(), this.timeoutMs);
        const pending = new Map();
        try {
            const stream = await fetch(this.mcpUrl, {
                method: 'GET',
                headers: { accept: 'text/event-stream' },
                signal: controller.signal,
            });
            if (!stream.ok) {
                clearTimeout(overallTimer);
                return { ok: false, error: { kind: 'PROTOCOL', message: `SSE open HTTP ${stream.status}` } };
            }
            if (stream.body === null) {
                clearTimeout(overallTimer);
                return { ok: false, error: { kind: 'PROTOCOL', message: 'SSE stream has no body' } };
            }
            const sessionBase = new URL(this.mcpUrl).origin;
            const endpointDeferred = deferred();
            void pumpSse(stream.body, {
                onEndpoint: (endpoint) => endpointDeferred.resolve(sessionBase + endpoint),
                onMessage: (message) => {
                    const id = typeof message.id === 'number' ? message.id : null;
                    if (id === null)
                        return;
                    const entry = pending.get(id);
                    if (entry === undefined)
                        return;
                    pending.delete(id);
                    if (message.error !== undefined) {
                        entry.reject({
                            kind: 'PROTOCOL',
                            message: typeof message.error?.message === 'string' ? message.error.message : 'mcp error',
                        });
                    }
                    else {
                        entry.resolve(message.result);
                    }
                },
                onError: (err) => {
                    endpointDeferred.reject(err);
                    for (const [, p] of pending)
                        p.reject(err);
                },
            });
            const sessionUrl = await withTimeout(endpointDeferred.promise, 10_000, 'SSE endpoint handshake');
            const call = async (method, params) => {
                const id = Math.floor(Math.random() * 1_000_000_000) + Date.now();
                const responsePromise = new Promise((resolve, reject) => {
                    pending.set(id, { resolve, reject });
                });
                const post = await fetch(sessionUrl, {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ jsonrpc: '2.0', id, method, params }),
                    signal: controller.signal,
                });
                if (!post.ok && post.status !== 202) {
                    pending.delete(id);
                    const err = { kind: 'PROTOCOL', message: `POST ${method} HTTP ${post.status}` };
                    throw err;
                }
                return withTimeout(responsePromise, this.timeoutMs - (Date.now() - startedAt), method);
            };
            await call('initialize', {
                protocolVersion: '2024-11-05',
                capabilities: {},
                clientInfo: { name: 'evidence-engine', version: '0.1.0' },
            });
            const result = (await call('tools/call', {
                name: this.toolName,
                arguments: buildToolArguments(input),
            }));
            clearTimeout(overallTimer);
            controller.abort();
            const narrative = extractNarrative(result);
            if (narrative === null) {
                return { ok: false, error: { kind: 'PROTOCOL', message: 'no narrative in tool response' } };
            }
            return { ok: true, value: narrative };
        }
        catch (cause) {
            clearTimeout(overallTimer);
            controller.abort();
            if (cause && typeof cause === 'object' && 'kind' in cause) {
                return { ok: false, error: cause };
            }
            if (cause instanceof DOMException && cause.name === 'AbortError') {
                return { ok: false, error: { kind: 'TIMEOUT', elapsedMs: Date.now() - startedAt } };
            }
            return {
                ok: false,
                error: {
                    kind: 'NETWORK',
                    message: cause instanceof Error ? cause.message : 'unknown network error',
                },
            };
        }
    }
}
function buildToolArguments(input) {
    const { project, summary } = input;
    const driftPercent = Math.round(summary.overallDriftScore * 100);
    const fragilityPercent = Math.round(summary.globalFragility * 100);
    const topRisk = summary.mostAtRisk[0];
    const topDriver = summary.topDrivers[0];
    const prose = buildUserPrompt(input);
    const projectName = `${project.code} ${project.name}. Assumption-drift early warning. ` +
        `Tracking ${summary.totalAssumptions} assumptions; ${summary.breachingNow} in breach now, ` +
        `${summary.breachingWithin30d} within 30 days, ${summary.breachingWithin90d} within 90. ` +
        (topRisk ? `Most at risk: ${topRisk.code} at ${topRisk.leadTimeDays} days lead time. ` : '') +
        (topDriver ? `Top driver: ${topDriver.code}. ` : '') +
        `Portfolio drift ${driftPercent} per cent; system fragility ${fragilityPercent} per cent.`;
    const rating = summary.breachingNow >= 3 ? 'RED' : summary.breachingWithin30d > 0 ? 'AMBER' : 'GREEN';
    return {
        narrative_type: 'risk',
        project_context: {
            project_name: projectName,
            department: 'Major Projects Authority',
            dca_rating: rating,
            baseline_cost: 0,
            forecast_cost: 0,
            cost_variance_percent: 0,
            additional_notes: prose,
        },
    };
}
function pumpSse(body, handlers) {
    return (async () => {
        const reader = body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let streaming = true;
        try {
            while (streaming) {
                const { value, done } = await reader.read();
                if (done) {
                    streaming = false;
                    break;
                }
                buffer += decoder.decode(value, { stream: true });
                let idx;
                while ((idx = buffer.indexOf('\n\n')) !== -1) {
                    const frame = buffer.slice(0, idx).trim();
                    buffer = buffer.slice(idx + 2);
                    if (frame.length === 0 || frame.startsWith(':'))
                        continue;
                    const lines = frame.split('\n');
                    let event = 'message';
                    const dataLines = [];
                    for (const line of lines) {
                        if (line.startsWith('event:'))
                            event = line.slice(6).trim();
                        else if (line.startsWith('data:'))
                            dataLines.push(line.slice(5).trim());
                    }
                    const data = dataLines.join('\n');
                    if (event === 'endpoint') {
                        handlers.onEndpoint(data);
                    }
                    else if (event === 'message') {
                        try {
                            handlers.onMessage(JSON.parse(data));
                        }
                        catch {
                            // ignore malformed frames
                        }
                    }
                }
            }
        }
        catch (err) {
            handlers.onError({
                kind: 'NETWORK',
                message: err instanceof Error ? err.message : 'sse read failed',
            });
        }
    })();
}
function extractNarrative(result) {
    if (result === null || typeof result !== 'object')
        return null;
    const content = result.content;
    if (Array.isArray(content)) {
        for (const item of content) {
            if (item && typeof item === 'object') {
                const text = item.text;
                if (typeof text === 'string' && text.length > 0)
                    return text;
            }
        }
    }
    const direct = result.narrative ?? result.text;
    return typeof direct === 'string' && direct.length > 0 ? direct : null;
}
function deferred() {
    let resolve;
    let reject;
    const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
}
async function withTimeout(promise, ms, label) {
    if (ms <= 0) {
        const err = { kind: 'TIMEOUT', elapsedMs: 0 };
        throw err;
    }
    return await Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => {
            const err = { kind: 'TIMEOUT', elapsedMs: ms };
            reject(err);
        }, ms)),
    ]).catch((cause) => {
        if (cause && typeof cause === 'object' && 'kind' in cause)
            throw cause;
        throw { kind: 'TIMEOUT', elapsedMs: ms, note: label };
    });
}
//# sourceMappingURL=pda-client.js.map