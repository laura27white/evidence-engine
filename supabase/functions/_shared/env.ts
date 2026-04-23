// Deno runtime helpers for Trueplan compute edge functions.

// deno-lint-ignore no-explicit-any
const denoGlobal: any = (globalThis as any).Deno;

export function readEnv(name: string): string {
  const value = denoGlobal?.env?.get?.(name);
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Missing env ${name}`);
  }
  return value;
}

export function demoProjectCode(): string {
  const override = denoGlobal?.env?.get?.('DEMO_PROJECT_CODE');
  return typeof override === 'string' && override.length > 0 ? override : 'HPO24A01-DEMO';
}
