/**
 * Deterministic fallback narrative.
 *
 * Plain, template-driven, always-correct. Not as good as the PDA Platform
 * narrative; demonstrating that gap is part of the value proposition.
 */

import type { NarrativeInput } from './types';

export function generateFallbackNarrative(input: NarrativeInput): string {
  const { summary } = input;

  const paragraph1 = buildPositionParagraph(input);
  const paragraph2 = buildNearTermParagraph(input);
  const paragraph3 = buildCallToActionParagraph(input);

  const parts = [paragraph1, paragraph2, paragraph3].filter((p) => p.length > 0);
  void summary;
  return parts.join('\n\n');
}

function buildPositionParagraph(input: NarrativeInput): string {
  const { project, summary } = input;
  const sentences: string[] = [];
  sentences.push(
    `${project.code} ${project.name} tracks ${summary.totalAssumptions} assumptions at the date of this brief.`,
  );
  if (summary.breachingNow > 0) {
    sentences.push(
      `${summary.breachingNow} ${pluralise(summary.breachingNow, 'assumption is', 'assumptions are')} currently outside tolerance and ${summary.breachingWithin30d} further ${pluralise(summary.breachingWithin30d, 'is', 'are')} projected to breach within 30 days.`,
    );
  } else if (summary.breachingWithin30d > 0) {
    sentences.push(
      `No assumption is currently in breach, although ${summary.breachingWithin30d} ${pluralise(summary.breachingWithin30d, 'is', 'are')} projected to breach within 30 days.`,
    );
  } else {
    sentences.push(
      `No assumption is currently in breach and none is projected to breach within 30 days.`,
    );
  }
  sentences.push(
    `Overall drift score stands at ${percent(summary.overallDriftScore)} and system fragility at ${percent(summary.globalFragility)}.`,
  );
  return sentences.join(' ');
}

function buildNearTermParagraph(input: NarrativeInput): string {
  const { summary } = input;
  const first = summary.mostAtRisk[0];
  if (first === undefined) {
    return 'No single assumption dominates the near-term risk picture at the date of this brief. The wider portfolio remains within tolerance and no breach is projected within 90 days.';
  }
  const topDriver = summary.topDrivers[0];
  const cascadeFragment =
    topDriver !== undefined
      ? ` Cascade analysis identifies ${topDriver.code} ${topDriver.description} as the most influential upstream driver, with a cumulative driver score of ${topDriver.driverScore.toFixed(2)}.`
      : '';
  return `The most actionable near-term issue is ${first.code} ${first.description}, projected to breach in ${first.leadTimeDays} ${pluralise(first.leadTimeDays, 'day', 'days')} at ${first.confidence.toLowerCase()} confidence.${cascadeFragment}`;
}

function buildCallToActionParagraph(input: NarrativeInput): string {
  const { summary } = input;
  const first = summary.mostAtRisk[0];
  if (first === undefined) {
    return 'The recommended action is to maintain the current review cadence and to confirm with upstream data owners that measurement pipelines remain operational. No escalation is required at this time.';
  }
  const window =
    first.leadTimeDays <= 30
      ? 'within ten working days'
      : first.leadTimeDays <= 90
        ? 'within twenty working days'
        : 'within thirty working days';
  const topDriver = summary.topDrivers[0];
  const driverMention =
    topDriver !== undefined
      ? ` The review should take particular account of ${topDriver.code} ${topDriver.description} as the dominant upstream driver.`
      : '';
  return `The recommended action is to convene an assurance review ${window}, prioritising ${first.code} and its immediate measurement provenance.${driverMention} This brief is intended to inform, not to substitute for, the SRO's judgement at the next scheduled review point.`;
}

function percent(value: number): string {
  return `${(value * 100).toFixed(0)} per cent`;
}

function pluralise(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}
