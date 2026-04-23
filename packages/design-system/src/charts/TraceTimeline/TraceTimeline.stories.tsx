import { TraceTimeline } from './TraceTimeline';

import type { Meta, StoryObj } from '@storybook/react';

const fixedNow = new Date('2026-04-22T10:00:00Z');
const retrievedAt = new Date(fixedNow.getTime() - 17 * 1000);

function measurement(
  monthsAgo: number,
  value: number,
  source: 'EXTERNAL_API' | 'MANUAL' = 'EXTERNAL_API',
) {
  return {
    measuredAt: new Date(fixedNow.getTime() - monthsAgo * 30 * 86_400_000),
    observedValue: value,
    source,
  };
}

const meta: Meta<typeof TraceTimeline> = {
  title: 'Charts/TraceTimeline',
  component: TraceTimeline,
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj<typeof TraceTimeline>;

export const Default: Story = {
  args: {
    assumption: {
      code: 'A039',
      description: 'CPI inflation will return to the 2 per cent target within 18 months',
      baselineValue: 2,
      baselineUnit: '% YoY',
      tolerancePct: 25,
      dateLogged: new Date('2024-10-01T00:00:00Z'),
    },
    measurements: [
      measurement(18, 6.3),
      measurement(15, 5.6),
      measurement(12, 4.9),
      measurement(9, 4.1),
      measurement(6, 3.6),
      measurement(3, 3.1),
      measurement(1, 2.9),
      measurement(0.3, 2.8),
    ],
    forecast: {
      projected30d: 2.9,
      projected90d: 3.1,
      projected365d: 3.6,
      breachDate: new Date(fixedNow.getTime() + 110 * 86_400_000),
      confidenceIntervalLower: [2.6, 2.6, 2.4],
      confidenceIntervalUpper: [3.2, 3.6, 4.8],
      computedAt: new Date(fixedNow.getTime() - 90 * 60 * 1000),
    },
    retrievedAt,
    now: fixedNow,
  },
};

export const NoForecast: Story = {
  args: {
    assumption: {
      code: 'A012',
      description: 'Stakeholder approval obtained within 6 weeks of sign-off',
      baselineValue: 42,
      baselineUnit: 'days',
      tolerancePct: 25,
      dateLogged: new Date('2026-03-10T00:00:00Z'),
    },
    measurements: [measurement(0.5, 45, 'MANUAL'), measurement(0.2, 48, 'MANUAL')],
    forecast: null,
    retrievedAt,
    now: fixedNow,
  },
};
