'use client';

/**
 * TraceTimeline: the hero chart.
 *
 * One assumption's story rendered in pure SVG. Seven visual layers from the back:
 *   1. tolerance band around baseline
 *   2. baseline horizontal line
 *   3. historical annotation band from dateLogged to now
 *   4. measurement scatter plus connecting line
 *   5. forecast cone (confidence interval) from now to now+365d
 *   6. median forecast dashed line within the cone
 *   7. breach-date annotation
 *
 * A live "retrieved X seconds ago" line sits bottom-right; it ticks every second
 * while the tab is visible. A visually-hidden figcaption carries the full data
 * in prose for screen readers and print.
 */

import { useEffect, useMemo, useState, type CSSProperties } from 'react';

import { colour } from '../../../tokens/colour';
import { space } from '../../../tokens/space';
import { fontFamily } from '../../foundations/style-utils';
import { formatNumber, formatDateMedium, formatDateShort } from '../shared/format';
import { linearScale, niceTicks, niceTimeTicks, timeScale } from '../shared/scales';

import { describeTimeline, forecastEnvelope, type ForecastInput } from './helpers';

export interface TraceMeasurement {
  measuredAt: Date;
  observedValue: number;
  source: 'EXTERNAL_API' | 'MANUAL' | 'SYSTEM_DERIVED';
  sourceUrl?: string;
}

export interface TraceTimelineProps {
  assumption: {
    code: string;
    description: string;
    baselineValue: number;
    baselineUnit: string;
    tolerancePct: number;
    dateLogged: Date;
  };
  measurements: TraceMeasurement[];
  forecast: ForecastInput | null;
  retrievedAt: Date;
  now?: Date;
  height?: number;
  style?: CSSProperties;
}

const MARGIN = { top: 56, right: 140, bottom: 48, left: 64 };
const HORIZON_DAYS = 365;

export function TraceTimeline({
  assumption,
  measurements,
  forecast,
  retrievedAt,
  now: nowProp,
  height = 480,
  style,
}: TraceTimelineProps) {
  const now = useMemo(() => nowProp ?? new Date(), [nowProp]);
  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
  const [width, setWidth] = useState(960);
  const [retrievedLabel, setRetrievedLabel] = useState(() => formatRelative(retrievedAt, now));

  useEffect(() => {
    if (containerRef === null) return;
    const update = (): void => setWidth(Math.max(560, containerRef.clientWidth));
    update();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(update);
    ro.observe(containerRef);
    return () => ro.disconnect();
  }, [containerRef]);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setRetrievedLabel(formatRelative(retrievedAt, new Date()));
      return;
    }
    const id = window.setInterval(() => {
      if (document.visibilityState === 'hidden') return;
      setRetrievedLabel(formatRelative(retrievedAt, new Date()));
    }, 1000);
    return () => window.clearInterval(id);
  }, [retrievedAt]);

  const innerWidth = Math.max(100, width - MARGIN.left - MARGIN.right);
  const innerHeight = Math.max(180, height - MARGIN.top - MARGIN.bottom);

  const sortedMeasurements = useMemo(
    () => [...measurements].sort((a, b) => a.measuredAt.getTime() - b.measuredAt.getTime()),
    [measurements],
  );

  const firstMeasured = sortedMeasurements[0]?.measuredAt ?? assumption.dateLogged;
  const chartStart = new Date(Math.min(firstMeasured.getTime(), assumption.dateLogged.getTime()));
  const chartEnd = new Date(now.getTime() + HORIZON_DAYS * 86_400_000);

  const envelope = useMemo(
    () => (forecast === null ? [] : forecastEnvelope(forecast, now)),
    [forecast, now],
  );

  const tolerance = Math.abs(assumption.baselineValue) * (assumption.tolerancePct / 100);
  const upperTolerance = assumption.baselineValue + tolerance;
  const lowerTolerance = assumption.baselineValue - tolerance;

  const valueSamples: number[] = [
    upperTolerance,
    lowerTolerance,
    assumption.baselineValue,
    ...sortedMeasurements.map((m) => m.observedValue),
    ...envelope.map((e) => e.upper),
    ...envelope.map((e) => e.lower),
  ];
  const domainPad = Math.max(0.5, (Math.max(...valueSamples) - Math.min(...valueSamples)) * 0.15);
  const yDomain: [number, number] = [
    Math.min(...valueSamples) - domainPad,
    Math.max(...valueSamples) + domainPad,
  ];
  const xScale = timeScale([chartStart, chartEnd], [0, innerWidth]);
  const yScale = linearScale(yDomain, [innerHeight, 0]);

  const xTicks = niceTimeTicks([chartStart, chartEnd], 6);
  const yTicks = niceTicks(yDomain, 5);

  const nowX = xScale(now.getTime());
  const breachX = forecast?.breachDate ? xScale(forecast.breachDate.getTime()) : null;

  const measurementPath = sortedMeasurements
    .map(
      (m, i) =>
        `${i === 0 ? 'M' : 'L'} ${xScale(m.measuredAt.getTime()).toFixed(1)} ${yScale(m.observedValue).toFixed(1)}`,
    )
    .join(' ');

  const coneUpperPath =
    envelope.length === 0
      ? ''
      : envelope
          .map(
            (e, i) =>
              `${i === 0 ? 'M' : 'L'} ${xScale(e.t).toFixed(1)} ${yScale(e.upper).toFixed(1)}`,
          )
          .join(' ');
  const coneLowerPath =
    envelope.length === 0
      ? ''
      : envelope
          .slice()
          .reverse()
          .map(
            (e, i) =>
              `${i === 0 ? 'L' : 'L'} ${xScale(e.t).toFixed(1)} ${yScale(e.lower).toFixed(1)}`,
          )
          .join(' ');
  const conePath = envelope.length === 0 ? '' : `${coneUpperPath} ${coneLowerPath} Z`;
  const centralPath =
    envelope.length === 0
      ? ''
      : envelope
          .map(
            (e, i) =>
              `${i === 0 ? 'M' : 'L'} ${xScale(e.t).toFixed(1)} ${yScale(e.central).toFixed(1)}`,
          )
          .join(' ');

  const caption = describeTimeline({
    code: assumption.code,
    description: assumption.description,
    baselineValue: assumption.baselineValue,
    baselineUnit: assumption.baselineUnit,
    tolerancePct: assumption.tolerancePct,
    measurementCount: sortedMeasurements.length,
    firstMeasuredAt: sortedMeasurements[0]?.measuredAt ?? null,
    lastMeasuredAt: sortedMeasurements[sortedMeasurements.length - 1]?.measuredAt ?? null,
    latestValue: sortedMeasurements[sortedMeasurements.length - 1]?.observedValue ?? null,
    forecastBreachDate: forecast?.breachDate ?? null,
    leadTimeDays:
      forecast?.breachDate != null
        ? Math.max(0, Math.floor((forecast.breachDate.getTime() - now.getTime()) / 86_400_000))
        : null,
  });

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
      aria-label={`Trace chart for ${assumption.code}: ${assumption.description}`}
    >
      <figcaption style={visuallyHidden}>{caption}</figcaption>
      <header style={{ marginBottom: space.scale['3'] }}>
        <p
          style={{
            fontFamily: fontFamily.mono,
            color: colour.ink.tertiary,
            fontSize: 12,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            margin: 0,
          }}
        >
          Trace &middot; {assumption.code}
        </p>
        <h3
          style={{
            fontFamily: fontFamily.display,
            fontWeight: 500,
            fontSize: 28,
            lineHeight: 1.1,
            margin: `${space.scale['2']} 0 0`,
            color: colour.ink.primary,
          }}
        >
          {assumption.description}
        </h3>
        <p
          style={{
            fontFamily: fontFamily.body,
            fontSize: 13,
            color: colour.ink.secondary,
            margin: `${space.scale['2']} 0 0`,
          }}
        >
          Baseline {formatNumber(assumption.baselineValue)} {assumption.baselineUnit} &middot;
          tolerance plus or minus {assumption.tolerancePct}% &middot; logged{' '}
          {formatDateMedium(assumption.dateLogged)}
        </p>
      </header>
      <svg
        role="img"
        aria-hidden
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ display: 'block', maxWidth: '100%' }}
      >
        <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
          <rect
            x={0}
            y={yScale(upperTolerance)}
            width={innerWidth}
            height={Math.max(0, yScale(lowerTolerance) - yScale(upperTolerance))}
            fill={colour.ink.primary}
            fillOpacity={0.04}
          />

          <rect
            x={xScale(assumption.dateLogged.getTime())}
            y={0}
            width={Math.max(0, nowX - xScale(assumption.dateLogged.getTime()))}
            height={innerHeight}
            fill={colour.paper.cream}
            fillOpacity={0.7}
          />

          {yTicks.map((tick) => (
            <g key={`y-${tick}`} transform={`translate(0, ${yScale(tick)})`}>
              <line x1={0} x2={innerWidth} stroke={colour.line.hairline} strokeWidth={1} />
              <text
                x={-8}
                y={4}
                textAnchor="end"
                fontFamily={fontFamily.mono}
                fontSize={11}
                fill={colour.ink.tertiary}
              >
                {formatNumber(tick)}
              </text>
            </g>
          ))}

          {xTicks.map((tick) => (
            <g
              key={`x-${tick.toISOString()}`}
              transform={`translate(${xScale(tick.getTime())}, 0)`}
            >
              <line y1={innerHeight} y2={innerHeight + 4} stroke={colour.line.regular} />
              <text
                y={innerHeight + 20}
                textAnchor="middle"
                fontFamily={fontFamily.mono}
                fontSize={11}
                fill={colour.ink.secondary}
              >
                {formatDateShort(tick)}
              </text>
            </g>
          ))}

          <line
            x1={0}
            x2={innerWidth}
            y1={yScale(assumption.baselineValue)}
            y2={yScale(assumption.baselineValue)}
            stroke={colour.ink.primary}
            strokeWidth={1}
          />
          <text
            x={innerWidth + 6}
            y={yScale(assumption.baselineValue) + 4}
            fontFamily={fontFamily.mono}
            fontSize={11}
            fill={colour.ink.secondary}
          >
            baseline
          </text>

          {conePath !== '' ? (
            <>
              <path d={conePath} fill={colour.accent.teal} fillOpacity={0.18} />
              <path
                d={centralPath}
                fill="none"
                stroke={colour.accent.teal}
                strokeWidth={1.5}
                strokeDasharray="4 3"
              />
              <text
                x={nowX + 10}
                y={18}
                fontFamily={fontFamily.mono}
                fontSize={11}
                fill={colour.accent.teal}
                letterSpacing={1.2}
              >
                FORECAST
              </text>
            </>
          ) : null}

          {sortedMeasurements.length > 0 ? (
            <path
              d={measurementPath}
              fill="none"
              stroke={colour.ink.primary}
              strokeWidth={1.25}
              strokeLinecap="round"
            />
          ) : null}
          {sortedMeasurements.map((m, idx) => (
            <circle
              key={idx}
              cx={xScale(m.measuredAt.getTime())}
              cy={yScale(m.observedValue)}
              r={4}
              fill={m.source === 'EXTERNAL_API' ? colour.ink.primary : colour.paper.cream}
              stroke={colour.ink.primary}
              strokeWidth={1.25}
            >
              <title>
                {formatNumber(m.observedValue)} on {formatDateMedium(m.measuredAt)} &middot;{' '}
                {m.source}
              </title>
            </circle>
          ))}

          <line
            x1={nowX}
            x2={nowX}
            y1={0}
            y2={innerHeight}
            stroke={colour.ink.primary}
            strokeWidth={1}
            strokeDasharray="2 3"
          />
          <text
            x={nowX + 4}
            y={innerHeight + 32}
            fontFamily={fontFamily.mono}
            fontSize={11}
            fill={colour.ink.secondary}
          >
            now
          </text>

          {breachX !== null && forecast?.breachDate != null ? (
            <g>
              <line
                x1={breachX}
                x2={breachX}
                y1={0}
                y2={innerHeight}
                stroke={colour.severity.critical}
                strokeWidth={1.25}
              />
              <rect
                x={breachX - 74}
                y={-18}
                width={148}
                height={22}
                rx={11}
                fill={colour.severity.critical}
              />
              <text
                x={breachX}
                y={-3}
                textAnchor="middle"
                fontFamily={fontFamily.mono}
                fontSize={11}
                fill={colour.ink.inverse}
                letterSpacing={0.6}
              >
                BREACH &middot; {formatDateShort(forecast.breachDate)}
              </text>
            </g>
          ) : null}
        </g>
      </svg>
      <footer
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: space.scale['2'],
          fontFamily: fontFamily.mono,
          fontSize: 11,
          color: colour.ink.tertiary,
        }}
      >
        <span>
          {sortedMeasurements.length} measurements &middot; forecast{' '}
          {forecast === null
            ? 'not yet computed'
            : `as of ${formatDateMedium(forecast.computedAt)}`}
        </span>
        <span title={retrievedAt.toISOString()}>Retrieved {retrievedLabel}</span>
      </footer>
    </figure>
  );
}

function formatRelative(target: Date, now: Date): string {
  const delta = now.getTime() - target.getTime();
  const seconds = Math.max(0, Math.round(delta / 1000));
  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours} hours ago`;
  const days = Math.round(hours / 24);
  return `${days} days ago`;
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
