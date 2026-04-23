/**
 * Sankey primitives: SankeyNode and SankeyEdge.
 *
 * The full Sankey composition belongs to Prompt 8. This module exposes the two SVG
 * primitives the Cascade view will combine: a labelled node rectangle and a curved
 * edge whose thickness encodes the propagation weight. Each primitive accepts raw
 * coordinates; the layout algorithm is deferred to Prompt 8.
 */
import { forwardRef, type SVGAttributes } from 'react';

import { colour } from '../../tokens/colour';

export interface SankeyNodeProps extends SVGAttributes<SVGGElement> {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  tone?: 'default' | 'accent' | 'warning' | 'critical' | 'safe';
}

const nodeTone: Record<NonNullable<SankeyNodeProps['tone']>, { fill: string; text: string }> = {
  default: { fill: colour.paper.creamElevated, text: colour.ink.primary },
  accent: { fill: colour.accent.tealMuted, text: colour.accent.tealDeep },
  safe: { fill: colour.severity.safeSoft, text: colour.severity.safe },
  warning: { fill: colour.severity.warningSoft, text: colour.severity.warning },
  critical: { fill: colour.severity.criticalSoft, text: colour.severity.critical },
};

export const SankeyNode = forwardRef<SVGGElement, SankeyNodeProps>(function SankeyNode(
  { x, y, width, height, label, tone = 'default', ...rest },
  ref,
) {
  const toneStyle = nodeTone[tone];
  return (
    <g ref={ref} {...rest}>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={4}
        fill={toneStyle.fill}
        stroke={colour.line.regular}
        strokeWidth={1}
      />
      <text
        x={x + width / 2}
        y={y + height / 2}
        fill={toneStyle.text}
        fontSize={12}
        fontFamily="var(--font-body), system-ui, sans-serif"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {label}
      </text>
    </g>
  );
});

export interface SankeyEdgeProps extends Omit<SVGAttributes<SVGPathElement>, 'source' | 'target'> {
  /** Source point {x, y} in SVG space. */
  source: { x: number; y: number };
  /** Target point {x, y} in SVG space. */
  target: { x: number; y: number };
  /** Thickness at the source and target. Typically derived from propagation weight. */
  strokeWidth?: number;
  /** Visual tone of the edge; usually mirrors the downstream node's severity. */
  tone?: 'default' | 'warning' | 'critical';
}

const edgeTone: Record<NonNullable<SankeyEdgeProps['tone']>, string> = {
  default: `${colour.ink.tertiary}80`,
  warning: `${colour.severity.warning}90`,
  critical: `${colour.severity.critical}A0`,
};

export const SankeyEdge = forwardRef<SVGPathElement, SankeyEdgeProps>(function SankeyEdge(
  { source, target, strokeWidth = 2, tone = 'default', ...rest },
  ref,
) {
  // Bezier control points halfway horizontally; yields a smooth editorial arc.
  const midX = (source.x + target.x) / 2;
  const d = `M ${source.x} ${source.y} C ${midX} ${source.y}, ${midX} ${target.y}, ${target.x} ${target.y}`;
  return (
    <path
      ref={ref}
      d={d}
      fill="none"
      stroke={edgeTone[tone]}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      {...rest}
    />
  );
});
