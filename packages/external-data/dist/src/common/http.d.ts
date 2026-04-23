import type { FetchError } from './types';
export interface HttpOptions {
    /** Optional headers; the User-Agent and Accept are added by this client. */
    headers?: Record<string, string>;
    /** Number of retries to attempt on transient failures. Defaults to 3. */
    retries?: number;
    /** Optional abort signal for cancellation. */
    signal?: AbortSignal;
}
export interface HttpResponseMeta {
    status: number;
    url: string;
    fetchedAt: string;
}
export type HttpResult<T> = {
    readonly ok: true;
    readonly body: T;
    readonly meta: HttpResponseMeta;
} | {
    readonly ok: false;
    readonly error: FetchError;
};
export declare function fetchJson<T = unknown>(url: string, options?: HttpOptions): Promise<HttpResult<T>>;
export declare function fetchText(url: string, options?: HttpOptions): Promise<HttpResult<string>>;
//# sourceMappingURL=http.d.ts.map