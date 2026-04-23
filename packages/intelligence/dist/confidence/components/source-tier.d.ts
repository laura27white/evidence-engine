/**
 * Source-tier component: a pure lookup from the assumption's source tier to a score.
 *
 * Tier 1 (official statistics: ONS, BoE, gov.uk) = 100
 * Tier 2 (reputable secondary: World Bank, OECD)  = 70
 * Tier 3 (internal estimate)                      = 40
 */
import { type SourceTier } from '../types';
export declare function computeSourceTier(tier: SourceTier): number;
//# sourceMappingURL=source-tier.d.ts.map