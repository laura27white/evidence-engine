'use client';

/**
 * HorizonChart: horizontal bar chart of all assumptions, positioned by projected
 * lead time along a shared 0..365 day axis.
 */

import { useEffect, useMemo, useState, type CSSProperties } from 'react';

import { colour } from '../../../tokens/colour';
import { fontFamily } from '../../foundations/style-utils';
import { linearScale } from '../shared/scales';

import { confidenceFill, horizonBarDescription, type HorizonDatum } from './helpers';

export interface HorizonChartProps {
  data: HorizonDatum[];
  horizonDays?: number;
  selectedId?: string;
  onSelect?: (assumptionId: string) => void;
  height?: number;
  style?: CSSProperties;
}

const ROW_HEIGHT = 26;
const ROW_GAP = 6;
const MARGIN = { top: 56, right: 48, bottom: 32, left: 360 };

const severityFill: Record<HorizonDatum['severity'], string> = {
  safe: colour.severity.safeSoft,
  warning: colour.severity.warningSoft,
  critical: colour.severity.criticalSoft,
};
const severityStroke: Record<HorizonDatum['severity'], string> = {
  safe: colour.severity.safe,
  warning: colour.severity.warning,
  critical: colour.severity.critical,
};

export function HorizonChart({
  data,
  horizonDays = 365,
  selectedId,
  onSelect,
  height,
  style,
}: HorizonChartProps) {
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

  const computedHeight =
    height ?? MARGIN.top + MARGIN.bottom + data.length * (ROW_HEIGHT + ROW_GAP);

  const innerWidth = Math.max(100, width - MARGIN.left - MARGIN.right);
  const xScale = useMemo(
    () => linearScale([0, horizonDays], [0, innerWidth]),
    [horizonDays, innerWidth],
  );
  const tickValues = [0, 30, 90, 180, 365].filter((t) => t <= horizonDays);

  return (
    <div ref={setContainerRef} style={{ position: 'relative', width: '100%', ...style }}>
      <svg
        role="img"
        aria-label="Assumption horizon chart: lead time to projected breach"
        width="100%"
        height={computedHeight}
        viewBox={`0 0 ${width} ${computedHeight}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ display: 'block', maxWidth: '100%' }}
      >
        <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
          <line
            x1={0}
            x2={innerWidth}
            y1={-16}
            y2={-16}
            stroke={colour.line.regular}
            strokeWidth={1}
          />
          {tickValues.map((t) => (
            <g key={`t-${t}`} transform={`translate(${xScale(t)}, 0)`}>
              <line
                y1={-18}
                y2={data.length * (ROW_HEIGHT + ROW_GAP) + 4}
                stroke={colour.line.hairline}
                strokeWidth={1}
              />
              <text
                y={-24}
                textAnchor="middle"
                fontFamily={fontFamily.mono}
                fontSize={11}
                fill={colour.ink.secondary}
              >
                {t === 0 ? 'now' : `+${t}d`}
              </text>
            </g>
          ))}
          {data.map((d, i) => {
            const y = i * (ROW_HEIGHT + ROW_GAP);
            const barEndDays = d.leadTimeDays === null ? horizonDays : Math.max(4, d.leadTimeDays);
            const barWidth = Math.max(6, xScale(barEndDays));
            const isSelected = d.assumptionId === selectedId;
            return (
              <g
                key={d.assumptionId}
                transform={`translate(0, ${y})`}
                style={{ cursor: onSelect === undefined ? 'default' : 'pointer' }}
                onClick={onSelect === undefined ? undefined : () => onSelect(d.assumptionId)}
                onKeyDown={
                  onSelect === undefined
                    ? undefined
                    : (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onSelect(d.assumptionId);
                        }
                      }
                }
                tabIndex={onSelect === undefined ? undefined : 0}
                role={onSelect === undefined ? 'img' : 'button'}
                aria-label={horizonBarDescription(d)}
              >
                {isSelected ? (
                  <rect
                    x={-MARGIN.left + 8}
                    y={0}
                    width={MARGIN.left + innerWidth + MARGIN.right - 16}
                    height={ROW_HEIGHT}
                    fill={colour.accent.tealMuted}
                  />
                ) : null}
                <text
                  x={-MARGIN.left + 16}
                  y={ROW_HEIGHT * 0.55}
                  fontFamily={fontFamily.mono}
                  fontSize={12}
                  fill={colour.ink.primary}
                  dominantBaseline="middle"
                >
                  {d.code}
                </text>
                <text
                  x={-MARGIN.left + 64}
                  y={ROW_HEIGHT * 0.55}
                  fontFamily={fontFamily.body}
                  fontSize={12}
                  fill={colour.ink.secondary}
                  dominantBaseline="middle"
                  textLength={MARGIN.left - 96}
                  lengthAdjust="spacingAndGlyphs"
                >
                  {truncate(d.description, 42)}
                </text>
                <ConfidenceDot confidence={d.confidence} x={-16} y={ROW_HEIGHT / 2} />
                <rect
                  x={0}
                  y={6}
                  width={barWidth}
                  height={ROW_HEIGHT - 12}
                  fill={severityFill[d.severity]}
                  stroke={severityStroke[d.severity]}
                  strokeWidth={1}
                  rx={2}
                />
                {d.leadTimeDays !== null && d.leadTimeDays > 0 ? (
                  <line
                    x1={xScale(d.leadTimeDays)}
                    x2={xScale(d.leadTimeDays)}
                    y1={2}
                    y2={ROW_HEIGHT - 2}
                    stroke={severityStroke[d.severity]}
                    strokeWidth={1.5}
                  />
                ) : null}
                {d.leadTimeDays === null ? (
                  <text
                    x={innerWidth + 8}
                    y={ROW_HEIGHT * 0.55}
                    fontFamily={fontFamily.mono}
                    fontSize={10}
                    fill={colour.ink.tertiary}
                    dominantBaseline="middle"
                  >
                    beyond horizon
                  </text>
                ) : null}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

function ConfidenceDot({
  confidence,
  x,
  y,
}: {
  confidence: HorizonDatum['confidence'];
  x: number;
  y: number;
}) {
  const fill = confidenceFill(confidence);
  return (
    <g transform={`translate(${x}, ${y})`}>
      <circle
        r={4}
        fill={
          fill === 'filled'
            ? colour.ink.primary
            : fill === 'half'
              ? colour.ink.tertiary
              : colour.paper.cream
        }
        stroke={colour.ink.primary}
        strokeWidth={1}
      >
        <title>Confidence {confidence.toLowerCase()}</title>
      </circle>
    </g>
  );
}

function truncate(value: string, maxChars: number): string {
  if (value.length <= maxChars) return value;
  return value.slice(0, maxChars - 1).trimEnd() + '...';
}
