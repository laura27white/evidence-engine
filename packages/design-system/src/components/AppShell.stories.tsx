import { AppShell } from './AppShell';
import { PageHeader } from './PageHeader';
import { Text } from './Text';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof AppShell> = {
  title: 'Components/AppShell',
  component: AppShell,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  args: {
    navItems: [
      { label: 'Horizon', href: '/horizon' },
      { label: 'Cascade', href: '/cascade' },
      { label: 'Trace', href: '/trace' },
      { label: 'Brief', href: '/brief' },
    ],
    activePath: '/horizon',
    children: (
      <>
        <PageHeader
          kicker="MPA Challenge 5"
          title="Evidence Engine: horizon view"
          subtitle="Forty-seven assumptions, ranked by projected breach date."
        />
        <Text>Body content goes here.</Text>
      </>
    ),
  },
};

export default meta;
type Story = StoryObj<typeof AppShell>;

export const HorizonActive: Story = {};

export const BriefActive: Story = { args: { activePath: '/brief' } };
