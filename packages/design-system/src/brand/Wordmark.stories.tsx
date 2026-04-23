import { Monogram, Wordmark } from './Wordmark';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Wordmark> = {
  title: 'Foundations/Brand',
  component: Wordmark,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Wordmark>;

export const Ink: Story = { args: { variant: 'ink', height: 24 } };

export const Accent: Story = { args: { variant: 'accent', height: 24 } };

export const Inverse: Story = {
  args: { variant: 'inverse', height: 24 },
  decorators: [
    (Story) => (
      <div style={{ background: '#1A1A1A', padding: 24, borderRadius: 4 }}>
        <Story />
      </div>
    ),
  ],
};

export const Scale: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'flex-start' }}>
      <Wordmark height={16} />
      <Wordmark height={24} />
      <Wordmark height={40} />
      <Wordmark height={64} />
    </div>
  ),
};

export const MonogramVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
      <Monogram size={32} variant="ink" />
      <Monogram size={48} variant="accent" />
      <Monogram size={64} variant="inverse" />
    </div>
  ),
};
