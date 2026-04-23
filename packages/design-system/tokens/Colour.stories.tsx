import { colour } from './colour';

import type { Meta, StoryObj } from '@storybook/react';

function Swatch({
  name,
  value,
  onDark,
}: {
  name: string;
  value: string;
  onDark?: boolean;
}): JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: 12,
        background: onDark ? '#1A1A1A' : '#F7F4EE',
        borderRadius: 4,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 4,
          background: value,
          border: '1px solid rgba(0,0,0,0.08)',
        }}
      />
      <div
        style={{
          color: onDark ? '#F7F4EE' : '#1A1A1A',
          fontFamily: 'var(--font-mono), monospace',
          fontSize: 13,
        }}
      >
        <div style={{ fontWeight: 500 }}>{name}</div>
        <div style={{ opacity: 0.65 }}>{value}</div>
      </div>
    </div>
  );
}

function Section({
  title,
  entries,
  onDark,
}: {
  title: string;
  entries: Record<string, string>;
  onDark?: boolean;
}): JSX.Element {
  return (
    <section style={{ marginBottom: 24 }}>
      <h2
        style={{
          fontFamily: 'var(--font-display), Georgia, serif',
          fontSize: 24,
          margin: '0 0 12px',
        }}
      >
        {title}
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 8,
        }}
      >
        {Object.entries(entries).map(([k, v]) => (
          <Swatch key={k} name={k} value={v} onDark={onDark} />
        ))}
      </div>
    </section>
  );
}

function Palette(): JSX.Element {
  return (
    <div style={{ padding: 24 }}>
      <Section title="Paper" entries={colour.paper} />
      <Section title="Ink" entries={colour.ink} />
      <Section title="Accent" entries={colour.accent} />
      <Section title="Severity" entries={colour.severity} />
      <Section title="Line" entries={colour.line} />
    </div>
  );
}

const meta: Meta<typeof Palette> = {
  title: 'Foundations/Tokens/Colour',
  component: Palette,
  parameters: { layout: 'fullscreen' },
};

export default meta;
export const All: StoryObj<typeof Palette> = {};
