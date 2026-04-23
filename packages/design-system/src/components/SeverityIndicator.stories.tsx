import { SeverityIndicator } from './SeverityIndicator';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof SeverityIndicator> = {
  title: 'Components/SeverityIndicator',
  component: SeverityIndicator,
  tags: ['autodocs'],
  args: { level: 'safe', value: '+0.2pp' },
  argTypes: {
    level: { control: { type: 'select' }, options: ['safe', 'warning', 'critical'] },
  },
};

export default meta;
type Story = StoryObj<typeof SeverityIndicator>;

export const Safe: Story = {};
export const Warning: Story = { args: { level: 'warning', value: '+0.8pp' } };
export const Critical: Story = { args: { level: 'critical', value: '-1.4pp' } };

export const AllLevels: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <SeverityIndicator level="safe" value="+0.2pp" />
      <SeverityIndicator level="warning" value="+0.8pp" />
      <SeverityIndicator level="critical" value="-1.4pp" />
    </div>
  ),
};
