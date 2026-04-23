/**
 * Deterministic SHA-256 hash of a response payload. Logged in `ingest_audit` so a paper
 * reviewer can verify the fetch was unaltered between upstream response and downstream
 * storage.
 */
export declare function hashPayload(payload: string | Uint8Array | object): string;
//# sourceMappingURL=provenance.d.ts.map