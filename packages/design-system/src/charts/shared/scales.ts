/**
 * Pure-SVG scale helpers. Replacements for the bits of d3-scale we need, kept small
 * and dependency-free so the design-system bundle stays compact.
 */

export interface LinearScale {
  (value: number): number;
  domain: [number, number];
  range: [number, number];
  invert(pixel: number): number;
}

export function linearScale(domain: [number, number], range: [number, number]): LinearScale {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const domainSpan = d1 - d0 === 0 ? 1 : d1 - d0;
  const rangeSpan = r1 - r0;
  const scale = ((value: number) => r0 + ((value - d0) / domainSpan) * rangeSpan) as LinearScale;
  scale.domain = domain;
  scale.range = range;
  scale.invert = (pixel) => d0 + ((pixel - r0) / rangeSpan) * domainSpan;
  return scale;
}

export function timeScale(domain: [Date, Date], range: [number, number]): LinearScale {
  return linearScale([domain[0].getTime(), domain[1].getTime()], range);
}

/**
 * Compute "nice" tick positions at a reasonable density across a numeric domain.
 * Uses the classic step heuristic: 1, 2, 5 * 10^k.
 */
export function niceTicks(domain: [number, number], count = 5): number[] {
  const [d0, d1] = domain;
  if (d0 === d1) return [d0];
  const span = d1 - d0;
  const rawStep = span / Math.max(1, count);
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const normalised = rawStep / magnitude;
  let step: number;
  if (normalised >= 5) step = 10 * magnitude;
  else if (normalised >= 2) step = 5 * magnitude;
  else if (normalised >= 1) step = 2 * magnitude;
  else step = magnitude;
  const start = Math.ceil(d0 / step) * step;
  const ticks: number[] = [];
  for (let t = start; t <= d1 + step * 0.0001; t += step) ticks.push(Number(t.toFixed(10)));
  return ticks;
}

/** Time-axis tick positions at reasonable intervals between two dates. */
export function niceTimeTicks(domain: [Date, Date], count = 5): Date[] {
  const [d0, d1] = domain;
  const ms0 = d0.getTime();
  const ms1 = d1.getTime();
  const span = ms1 - ms0;
  const day = 86_400_000;
  const month = day * 30;
  const intervals = [day, day * 7, day * 14, month, month * 3, month * 6, day * 365];
  const chosen = intervals.find((i) => span / i <= count * 2) ?? intervals[intervals.length - 1]!;
  const out: Date[] = [];
  const start = Math.ceil(ms0 / chosen) * chosen;
  for (let t = start; t <= ms1; t += chosen) out.push(new Date(t));
  return out;
}
