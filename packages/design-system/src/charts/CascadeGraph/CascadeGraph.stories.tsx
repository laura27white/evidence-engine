import { CascadeGraph } from './CascadeGraph';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof CascadeGraph> = {
  title: 'Charts/CascadeGraph',
  component: CascadeGraph,
  parameters: { layout: 'padded' },
};

export default meta;

type Story = StoryObj<typeof CascadeGraph>;

export const Default: Story = {
  args: {
    nodes: [
      { id: 'a1', code: 'A039', category: 'Economic', highlighted: true },
      { id: 'a2', code: 'A040', category: 'Economic', highlighted: false },
      { id: 'a3', code: 'A015', category: 'Operational', highlighted: true },
      { id: 'a4', code: 'A006', category: 'Operational', highlighted: true },
      { id: 'a5', code: 'A027', category: 'People', highlighted: true },
      { id: 'a6', code: 'A041', category: 'Regulatory', highlighted: false },
    ],
    edges: [
      { source: 'a1', target: 'a3', weight: 0.8, highlighted: true },
      { source: 'a1', target: 'a4', weight: 0.5, highlighted: true },
      { source: 'a3', target: 'a5', weight: 0.6, highlighted: true },
      { source: 'a2', target: 'a5', weight: 0.3, highlighted: false },
      { source: 'a6', target: 'a4', weight: 0.4, highlighted: false },
    ],
    highlightedSourceId: 'a1',
  },
};
