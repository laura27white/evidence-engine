/**
 * Lead time: floored days between "now" and the projected breach date.
 */

export function computeLeadTime(breachDate: Date | null, now: Date): number | null {
  if (breachDate === null) return null;
  const diffMs = breachDate.getTime() - now.getTime();
  return Math.floor(diffMs / 86_400_000);
}
