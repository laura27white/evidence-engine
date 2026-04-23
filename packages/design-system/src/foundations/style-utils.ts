/**
 * Shared style helpers. Returns plain CSS style objects keyed against the token files so
 * components can be authored without a Tailwind dependency (useful for consumers that do
 * not ship Tailwind and for Storybook, which runs without it).
 */

import { colour } from '../../tokens/colour';
import { space } from '../../tokens/space';
import { typography, type TypographyScale } from '../../tokens/typography';

import type { CSSProperties } from 'react';

export function scaleStyle(variant: TypographyScale): CSSProperties {
  const scale = typography.scale[variant];
  const style: CSSProperties = {
    fontSize: scale.size,
    lineHeight: scale.lineHeight,
    letterSpacing: scale.tracking,
    fontWeight: scale.weight,
  };
  if ('textTransform' in scale) {
    style.textTransform = scale.textTransform;
  }
  return style;
}

export function focusRingStyle(): CSSProperties {
  return {
    outline: `3px solid ${colour.accent.teal}`,
    outlineOffset: '2px',
  };
}

export const fontFamily = typography.font;
export const tokens = { colour, typography, space };
