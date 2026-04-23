import { KPI } from './KPI';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof KPI> = {
  title: 'Components/KPI',
  component: KPI,
  tags: ['autodocs'],
  args: { label: 'Lead time', value: '47', unit: 'days', trend: 'flat' },
  argTypes: {
    trend: { control: { type: 'select' }, options: ['up', 'down', 'flat'] },
    size: { control: { type: 'select' }, options: ['md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<typeof KPI>;

export const LeadTime: Story = {};

export const WithTrend: Story = {
  args: { trend: 'down', trendTone: 'negative', value: '12', unit: 'days' },
};

export const WithConfidence: Story = {
  args: {
    label: 'CPI forecast, 90 day',
    value: '2.9',
    unit: '% YoY',
    trend: 'up',
    trendTone: 'negative',
    confidenceInterval: 'CI 90 percent: 2.5 to 3.3',
  },
};

export const Portfolio: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
      <KPI label="Assumptions" value="47" unit="total" />
      <KPI label="At warning" value="6" trend="up" trendTone="negative" />
      <KPI label="Lead time median" value="39" unit="days" trend="down" trendTone="negative" />
    </div>
  ),
};
