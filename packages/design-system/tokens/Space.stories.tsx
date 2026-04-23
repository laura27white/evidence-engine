import { space } from './space';

import type { Meta, StoryObj } from '@storybook/react';

function SpaceScale(): JSX.Element {
  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Object.entries(space.scale).map(([key, value]) => (
        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span
            style={{
              width: 48,
              fontFamily: 'var(--font-mono), monospace',
              fontSize: 13,
              color: '#4A4A4A',
            }}
          >
            {key}
          </span>
          <span
            style={{
              width: 72,
              fontFamily: 'var(--font-mono), monospace',
              fontSize: 13,
              color: '#4A4A4A',
            }}
          >
            {value}
          </span>
          <div style={{ height: 16, width: value, background: '#0E6B6B', borderRadius: 2 }} />
        </div>
      ))}
    </div>
  );
}

const meta: Meta<typeof SpaceScale> = {
  title: 'Foundations/Tokens/Space',
  component: SpaceScale,
  parameters: { layout: 'fullscreen' },
};

export default meta;
export const Scale: StoryObj<typeof SpaceScale> = {};
