'use client';

/**
 * CascadeSankey: custom SVG flow diagram for a single cascade source.
 *
 * Left-to-right layout. Nodes are thin rectangles sized by totalDrift; links are
 * cubic Bezier curves whose stroke width encodes the link value. No external
 * dependencies; everything is hand-rolled from the tokens and the helpers module.
 */

import { useEffect, useMemo, useState, type CSSProperties } from 'react';

import { colour } from '../../../tokens/colour';
import { space } from '../../../tokens/space';
import { fontFamily } from '../../foundations/style-utils';
import { formatNumber } from '../shared/format';

import { layoutSankey, type SankeyLinkInput, type SankeyNodeInput } from './helpers';

export interface CascadeSankeyProps {
  nodes: SankeyNodeInput[];
  links: SankeyLinkInput[];
  height?: number;
  style?: CSSProperties;
  onHoverLink?: (link: SankeyLinkInput | null) => void;
}

export function CascadeSankey({
  nodes,
  links,
  height = 480,
  style,
  onHoverLink,
}: CascadeSankeyProps) {
  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
  const [width, setWidth] = useState(960);
  const [hoveredLinkKey, setHoveredLinkKey] = useState<string | null>(null);

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
    () => layoutSankey(nodes, links, { width, height }),
    [nodes, links, width, height],
  );

  const caption = useMemo(() => {
    const source = nodes.find((n) => n.level === 0);
    if (!source) return 'Cascade flow diagram with no source node.';
    const targets = nodes.filter((n) => n.level > 0);
    const top = [...links].sort((a, b) => b.value - a.value).slice(0, 3);
    const topLabel = top
      .map((l) => {
        const target = nodes.find((n) => n.id === l.targetId);
        return `${target?.code ?? l.targetId} (${formatNumber(l.value, 3)})`;
      })
      .join(', ');
    return `Drift from ${source.code} flows to ${targets.length} downstream assumption${targets.length === 1 ? '' : 's'}${
      top.length > 0 ? `, most strongly to ${topLabel}.` : '.'
    }`;
  }, [nodes, links]);

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
      aria-label="Cascade flow from source to downstream assumptions"
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
        {layout.links.map((link, i) => {
          const key = `${link.sourceId}->${link.targetId}-${i}`;
          const isHovered = hoveredLinkKey === key;
          const isDimmed = hoveredLinkKey !== null && !isHovered;
          return (
            <path
              key={key}
              d={link.path}
              fill="none"
              stroke={colour.accent.teal}
              strokeOpacity={isHovered ? 0.85 : isDimmed ? 0.08 : 0.32}
              strokeWidth={link.width}
              onMouseEnter={() => {
                setHoveredLinkKey(key);
                onHoverLink?.(link);
              }}
              onMouseLeave={() => {
                setHoveredLinkKey(null);
                onHoverLink?.(null);
              }}
              aria-label={link.pathDescription}
            >
              <title>
                {link.pathDescription} &middot; value {formatNumber(link.value, 3)}
              </title>
            </path>
          );
        })}
        {layout.nodes.map((node) => {
          const fill = node.level === 0 ? colour.accent.teal : colour.ink.primary;
          return (
            <g key={node.id} transform={`translate(${node.x}, ${node.yTop})`}>
              <rect
                width={14}
                height={Math.max(10, node.yBottom - node.yTop)}
                fill={fill}
                fillOpacity={0.85}
              />
              <text
                x={18}
                y={Math.min(18, (node.yBottom - node.yTop) / 2 + 4)}
                fontFamily={fontFamily.mono}
                fontSize={11}
                fill={colour.ink.primary}
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
