# Prompt 2: Design System, Tokens, Component Library, Storybook

**Runtime:** approximately 2 hours. Runs in parallel with Prompts 1 and 3 against the merged output of Prompt 0.

**Prerequisite:** Prompt 0 merged to main. Repo cloned. Architecture doc at root.

**Authoritative context:** Read `ARCHITECTURE.md` section 6 (visual design direction) in full before doing anything. This prompt operationalises that section. If I've said something here that contradicts section 6, section 6 wins.

---

## Role and mission

You are a senior design engineer. Your job is to build Project Trueplan's design system: tokens, components, typography, Storybook, visual regression with Chromatic, and the aesthetic execution of the "editorial intelligence" direction committed to in the architecture doc.

Judges will see this product once, for three minutes. The visual impression in the first five seconds determines whether they pay attention to anything else Laura says. Your work decides that first impression. Do not produce generic AI-dashboard aesthetics; the design doc has been explicit about this.

This is not a prompt for rushing. Every decision is intentional.

---

## What you are building

### 2.1 Storybook setup

You bootstrapped empty Storybook in Prompt 0. Now fill it in.

- Configure `packages/design-system/.storybook/` with:
  - `main.ts` with `@storybook/nextjs`, essential addons (controls, actions, viewport, a11y, backgrounds, measure).
  - `preview.tsx` that wires up fonts, the Tailwind CSS, a background selector (cream / ink / white), and a global a11y addon check.
- Story locations: `packages/design-system/src/**/*.stories.tsx`.
- Storybook build published to GitHub Pages (or Chromatic's own URL, more on this below) on every PR.

### 2.2 Chromatic for visual regression

- Install `@chromatic-com/storybook`.
- Configure Chromatic to run on every PR against the `design-system` package.
- The `CHROMATIC_PROJECT_TOKEN` is optional; if unset, the CI job skips with a warning rather than failing (the repo is private, so Chromatic's free tier on private repos is capped at 5,000 snapshots/month which is plenty for us but not essential for MVP functionality).
- Document the Chromatic setup in `packages/design-system/CHROMATIC.md`.

### 2.3 Design tokens

Tokens live in `packages/design-system/tokens/`. Three files:

#### `colour.ts`

```typescript
export const colour = {
  paper: {
    cream: '#F7F4EE',       // background
    creamElevated: '#FBF9F4', // cards on cream
    white: '#FFFFFF',        // printable, paper-like backgrounds
  },
  ink: {
    primary: '#1A1A1A',
    secondary: '#4A4A4A',
    tertiary: '#7A7A7A',
    quaternary: '#B8B8B8',
    inverse: '#F7F4EE',      // ink on dark surfaces
  },
  accent: {
    teal: '#0E6B6B',
    tealMuted: '#0E6B6B20', // 12.5% alpha for hovers
    tealDeep: '#094949',
  },
  severity: {
    safe: '#6B8E7F',
    safeSoft: '#6B8E7F18',
    warning: '#D97534',
    warningSoft: '#D9753418',
    critical: '#B3261E',
    criticalSoft: '#B3261E18',
  },
  line: {
    hairline: '#E6E1D8',
    regular: '#D3CDC2',
    strong: '#4A4A4A',
  },
} as const;
```

Every colour here must be verified against:
- WCAG AA contrast when used on `paper.cream`: all text colours must score ≥ 4.5:1 for body, ≥ 3:1 for large text.
- Oracle/deuteranopia/protanopia/tritanopia simulator: severity trio must be distinguishable without colour alone. Pair severity with icons (check-circle, triangle, x-circle) and labels at all times.

Write a test in `packages/design-system/__tests__/colour-contrast.test.ts` that asserts the above using `wcag-contrast` library.

#### `typography.ts`

```typescript
export const typography = {
  font: {
    display: 'var(--font-display)',    // Source Serif 4
    body: 'var(--font-body)',           // IBM Plex Sans
    mono: 'var(--font-mono)',           // JetBrains Mono
  },
  scale: {
    // Display (editorial serif, used sparingly)
    displayMax: { size: '72px', lineHeight: '76px', tracking: '-0.02em', weight: 500 },
    displayLarge: { size: '56px', lineHeight: '60px', tracking: '-0.02em', weight: 500 },
    displayMedium: { size: '40px', lineHeight: '44px', tracking: '-0.015em', weight: 500 },
    displaySmall: { size: '28px', lineHeight: '32px', tracking: '-0.01em', weight: 500 },
    // Body (sans, dense, readable)
    bodyLarge: { size: '17px', lineHeight: '26px', tracking: '0', weight: 400 },
    body: { size: '15px', lineHeight: '22px', tracking: '0', weight: 400 },
    bodySmall: { size: '13px', lineHeight: '18px', tracking: '0.005em', weight: 400 },
    label: { size: '12px', lineHeight: '16px', tracking: '0.05em', weight: 500, textTransform: 'uppercase' },
    // Mono (data, timestamps, codes)
    monoLarge: { size: '15px', lineHeight: '20px', tracking: '0', weight: 400 },
    mono: { size: '13px', lineHeight: '18px', tracking: '0', weight: 400 },
    monoSmall: { size: '11px', lineHeight: '14px', tracking: '0', weight: 400 },
  },
} as const;
```

Font loading via `next/font/google` in `apps/web/app/layout.tsx`:
```typescript
import { Source_Serif_4, IBM_Plex_Sans, JetBrains_Mono } from 'next/font/google';

const display = Source_Serif_4({ subsets: ['latin'], variable: '--font-display', weight: ['400','500','600'] });
const body = IBM_Plex_Sans({ subsets: ['latin'], variable: '--font-body', weight: ['300','400','500','600'] });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['400','500'] });
```

Apply via `className={`${display.variable} ${body.variable} ${mono.variable}`}` on `<html>`.

#### `space.ts`

```typescript
export const space = {
  // 4-point base grid
  unit: 4,
  scale: {
    '0': '0',
    '1': '4px',
    '2': '8px',
    '3': '12px',
    '4': '16px',
    '5': '20px',
    '6': '24px',
    '8': '32px',
    '10': '40px',
    '12': '48px',
    '16': '64px',
    '20': '80px',    // standard gutter
    '24': '96px',
    '32': '128px',
    '40': '160px',
  },
  container: {
    maxWidth: '1440px',
    columns: 12,
    gutter: '80px',   // desktop
    gutterTablet: '32px',
    margin: '80px',   // edge margin desktop
  },
} as const;
```

#### Tailwind integration

Extend `tailwind.config.ts` to consume these tokens. Do not use Tailwind's default palette; override `colors`, `fontSize`, `fontFamily`, `spacing`. Document in `packages/design-system/TOKENS.md` why we override rather than extend.

### 2.4 Core components

Each component has: implementation, Storybook story with at least three variant states, unit tests for behaviour, axe-core test for accessibility. Located at `packages/design-system/src/components/`.

Build in this order:

1. **Text**: typographic primitive. Props: `variant` (displayMax, displayLarge, …, monoSmall), `as` (html element), `tone` (primary, secondary, tertiary, inverse), `children`. Renders a semantic element with the right token styles.

2. **Button**: primary, secondary, ghost. States: default, hover, focus, active, disabled, loading. Focus ring uses accent teal at 3px offset, visible and AAA-compliant. Keyboard support tested.

3. **Badge**: severity variants (safe, warning, critical) with icon + label. Size sm/md. Never colour-only; always an icon and text.

4. **Card**: `paper` background, hairline border, radius-sm, subtle shadow. Variants: default, elevated (for hover), outlined, no-shadow. Padding slots.

5. **SeverityIndicator**: a pill showing drift severity. Combines badge + a short numeric or textual value. Three variants in severity.

6. **Timestamp**: renders a relative time ("14 seconds ago") with absolute time in a tooltip. Uses mono font. Updates live if the page is visible.

7. **SourceLink**: an inline component showing a source label + external link icon; on click, opens the source URL in a new tab. Accessible label mentions destination.

8. **KPI**: a number display. Large display-size value, small uppercase label above. Optional trend indicator (up arrow green, down arrow red, flat grey). Optional confidence interval shown in small mono text below.

9. **DataTable**: a minimal, density-dense table styled for editorial data display. Sticky header. Row hover. Sortable columns via headers. Keyboard navigable (arrow keys). ARIA grid role. Variants for number, text, badge, timestamp cells. This is used in the Horizon view so the table must be excellent.

10. **HorizonBar**: the bespoke visualisation primitive. A horizontal bar representing time from today → 12 months out. Inside the bar, a smaller coloured segment indicates current drift position; a dashed extension shows the forecast cone; a vertical tick marks the projected breach date. Accessible text alternative describes the data in full prose. Used repeatedly in the Horizon view, one per assumption.

11. **SankeyNode** and **SankeyEdge**: custom SVG primitives that will compose into the Cascade view. Defer full Sankey diagram to Prompt 8; in this prompt build only the node and edge primitives.

12. **Chrome / AppShell**: top navigation bar, main content area, footer. Not a single component but a layout. Uses semantic `<header>`, `<main>`, `<footer>`. Skip-to-content link. Document title management. Breadcrumbs slot. The nav items are Horizon, Cascade, Trace, Brief. Active state on current route.

13. **PageHeader**: editorial page header: display-size serif title, body-size kicker above, body-size subtitle below. Optional meta row (time range, filter chips, data source). Generous padding. Always rendered at the top of a page, anchoring the eye.

14. **EmptyState**: when a view has no data. Should feel intentional, not broken. Serif display heading, body explanation, optional action button.

15. **LoadingState**: skeleton shimmer for major surfaces. Not a spinner. Respects `prefers-reduced-motion`.

16. **ErrorState**: an error surface with a heading, message, and action. Uses warning severity colour. Never crimson, which is reserved for critical drift.

### 2.5 Accessibility baseline

Every component:

- Passes `@axe-core/playwright` smoke test with zero violations.
- Has full keyboard support; focus traps where appropriate.
- Uses semantic HTML before ARIA; ARIA only when necessary.
- Supports `prefers-reduced-motion`.
- Works at 200% browser zoom without horizontal scroll or content clipping.
- Colour contrast checked in tests (see 2.3).
- Touch targets ≥ 44x44px on tablet.

Storybook's a11y addon must show zero violations on every story.

### 2.6 Icons

Use Lucide React. Icons are semantic; never decorative. When decorative, mark `aria-hidden`. When semantic, pair with a label. Don't build a custom icon set.

Extend Lucide with two domain-specific icons if needed (drift direction arrows, cascade node), these live in `packages/design-system/src/icons/`.

### 2.7 Motion

Animations use Motion (formerly Framer Motion). A small set of primitives:

- **StaggerFade**: staggered fade-in for lists (80ms per item).
- **ChartTransition**: 250ms ease-out transition for chart state changes.
- **PageTransition**: minimal crossfade on route change.

No bouncy springs. No wobble. Editorial restraint.

Respect `prefers-reduced-motion`: all of the above reduce to opacity-only or no animation.

### 2.8 Brand marks

Project Trueplan needs a wordmark. A simple typographic mark is sufficient:

- **Full wordmark:** "PROJECT TRUEPLAN" set in Source Serif 4 Small Caps, weight 500, letter-spacing 0.12em, kerned by hand if necessary.
- **Mark-only variant:** "PT" monogram, same font, for favicon and tight spaces.
- **Colour variants:** ink on cream (primary), inverse (cream on ink), accent (teal on cream, rare).

Render the wordmark as an SVG React component at `packages/design-system/src/brand/Wordmark.tsx` so it scales cleanly and doesn't depend on font loading timing.

Favicon: the "PT" monogram, 32x32 SVG, both light and dark variants for system themes.

### 2.9 Storybook MDX docs

For each token file and each component, write a Storybook docs page:

- **Tokens/Colour**: swatches, contrast ratios, severity usage guide, accessibility notes.
- **Tokens/Typography**: specimen of every scale size, font-loading info.
- **Tokens/Space**: spacing scale visualiser, grid overlay.
- **Foundations/Motion**: principles, examples, reduced-motion note.
- **Foundations/Iconography**: usage principles, pair-with-label rule.
- **Components/[Name]**: overview, variants, anatomy, accessibility, examples.

The Storybook should feel like a polished design-system microsite, not like a developer test-bed. Judges may look at it.

### 2.10 Style lint

Configure Stylelint to enforce:

- No arbitrary colour values (all colours via tokens).
- No arbitrary font-size values (all sizes via scale).
- No em dashes (repeat enforcement from Prompt 0's ESLint rule at the CSS layer just in case).
- No `!important` without a CSS-level comment explaining why.

Add a `pnpm stylelint` script; integrate into CI.

---

## Out of scope for this prompt

- The four dashboard views (Prompt 7)
- The visualisations themselves (Horizon chart, Cascade Sankey, Trace timeline, Prompt 8)
- Any data or API integration (Prompts 1, 3)
- Any intelligence computation (Prompts 4, 5, 6)

---

## Definition of done

- [ ] Storybook runs locally via `pnpm storybook` and on CI
- [ ] Chromatic configured and running on PRs (optional but wired)
- [ ] Token files exist, consumed by Tailwind, documented in Storybook
- [ ] Colour contrast test passes for every token used on cream background
- [ ] Fonts load from `next/font/google`; no FOUC; Storybook and the Next app both render correctly
- [ ] All 16 components built, with stories, tests, and axe-core coverage
- [ ] Storybook a11y addon shows zero violations across all stories
- [ ] Lighthouse accessibility score on the Storybook docs site ≥ 95
- [ ] Wordmark renders as SVG component, favicon wired in the Next app
- [ ] Motion primitives respect `prefers-reduced-motion`
- [ ] Stylelint running in CI with the rules in 2.10
- [ ] Component docs (MDX) written for every component
- [ ] PR opened with clear description, all CI green, reviewed against `ARCHITECTURE.md` section 6
- [ ] A single screenshot of Storybook's component list attached to the PR description, for human-eye review

---

## Self-check before PR

Answer in the PR description:

1. Does this look like editorial intelligence, or does it look like another generic dashboard? If the latter, rework until the former.
2. Would a design-literate judge who sees the Storybook microsite form a positive impression of the product before seeing the app itself?
3. Is every component accessible via keyboard alone, tested?
4. Have I imposed any arbitrary design choice that a senior designer would immediately undo?
5. Does the type lockup (serif display + sans body) feel cohesive or pasted together?
6. Have I ensured the severity palette works for colour-blind users, with icons and labels always paired?

---

*End of Prompt 2. Runs in parallel with Prompts 1 and 3.*
