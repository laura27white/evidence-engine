import { useState } from 'react';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Text } from '../components/Text';

import { ChartTransition } from './ChartTransition';
import { PageTransition } from './PageTransition';
import { StaggerFade } from './StaggerFade';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Foundations/Motion',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const StaggerFadeList: Story = {
  render: () => (
    <StaggerFade>
      {['A046 Inflation', 'A047 Interest Rates', 'A048 Tax Policy'].map((label) => (
        <Card key={label} variant="default" padding="md" style={{ marginBottom: 12 }}>
          <Text variant="displaySmall">{label}</Text>
        </Card>
      ))}
    </StaggerFade>
  ),
};

export const ChartTransitionSwap: Story = {
  render: () => {
    function Demo() {
      const [range, setRange] = useState<'1m' | '3m' | '12m'>('3m');
      return (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {(['1m', '3m', '12m'] as const).map((r) => (
              <Button
                key={r}
                variant={r === range ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setRange(r)}
              >
                {r}
              </Button>
            ))}
          </div>
          <ChartTransition transitionKey={range}>
            <Card padding="lg">
              <Text variant="displayMedium">{range} chart placeholder</Text>
            </Card>
          </ChartTransition>
        </div>
      );
    }
    return <Demo />;
  },
};

export const PageTransitionSwap: Story = {
  render: () => {
    function Demo() {
      const [path, setPath] = useState('/horizon');
      return (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {['/horizon', '/cascade', '/trace'].map((p) => (
              <Button
                key={p}
                variant={p === path ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setPath(p)}
              >
                {p}
              </Button>
            ))}
          </div>
          <PageTransition pathname={path}>
            <Card padding="lg">
              <Text variant="displayMedium">Page: {path}</Text>
            </Card>
          </PageTransition>
        </div>
      );
    }
    return <Demo />;
  },
};
