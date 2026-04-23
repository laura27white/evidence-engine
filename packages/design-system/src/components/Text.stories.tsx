import { Text } from './Text';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Text> = {
  title: 'Components/Text',
  component: Text,
  tags: ['autodocs'],
  args: {
    children: 'Evidence Engine forecasts assumption drift.',
    variant: 'body',
    tone: 'primary',
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: [
        'displayMax',
        'displayLarge',
        'displayMedium',
        'displaySmall',
        'bodyLarge',
        'body',
        'bodySmall',
        'label',
        'monoLarge',
        'mono',
        'monoSmall',
      ],
    },
    tone: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'tertiary', 'inverse', 'accent'],
    },
    as: { control: { type: 'text' } },
  },
};

export default meta;
type Story = StoryObj<typeof Text>;

export const Body: Story = {};

export const DisplayScale: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Text variant="displayMax" as="h1">
        Editorial intelligence
      </Text>
      <Text variant="displayLarge" as="h2">
        Evidence Engine
      </Text>
      <Text variant="displayMedium" as="h3">
        Assumption drift forecast
      </Text>
      <Text variant="displaySmall" as="h4">
        Forty-seven assumptions, live data
      </Text>
    </div>
  ),
};

export const BodyScale: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: '65ch' }}>
      <Text variant="bodyLarge">
        Body large: used for opening paragraphs, page subtitles, and anything the eye should land on
        first after a display heading.
      </Text>
      <Text variant="body">
        Body: the workhorse. Dense, legible at small sizes, right weight and tracking for long-form
        reading.
      </Text>
      <Text variant="bodySmall">Body small: secondary copy, captions, helper text.</Text>
      <Text variant="label">Label uppercase</Text>
    </div>
  ),
};

export const MonoScale: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <Text variant="monoLarge">$ pnpm ingest:backfill</Text>
      <Text variant="mono">ONS:D7G7 2025-10-01 2.6% YoY</Text>
      <Text variant="monoSmall">sha256 2cf24dba5fb0a30e...</Text>
    </div>
  ),
};

export const Tones: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Text tone="primary">Primary ink (#1A1A1A)</Text>
      <Text tone="secondary">Secondary ink (#4A4A4A)</Text>
      <Text tone="tertiary">Tertiary ink (#7A7A7A)</Text>
      <Text tone="accent">Accent teal (#0E6B6B)</Text>
      <div style={{ background: '#1A1A1A', padding: 12, borderRadius: 4 }}>
        <Text tone="inverse">Inverse on ink</Text>
      </div>
    </div>
  ),
};
