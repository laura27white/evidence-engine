'use client';

/**
 * CascadeGraph: lightweight deterministic dependency-network rendering.
 *
 * See helpers.ts for the rationale: a hand-rolled category-column layout rather
 * than Cytoscape, to keep the bundle small. Renders nodes as circles sized by
 * degree, edges as thin curves with opacity scaled by weight.
 */

import { useEffect, useMemo, useState, type CSSProperties } from 'react';

import { colour } from '../../../tokens/colour';
import { space } from '../../../tokens/space';
import { fontFamily } from '../../foundations/style-utils';

import { layoutCascadeGraph, type GraphEdgeInput, type GraphNodeInput } from './helpers';

export interface CascadeGraphProps {
  nodes: GraphNodeInput[];
  edges: GraphEdgeInput[];
  height?: number;
  highlightedSourceId?: string;
  style?: CSSProperties;
  onSelectNode?: (id: string) => void;
}

export function CascadeGraph({
  nodes,
  edges,
  height = 520,
  highlightedSourceId,
  style,
  onSelectNode,
}: CascadeGraphProps) {
  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
  const [width, setWidth] = useState(960);

  useEffect(() => {
    if (containerRef === null) return;
    const update = (): void => setWidth(Math.max(520, containerRef.clientWidth));
    update();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(update);
    ro.observe(containerRef);
    return () => ro.disconnect();
  }, [containerRef]);

  const layout = useMemo(
    () => layoutCascadeGraph(nodes, edges, { width, height }),
    [nodes, edges, width, height],
  );

  const caption = `Dependency graph with ${nodes.length} nodes and ${edges.length} edges across ${
    new Set(nodes.map((n) => n.category)).size
  } categories. Highlighted source: ${highlightedSourceId ?? 'none'}.`;

  return (
    <figure
      ref={setContainerRef}
      style={{
        margin: 0,
        padding: space.scale['5'],
        background: colour.paper.creamElevated,
        border: `1px solid ${colour.line.hairline}`,
        borderRadius: 4,
        ...style,
      }}
      aria-label="Cascade dependency graph"
    >
      <figcaption style={visuallyHidden}>{caption}</figcaption>
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ display: 'block', maxWidth: '100%' }}
        role="img"
        aria-hidden
      >
        {layout.edges.map((edge, i) => {
          const mx = (edge.sourceX + edge.targetX) / 2;
          const path = `M ${edge.sourceX.toFixed(1)} ${edge.sourceY.toFixed(1)} C ${mx.toFixed(1)} ${edge.sourceY.toFixed(1)}, ${mx.toFixed(1)} ${edge.targetY.toFixed(1)}, ${edge.targetX.toFixed(1)} ${edge.targetY.toFixed(1)}`;
          const strong = edge.highlighted || edge.source === highlightedSourceId;
          return (
            <path
              key={`${edge.source}->${edge.target}-${i}`}
              d={path}
              fill="none"
              stroke={strong ? colour.accent.teal : colour.ink.tertiary}
              strokeOpacity={strong ? 0.7 : 0.25}
              strokeWidth={Math.max(0.8, edge.weight * 2)}
            />
          );
        })}
        {layout.nodes.map((node) => {
          const r = Math.min(22, 10 + Math.sqrt(node.degree) * 3);
          const isSource = node.id === highlightedSourceId;
          const isHighlighted = node.highlighted;
          const fill = isSource
            ? colour.accent.teal
            : isHighlighted
              ? colour.accent.tealMuted
              : colour.paper.creamElevated;
          return (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              onClick={onSelectNode === undefined ? undefined : () => onSelectNode(node.id)}
              role={onSelectNode === undefined ? 'img' : 'button'}
              tabIndex={onSelectNode === undefined ? undefined : 0}
              onKeyDown={
                onSelectNode === undefined
                  ? undefined
                  : (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectNode(node.id);
                      }
                    }
              }
              style={{ cursor: onSelectNode === undefined ? 'default' : 'pointer' }}
              aria-label={`${node.code} node in category ${node.category}, degree ${node.degree}`}
            >
              <circle
                r={r}
                fill={fill}
                stroke={isSource ? colour.accent.tealDeep : colour.ink.primary}
                strokeWidth={isSource ? 2 : 1}
              />
              <text
                y={r + 14}
                textAnchor="middle"
                fontFamily={fontFamily.mono}
                fontSize={10}
                fill={colour.ink.secondary}
              >
                {node.code}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}

const visuallyHidden: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};
