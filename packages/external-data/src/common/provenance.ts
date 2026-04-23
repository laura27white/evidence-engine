import { createHash } from 'node:crypto';

/**
 * Deterministic SHA-256 hash of a response payload. Logged in `ingest_audit` so a paper
 * reviewer can verify the fetch was unaltered between upstream response and downstream
 * storage.
 */
export function hashPayload(payload: string | Uint8Array | object): string {
  const hash = createHash('sha256');
  if (typeof payload === 'string') {
    hash.update(payload);
  } else if (payload instanceof Uint8Array) {
    hash.update(payload);
  } else {
    hash.update(JSON.stringify(payload));
  }
  return hash.digest('hex');
}
