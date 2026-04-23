# Design tokens

Three token files live in `packages/design-system/tokens/`. They are the source of truth for every colour, type size, and spacing step in the product. The Tailwind config at `apps/web/tailwind.config.ts` consumes them directly; components in this package consume them via inline styles so they work without a Tailwind dependency and render identically inside Storybook.

## Why we override Tailwind rather than extend

Tailwind's default palette (`slate`, `emerald`, `violet`, etc.) is generic; using it would dilute the editorial direction. The `apps/web/tailwind.config.ts` therefore replaces the default palette, `fontSize`, `fontFamily`, and `spacing` rather than extending them. This means:

- A developer writing `text-red-500` in a JSX file gets no output at all. That is by design: red is not in our palette. If they need critical severity, they use `text-severity-critical`, which comes from the tokens.
- A developer writing `p-7` (which would be 28px in default Tailwind) gets no output. The spacing scale is the 4-point grid we published; arbitrary multiples are not available.
- The mistake surface drops to zero: no "I used `#F00` because I could not find the token".

Stylelint enforces the same discipline at the CSS layer: `color-no-hex` bans hex literals in committed CSS, pushing authors to reach for the token.

## Consuming tokens

### From a component file (inline-style path)

```tsx
import { colour, space, typography } from '@tp/design-system/tokens';

function Example() {
  return <div style={{ background: colour.paper.cream, padding: space.scale['6'] }}>...</div>;
}
```

### From Tailwind (app-level path)

```tsx
<div className="bg-cream p-6 text-ink">...</div>
<p className="text-accent-teal">Tier 1 anchored</p>
<p className="text-severity-warning">Warning: drift 0.8</p>
```

## Adding a token

1. Add the value to the right file (`colour.ts`, `typography.ts`, or `space.ts`), preserving the `as const` assertion.
2. Update the corresponding story in `tokens/*.stories.tsx` so reviewers can see it.
3. If it is a colour, add the colour-contrast assertions to `__tests__/colour-contrast.test.ts`.
4. If the consumer is Tailwind, surface it in `apps/web/tailwind.config.ts` under the matching extend key.

## Why some tokens are duplicated under legacy names

`tokens/colours.ts` keeps the original Prompt 0 shape (with British-English pluralisation and a different nesting) so Tailwind configs wired up before Prompt 2 continue to work during migration. New code should import from `./colour` (singular).
