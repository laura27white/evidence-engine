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
import type { NarrativeInput, PdaError, Result } from './types';
export interface PdaClientConfig {
    mcpUrl: string;
    timeoutMs?: number;
    retryAttempts?: number;
    toolName?: string;
}
export declare class PdaClient {
    private readonly mcpUrl;
    private readonly timeoutMs;
    private readonly retryAttempts;
    private readonly toolName;
    constructor(config: PdaClientConfig);
    generateNarrative(input: NarrativeInput): Promise<Result<string, PdaError>>;
    healthCheck(): Promise<boolean>;
    warmPing(): Promise<void>;
    private attemptOnce;
}
//# sourceMappingURL=pda-client.d.ts.map