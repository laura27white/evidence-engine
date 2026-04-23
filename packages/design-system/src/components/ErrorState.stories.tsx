import { Button } from './Button';
import { ErrorState } from './ErrorState';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof ErrorState> = {
  title: 'Components/ErrorState',
  component: ErrorState,
  tags: ['autodocs'],
  args: {
    title: 'Ingestion stalled',
    description:
      'The ONS timeseries endpoint returned HTTP 503 on the last three attempts. Evidence Engine is retrying in the background; data shown below is from the most recent successful fetch.',
    action: <Button variant="secondary">Retry now</Button>,
    technicalDetail:
      'GET https://api.beta.ons.gov.uk/v1/timeseries/d7g7/dataset/mm23/data → 503 Service Unavailable',
  },
};

export default meta;
type Story = StoryObj<typeof ErrorState>;

export const Default: Story = {};

export const WithoutDetail: Story = { args: { technicalDetail: undefined } };
