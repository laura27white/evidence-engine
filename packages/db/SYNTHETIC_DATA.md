# Synthetic drift measurement generation

This document is the paper appendix for how Project Trueplan generates synthetic historical drift measurements for the 44 non-externally-anchored HPO assumptions. It accompanies the real-data stubs for A046, A047, A048 which will be replaced by live adapter fetches once Prompt 3 merges.

## Motivation

The forecast ensemble (Prompt 4) and the cascade propagation engine (Prompt 5) need input data. The HPO register as delivered is a static register with no time-series. Rather than wait for nine months of real observations to accumulate, we generate synthetic trajectories whose statistical properties are parameterised by the register's `likelihood_of_failure` field. This lets us demonstrate the method on a mix of real and synthetic trajectories: real data validates the forecast ensemble against observable ground truth, synthetic data exercises the cascade engine at portfolio scale.

## Method

For each assumption, we generate nine monthly observations backdated from `today` (the day the seed script runs). The first observation sits nine months in the past; the last is the current month. Each observation is a compound drift from the previous, summed over a 30-day window of daily Gaussian noise.

### Daily drift distribution

The daily drift `d` is drawn from a normal distribution parameterised by the assumption's `likelihood_of_failure`:

| Likelihood | Mean (`mu`) | Std dev (`sigma`) |
| ---------- | ----------- | ----------------- |
| LOW        | 0.000       | 0.010             |
| MEDIUM     | 0.002       | 0.020             |
| HIGH       | 0.005       | 0.030             |

Daily drifts accumulate multiplicatively over the month. Let `x_{i-1}` be the prior month's observed value and let `d_{i, 1..30}` be that month's daily drifts. Then:

```
x_i = x_{i-1} * (1 + sum_{j=1..30} d_{i, j})
```

The month-zero starting point is the assumption's `baseline_value`, or `100` if that is null. (In the HPO register, almost all non-anchored assumptions have null baselines, so they start at 100 and the trajectories are expressed as a percentage index.)

### Deterministic seed

All random numbers come from a single linear congruential generator (LCG) seeded with `20260422`:

```
state_{n+1} = (state_n * 1664525 + 1013904223) mod 2^32
u_n = state_n / 2^32
```

Box-Muller transforms two consecutive uniform samples into one Gaussian:

```
z = sqrt(-2 * log(max(u_1, 1e-12))) * cos(2 * pi * u_2)
```

Seeded determinism matters: the same `today` date produces the same trajectories every run, so tests can assert exact values and reviewers can reproduce the dataset exactly.

### Economic stubs

A046 Inflation, A047 Interest Rates, and A048 Tax Policy carry hardcoded historical values representative of UK 2025 public data. See `scripts/seed-drift-measurements.ts` for the values and the source URLs. These rows use `source='EXTERNAL_API'` and carry the stub source URL. They will be replaced with live ONS, BoE, and gov.uk fetches via the external-data adapters (Prompt 3).

## Assumptions and limitations

This method has known limitations, documented here so a reviewer knows what we do and do not claim.

- **Independence assumption**. Daily drifts are independent samples. In reality project risks correlate (a delivery slip on Monday makes a slip on Tuesday more likely). Modelling autocorrelation is left to the AR(1) leg of the forecast ensemble in Prompt 4.
- **Compound multiplicative drift**. We model drift as multiplicative rather than additive. This is appropriate for budget and schedule-indexed measurements where doubling a value has the same meaning regardless of the absolute level. For bounded assumptions (boolean-style, percentage-capped) this would overshoot; we do not currently use synthetic trajectories for those.
- **No mean reversion**. Trajectories walk without a pull back to baseline. Over nine months at HIGH volatility this can produce drift ratios exceeding realistic programme behaviour. The cascade engine sees these as tail events, which is arguably appropriate for an early warning system.
- **Uniform cadence**. We pin measurements to the first of each month at 12:00 UTC. Real programmes measure at irregular intervals. Forecast methods that assume evenly-spaced observations (LINEAR, EWMA) see this as a feature; AR(1) would benefit from a timestamp-aware variant.
- **Calibration is not validated**. The `(mu, sigma)` table for LOW / MEDIUM / HIGH is illustrative, not empirically calibrated against a historical register. If a real project programme provided nine months of matched register-plus-measurements, we would recalibrate these parameters by maximum likelihood.

## Reproducibility

To reproduce:

```bash
# Fresh DB
supabase db reset
pnpm --filter @tp/db import:hpo
pnpm --filter @tp/db seed:drift

# Or without reset, from a known state
pnpm --filter @tp/db seed:drift -- --reset
```

Assert identical output by comparing the `observed_value` column across runs. The first and last values for A001 (the first HPO assumption, MEDIUM likelihood, baseline 100) should be reproducible to at least six decimal places.

## References

Per ARCHITECTURE.md section 8 the methodology aggregates into `docs/paper/methodology.md` at the end of the build. The BibTeX bibliography goes to `docs/paper/references.bib`. Candidate references for this appendix:

- Chatfield, C. (2003). _The Analysis of Time Series: An Introduction_ (6th ed.). Chapman and Hall.
- Bollen, B. (2014). _Stochastic Processes in Finance_. McGraw-Hill.
- Knuth, D. E. (1997). _The Art of Computer Programming, Volume 2: Seminumerical Algorithms_. Addison-Wesley. (LCG parameters.)
