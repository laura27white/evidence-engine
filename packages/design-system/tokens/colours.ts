/**
 * Legacy colours re-export.
 *
 * Prompt 0 shipped a minimal `colours` token under this filename. Prompt 2 moves the
 * authoritative tokens to `./colour` with an expanded palette. This module keeps the
 * original identifier exported so `apps/web/tailwind.config.ts` and any other consumer
 * wired during Prompt 0 continues to work until they migrate to the new names.
 */
import { colour } from './colour';

export const colours = {
  background: {
    cream: colour.paper.cream,
    paper: colour.paper.white,
  },
  ink: {
    DEFAULT: colour.ink.primary,
    muted: colour.ink.secondary,
    subtle: colour.ink.tertiary,
    faint: colour.ink.quaternary,
  },
  accent: {
    teal: colour.accent.teal,
    tealHover: colour.accent.tealDeep,
    tealSubtle: colour.accent.tealMuted,
  },
  severity: {
    safe: colour.severity.safe,
    warning: colour.severity.warning,
    critical: colour.severity.critical,
  },
  rule: {
    hairline: colour.line.hairline,
    solid: colour.line.regular,
  },
} as const;

export type Colours = typeof colours;
