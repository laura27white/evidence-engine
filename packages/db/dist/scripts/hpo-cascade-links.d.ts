/**
 * Hand-coded cascade edges for the HPO24A01 register.
 *
 * The register's `Linked Items` column points at milestones and deliverables, not at other
 * assumptions, so we hand-code the edges that are material for the Project Trueplan demo.
 * The economic cascade (A046 Inflation as source) is the paper's primary case study; the
 * remaining edges sketch the plausible downstream from A047 Interest Rates and A048 Tax
 * Policy. Weights are in [0, 1] where 0 means no transmission and 1 means linear pass
 * through.
 *
 * Every weight has a one-sentence rationale. These weights and rationales are reviewed in
 * `docs/paper/methodology.md` (aggregated in Prompt 5) before they become published claims.
 *
 * **Deviation from the prompt spec:** the spec names A039, A040, A041 as the economic
 * assumptions. The actual HPO register ships them as A046, A047, A048. The semantic
 * meaning (Inflation, Interest Rates, Tax Policy) is unchanged.
 */
export interface CascadeLinkDef {
    source_code: string;
    target_code: string;
    propagation_weight: number;
    rationale: string;
}
export declare const HPO_CASCADE_LINKS: readonly CascadeLinkDef[];
//# sourceMappingURL=hpo-cascade-links.d.ts.map