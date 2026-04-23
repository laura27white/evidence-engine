import { typography } from './typography';

import type { Meta, StoryObj } from '@storybook/react';

function Specimen(): JSX.Element {
  return (
    <div
      style={{
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        background: '#F7F4EE',
      }}
    >
      {Object.entries(typography.scale).map(([name, spec]) => (
        <div key={name} style={{ borderBottom: '1px solid #E6E1D8', paddingBottom: 16 }}>
          <div
            style={{
              fontFamily: 'var(--font-mono), monospace',
              fontSize: 11,
              color: '#7A7A7A',
              marginBottom: 8,
            }}
          >
            {name} · {spec.size} / {spec.lineHeight} · weight {spec.weight} · tracking{' '}
            {spec.tracking}
          </div>
          <div
            style={{
              fontSize: spec.size,
              lineHeight: spec.lineHeight,
              fontWeight: spec.weight,
              letterSpacing: spec.tracking,
              fontFamily: name.startsWith('display')
                ? 'var(--font-display), Georgia, serif'
                : name.startsWith('mono')
                  ? 'var(--font-mono), monospace'
                  : 'var(--font-body), system-ui, sans-serif',
              color: '#1A1A1A',
              textTransform:
                'textTransform' in spec ? (spec.textTransform as 'uppercase') : undefined,
            }}
          >
            Editorial intelligence anchored to live UK public data.
          </div>
        </div>
      ))}
    </div>
  );
}

const meta: Meta<typeof Specimen> = {
  title: 'Foundations/Tokens/Typography',
  component: Specimen,
  parameters: { layout: 'fullscreen' },
};

export default meta;
export const Scale: StoryObj<typeof Specimen> = {};
