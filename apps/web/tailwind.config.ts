import { colour } from '../../packages/design-system/tokens/colour';
import { space } from '../../packages/design-system/tokens/space';
import { typography } from '../../packages/design-system/tokens/typography';

import type { Config } from 'tailwindcss';

type FontSizeEntry = [string, { lineHeight: string; letterSpacing: string; fontWeight: number }];

const fontSize = Object.fromEntries(
  Object.entries(typography.scale).map(([key, v]): [string, FontSizeEntry] => [
    key,
    [v.size, { lineHeight: v.lineHeight, letterSpacing: v.tracking, fontWeight: v.weight }],
  ]),
);

const config: Config = {
  content: [
    './app/**/*.{ts,tsx,mdx}',
    './components/**/*.{ts,tsx,mdx}',
    './lib/**/*.{ts,tsx}',
    '../../packages/design-system/src/**/*.{ts,tsx}',
    '../../packages/design-system/tokens/**/*.ts',
  ],
  theme: {
    extend: {
      colors: {
        cream: colour.paper.cream,
        'cream-elevated': colour.paper.creamElevated,
        paper: colour.paper.white,
        ink: {
          DEFAULT: colour.ink.primary,
          primary: colour.ink.primary,
          secondary: colour.ink.secondary,
          tertiary: colour.ink.tertiary,
          quaternary: colour.ink.quaternary,
          inverse: colour.ink.inverse,
          muted: colour.ink.secondary,
          subtle: colour.ink.tertiary,
          faint: colour.ink.quaternary,
        },
        accent: {
          teal: colour.accent.teal,
          'teal-hover': colour.accent.tealDeep,
          'teal-deep': colour.accent.tealDeep,
          'teal-muted': colour.accent.tealMuted,
          'teal-subtle': colour.accent.tealMuted,
        },
        severity: {
          safe: colour.severity.safe,
          'safe-soft': colour.severity.safeSoft,
          warning: colour.severity.warning,
          'warning-soft': colour.severity.warningSoft,
          critical: colour.severity.critical,
          'critical-soft': colour.severity.criticalSoft,
        },
        line: {
          hairline: colour.line.hairline,
          regular: colour.line.regular,
          strong: colour.line.strong,
        },
        rule: {
          hairline: colour.line.hairline,
          solid: colour.line.regular,
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Source Serif 4', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'IBM Plex Sans', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'Consolas', 'monospace'],
      },
      fontSize: {
        ...fontSize,
        'display-xl': ['72px', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-lg': ['56px', { lineHeight: '1.1', letterSpacing: '-0.015em' }],
        'display-md': ['40px', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
      },
      spacing: space.scale,
      borderRadius: {
        none: '0px',
        sm: space.radius.sm,
        md: space.radius.md,
        full: space.radius.full,
      },
      boxShadow: {
        hairline: space.shadow.hairline,
        soft: space.shadow.soft,
      },
      maxWidth: {
        prose: '65ch',
        reading: '72ch',
        container: space.container.maxWidth,
      },
    },
  },
  plugins: [],
};

export default config;
