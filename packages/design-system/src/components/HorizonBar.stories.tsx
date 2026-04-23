import { HorizonBar } from './HorizonBar';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof HorizonBar> = {
  title: 'Components/HorizonBar',
  component: HorizonBar,
  tags: ['autodocs'],
  args: {
    currentPosition: 0.35,
    projectedBreach: 0.72,
    severity: 'warning',
    horizonLabel: '12 months',
    description:
      'CPI drift is 35 percent through its 12-month horizon; projected breach at month 9.',
  },
};

export default meta;
type Story = StoryObj<typeof HorizonBar>;

export const Warning: Story = {};

export const Safe: Story = {
  args: {
    severity: 'safe',
    currentPosition: 0.08,
    projectedBreach: null,
    description: 'Drift within safe band, no breach projected.',
  },
};

export const Critical: Story = {
  args: {
    severity: 'critical',
    currentPosition: 0.82,
    projectedBreach: 0.9,
    description: 'Drift near tolerance boundary; breach within weeks.',
  },
};

export const Stack: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 640 }}>
      <HorizonBar severity="safe" currentPosition={0.08} description="Safe" />
      <HorizonBar
        severity="warning"
        currentPosition={0.4}
        projectedBreach={0.75}
        description="Warning, breach projected."
      />
      <HorizonBar
        severity="critical"
        currentPosition={0.85}
        projectedBreach={0.95}
        description="Critical, imminent breach."
      />
    </div>
  ),
};
