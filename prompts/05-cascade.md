# Prompt 5: Cascade Propagation Engine

**Runtime:** approximately 3 hours. Can run in parallel with Prompts 4 and 6. Requires Prompt 1 merged (for `cascade_links` schema).

**Authoritative context:** Read `ARCHITECTURE.md` sections 3.5 (cascade impact) and 8 (paper-grade documentation) before starting.

---

## Role and mission

You are a senior applied mathematician building the cascade propagation engine for Project Trueplan. This module answers the question: when assumption A drifts, which other assumptions are affected, and by how much?

This is the second half of the companion academic paper. Your METHODOLOGY.md here is a self-contained draft. The paper's full contribution combines this with the forecast methodology from Prompt 4.

The novel claim: applying Bayesian-network-style probability propagation to project assumption dependency graphs yields a quantified "system fragility" metric that predicts which upstream drifts matter most. Document this precisely.

---

## What you are building

### 5.1 Package structure

`packages/intelligence/src/cascade/` contains:

```
packages/intelligence/
├── src/
│   ├── cascade/
│   │   ├── index.ts
│   │   ├── types.ts
│   │   ├── graph.ts           // DAG construction, validation, utilities
│   │   ├── propagate.ts       // single-source and all-pairs propagation
│   │   ├── fragility.ts       // system fragility metric
│   │   ├── visualise.ts       // helpers that prepare data for Sankey rendering
│   │   └── __tests__/
│   └── index.ts
└── (forecast lives alongside; cascade is a sibling)
```

### 5.2 Types

```typescript
// packages/intelligence/src/cascade/types.ts

export interface AssumptionNode {
  id: string;              // assumption UUID
  code: string;            // e.g. A039
  category: string;
  isExternal: boolean;
  currentDriftScore: number; // [0, 1], fed in from forecast or measurement layer
}

export interface CascadeEdge {
  sourceId: string;
  targetId: string;
  weight: number;          // [0, 1]: fraction of source drift that propagates
  rationale: string;       // required; human-readable justification
}

export interface CascadeGraph {
  nodes: Map<string, AssumptionNode>;
  edges: CascadeEdge[];
  outgoing: Map<string, CascadeEdge[]>;  // indexed by sourceId
  incoming: Map<string, CascadeEdge[]>;  // indexed by targetId
}

/** A single path from source to target. */
export interface CascadePath {
  nodes: string[];         // assumption IDs, in order
  weights: number[];       // edge weights, in order
  pathProduct: number;     // product of weights = path strength
}

/** Total propagation from a single source to a single target. */
export interface CascadeImpact {
  sourceId: string;
  targetId: string;
  expectedDriftScore: number;  // [0, 1]: total drift transmitted
  paths: CascadePath[];        // all distinct simple paths, ordered by pathProduct desc
}

/** Full propagation result from a single source. */
export interface SingleSourcePropagation {
  sourceId: string;
  sourceDriftScore: number;
  impacts: CascadeImpact[];    // one entry per reachable node
  totalDownstreamDrift: number; // sum of all impacts (raw sum, not normalised)
  computedAt: Date;
}

/** System-level fragility summary. */
export interface SystemFragility {
  nodeFragility: Map<string, number>;        // per-node upstream sensitivity
  globalFragilityScore: number;              // [0, 1]: whole-graph fragility
  topUpstreamDrivers: Array<{ id: string; score: number }>;
  computedAt: Date;
}
```

### 5.3 Graph construction and validation

File: `graph.ts`.

```typescript
export function buildGraph(
  nodes: AssumptionNode[],
  edges: CascadeEdge[],
): Result<CascadeGraph, GraphError>;
```

- Returns a `Result` union type; errors are values, not exceptions.
- Validates no self-loops (source != target).
- Validates no duplicate edges (source, target unique).
- Validates edge weights in `[0, 1]`.
- Validates graph is a DAG: run Kahn's algorithm and error if cycles detected. Cycles are explicitly out of scope for the paper; document the rationale in METHODOLOGY.md.
- Builds adjacency indices for efficient traversal.

Cycle handling error must include the cycle path in the error for debugging.

### 5.4 Single-source propagation

File: `propagate.ts`.

```typescript
export function propagateFromSource(
  graph: CascadeGraph,
  sourceId: string,
  options?: {
    maxDepth?: number;        // default 6; prevents pathological fan-out
    saturationCap?: number;   // default 1; caps cumulative drift per target at this value
  },
): Result<SingleSourcePropagation, PropagationError>;
```

Algorithm:

1. Find all distinct simple paths from `sourceId` to every reachable node using depth-limited DFS.
2. For each path `(e_1, e_2, ..., e_n)`, compute `pathProduct = product(weights)`.
3. For each target node, aggregate across multiple paths:
   - `expectedDriftScore(target) = min(saturationCap, sum over paths p to target of (pathProduct(p) * sourceDriftScore))`
   - Saturation cap ensures cumulative drift cannot exceed 1 (the definition of a normalised drift score) even if multiple paths sum to more than 1 in theory.
4. Return all impacts sorted by `expectedDriftScore` descending.

Why sum across paths (with saturation), not max? Because multiple independent paths represent independent channels of influence; their effects are additive up to the unit cap. Document this in METHODOLOGY.md.

Why simple paths (no repeated nodes)? Because in a DAG, any path is necessarily simple. The distinction matters only if the graph were extended to DCGs later; future work.

Complexity: worst case O(|V| + |E|) per target, O(|V|^2 + |V||E|) in total because paths are bounded by the DAG structure (simple paths only). Document this.

### 5.5 All-pairs propagation

```typescript
export function propagateAllPairs(
  graph: CascadeGraph,
  options?: PropagateOptions,
): Map<string, SingleSourcePropagation>;
```

Runs `propagateFromSource` for every node in the graph. Returns a map keyed by source ID. Used to populate the `cascade_impacts` table and to feed system fragility.

Computable from scratch in O(|V|) times the single-source complexity. For our expected graph sizes (~50 nodes, ~100 edges) this is trivial; documented for scalability considerations in the paper.

### 5.6 System fragility

File: `fragility.ts`.

```typescript
export function computeSystemFragility(
  graph: CascadeGraph,
  allPairs: Map<string, SingleSourcePropagation>,
): SystemFragility;
```

Per-node fragility (how sensitive is this node to upstream drift?):

- For each node `n`: `nodeFragility(n) = sum over all sources s of (expectedDriftScore(s -> n))`, assuming unit drift at each source.
- Normalised to `[0, 1]` by dividing by the maximum observed fragility across all nodes.

Global fragility (how reactive is the whole graph?):

- `globalFragilityScore = mean of nodeFragility over all non-source (downstream) nodes`.
- Alternative formulations considered and documented in METHODOLOGY.md: median (too robust, misses tail risk), max (single outlier dominates), weighted mean by node centrality (overfits). Mean is the pragmatic default.

Top upstream drivers:

- For each source `s`: `driverScore(s) = sum over all targets t of expectedDriftScore(s -> t)`.
- Rank sources by `driverScore` descending. The top few are the nodes whose drift cascades most widely. This is what SROs want to watch.

### 5.7 Visualisation helpers

File: `visualise.ts`.

These are pure data transformers for the UI (Prompt 8) to consume. No rendering here.

```typescript
export function toSankeyData(
  propagation: SingleSourcePropagation,
  graph: CascadeGraph,
): { nodes: SankeyNode[]; links: SankeyLink[] };

export function toCytoscapeData(
  graph: CascadeGraph,
  highlight?: { sourceId: string }
): { elements: CytoscapeElement[] };
```

Sankey data is derived from paths, grouped by intermediate level. Cytoscape data is the raw graph with optional highlight metadata for the source node and reachable subgraph.

Neither imports any visualisation library. They produce plain data shapes that Prompt 8 renders.

### 5.8 Public API

```typescript
// packages/intelligence/src/cascade/index.ts

export { buildGraph } from './graph';
export { propagateFromSource, propagateAllPairs } from './propagate';
export { computeSystemFragility } from './fragility';
export { toSankeyData, toCytoscapeData } from './visualise';
export type * from './types';
```

### 5.9 METHODOLOGY.md

Paper-grade. Sections required:

1. **Problem statement.** Why cascade propagation matters. Current state (project management: "linked items" fields are qualitative). The gap: quantified downstream exposure.

2. **Formal definitions.** DAG, edge weight as propagation coefficient, path, path product, cascade impact with saturation, system fragility, node fragility, global fragility. All in LaTeX.

3. **Interpretation of edge weights.** An edge weight `w` means "if the source assumption drifts to value `d`, the target experiences drift `w * d` all else equal." This is a first-order linearisation of a more complex causal relationship; document that higher-order interactions are not modelled. Reference project-management precedent: the notion of sensitivity analysis in Monte Carlo schedule simulation (Hulett, *Practical Schedule Risk Analysis*, Gower, 2009).

4. **Why Bayesian-style propagation, not a simpler dependency matrix?** Because the graph is sparse but deep; matrix operations are inefficient and hide structure. Path enumeration makes intermediate nodes visible, which is what Trace and Cascade views will display. Also, the multiplicative-along-paths-additive-across-paths convention is the standard in directed belief networks (Pearl, *Probabilistic Reasoning in Intelligent Systems*, Morgan Kaufmann, 1988).

5. **Why saturation?** Because drift score is bounded in `[0, 1]` by definition, cumulative drift across many paths must also be bounded. Alternatives considered: logistic compression (smoother, but parameter-dependent); no cap (violates type). Saturation at 1 is the simplest consistent choice; document the approximation.

6. **Why simple paths?** Because the graph is a DAG by construction; any path in a DAG is simple. The algorithm generalises to DCGs with simple-path restriction; noted as future work.

7. **Algorithmic complexity.** O(|V| + |E|) per source (best case, tree); O(|V|^2 + |V||E|) worst case (rich graph). All-pairs: O(|V|^3) worst case. For our scale (|V| ~ 50), trivial. For enterprise scale (|V| ~ 10000), an O(|V|^2) approximation may be needed; documented as future work.

8. **System fragility.** Derivation of per-node and global scores. Sensitivity to graph topology: discuss the edge case of a single high-fan-out source making global fragility dominated by one node. Comparison with existing portfolio-risk fragility metrics.

9. **Assumptions and limitations.**
   - Linearity assumption in propagation (first-order).
   - No modelling of feedback loops (DAG-only).
   - Edge weights are expert-elicited or inferred, not learned from data. The paper should be honest about this: the methodology is sound but calibration is a separate problem.
   - No temporal dynamics: edges fire instantaneously. In practice, cascades take time; this is future work.

10. **Validation approach.**
    - Unit tests on graphs with known analytical answers (chains, trees, single diamond).
    - Property-based tests for invariants.
    - Sanity checks on the HPO cascade: the Economic / Inflation node A039 should be among the top driver nodes, matching domain intuition.

11. **Reproducibility.** Every edge weight in the HPO cascade has a documented rationale (in the `rationale` field of `cascade_links`). Graph construction is deterministic from the database.

12. **References (BibTeX).** Pearl 1988; Hulett 2009; possibly Koller and Friedman, *Probabilistic Graphical Models*, MIT Press, 2009; Darwiche, *Modeling and Reasoning with Bayesian Networks*, Cambridge University Press, 2009.

### 5.10 Tests

Unit and property tests covering:

- **Graph construction.**
  - Empty graph valid.
  - Self-loop rejected.
  - Duplicate edge rejected.
  - Weight out of `[0, 1]` rejected.
  - Cycle rejected with cycle path in error.

- **Single-source propagation on canonical graphs.**
  - Chain A -> B -> C with weights 0.5 and 0.6: impact on C = 0.3; impact on B = 0.5.
  - Diamond A -> B -> D and A -> C -> D with weights all 0.5: impact on D = min(1, 0.25 + 0.25) = 0.5.
  - Saturation: chain with product of path weights exceeding 1 after multiple paths, must cap at 1.
  - Node unreachable from source returns no impact entry.

- **All-pairs propagation.**
  - Size scales as expected.
  - Each source independent.

- **System fragility.**
  - Node fragility non-negative, normalised `[0, 1]`.
  - Global fragility non-negative.
  - Top drivers identified correctly on test graphs.

- **Visualisation helpers.**
  - Sankey output contains expected node and link counts.
  - Cytoscape output contains all nodes and edges.

- **Property-based tests.**
  - For random DAGs of varying size: `propagateAllPairs` never throws.
  - Monotonicity: adding an edge cannot decrease any `expectedDriftScore`.
  - Saturation invariant: every `expectedDriftScore` is in `[0, 1]`.

- **Domain sanity.**
  - Using the HPO cascade links from the database: A039 ranks in the top 3 upstream drivers.
  - Deleting the A039 outgoing edges reduces global fragility by a measurable amount.

Coverage target 95%.

### 5.11 Documentation

- `README.md`, package overview and API reference.
- `METHODOLOGY.md`, as specified in 5.9.
- `EDGE_WEIGHT_RATIONALES.md`, for the HPO cascade specifically: each documented edge, its weight, and its rationale, in table form. Paper appendix.

---

## Out of scope

- Persisting `cascade_impacts` to the database (edge function in Prompt 9 or application layer).
- The UI for cascades (Sankey rendering is Prompt 8).
- Forecast (Prompt 4).
- Confidence scoring (Prompt 6).

---

## Definition of done

- [ ] Package structure matches section 5.1
- [ ] All types defined; no `any`
- [ ] Graph construction validates all required properties
- [ ] Cycle detection works and reports the cycle path
- [ ] Single-source propagation produces correct results on canonical test graphs
- [ ] All-pairs propagation tested at scale up to ~100 nodes without performance issues
- [ ] System fragility computed per spec; top drivers correctly surfaced
- [ ] Visualisation helpers return correct data shapes for Sankey and Cytoscape
- [ ] Domain sanity test on HPO data passes (A039 a top driver)
- [ ] Coverage ≥95%
- [ ] METHODOLOGY.md at journal quality with BibTeX references
- [ ] EDGE_WEIGHT_RATIONALES.md populated for all HPO cascade edges
- [ ] README written
- [ ] CI green
- [ ] PR opened, reviewed against `ARCHITECTURE.md` section 3.5

---

## Self-check before PR

1. Can I explain, in one paragraph, the novel contribution of this module in a way a peer reviewer would find defensible?
2. Have I been honest about limitations (linearity, no feedback, expert-elicited weights)?
3. Does the HPO sanity test (A039 as top driver) actually pass, or did I cherry-pick test graphs that confirm intuition without testing against the real graph?
4. Have I documented the saturation choice and its implications for the paper's interpretation?
5. Is the package pure? No database or network access?

---

*End of Prompt 5. Runs in parallel with Prompts 4 and 6.*
