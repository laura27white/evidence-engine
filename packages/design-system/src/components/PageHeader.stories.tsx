import { Badge } from './Badge';
import { Button } from './Button';
import { PageHeader } from './PageHeader';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof PageHeader> = {
  title: 'Components/PageHeader',
  component: PageHeader,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  args: {
    kicker: 'MPA Challenge 5',
    title: 'Horizon',
    subtitle: 'Forty-seven assumptions, ranked by projected breach date.',
    size: 'lg',
  },
};

export default meta;
type Story = StoryObj<typeof PageHeader>;

export const Default: Story = {};

export const WithMeta: Story = {
  args: {
    meta: (
      <>
        <Badge variant="neutral">Updated 14m ago</Badge>
        <Badge variant="neutral">HPO24A01-DEMO</Badge>
        <Badge variant="neutral">ONS, BoE, gov.uk</Badge>
      </>
    ),
  },
};

export const WithActions: Story = {
  args: {
    actions: <Button variant="secondary">Export</Button>,
  },
};
