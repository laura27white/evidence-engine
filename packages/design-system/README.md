# @tp/design-system

Tokens, primitives, motion, brand, and Storybook catalogue for Project Trueplan.

Authoritative design direction: `ARCHITECTURE.md` section 6. See [TOKENS.md](./TOKENS.md) for the token model, [CHROMATIC.md](./CHROMATIC.md) for visual regression, and open the Storybook (`pnpm storybook`) for the interactive catalogue.

## Contents

```
packages/design-system
├── tokens/
│   ├── colour.ts       # paper, ink, accent, severity, line
│   ├── typography.ts   # display / body / mono stacks, 11-step scale
│   └── space.ts        # 4-point grid, container, radius, shadow
├── src/
│   ├── brand/          # Wordmark, Monogram SVG components
│   ├── components/     # 16 primitives
│   ├── motion/         # StaggerFade, ChartTransition, PageTransition
│   ├── icons/          # Lucide re-exports + DriftArrow + CascadeNode
│   └── foundations/    # shared style helpers + MDX pages
├── __tests__/          # colour-contrast and component unit tests
├── .storybook/         # Storybook 8 + Chromatic addon config
├── README.md
├── TOKENS.md
└── CHROMATIC.md
```

## Install

The package lives inside the monorepo and is installed by the root `pnpm install`. Downstream packages import via the workspace alias:

```ts
import { Button, KPI, PageHeader, colour, StaggerFade, Wordmark } from '@tp/design-system';
```

Tokens are also exposed as their own sub-path:

```ts
import { colour, typography, space } from '@tp/design-system/tokens';
```

## Develop

```bash
pnpm --filter @tp/design-system storybook           # dev server on :6006
pnpm --filter @tp/design-system build-storybook     # static build
pnpm --filter @tp/design-system test                # vitest + testing-library
pnpm --filter @tp/design-system test:coverage       # with v8 coverage
pnpm --filter @tp/design-system stylelint           # CSS discipline
pnpm --filter @tp/design-system chromatic           # needs CHROMATIC_PROJECT_TOKEN
```

## The 16 components

| Component                   | Purpose                                                |
| --------------------------- | ------------------------------------------------------ |
| `Text`                      | Typographic primitive with variant, as, tone, truncate |
| `Button`                    | Primary, secondary, ghost; all states; focus ring      |
| `Badge`                     | Severity tone with icon and label                      |
| `Card`                      | Paper surface, four variants                           |
| `SeverityIndicator`         | Drift-severity pill (icon, value, label)               |
| `Timestamp`                 | Relative time, absolute tooltip, live updates          |
| `SourceLink`                | Inline source label with external link                 |
| `KPI`                       | Big number, label, trend, confidence interval          |
| `DataTable`                 | Dense editorial grid, sortable headers, ARIA grid      |
| `HorizonBar`                | 12-month horizon bar with drift and forecast           |
| `SankeyNode` / `SankeyEdge` | SVG primitives for the Cascade view                    |
| `AppShell`                  | Header, main, footer, skip link, active route          |
| `PageHeader`                | Editorial title, kicker, subtitle, meta, actions       |
| `EmptyState`                | Intentional no-data surface                            |
| `LoadingState`              | Skeleton shimmer, reduced-motion aware                 |
| `ErrorState`                | Warning-tone error, collapsed technical detail         |

## Accessibility

- All components render semantic HTML and have been exercised by unit tests via Testing Library role queries.
- The `@storybook/addon-a11y` addon scans every story in the Storybook UI.
- A dedicated colour-contrast test asserts every token colour on cream meets WCAG AA body (4.5:1) or large-text (3:1) thresholds.
- Keyboard: tables support arrow-key navigation via the ARIA grid role; buttons show a 3px accent-teal focus ring; the AppShell provides a visible skip-to-content link.
- All motion primitives honour `prefers-reduced-motion` via `useReducedMotion()`.

## Deferred

The 16 components ship but two visualisations are scaffolded primitives only:

- **HorizonBar** is the production-ready primitive. The actual per-assumption Horizon cards that compose it live in `apps/web` once Prompt 7 lands.
- **SankeyNode** and **SankeyEdge** are SVG primitives. The full Cascade view composition (layout algorithm, node placement, interactions) is Prompt 8.

This is explicit in the Prompt 2 spec (`prompts/02-design-system.md`).
