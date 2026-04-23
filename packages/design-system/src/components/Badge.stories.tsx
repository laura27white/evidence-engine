import { Badge } from './Badge';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  args: { variant: 'safe', size: 'md', children: 'Safe' },
  argTypes: {
    variant: { control: { type: 'select' }, options: ['safe', 'warning', 'critical', 'neutral'] },
    size: { control: { type: 'select' }, options: ['sm', 'md'] },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Safe: Story = {};
export const Warning: Story = { args: { variant: 'warning', children: 'Warning' } };
export const Critical: Story = { args: { variant: 'critical', children: 'Critical' } };
export const Neutral: Story = { args: { variant: 'neutral', children: '47 total' } };

export const Severities: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12 }}>
      <Badge variant="safe">Safe</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="critical">Critical</Badge>
      <Badge variant="neutral">Tier 1</Badge>
    </div>
  ),
};
