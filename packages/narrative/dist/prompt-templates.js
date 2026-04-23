/**
 * System and user prompt templates for the PDA Platform narrative generator.
 *
 * The system prompt is stable across calls; the user prompt is composed per call
 * from a NarrativeInput. Both constraints are documented in PROMPT_ENGINEERING.md:
 * British English, no em dashes, three paragraphs, 180 to 260 words.
 */
export const SYSTEM_PROMPT = `You are writing a board-ready assurance brief for a senior responsible owner (SRO) of a UK government major programme. Your register is an investment committee memo: concise, evidence-first, plain English, no jargon, no hedging except where calibrated uncertainty is warranted.

Write in British English. Do not use em dashes. Use full stops and commas.

The brief has three paragraphs, in this order:

Paragraph 1: The position today. One or two sentences on the overall portfolio state. Lead with the most material finding. Cite specific assumption codes when a single assumption dominates.

Paragraph 2: The most actionable near-term issue. Identify the single assumption whose breach is both most imminent and highest downstream exposure. Say what is happening in plain terms, what the lead time is, and what the cascade would touch.

Paragraph 3: The call to action. State specifically what the SRO should do next: direct action, seek further information, commission a review. Be concrete, time-bounded, and proportionate.

Total length: 180 to 260 words. Do not exceed 260 words. Do not include headings. Do not include bullet points. Do not address the reader as "you". Write in the third person, like an assurance note.`;
export function buildUserPrompt(input) {
    const { project, computedAt, summary } = input;
    const lines = [];
    lines.push(`Project: ${project.name} (${project.code})`);
    lines.push(`Data computed: ${computedAt.toISOString()}`);
    lines.push('');
    lines.push('Portfolio summary:');
    lines.push(`- ${summary.totalAssumptions} assumptions tracked`);
    lines.push(`- ${summary.breachingNow} currently breaching tolerance`);
    lines.push(`- ${summary.breachingWithin30d} projected to breach within 30 days`);
    lines.push(`- ${summary.breachingWithin90d} projected to breach within 90 days`);
    lines.push(`- Overall drift score: ${percent(summary.overallDriftScore)}`);
    lines.push(`- System fragility: ${percent(summary.globalFragility)}`);
    lines.push('');
    if (summary.topDrivers.length > 0) {
        lines.push('Top upstream drivers (assumptions whose drift cascades most widely):');
        for (const d of summary.topDrivers) {
            lines.push(`- ${d.code} ${d.description} (driver score ${d.driverScore.toFixed(2)})`);
        }
        lines.push('');
    }
    if (summary.mostAtRisk.length > 0) {
        lines.push('Most at-risk assumptions (shortest lead time first):');
        for (const r of summary.mostAtRisk) {
            lines.push(`- ${r.code} ${r.description}: ${r.leadTimeDays} days, severity ${r.severity}, confidence ${r.confidence.toLowerCase()}`);
        }
        lines.push('');
    }
    if (summary.externalSignals.length > 0) {
        lines.push('Externally-anchored assumptions with live data:');
        for (const s of summary.externalSignals) {
            lines.push(`- ${s.code} ${s.description}: baseline ${s.baselineValue}, current ${s.currentValue.toFixed(2)}, drift ${s.driftPct.toFixed(1)} per cent, retrieved ${s.lastRetrievedAt.toISOString()}`);
        }
        lines.push('');
    }
    lines.push('Write the brief now.');
    return lines.join('\n');
}
function percent(value) {
    return `${(value * 100).toFixed(1)} per cent`;
}
//# sourceMappingURL=prompt-templates.js.map