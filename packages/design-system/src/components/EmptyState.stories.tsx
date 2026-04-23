import { Inbox } from 'lucide-react';

import { Button } from './Button';
import { EmptyState } from './EmptyState';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof EmptyState> = {
  title: 'Components/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  args: {
    title: 'No assumptions in breach',
    description:
      'Every assumption sits within its tolerance band today. The Trace view will surface the first mover the moment drift approaches a breach.',
    action: <Button variant="secondary">Open Trace</Button>,
    icon: <Inbox size={32} aria-hidden />,
  },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {};

export const WithoutAction: Story = { args: { action: undefined } };
