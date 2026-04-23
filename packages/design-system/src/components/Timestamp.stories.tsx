import { Timestamp } from './Timestamp';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Timestamp> = {
  title: 'Components/Timestamp',
  component: Timestamp,
  tags: ['autodocs'],
  args: { at: new Date(Date.now() - 45_000).toISOString(), mode: 'relative' },
  argTypes: {
    mode: { control: { type: 'select' }, options: ['relative', 'absolute', 'both'] },
  },
};

export default meta;
type Story = StoryObj<typeof Timestamp>;

export const Relative: Story = {};
export const Absolute: Story = { args: { mode: 'absolute' } };
export const Both: Story = { args: { mode: 'both' } };

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Timestamp at={new Date(Date.now() - 5_000).toISOString()} />
      <Timestamp at={new Date(Date.now() - 90_000).toISOString()} />
      <Timestamp at={new Date(Date.now() - 60 * 60 * 1000).toISOString()} />
      <Timestamp at={new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()} />
      <Timestamp at={new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()} />
    </div>
  ),
};
