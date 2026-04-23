/**
 * Colour tokens.
 *
 * Derived from ARCHITECTURE.md section 6.3. Monochrome cream and ink base with a single
 * teal accent and a three-tone colour-blind-safe severity scale. Every value here is
 * verified against WCAG AA contrast on cream backgrounds by
 * `__tests__/colour-contrast.test.ts`. Severity colours are always paired with an icon
 * and a text label; the design system never conveys state via colour alone.
 */
export const colour = {
  paper: {
    cream: '#F7F4EE',
    creamElevated: '#FBF9F4',
    white: '#FFFFFF',
  },
  ink: {
    primary: '#1A1A1A',
    secondary: '#4A4A4A',
    tertiary: '#7A7A7A',
    quaternary: '#B8B8B8',
    inverse: '#F7F4EE',
  },
  accent: {
    teal: '#0E6B6B',
    tealMuted: '#0E6B6B20',
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

export type Colour = typeof colour;
export type SeverityTone = keyof typeof colour.severity;
