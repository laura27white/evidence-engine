export const HPO_CASCADE_LINKS = [
    // -----------------------------------------------------------------------
    // A046 Inflation cascade (primary case study)
    // -----------------------------------------------------------------------
    {
        source_code: 'A046',
        target_code: 'A011',
        propagation_weight: 0.7,
        rationale: 'Sustained inflation materially weakens the Buyer fiscal envelope, raising the probability of a delayed or restructured funding schedule.',
    },
    {
        source_code: 'A046',
        target_code: 'A028',
        propagation_weight: 0.75,
        rationale: 'Project internal budgets are set in nominal terms; inflation erodes headroom and tightens the adequacy assumption.',
    },
    {
        source_code: 'A046',
        target_code: 'A025',
        propagation_weight: 0.6,
        rationale: 'Higher inflation increases wage expectations; key delivery staff may renegotiate or leave without uplift.',
    },
    {
        source_code: 'A046',
        target_code: 'A007',
        propagation_weight: 0.5,
        rationale: 'Cost pressure on the Buyer lengthens invoice approval cycles beyond the 15-day assumption.',
    },
    {
        source_code: 'A046',
        target_code: 'A008',
        propagation_weight: 0.4,
        rationale: 'Inflation raises fuel and logistics costs, pushing the site access plan toward the edge of budgeted freight.',
    },
    {
        source_code: 'A046',
        target_code: 'A009',
        propagation_weight: 0.3,
        rationale: 'Cloud provider list prices drift with headline inflation; the stable cloud cost assumption degrades slowly.',
    },
    {
        source_code: 'A046',
        target_code: 'A030',
        propagation_weight: 0.4,
        rationale: 'LLM licensing fees trend with compute input costs; inflation pressure increases the chance of mid-contract list-price changes.',
    },
    {
        source_code: 'A046',
        target_code: 'A043',
        propagation_weight: 0.55,
        rationale: 'Inflation-driven fit-out supply cost growth lengthens the room readiness schedule.',
    },
    {
        source_code: 'A046',
        target_code: 'A044',
        propagation_weight: 0.45,
        rationale: 'Buyer-side fit-out cost growth shifts contractor selection and schedule ownership.',
    },
    {
        source_code: 'A046',
        target_code: 'A045',
        propagation_weight: 0.6,
        rationale: 'Cost inflation reopens risk allocation conversations about who absorbs overruns.',
    },
    {
        source_code: 'A046',
        target_code: 'A012',
        propagation_weight: 0.35,
        rationale: 'Inflation may trigger Buyer procurement re-examination and extend onboarding timelines.',
    },
    {
        source_code: 'A046',
        target_code: 'A022',
        propagation_weight: 0.5,
        rationale: 'Subcontractors under margin pressure slip on delivery commitments.',
    },
    // -----------------------------------------------------------------------
    // A047 Interest Rates secondary cascade
    // -----------------------------------------------------------------------
    {
        source_code: 'A047',
        target_code: 'A011',
        propagation_weight: 0.65,
        rationale: 'Higher borrowing costs tighten Buyer liquidity, increasing the probability of funding timing slippage.',
    },
    {
        source_code: 'A047',
        target_code: 'A028',
        propagation_weight: 0.55,
        rationale: 'Financing costs on internal working capital reduce the real budget available for the project.',
    },
    {
        source_code: 'A047',
        target_code: 'A022',
        propagation_weight: 0.5,
        rationale: 'Supplier and subcontractor cashflows tighten when rates rise, raising delivery risk.',
    },
    {
        source_code: 'A047',
        target_code: 'A012',
        propagation_weight: 0.4,
        rationale: 'Buyer procurement tightens when debt service pressure rises, extending onboarding cycles.',
    },
    // -----------------------------------------------------------------------
    // A048 Tax Policy tertiary cascade
    // -----------------------------------------------------------------------
    {
        source_code: 'A048',
        target_code: 'A028',
        propagation_weight: 0.45,
        rationale: 'New corporate taxes reduce post-tax budget available for project delivery.',
    },
    {
        source_code: 'A048',
        target_code: 'A015',
        propagation_weight: 0.35,
        rationale: 'Material tax policy change surfaces compliance or contractual disputes that would otherwise stay dormant.',
    },
    {
        source_code: 'A048',
        target_code: 'A045',
        propagation_weight: 0.4,
        rationale: 'Tax changes reopen risk allocation of project costs between Buyer and Supplier.',
    },
];
//# sourceMappingURL=hpo-cascade-links.js.map