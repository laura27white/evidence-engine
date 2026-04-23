import { CascadeSankey } from './CascadeSankey';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof CascadeSankey> = {
  title: 'Charts/CascadeSankey',
  component: CascadeSankey,
  parameters: { layout: 'padded' },
};

export default meta;

type Story = StoryObj<typeof CascadeSankey>;

export const Default: Story = {
  args: {
    nodes: [
      { id: 'a1', code: 'A039', level: 0, totalDrift: 1 },
      { id: 'a2', code: 'A015', level: 1, totalDrift: 0.42 },
      { id: 'a3', code: 'A027', level: 1, totalDrift: 0.28 },
      { id: 'a4', code: 'A006', level: 1, totalDrift: 0.14 },
      { id: 'a5', code: 'A045', level: 2, totalDrift: 0.21 },
      { id: 'a6', code: 'A047', level: 2, totalDrift: 0.11 },
    ],
    links: [
      {
        sourceId: 'a1',
        targetId: 'a2',
        value: 0.42,
        pathDescription: 'A039 -> A015 via weight 0.80',
      },
      {
        sourceId: 'a1',
        targetId: 'a3',
        value: 0.28,
        pathDescription: 'A039 -> A027 via weight 0.55',
      },
      {
        sourceId: 'a1',
        targetId: 'a4',
        value: 0.14,
        pathDescription: 'A039 -> A006 via weight 0.25',
      },
      {
        sourceId: 'a2',
        targetId: 'a5',
        value: 0.21,
        pathDescription: 'A015 -> A045 via weight 0.50',
      },
      {
        sourceId: 'a2',
        targetId: 'a6',
        value: 0.11,
        pathDescription: 'A015 -> A047 via weight 0.26',
      },
    ],
  },
};
