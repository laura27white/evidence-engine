import { SourceLink } from './SourceLink';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof SourceLink> = {
  title: 'Components/SourceLink',
  component: SourceLink,
  tags: ['autodocs'],
  args: {
    href: 'https://www.ons.gov.uk/economy/inflationandpriceindices/timeseries/d7g7/mm23',
    label: 'ONS:D7G7',
  },
  argTypes: {
    tone: { control: { type: 'select' }, options: ['default', 'muted'] },
    size: { control: { type: 'select' }, options: ['sm', 'md'] },
  },
};

export default meta;
type Story = StoryObj<typeof SourceLink>;

export const Default: Story = {};
export const Muted: Story = { args: { tone: 'muted' } };
export const List: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <SourceLink href="https://www.ons.gov.uk/economy" label="ONS:D7G7" />
      <SourceLink href="https://www.bankofengland.co.uk" label="BOE:IUDSOIA" />
      <SourceLink
        href="https://www.gov.uk/api/search.json"
        label="GOVUK:hmrc-tax-policy-announcements"
      />
    </div>
  ),
};
