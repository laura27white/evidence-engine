# Prompt 6: Confidence Scoring

**Runtime:** approximately 2.5 hours. Can run in parallel with Prompts 4 and 5. Requires Prompt 1 merged (for schema).

**Authoritative context:** Read `ARCHITECTURE.md` sections 3.6 (confidence score) and 8 (paper-grade documentation) before starting.

---

## Role and mission

You are a senior applied mathematician and software engineer building Project Trueplan's confidence scoring module. For every assumption, this module answers: "how much can we trust the state we are reporting?"

The MPA Challenge 5 brief explicitly asks for "confidence scoring and review-age tracking" as a success criterion. The user-facing confidence score is distinct from the ensemble agreement score computed in Prompt 4; the two combine later in the UI but the intermediate computations remain separate.

Confidence is harder to model honestly than drift. A naive score is worse than no score: it gives users false precision. This prompt asks you to take confidence seriously, decompose it into identifiable components, justify weights, and be explicit about what the score does and does not capture.

---

## What you are building

### 6.1 Package structure

```
packages/intelligence/src/confidence/
├── index.ts
├── types.ts
├── components/
│   ├── recency.ts         // review-age decay
│   ├── source-tier.ts     // source credibility
│   ├── agreement.ts       // cross-source agreement
│   ├── volatility.ts      // drift series volatility
│   └── __tests__/
├── score.ts               // combines the four components
├── explain.ts             // produces human-readable breakdown
└── __tests__/
```

### 6.2 Types

```typescript
// packages/intelligence/src/confidence/types.ts

export interface ConfidenceInputs {
  lastReviewDate: Date | null;
  reviewCadenceDays: number;
  sourceTier: 1 | 2 | 3;
  measurements: Measurement[];            // recent drift measurements
  crossSourceValues?: Array<{             // optional: multiple sources for same concept
    source: string;
    value: number;
    asOf: Date;
  }>;
  nowOverride?: Date;                     // for testing
}

export interface ConfidenceComponents {
  recency: number;        // [0, 100]
  sourceTier: number;     // [0, 100]
  agreement: number;      // [0, 100]; null if no cross-source data
  volatility: number;     // [0, 100]
}

export interface ConfidenceScore {
  score: number;                  // [0, 100]; weighted combination
  components: ConfidenceComponents;
  weights: { recency: number; sourceTier: number; agreement: number; volatility: number };
  interpretation: 'HIGH' | 'MODERATE' | 'LOW';
  caveats: string[];              // human-readable warnings when specific components degrade
  computedAt: Date;
}
```

### 6.3 Component 1: Recency

File: `components/recency.ts`.

Intuition: the confidence we have in an assumption erodes the longer it goes unreviewed. For an assumption with review cadence `c` days and days-since-review `d`:

- `d <= c`: full confidence. `recency = 100`.
- `c < d <= 3c`: linear decay from 100 to 20.
- `d > 3c`: exponential tail. `recency = 20 * exp(-(d - 3c) / c)`.

No assumption drops to exactly zero recency (an assumption reviewed long ago is not certainly wrong, just certainly not recently validated).

If `lastReviewDate` is null: recency = 50 (no information, but not lowest; lowest implies we know it's stale).

Rationale for piecewise form, not single exponential: within the cadence, confidence should be undiminished; reviewers set the cadence to reflect expected stability. Exponential decay below 20 prevents the score from compressing into a tiny range for very old reviews.

Test cases: exact boundary behaviour at `d = c` (100), `d = 3c` (20), `d = 0` (100), `d = 10c` (exponentially small).

### 6.4 Component 2: Source tier

File: `components/source-tier.ts`.

Pure lookup:

- Tier 1 (official statistics, e.g. ONS, BoE, gov.uk): `sourceTier = 100`.
- Tier 2 (reputable secondary, e.g. World Bank, industry bodies): `sourceTier = 70`.
- Tier 3 (internal estimate): `sourceTier = 40`.

Rationale: tier 1 data has documented methodology, revisions protocol, and public accountability. Tier 3 is one person's judgement. Tier 2 is between; 70 not 50 because reputable secondary sources (World Bank, OECD) carry significant institutional weight. Document in METHODOLOGY.md.

This is the simplest component; document it clearly.

### 6.5 Component 3: Cross-source agreement

File: `components/agreement.ts`.

When multiple independent sources measure the same concept, their agreement is a confidence signal.

Inputs: list of `{source, value, asOf}` entries.

- Fewer than 2 sources: agreement = null (not scored; weight redistributed to other components in the final score).
- 2 or more sources: compute coefficient of variation of values (standard deviation / mean). If mean is zero, use the absolute standard deviation instead. Map:
  - `cv <= 0.02`: agreement = 100 (2% CV is essentially matching).
  - `cv >= 0.20`: agreement = 0.
  - In between: linear interpolation.

Rationale: cross-source agreement is a strong confidence signal when available. For the HPO data, only A039 Inflation has multiple sources (ONS primary; World Bank secondary); for A040 and A041 only one primary source exists. Document per-assumption which source-pairs apply.

### 6.6 Component 4: Volatility

File: `components/volatility.ts`.

Confidence is undermined when the assumption's measured values are themselves noisy.

Input: recent drift measurements (last 90 days).

- Compute the coefficient of variation of observed values.
- Map: `cv <= 0.05`: volatility component = 100. `cv >= 0.50`: volatility component = 0. Linear interpolation between.

Rationale: low CV means the series is stable; forecast and status claims are well-founded. High CV means the series is in a noisy regime and our forecasts are correspondingly less reliable.

Edge case: fewer than 3 measurements. Volatility component = 50 (insufficient data to judge volatility, but we shouldn't penalise or reward without evidence).

### 6.7 Combining components

File: `score.ts`.

Default weights (sum to 1):

- Recency: 0.30
- Source tier: 0.25
- Agreement: 0.20
- Volatility: 0.25

When agreement is null (no cross-source data), redistribute its 0.20 weight proportionally across the other three.

```typescript
export function computeConfidence(
  inputs: ConfidenceInputs,
  weights?: Partial<typeof DEFAULT_WEIGHTS>,
): ConfidenceScore;
```

The function:

1. Computes each component independently.
2. Redistributes weights if agreement is null.
3. Computes weighted sum.
4. Maps score to interpretation: `>= 75` = HIGH, `50-74` = MODERATE, `< 50` = LOW.
5. Generates caveats: human-readable warnings triggered by degraded components. For example:
   - Recency below 40: "Last review was over {days} days ago; cadence is {c} days."
   - Source tier 3: "Assumption relies on internal estimate; no external validation source."
   - Agreement below 50: "Primary and secondary sources disagree by more than 10%."
   - Volatility below 50: "Drift series is volatile; confidence in current state is reduced."

### 6.8 Explain function

File: `explain.ts`.

A separate pure function that takes a `ConfidenceScore` and returns a human-readable plain-text explanation for the Brief view. For example:

> "Confidence in this assumption: **moderate** (62/100). The largest factor is the source: this value relies on an internal estimate (tier 3), not an external statistic. Recency is within cadence (reviewed 34 days ago against a 90-day cadence). The measurement series is stable, supporting the current reading."

This composition is deterministic. It reads score components in a fixed priority order (worst component first) and constructs a narrative accordingly.

### 6.9 Public API

```typescript
// packages/intelligence/src/confidence/index.ts

export { computeConfidence } from './score';
export { explainConfidence } from './explain';
export type * from './types';
```

### 6.10 METHODOLOGY.md

Paper-grade. Sections:

1. **Problem statement.** Why quantified confidence? The trap of "false precision" and how this design avoids it. Existing literature on epistemic uncertainty in project management (Walker et al., *Defining Uncertainty*, Integrated Assessment, 2003).

2. **Decomposition rationale.** Why four components, not one? Because a single number hides the source of (un)confidence. A tier-3 source is a different problem from a stale review, even if both reduce the score to the same point. Practitioners need both the headline and the diagnosis.

3. **Component definitions.** Each component, its functional form, the parameter choices (cadence multiples, CV thresholds, tier scores), the boundary behaviour.

4. **Weighting choices.** Default weights and their rationale. Note that the weights are a judgement call, not a statistical derivation; a future paper might learn them from expert elicitation or outcome data.

5. **Weight redistribution when agreement is null.** The approach (proportional redistribution) and the alternative considered (keep agreement at 50 if no data). Proportional redistribution is preferred because "no data" is not the same as "moderate agreement."

6. **Interpretation thresholds.** Why 75 and 50 as HIGH/MODERATE/LOW boundaries. Alignment with practitioner intuition. A better threshold could be learned, but for hackathon and paper purposes, fixed thresholds with documented rationale are defensible.

7. **Caveat generation.** The purpose of per-component caveats: separate "what is the score?" from "why is the score what it is?" Users deserve both.

8. **Limitations.**
   - Weights are judgement, not learned.
   - CV thresholds are stylised.
   - No modelling of reviewer skill or dependence between components.
   - A tier-3 source with perfect recency, agreement, and low volatility still caps below HIGH by design, reflecting the view that internal estimates cannot be as reliable as external statistics regardless of other factors.

9. **Validation approach.**
   - Unit tests for each component.
   - Property tests for boundary behaviour (scores in `[0, 100]`, monotonicity).
   - Face validity check: compute scores for all 47 HPO assumptions and inspect whether the distribution matches intuition. Report as a paper table.

10. **Reproducibility.** Weights and thresholds fixed and documented. Deterministic function.

11. **References (BibTeX).**
    - Walker et al. 2003 (epistemic uncertainty).
    - Taleb, *The Black Swan*, Random House, 2007 (on the danger of false confidence in quantitative scores; worth citing as a warning even though we're not taking the extreme position).

### 6.11 Tests

- **Component tests.**
  - Recency at boundary values.
  - Source tier for each tier value.
  - Agreement with 0, 1, 2, 5 sources and various CV levels.
  - Volatility with 0, 2, 3, 10 measurements.

- **Score combination tests.**
  - All components 100 -> score 100.
  - All components 0 -> score 0.
  - One component 0, others 100 -> score matches 100 * (1 - weight of the zero component).
  - Agreement null -> weights redistributed; total still 100 when other components are 100.

- **Caveat generation.**
  - Worst component first.
  - No caveat generated for components >= 75.
  - Human-readable output format verified against fixtures.

- **Face validity on HPO data.**
  - Compute confidence for all 47 assumptions using current data.
  - A039, A040, A041 should score MODERATE or HIGH on source tier (tier 1).
  - All 47 should score LOW or MODERATE on recency (every assumption is past review date per the HPO register).
  - Report the full distribution in a test assertion file; any major surprise (e.g. tier-3 assumption scoring HIGH) indicates a bug.

- **Explain function.**
  - Determinism: same inputs -> same output string.
  - British English.
  - No em dashes (enforced by CI too, but test locally).
  - Under 400 characters.

Coverage target 95%.

### 6.12 Documentation

- `README.md`.
- `METHODOLOGY.md` as specified in 6.10.
- `HPO_CONFIDENCE_TABLE.md`, a generated artefact listing all 47 assumptions' current confidence scores and caveats, for the paper appendix. Regenerated on every CI run as a post-build step so the table stays current with any methodology change.

---

## Out of scope

- Persisting confidence scores to the database (Prompt 7 or 9 edge function).
- UI for confidence (Prompt 8 displays the score; Prompt 9 consumes the caveats for the Brief).
- Forecast (Prompt 4). Cascade (Prompt 5).

---

## Definition of done

- [ ] Package structure matches 6.1
- [ ] Types defined; no `any`
- [ ] Four components implemented, unit-tested at boundaries
- [ ] Score combination handles null-agreement weight redistribution
- [ ] Caveats generated in priority order
- [ ] Explain function produces British-English prose under 400 chars
- [ ] Face validity test on HPO data passes and reports the distribution
- [ ] Coverage >=95%
- [ ] METHODOLOGY.md at journal quality with BibTeX references
- [ ] HPO_CONFIDENCE_TABLE.md generated and current
- [ ] CI green
- [ ] PR opened, reviewed against `ARCHITECTURE.md` section 3.6

---

## Self-check before PR

1. Is every weight, threshold, and mapping function justified in METHODOLOGY.md, or is any of it arbitrary?
2. Would a peer reviewer accept the "caveats in priority order" design, or would they prefer a different aggregation of explanations?
3. Have I resisted the temptation to over-engineer (e.g. Bayesian updating of weights)? A simple, documented scheme is better than a clever one.
4. Does the face-validity check on HPO data produce results a domain expert (Laura, an assurance lead) would call plausible?
5. Is the Explain function's output actually useful in a Brief view, or is it jargon-laden?

---

*End of Prompt 6. Runs in parallel with Prompts 4 and 5.*
