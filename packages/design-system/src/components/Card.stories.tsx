import { Card } from './Card';
import { Text } from './Text';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
  args: { variant: 'default', padding: 'md' },
  argTypes: {
    variant: { control: { type: 'select' }, options: ['default', 'elevated', 'outlined', 'flush'] },
    padding: { control: { type: 'select' }, options: ['none', 'sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    children: (
      <div>
        <Text variant="label" tone="accent">
          Assumption A046
        </Text>
        <Text variant="displaySmall" as="h3">
          Inflation within forecast band
        </Text>
        <Text variant="body">Current CPI 2.6 percent, tolerance 40 percent, drift score 0.05.</Text>
      </div>
    ),
  },
};

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    children: <Text>Elevated cards carry a soft shadow; used on hover or to draw focus.</Text>,
  },
};

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    children: (
      <Text>Outlined cards remove the paper tint; used when the surface sits on a white page.</Text>
    ),
  },
};

export const Grid: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
      <Card variant="default">
        <Text>Default</Text>
      </Card>
      <Card variant="elevated">
        <Text>Elevated</Text>
      </Card>
      <Card variant="outlined">
        <Text>Outlined</Text>
      </Card>
    </div>
  ),
};
