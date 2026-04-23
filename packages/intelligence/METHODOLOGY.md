# Intelligence METHODOLOGY (draft)

This file is a stub methodology note covering the three intelligence modules: forecast, cascade, and confidence. It is intentionally terse for the hackathon milestone; the full paper-grade write-up (journal-submission quality with complete BibTeX references, retrospective empirical validation, and a full derivation of the ensemble-agreement metric) is scheduled for the post-MVP consolidation pass as agreed with the programme lead. See `ARCHITECTURE.md` sections 3.3, 3.4, 3.5, and 3.6 for the canonical specification.

## 1. Forecast module

### Problem statement

For every assumption with a drift-measurement time series, estimate when the series will breach tolerance and how confident we are in that date. Three independent forecasting methods are run over the same series; disagreement between methods is itself a signal (ensemble agreement, section 1.4).

### 1.1 Linear trend

Ordinary least squares of `observedValue` on `daysSinceFirstMeasurement`. Forecast at `t + h` is `intercept + slope * (t + h)`. Breach date is the smallest non-negative `h` where `|intercept + slope * (t + h) - baseline| >= tolerance` (solved analytically; see `breach.ts`). Slope standard error is propagated to a breach-day confidence interval via the delta method.

### 1.2 EWMA (Holt's linear method)

Double exponential smoothing:

```
level_t = alpha * y_t + (1 - alpha) * (level_{t-1} + trend_{t-1})
trend_t = beta  * (level_t - level_{t-1}) + (1 - beta) * trend_{t-1}
```

Defaults `alpha = 0.3`, `beta = 0.1`. Trend is normalised to a per-day rate to cope with irregular cadence; forecasts remain linear in horizon so breach solves analytically.

### 1.3 AR(1) with drift

`y_t - mu = phi * (y_{t-1} - mu) + epsilon_t`. Parameters estimated by method of moments: `mu` is the sample mean, `phi` is the lag-1 sample autocorrelation. When the implied process is non-stationary (|phi| >= 1) we fall back to a random walk with drift and record `fallback: 'random-walk'` in the model params. Breach date is iterated day by day because the expected trajectory is non-linear in horizon.

### 1.4 Ensemble combination and agreement

Combined projected values are the median across the three methods. Combined breach date is the median of method breach dates, but only when at least two methods project a breach within horizon; otherwise null.

Ensemble agreement is `exp(-cv)` where `cv = sd / max(mean, 1)` over the three methods' breach days. Methods that do not project a breach within horizon contribute the horizon value. This mapping is smooth, monotonic in disagreement, and bounded in `(0, 1]`. Alternatives (`1 - cv`, `1 / (1 + cv)`, `1 - min(1, cv)`) require hard clamps or lose monotonicity; `exp(-cv)` is the simplest smooth choice.

### 1.5 Limitations

Method of moments for AR(1) is less efficient than maximum likelihood on short series; documented limitation. The delta-method confidence interval for linear breach day is approximate. No exogenous shocks or structural breaks are modelled. Empirical retrospective validation against the three externally anchored assumptions (A039, A040, A041) is deferred to the post-MVP pass.

## 2. Cascade module

### Problem statement

Given a directed acyclic graph of assumption dependencies with per-edge propagation coefficients, quantify downstream exposure when any source assumption drifts.

### 2.1 Propagation

For each source node, all simple paths to every reachable node are enumerated via depth-limited DFS (bounded at depth 6 by default to prevent pathological fan-out; in a DAG all paths are simple). Per-path strength is the product of edge weights. Per-target expected drift is the sum of path products multiplied by source drift, capped at the saturation ceiling (default 1) to honour the [0, 1] type invariant on drift scores.

Sum-then-saturate (additive across paths, multiplicative along paths) is the convention from directed belief-propagation networks (Pearl, 1988). Max-across-paths under-counts independent channels; logistic compression is smoother but parameter-dependent.

### 2.2 System fragility

Per-node fragility = sum of unit-drift impacts arriving from all sources, normalised by the maximum observed value to produce a [0, 1] ranking. Global fragility is the mean over downstream nodes (nodes with at least one inbound edge) to avoid inflating the denominator with isolated sources. Top upstream drivers are nodes ranked by total outbound impact.

### 2.3 Limitations

First-order linear propagation. No feedback loops (DAG-only). Edge weights are expert-elicited rather than learned from data; calibration is a separate concern. No temporal dynamics (edges fire instantaneously). Per-edge rationales are captured in `cascade_links.rationale` for auditability.

## 3. Confidence module

### Problem statement

Report, for every assumption, how much we trust the current state. A single number is insufficient because the _reason_ for reduced confidence matters; we decompose into four components and surface the worst as caveats.

### 3.1 Components

- **Recency.** Piecewise: 100 within cadence, linear decay to 20 over `c..3c`, exponential tail thereafter; 50 when `lastReviewDate` is unknown (distinct from known-stale).
- **Source tier.** Tier 1 (ONS, BoE, gov.uk) = 100; tier 2 (World Bank, OECD) = 70; tier 3 (internal estimate) = 40.
- **Cross-source agreement.** null when fewer than two sources; else `1 - cv` mapped linearly between `cv = 0.02` (=>100) and `cv = 0.20` (=>0).
- **Volatility.** Coefficient of variation of the last 90 days of measurements; mapped between `cv = 0.05` (=>100) and `cv = 0.50` (=>0); 50 when fewer than three measurements in-window.

### 3.2 Combination

Weighted sum with default weights `{recency 0.30, sourceTier 0.25, agreement 0.20, volatility 0.25}`. When agreement is null, its weight is proportionally redistributed across the remaining three. Score bands: `>=75` HIGH, `50-74` MODERATE, `<50` LOW.

Caveats are generated per-component when the component is below a threshold (recency < 40; tier 3; agreement < 50; volatility < 50) and sorted worst-first, so the user sees the most-degraded factor at the top.

### 3.3 Limitations

Weights are judgement calls, not learned. CV thresholds are stylised. No modelling of reviewer skill. A tier-3 source caps below HIGH by design, reflecting the view that internal estimates cannot be as reliable as external statistics regardless of recency or volatility.

## 4. References (partial; full BibTeX deferred)

- Hyndman, R. J. and Athanasopoulos, G. (2021). _Forecasting: Principles and Practice_, 3rd ed., OTexts.
- Hoeting, J. A., Madigan, D., Raftery, A. E. and Volinsky, C. T. (1999). Bayesian model averaging: a tutorial. _Statistical Science_ 14(4), 382-417.
- Pearl, J. (1988). _Probabilistic Reasoning in Intelligent Systems_. Morgan Kaufmann.
- Walker, W. E., Harremoes, P., Rotmans, J., van der Sluijs, J. P., van Asselt, M. B. A., Janssen, P. and Krayer von Krauss, M. P. (2003). Defining uncertainty: a conceptual basis for uncertainty management in model-based decision support. _Integrated Assessment_ 4(1), 5-17.
