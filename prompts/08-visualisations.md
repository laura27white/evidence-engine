# Prompt 8: Visualisations: Horizon Chart, Cascade Graph and Sankey, Trace Timeline

**Runtime:** approximately 4 hours. Can overlap with Prompt 7; best merged after 7's page skeletons are in place.

**Authoritative context:** Read `ARCHITECTURE.md` section 6 (visual design direction) and Prompt 7's view descriptions for context on where each visualisation lives.

---

## Role and mission

You are a senior data-visualisation engineer. This prompt builds the three visualisations that carry Project Trueplan's demo. Each is the centrepiece of its view:

- **HorizonChart** anchors the Horizon view.
- **CascadeGraph** (Cytoscape) and **CascadeSankey** (custom SVG) together anchor the Cascade view.
- **TraceTimeline** anchors the Trace view and is the single most important component in the whole application.

If these are mediocre, the demo falls flat. If they are excellent, everything else becomes support. Prioritise the TraceTimeline.

The aesthetic direction committed to in ARCHITECTURE section 6 is editorial intelligence: serif display, monochrome with teal accent, severity-colour-blind-safe palette, generous negative space. Nothing in these visualisations should look like a generic SaaS chart.

---

## What you are building

### 8.1 Package structure

Visualisations live in `packages/design-system/src/charts/` so they are part of the design system and appear in Storybook.

```
packages/design-system/src/charts/
├── HorizonChart/
│   ├── HorizonChart.tsx
│   ├── HorizonChart.stories.tsx
│   ├── HorizonChart.test.tsx
│   └── helpers.ts
├── CascadeGraph/
│   ├── CascadeGraph.tsx          // Cytoscape
│   ├── CascadeGraph.stories.tsx
│   └── CascadeGraph.test.tsx
├── CascadeSankey/
│   ├── CascadeSankey.tsx         // custom SVG
│   ├── CascadeSankey.stories.tsx
│   ├── CascadeSankey.test.tsx
│   └── helpers.ts
├── TraceTimeline/
│   ├── TraceTimeline.tsx
│   ├── TraceTimeline.stories.tsx
│   ├── TraceTimeline.test.tsx
│   └── helpers.ts
└── shared/
    ├── axes.ts                    // custom axis helpers
    ├── tooltip.tsx                // shared tooltip component
    └── legends.tsx
```

Each chart is a client component (`'use client'`), but exports a server-safe fallback when server-rendered. Fallback is a semantic summary (a `<figure>` with a prose `<figcaption>` describing the data for screen readers and print).

### 8.2 Shared principles

Apply to all three charts:

- **Recharts for the HorizonChart's bar-chart-like layout** and **TraceTimeline's line chart**. Recharts because it's battle-tested, accessible, and Tailwind-friendly. Use `recharts` v2.
- **Cytoscape.js for CascadeGraph.** `cytoscape` + `cytoscape-cose-bilkent` for force layout, plus `cytoscape-popper` for tooltips.
- **Custom SVG for CascadeSankey.** Recharts does not do Sankey well; D3-sankey is bloated. Write our own with `d3-shape` only (2kb), not the full D3.
- **Tokens, always.** Every colour, spacing, font size comes from `packages/design-system/tokens/`. No magic numbers in chart code.
- **Motion respects `prefers-reduced-motion`.** Use Motion's `useReducedMotion` hook and conditionally skip animations.
- **Accessibility first-class.** Every chart has:
  - An `aria-label` summarising the content.
  - A visually-hidden `<figcaption>` with the full data table in text form (populated from the same props the chart uses to render).
  - Keyboard navigation where interactive.
  - Focus indicators meeting WCAG 2.2 AA contrast.
- **Print styles.** Every chart renders meaningfully in black-and-white print. Severity differentiation relies on icons and labels, not colour.

### 8.3 HorizonChart

File: `HorizonChart/HorizonChart.tsx`.

**Purpose.** Display all 47 assumptions as horizontal bars, each positioned by lead time on a shared horizontal axis from today to +365 days. Severity indicated by bar colour and a leading icon.

**Data shape.**

```typescript
interface HorizonDatum {
  assumptionId: string;
  code: string;
  description: string;
  leadTimeDays: number | null;    // null = no breach within horizon
  severity: 'safe' | 'warning' | 'critical';
  breachDate: Date | null;
  confidence: 'HIGH' | 'MODERATE' | 'LOW';
  category: string;
  driftScore: number;             // [0, 1] current drift
}

interface HorizonChartProps {
  data: HorizonDatum[];
  horizonDays?: number;           // default 365
  onSelect?: (assumptionId: string) => void;
  selectedId?: string;
  height?: number;                // default auto based on data length
}
```

**Visual design.**

- Horizontal bars, 24px tall, 8px vertical gap, left-aligned labels.
- Horizontal axis at top, sticky on scroll. Gridlines at 30d, 90d, 180d, 365d. Teal tick labels in mono font, bottom-anchored.
- Bar fill: severity-coloured with 12% alpha; bar stroke at 1px with full severity colour. This gives a layered paper-map feel rather than a solid block of colour.
- Bar length = proportional to lead time. Assumptions with null lead time (no breach within horizon) render as an outlined "safe" bar extending to the right edge with a chevron indicating "beyond horizon."
- At the breach date, a vertical tick with a subtle label "breach" in small mono.
- Confidence indicator: a small dot to the left of each bar, filled for HIGH, half-filled for MODERATE, outlined for LOW. Tooltip explains.
- Row hover: 4% tint band behind the row, teal; cursor pointer if clickable.
- Selected row: 12% tint band + 2px teal left border.

**Interaction.**

- Click a row: invokes `onSelect(assumptionId)`.
- Keyboard: focus trap on the chart, arrow keys move between rows, Enter invokes select.
- Screen reader: each row is an `<a>` or `<button>` with an `aria-label` like "A039 Economic Inflation, lead time 23 days, severity critical, confidence moderate. Activate to open Trace view."

**Motion.**

- Initial render: bars grow from 0 width to their target, staggered 30ms per row. Total under 1.4 seconds.
- Reorder (from sort): bars animate to new positions with 400ms ease-out.
- Skipped entirely under `prefers-reduced-motion`.

**Stories.**

- Default (47 HPO assumptions, realistic distribution).
- All safe, all warning, all critical (visual tests for each colour state).
- Single assumption (minimal dataset).
- 100 assumptions (stress test for performance and readability).
- With selection.
- No data (empty state from design system).

### 8.4 CascadeGraph (Cytoscape)

File: `CascadeGraph/CascadeGraph.tsx`.

**Purpose.** Show the whole assumption dependency graph as a force-directed network, with the option to highlight a single source and its downstream subgraph.

**Data shape.**

Consumes `toCytoscapeData` output from `packages/intelligence/src/cascade/visualise.ts`.

```typescript
interface CascadeGraphProps {
  elements: CytoscapeElement[];
  highlightedSourceId?: string;
  onSelectNode?: (assumptionId: string) => void;
  onHoverNode?: (assumptionId: string | null) => void;
  height?: number;                // default 600
}
```

**Visual design.**

- Nodes: circles, radius 14-32px scaled by `driverScore` (larger = more cascade influence upstream). Fill ink 12% alpha; stroke ink 1px. Label below node in body-small font.
- Edges: curved arrows. Width 1-3px scaled by `propagation_weight`. Colour teal 40% alpha.
- Highlighted source: node stroked in teal 2px with a subtle outer halo.
- Highlighted edges (from source): teal 90% alpha; non-highlighted edges muted to 15% alpha.
- Downstream nodes (reachable from source): fill severity-coloured based on `expectedDriftScore`. Non-reachable nodes: 30% alpha.
- Layout: cose-bilkent force layout with custom tuning for readability on ~50 nodes. Fixed seed so renders are deterministic across page loads.

**Interaction.**

- Hover node: subtle highlight on node and its outgoing edges; invokes `onHoverNode`.
- Click node: navigates or invokes `onSelectNode`.
- Pan and zoom enabled (cytoscape defaults) but not required for default fit.
- Keyboard: tab cycles through nodes in alphabetical order by code; focus ring visible; Enter to select.

**Performance.**

- Layout runs once on mount; does not re-run on hover. A 50-node graph with cose-bilkent is ~200ms; acceptable.
- Uses Cytoscape's web-worker mode if available.

**Stories.**

- Default HPO graph (~50 nodes).
- With highlighted source A039.
- Empty.
- Densely connected (stress test).

### 8.5 CascadeSankey (custom SVG)

File: `CascadeSankey/CascadeSankey.tsx`.

**Purpose.** For a single source, show drift flowing through paths to downstream targets. Sankey conveys flow and magnitude in a way a force-graph does not.

**Data shape.**

Consumes `toSankeyData` from the cascade package.

```typescript
interface SankeyNode {
  id: string;
  code: string;
  level: number;                  // 0 = source, 1 = direct child, ...
  totalDrift: number;             // expectedDriftScore into this node
}

interface SankeyLink {
  sourceId: string;
  targetId: string;
  value: number;                  // pathProduct * sourceDrift
  pathDescription: string;        // e.g. "A039 → A015 via weight 0.8"
}

interface CascadeSankeyProps {
  nodes: SankeyNode[];
  links: SankeyLink[];
  height?: number;                // default 480
  onHoverLink?: (link: SankeyLink | null) => void;
}
```

**Layout algorithm.**

- Nodes are positioned in horizontal columns by `level`.
- Within each level, nodes stacked vertically with height proportional to `totalDrift`.
- Links are cubic Bézier curves from source right-edge to target left-edge, width proportional to `value`.
- Use `d3-shape`'s `linkHorizontal()` generator for the curves; everything else is custom.

**Visual design.**

- Nodes: cream-filled rectangles, 16px wide, ink 1px stroke. Label beside node in body-small with monospace code + description.
- Links: teal fill with 30% alpha. On hover: that link goes to 80% alpha; others fade to 10%.
- Severity encoded on the target node's label (not the link), via a small severity badge to its right.
- Flow direction: left-to-right, source on the left.

**Interaction.**

- Hover link: highlights flow, shows tooltip with the `pathDescription` and the numeric `value` rounded to 3 decimals.
- Click link: no-op by default; reserved for future use.
- Keyboard navigation: tab cycles through links in order of value descending.

**Accessibility.**

- Prose fallback in `<figcaption>`: "Drift from A039 Inflation flows to 12 downstream assumptions, most strongly to A015 (0.42), A027 (0.28), ..."
- Every link has an `aria-label`.

**Stories.**

- Default: A039 single-source focus with ~12 downstream.
- Simple chain (test layout).
- Highly branched (test readability).
- Empty.

### 8.6 TraceTimeline: the hero

File: `TraceTimeline/TraceTimeline.tsx`.

**Purpose.** Show a single assumption's story: baseline, measurements over time, forecast cone, breach date, tolerance band. This is the component judges remember. Spend proportionate time on it.

**Data shape.**

```typescript
interface TraceTimelineProps {
  assumption: {
    code: string;
    description: string;
    baselineValue: number;
    baselineUnit: string;
    tolerancePct: number;
    dateLogged: Date;
  };
  measurements: Array<{
    measuredAt: Date;
    observedValue: number;
    source: 'EXTERNAL_API' | 'MANUAL' | 'SYSTEM_DERIVED';
    sourceUrl?: string;
  }>;
  leadingIndicators?: Array<{
    label: string;                 // e.g. "Services CPI (D7NN)"
    seriesId: string;
    unit: string;                  // may differ from primary unit
    points: Array<{
      measuredAt: Date;
      observedValue: number;
      sourceUrl?: string;
    }>;
  }>;
  forecast: {
    projected30d: number;
    projected90d: number;
    projected365d: number;
    breachDate: Date | null;
    confidenceIntervalLower: number[];   // per horizon day
    confidenceIntervalUpper: number[];
    computedAt: Date;
  } | null;
  retrievedAt: Date;               // most recent fetch timestamp, for the "seconds ago" line
  now?: Date;                       // for testing
  height?: number;                  // default 480
  onHoverMeasurement?: (index: number | null) => void;
}
```

**Visual design.**

The chart has seven visual layers, composed bottom to top:

1. **Tolerance band.** A faint ink band from `baseline * (1 - tolerance)` to `baseline * (1 + tolerance)`. 4% alpha. Indicates the "no breach" zone.
2. **Baseline line.** Horizontal ink line at `baselineValue`. 1px solid. Labelled "baseline" at the right edge in small mono.
3. **Leading indicator lines.** One thin dashed line per entry in `leadingIndicators`, muted (ink at 35% alpha), labelled at the right edge. Leading indicators share the primary chart's x-axis but may need a secondary y-axis if units differ materially (configurable per indicator; default is to render on the primary axis if units are compatible, e.g. both are percentages). These lines are deliberately visually subordinate to the measurement line, which is the primary signal.
4. **Measurement scatter + line.** Points for each measurement, connected by a thin ink line. Points are 4px circles; external-API-sourced points filled ink; manual and synthetic points outlined only, to encode provenance visually. This is the dominant visual element.
5. **Historical annotation band.** A pale cream band behind the measurement region (from `dateLogged` to `now`), subtly distinguishing "what we know" from "what we forecast."
6. **Forecast cone.** From `now` to `now + 365d`, a teal polygon from confidence-interval-lower to confidence-interval-upper. 20% alpha. A dashed teal line through the median forecast inside the cone.
7. **Breach annotation.** If `breachDate` is set, a vertical crimson line at the breach date with a pill label "Projected breach: {date}, {leadTime}d" in small mono.

A small legend panel in the top-right lists the primary measurement, each leading indicator, and the forecast cone with their visual treatments, so the reader can match line to label without hover.

Axes:

- Horizontal: time axis. Labels in mono, spanning from `dateLogged` to 365 days from `now`. A vertical ink hairline at `now` marks the boundary between observed and forecast.
- Vertical: value axis. Labels in mono with units from `baselineUnit`. Grid lines at major ticks, hairline weight.

Typography:

- Title of the chart (above axes): serif display-small with the assumption description.
- Subtitle: "Baseline {value} {unit} logged {date}".
- Bottom-right corner: "Retrieved {retrievedAt, formatted as seconds-ago}" live-updating.
- Forecast panel label: "FORECAST" in uppercase label-scale at the top of the cone region.

**The live timestamp.**

This is a key detail. The retrievedAt timestamp updates every second (using `useEffect` + `setInterval`, skipped under reduced motion). Format: "Retrieved 14 seconds ago" → "15 seconds ago" → ... . On hover, a tooltip shows the absolute time ("2026-04-22 15:42:37 UTC"). This is what turns the Trace view from "a chart" into "a live instrument" in the judges' eyes. Build it carefully.

**Interaction.**

- Hover a measurement point: tooltip with full provenance (value, source, URL, timestamp). If sourceUrl exists, the tooltip includes a "View source" link.
- Hover within the forecast cone: tooltip with the projected value and CI bounds at that date.
- Hover the breach pill: tooltip with the full forecast summary.
- Keyboard: tab cycles through measurements in chronological order; Enter opens the source if available.

**Motion.**

- On mount: measurements fade in from 0 opacity over 300ms.
- Forecast cone: draws from left to right over 600ms, 200ms delay after measurements.
- Breach annotation: fades in last, 400ms after cone completes.
- Total intro sequence under 1.2 seconds.
- All skipped under reduced motion.

**Print styles.**

- The chart prints in full. Forecast cone becomes a hatched pattern rather than a fill. Retrievedat timestamp prints as absolute time. Sources are footnoted inline.

**Stories.**

- Default (A039, real data, with leading indicators: Services CPI and PPI).
- No forecast yet (insufficient measurements).
- Critical breach already past (retrospective view).
- Safe, no breach in horizon.
- Wide confidence interval (ensemble disagreement).
- Narrow confidence interval (high agreement).
- Mixed provenance (some external, some manual, some synthetic).
- With leading indicators disagreeing with primary (e.g. services CPI rising while headline CPI flat).
- Without leading indicators (fallback rendering when none provided).

### 8.7 Tests

- **Snapshot tests** via Storybook + Chromatic for every story. Visual regression caught automatically.
- **Unit tests** for the helper functions (`helpers.ts` in each chart directory).
- **Accessibility tests** with `@axe-core/react` on every story.
- **Keyboard interaction tests** with Testing Library: focus, arrow-key navigation, Enter activation.
- **Performance tests.** Render HorizonChart with 200 assumptions, assert initial render <200ms. Render TraceTimeline with 365 measurements, assert <150ms.
- **Screen-reader output tests.** Assert the `<figcaption>` contains the key data points in prose.

Coverage target 80% (charts are dominated by rendering code that's hard to unit-test; visual regression does most of the work).

### 8.8 Documentation

- `packages/design-system/src/charts/README.md`, overview of the four charts, when to use each, how to extend.
- Per-chart Storybook docs page with anatomy diagram and accessibility notes.

---

## Out of scope

- The views themselves (Prompt 7 built the page skeletons; this prompt slots into them).
- The Brief view's rendering (Prompt 9).
- The intelligence layer (Prompts 4-6).

---

## Definition of done

- [ ] Four charts built in `packages/design-system/src/charts/`
- [ ] All charts consume tokens from design system; no magic numbers
- [ ] HorizonChart renders 47-assumption dataset in <200ms, sorts correctly, navigates on click
- [ ] CascadeGraph renders force-directed network with deterministic layout, highlights source correctly
- [ ] CascadeSankey renders flow layout with correct proportions, tooltips on hover
- [ ] TraceTimeline renders baseline, tolerance band, measurements, forecast cone, breach annotation, and live retrievedAt timestamp
- [ ] Every chart has a server-safe fallback with prose `<figcaption>`
- [ ] Every chart passes axe-core with zero violations
- [ ] Keyboard navigation works end-to-end on all interactive charts
- [ ] All charts render correctly in print view (verified manually; noted in PR)
- [ ] Motion respects `prefers-reduced-motion`
- [ ] Storybook contains all required stories
- [ ] Chromatic visual regression passing
- [ ] Unit and performance tests pass in CI
- [ ] Charts integrate with Prompt 7's page skeletons and produce the expected visual in each view
- [ ] PR opened, reviewed against `ARCHITECTURE.md` section 6

---

## Self-check before PR

1. Does the TraceTimeline create the "demo moment" described in ARCHITECTURE section 6? Load it with A039's real ONS data and judge for yourself. If it doesn't feel like a live instrument, iterate before opening the PR.
2. Is the retrievedAt timestamp genuinely live and trustworthy during a demo? Validate: load the page, wait 30 seconds, timestamp should read "30 seconds ago" or thereabouts.
3. Are the three severity colours distinguishable without colour vision? Test with a simulator; pair every severity with an icon and a text label.
4. Is every chart genuinely informative in black-and-white print? Print each one and hold it at arm's length.
5. Does the Sankey look handmade-editorial, or does it look like a default D3 example? If the latter, restyle.
6. If a judge says "can I click the chart?" on every chart, do they get meaningful interaction, or a no-op?

---

*End of Prompt 8. Sequential with Prompt 7.*
