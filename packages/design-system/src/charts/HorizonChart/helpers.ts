export type Severity = 'safe' | 'warning' | 'critical';
export type ConfidenceBand = 'HIGH' | 'MODERATE' | 'LOW' | 'UNKNOWN';

export interface HorizonDatum {
  assumptionId: string;
  code: string;
  description: string;
  leadTimeDays: number | null;
  severity: Severity;
  breachDate: Date | null;
  confidence: ConfidenceBand;
  category: string;
  driftScore: number;
}

export function horizonBarDescription(d: HorizonDatum): string {
  const lead =
    d.leadTimeDays === null
      ? 'no projected breach within horizon'
      : d.leadTimeDays <= 0
        ? 'currently in breach'
        : `${d.leadTimeDays} days to projected breach`;
  return `${d.code} ${d.description}. ${d.category}. Severity ${d.severity}, confidence ${d.confidence.toLowerCase()}. ${lead}.`;
}

export function confidenceFill(confidence: ConfidenceBand): 'filled' | 'half' | 'outline' {
  if (confidence === 'HIGH') return 'filled';
  if (confidence === 'MODERATE') return 'half';
  return 'outline';
}
