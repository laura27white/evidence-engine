import { HorizonChart } from './HorizonChart';

import type { HorizonDatum } from './helpers';
import type { Meta, StoryObj } from '@storybook/react';

const sample: HorizonDatum[] = [
  {
    assumptionId: 'a1',
    code: 'A039',
    description: 'Inflation returns to target',
    leadTimeDays: 22,
    severity: 'critical',
    breachDate: new Date('2026-05-14T00:00:00Z'),
    confidence: 'MODERATE',
    category: 'Economic',
    driftScore: 0.78,
  },
  {
    assumptionId: 'a2',
    code: 'A040',
    description: 'Bank rate remains below 5 per cent',
    leadTimeDays: 85,
    severity: 'warning',
    breachDate: new Date('2026-07-16T00:00:00Z'),
    confidence: 'HIGH',
    category: 'Economic',
    driftScore: 0.52,
  },
  {
    assumptionId: 'a3',
    code: 'A041',
    description: 'Corporation tax policy stable',
    leadTimeDays: null,
    severity: 'safe',
    breachDate: null,
    confidence: 'HIGH',
    category: 'Regulatory',
    driftScore: 0.18,
  },
  {
    assumptionId: 'a4',
    code: 'A015',
    description: 'Supply chain costs within plan',
    leadTimeDays: 180,
    severity: 'warning',
    breachDate: new Date('2026-10-18T00:00:00Z'),
    confidence: 'LOW',
    category: 'Operational',
    driftScore: 0.36,
  },
  {
    assumptionId: 'a5',
    code: 'A027',
    description: 'Workforce capacity stable across delivery',
    leadTimeDays: 300,
    severity: 'safe',
    breachDate: new Date('2027-02-15T00:00:00Z'),
    confidence: 'MODERATE',
    category: 'People',
    driftScore: 0.22,
  },
];

const meta: Meta<typeof HorizonChart> = {
  title: 'Charts/HorizonChart',
  component: HorizonChart,
  parameters: { layout: 'padded' },
};

export default meta;

type Story = StoryObj<typeof HorizonChart>;

export const Default: Story = {
  args: { data: sample },
};

export const WithSelection: Story = {
  args: { data: sample, selectedId: 'a1' },
};
