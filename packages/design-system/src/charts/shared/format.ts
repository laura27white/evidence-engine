/**
 * Formatting helpers shared across charts.
 */

export function formatDateShort(date: Date): string {
  return date.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
}

export function formatDateMedium(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatNumber(value: number, fractionDigits = 2): string {
  if (!Number.isFinite(value)) return '--';
  if (Math.abs(value) >= 1000) return value.toFixed(0);
  return value.toFixed(fractionDigits);
}
