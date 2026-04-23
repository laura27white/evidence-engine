# Prompt 4: Forecast Ensemble and Lead Time Computation

**Runtime:** approximately 3 hours. Can run in parallel with Prompts 5 and 6. Requires Prompts 1 and 3 merged (for schema and data).

**Authoritative context:** Read `ARCHITECTURE.md` section 3.3 (drift), 3.4 (lead time), and section 8 (paper-grade documentation requirements) before starting.

---

## Role and mission

You are a senior applied mathematician and software engineer building the forecast engine for Project Trueplan. This is the module that turns a series of drift measurements into a projected breach date. The projected breach date feeds the lead-time metric, which is the product's headline.

This is also the module that anchors one half of the companion academic paper. Your METHODOLOGY.md here is the first draft of the paper's methodology section. Write accordingly: formal definitions, justified choices, honest limitations, citations.

The novel claim you are operationalising: **disagreement between independent forecasting methods is itself a useful signal.** When three methods converge on a breach date, confidence in that date is high. When they disagree wildly, confidence is low, and the UI communicates this as an intentional limitation rather than hiding it. Document this claim precisely; it is a core contribution.

---

## What you are building

### 4.1 Package structure

`packages/intelligence/src/forecast/` contains:

```
packages/intelligence/
├── src/
│   ├── forecast/
│   │   ├── index.ts
│   │   ├── types.ts
│   │   ├── methods/
│   │   │   ├── linear.ts
│   │   │   ├── ewma.ts
│   │   │   ├── ar1.ts
│   │   │   └── __tests__/
│   │   ├── ensemble.ts
│   │   ├── breach.ts
│   │   ├── leadtime.ts
│   │   ├── confidence.ts      // ensemble-agreement score (not the user-facing confidence, that's Prompt 6)
│   │   └── __tests__/
│   └── index.ts
├── METHODOLOGY.md             // paper-grade, see 4.9
└── package.json
```

### 4.2 Types

```typescript
// packages/intelligence/src/forecast/types.ts

/** A single drift measurement, as stored in drift_measurements. */
export interface Measurement {
  assumptionId: string;
  measuredAt: Date;
  observedValue: number;
  source: 'EXTERNAL_API' | 'MANUAL' | 'SYSTEM_DERIVED';
  externalDataRef?: string;
}

/** The baseline and tolerance configuration for an assumption. */
export interface AssumptionBaseline {
  baselineValue: number;
  baselineUnit: string;
  tolerancePct: number;  // e.g. 25 means tolerance is 25% of baseline
}

/** A forecast produced by a single method. */
export interface MethodForecast {
  method: 'LINEAR' | 'EWMA' | 'AR1';
  projected30d: number;
  projected90d: number;
  projected365d: number;
  breachDate: Date | null;          // null if the forecast never breaches within the horizon
  breachConfidenceInterval: [Date, Date] | null;
  modelParams: Record<string, unknown>;
  residualStdError: number;         // root mean square of in-sample residuals
}

/** The combined ensemble forecast. */
export interface EnsembleForecast {
  projected30d: number;             // median across methods
  projected90d: number;
  projected365d: number;
  breachDate: Date | null;          // median of method breach dates
  breachConfidenceInterval: [Date, Date] | null;
  leadTimeDays: number | null;      // (breachDate - today) in days, null if no breach
  ensembleAgreement: number;        // [0, 1]; 1 = perfect agreement, 0 = no agreement
  memberForecasts: MethodForecast[];
  computedAt: Date;
  inputSeriesHash: string;
}

/** Configuration for a forecast run. */
export interface ForecastConfig {
  horizonDays: number;              // default 365
  minMeasurementsRequired: number;  // default 6
  nowOverride?: Date;               // for testing; defaults to new Date()
}
```

### 4.3 Method 1: Linear trend with OLS

File: `methods/linear.ts`.

```typescript
export function forecastLinear(
  measurements: Measurement[],
  baseline: AssumptionBaseline,
  config: ForecastConfig,
): MethodForecast;
```

Ordinary least squares regression of `observedValue` on `daysSinceFirstMeasurement`. Slope and intercept estimated; forecast at `t = [30, 90, 365]` days from today. Residual standard error computed from in-sample fit.

Breach date: solve for the first `t` where `|value(t) - baseline| >= tolerance * baseline`. If solution exists within horizon, report; else null.

Confidence interval for breach date: standard error of the slope, translated to a breach-date uncertainty via the delta method. A simple-but-defensible approximation.

Edge cases:
- Fewer than `minMeasurementsRequired` measurements: return a forecast with the current value projected flat, `residualStdError = Infinity`, and a comment that the method is inapplicable.
- Constant series (zero variance): return flat projection, `residualStdError = 0`, breach date null unless already in breach.
- Non-finite values in series: reject with an error, don't silently filter.

### 4.4 Method 2: EWMA (exponentially weighted moving average)

File: `methods/ewma.ts`.

```typescript
export function forecastEwma(
  measurements: Measurement[],
  baseline: AssumptionBaseline,
  config: ForecastConfig & { alpha?: number },  // alpha default 0.3
): MethodForecast;
```

Exponentially weighted moving average with smoothing parameter `alpha`. The EWMA level and trend (Holt's linear method) are estimated jointly: `level_t = alpha * y_t + (1 - alpha) * (level_{t-1} + trend_{t-1})`; `trend_t = beta * (level_t - level_{t-1}) + (1 - beta) * trend_{t-1}`. Beta fixed at 0.1 by default; both parameters configurable.

Forecast at `t+h`: `level_t + h * trend_t`.

Residual standard error: same as in linear, computed over in-sample predictions.

Breach date: same logic as linear, solved analytically since forecast is linear in `h`.

Parameter selection: the defaults (alpha 0.3, beta 0.1) are documented in METHODOLOGY.md with a rationale. Do not grid-search; we are demonstrating a method, not tuning for a specific dataset.

### 4.5 Method 3: AR(1) with drift

File: `methods/ar1.ts`.

```typescript
export function forecastAr1(
  measurements: Measurement[],
  baseline: AssumptionBaseline,
  config: ForecastConfig,
): MethodForecast;
```

First-order autoregressive model with drift: `y_t - mu = phi * (y_{t-1} - mu) + epsilon_t`, where `epsilon_t ~ N(0, sigma^2)`.

Estimate `phi` and `mu` by method of moments (sample autocorrelation at lag 1 for `phi`; sample mean for `mu`). Estimate `sigma` from residuals.

Forecast at horizon `h`: `y_t_hat(h) = mu + phi^h * (y_t - mu)`. Variance at horizon: `sigma^2 * (1 - phi^(2h)) / (1 - phi^2)` for stationary series (`|phi| < 1`).

Non-stationary case (`phi >= 1`): fall back to a random walk with drift (set `phi = 1` explicitly), document in model params.

Breach date: computed iteratively because forecast is non-linear in `h`; step forward day by day until the expected value crosses tolerance. Slower than linear or EWMA but negligible in practice because horizon is 365 days.

Edge cases: insufficient data (less than ~20 points) warrants a warning that AR(1) estimation is unreliable; still return a forecast but with a wide confidence interval reflecting parameter uncertainty.

### 4.6 Ensemble combination

File: `ensemble.ts`.

```typescript
export function ensembleForecast(
  measurements: Measurement[],
  baseline: AssumptionBaseline,
  config: ForecastConfig,
): EnsembleForecast;
```

Process:

1. Run all three methods. Each returns a `MethodForecast`.
2. Combined projected values at 30/90/365 days: the **median** of the three method values. Median (not mean) is robust to one method going wild.
3. Combined breach date: median of the three method breach dates. If fewer than two methods produce a breach date within the horizon, the ensemble breach date is null (we don't trust a single method's breach claim).
4. Combined confidence interval for breach date: the min of method lower bounds to max of method upper bounds; expanded to encompass all methods' ranges.
5. Lead time: `(breachDate - now) / 86400000` days, rounded down. Null if no breach.
6. **Ensemble agreement** (the novel metric): defined in 4.7.
7. `inputSeriesHash`: SHA-256 of the concatenation of sorted measurement rows, used to detect when a re-forecast is needed.

### 4.7 Ensemble agreement score

This is the paper's central methodological contribution. Define precisely.

Let `b_LINEAR`, `b_EWMA`, `b_AR1` be the three methods' breach dates (in days from now). If any is null (no breach within horizon), assign it a value equal to the horizon, e.g. 365.

Define:

```
mean_b = (b_LINEAR + b_EWMA + b_AR1) / 3
sd_b = sqrt(sum((b_i - mean_b)^2) / 3)
cv = sd_b / max(mean_b, 1)                  // coefficient of variation
agreement = exp(-cv)                         // in (0, 1]; 1 when perfect agreement
```

Ensemble agreement = `agreement`. Store as `numeric(4,3)` in the database.

Interpretation:
- `agreement > 0.9`, methods concur strongly; lead-time estimate is dependable.
- `0.6 < agreement <= 0.9`, reasonable concurrence; moderate confidence.
- `agreement <= 0.6`, wide disagreement; the assumption is in a regime where forecasting is unreliable. Surface this in the UI as a warning.

In METHODOLOGY.md, justify the choice of `exp(-cv)` over alternatives like `1 - cv`, `1 / (1 + cv)`, or `1 - min(1, cv)`. Briefly: exponential decay gives a smooth monotonic mapping from `cv` in `[0, inf)` to agreement in `(0, 1]` without a hard clamp.

### 4.8 Public API

```typescript
// packages/intelligence/src/forecast/index.ts

export { ensembleForecast } from './ensemble';
export { forecastLinear } from './methods/linear';
export { forecastEwma } from './methods/ewma';
export { forecastAr1 } from './methods/ar1';
export { computeBreachDate } from './breach';
export { computeLeadTime } from './leadtime';
export type * from './types';
```

The orchestration that reads `drift_measurements` from Supabase, calls `ensembleForecast`, and writes to the `forecasts` table is **not** in this package. That's application-layer work, handled in Prompt 7 (pages) or Prompt 9 (Brief generator), via a Supabase edge function. Keep this package pure.

### 4.9 METHODOLOGY.md: paper-grade

This file is the paper's forecasting methodology section in draft form. Write in formal academic register, British English.

Required sections:

1. **Problem statement.** What we are computing and why. Why lead time matters. Why forecasting at all, given assumptions are often "point-in-time beliefs."

2. **Formal definitions.** Drift ratio, tolerance, breach, lead time, ensemble forecast, ensemble agreement. All in LaTeX. Cross-reference `ARCHITECTURE.md` section 3.

3. **Method selection rationale.**
   - Why three methods? The hypothesis that different models capture different failure modes: linear captures steady trend, EWMA captures regime shifts, AR(1) captures mean-reverting dynamics.
   - Why these three specifically? Precedent in the forecasting literature (Hyndman and Athanasopoulos, *Forecasting: Principles and Practice*, 3rd ed., OTexts, 2021).
   - Why not Prophet, neural networks, or Bayesian structural time series? (Answer: interpretability, reproducibility on short series, and the ensemble argument doesn't require individually sophisticated members. Sometimes a simpler base improves the aggregator.)

4. **Algorithmic details.** For each method: update equations, parameter estimation, forecast equations, residual analysis, breach-date computation, confidence interval construction. Include pseudocode in algorithm boxes.

5. **Ensemble combination.** Median aggregation rationale (robust to single-method failure); why median over weighted mean (no ground truth to learn weights from in the hackathon dataset; future work could incorporate weights).

6. **Ensemble agreement as a confidence signal.** The central novel claim. Derivation of the `exp(-cv)` mapping. Interpretation thresholds. Connection to Bayesian model averaging literature (Hoeting et al., *Bayesian Model Averaging: A Tutorial*, Statistical Science, 1999).

7. **Complexity.** Time and space complexity of each method and the ensemble. For context: linear is O(n), EWMA is O(n), AR(1) parameter estimation is O(n), breach-date iteration in AR(1) is O(horizonDays). Total ensemble O(n + horizonDays).

8. **Assumptions and limitations.**
   - Stationarity assumption in AR(1) is often violated for externally-anchored assumptions during regime changes (e.g. post-COVID inflation).
   - Short series (less than ~20 measurements) undermine AR(1) parameter estimation; we surface a warning but still forecast.
   - The linear CI via delta method is approximate.
   - We do not model exogenous shocks or structural breaks.
   - Synthetic trajectories (for the 44 non-anchored assumptions) are demonstrations, not validations; the paper should be explicit about this.

9. **Validation approach.**
   - Unit tests verify method correctness against known analytical solutions (e.g. linear with perfectly linear input must recover the line; AR(1) with phi=0 must reduce to iid noise).
   - Property tests verify invariants: ensemble agreement in [0,1]; breach date, if present, is within horizon; lead time matches breach-date arithmetic.
   - Empirical validation on the three externally-anchored assumptions: do the method forecasts, if run as of 6 months ago with the data available then, successfully predict the subsequent drift trajectory? A retroactive accuracy check, results reported in a table.

10. **Reproducibility statement.** All parameter choices documented. Random seeds where applicable. Input data hashed. Code open source.

11. **References (BibTeX).** Hyndman and Athanasopoulos; Hoeting et al.; any others cited. Complete BibTeX entries.

### 4.10 Tests

Unit tests (Vitest) with at least the following:

- **Correctness tests for each method.**
  - Linear with perfectly linear synthetic input must recover the slope and intercept to within numerical precision.
  - EWMA with `alpha = 1` must equal the latest observation (degenerate case).
  - AR(1) with `phi = 0` must reduce to white noise around the mean.

- **Edge cases.**
  - Fewer than `minMeasurementsRequired` measurements: each method returns a degraded forecast without crashing; the ensemble propagates the degradation honestly.
  - All-zero series: no spurious breach.
  - Constant-non-zero series: breach date null if baseline equals constant; breach "today" if constant is already outside tolerance.
  - Series with one NaN or infinity: adapter rejects with typed error, not silent failure.

- **Ensemble properties.**
  - Agreement is always in `[0, 1]`.
  - Lead time is consistent with breach date (`lead_time_days = floor((breach_date - now).days)`).
  - Re-running with identical input produces identical output (deterministic).

- **Property tests (fast-check or equivalent).**
  - For any finite, positive-valued series: `ensembleForecast(...)` does not throw.
  - Monotonic breach-date property: if we add an observation that continues the trend, the projected breach date moves earlier (or stays the same).

- **Empirical validation test.** Using the three externally-anchored assumptions' real data, compute forecasts as of a date 6 months ago using the data available then; report the accuracy of the predicted breach date against what actually happened. This is a paper table.

Coverage target: 95% (this package is pure, tests are easy, and the paper demands rigour).

### 4.11 Documentation

- `README.md`, how to use the package, API reference, links to METHODOLOGY.md.
- `METHODOLOGY.md`, as specified in 4.9.
- `CHANGELOG.md`, for the paper, to track any methodological evolution.

---

## Out of scope

- Persisting forecasts to the database (Prompt 7 or 9 handles this via an edge function).
- UI for forecasts (Prompt 8).
- The user-facing confidence score (Prompt 6; distinct from ensemble agreement).
- Cascade propagation (Prompt 5).

---

## Definition of done

- [ ] Package structure matches section 4.1
- [ ] All types defined in `types.ts`; no `any` anywhere
- [ ] Three method implementations pass correctness tests against analytical solutions
- [ ] Ensemble combination correctly uses median and produces `EnsembleForecast`
- [ ] Ensemble agreement computed exactly per section 4.7; verified monotonic and bounded
- [ ] Edge cases handled without exceptions leaking
- [ ] Empirical validation on A039, A040, A041 runs and produces a results table
- [ ] Coverage >=95%
- [ ] METHODOLOGY.md written at journal-submission quality with BibTeX references
- [ ] README and CHANGELOG present
- [ ] CI green; types exported cleanly to downstream packages
- [ ] PR opened, reviewed against `ARCHITECTURE.md` sections 3.3, 3.4, 8

---

## Self-check before PR

Answer in the PR description:

1. Does the ensemble agreement metric behave correctly at the boundary cases (all three methods agree perfectly; all three disagree maximally)? Show with a test.
2. Does the empirical validation on the three real-data assumptions produce plausible results, or does it reveal a methodological issue? If the latter, fix before opening.
3. Is METHODOLOGY.md defensible if submitted to a peer-reviewed journal as a short note? If a co-author would flag issues, address them.
4. Have I documented every parameter choice with a rationale, not just a value?
5. Is the package genuinely pure: no I/O, no database, no network, no global state?

---

*End of Prompt 4. Runs in parallel with Prompts 5 and 6.*
