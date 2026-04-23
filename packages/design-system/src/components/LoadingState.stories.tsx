import { LoadingState } from './LoadingState';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof LoadingState> = {
  title: 'Components/LoadingState',
  component: LoadingState,
  tags: ['autodocs'],
  args: { rows: 4 },
};

export default meta;
type Story = StoryObj<typeof LoadingState>;

export const FourRows: Story = {};
export const OneRow: Story = { args: { rows: 1 } };
export const MatchingATableRowHeight: Story = { args: { rowHeight: '28px', rows: 6 } };
