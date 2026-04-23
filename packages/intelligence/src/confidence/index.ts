export { computeConfidence } from './score';
export { explainConfidence } from './explain';
export { computeRecency } from './components/recency';
export { computeSourceTier } from './components/source-tier';
export { computeAgreement } from './components/agreement';
export { computeVolatility } from './components/volatility';
export type {
  ConfidenceInputs,
  ConfidenceComponents,
  ConfidenceScore,
  ConfidenceWeights,
  CrossSourceValue,
  SourceTier,
} from './types';
export { DEFAULT_WEIGHTS, TIER_SCORES } from './types';
