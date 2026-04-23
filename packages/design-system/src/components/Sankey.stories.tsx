import { SankeyEdge, SankeyNode } from './Sankey';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Components/Sankey',
};

export default meta;
type Story = StoryObj;

export const Primitive: Story = {
  render: () => (
    <svg
      width={720}
      height={280}
      role="img"
      aria-label="A046 Inflation cascades into five downstream assumptions."
    >
      <SankeyNode x={40} y={110} width={160} height={60} label="A046 Inflation" tone="accent" />
      <SankeyNode x={520} y={20} width={160} height={40} label="A011 Funding" tone="warning" />
      <SankeyNode x={520} y={80} width={160} height={40} label="A025 Resourcing" tone="warning" />
      <SankeyNode x={520} y={140} width={160} height={40} label="A028 Budget" tone="critical" />
      <SankeyNode x={520} y={200} width={160} height={40} label="A043 Fit-out" tone="default" />
      <SankeyEdge
        source={{ x: 200, y: 140 }}
        target={{ x: 520, y: 40 }}
        strokeWidth={5}
        tone="warning"
      />
      <SankeyEdge
        source={{ x: 200, y: 140 }}
        target={{ x: 520, y: 100 }}
        strokeWidth={4}
        tone="warning"
      />
      <SankeyEdge
        source={{ x: 200, y: 140 }}
        target={{ x: 520, y: 160 }}
        strokeWidth={6}
        tone="critical"
      />
      <SankeyEdge source={{ x: 200, y: 140 }} target={{ x: 520, y: 220 }} strokeWidth={3} />
    </svg>
  ),
};
