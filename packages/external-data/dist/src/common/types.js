/** Successful fetch-result constructor. */
export function ok(data) {
    return { ok: true, data };
}
/** Failed fetch-result constructor. */
export function err(error) {
    return { ok: false, error };
}
//# sourceMappingURL=types.js.map