import { colour, space, typography } from '../tokens';

import { Wordmark } from './brand';

import type { Meta, StoryObj } from '@storybook/react';

function Welcome(): JSX.Element {
  return (
    <main
      style={{
        fontFamily: typography.font.body,
        color: colour.ink.primary,
        background: colour.paper.cream,
        padding: space.scale['20'],
        minHeight: '100vh',
      }}
    >
      <div style={{ marginBottom: space.scale['10'] }}>
        <Wordmark height={28} />
      </div>
      <p
        style={{
          fontFamily: typography.font.body,
          fontSize: typography.scale.label.size,
          lineHeight: typography.scale.label.lineHeight,
          letterSpacing: typography.scale.label.tracking,
          textTransform: 'uppercase',
          color: colour.accent.teal,
          marginBottom: space.scale['4'],
        }}
      >
        Design system
      </p>
      <h1
        style={{
          fontFamily: typography.font.display,
          fontSize: typography.scale.displayLarge.size,
          lineHeight: typography.scale.displayLarge.lineHeight,
          letterSpacing: typography.scale.displayLarge.tracking,
          fontWeight: typography.scale.displayLarge.weight,
          margin: 0,
          marginBottom: space.scale['4'],
          maxWidth: '22ch',
        }}
      >
        Editorial intelligence, not dashboard-by-default.
      </h1>
      <p
        style={{
          fontFamily: typography.font.body,
          fontSize: typography.scale.bodyLarge.size,
          lineHeight: typography.scale.bodyLarge.lineHeight,
          color: colour.ink.secondary,
          maxWidth: '65ch',
          margin: 0,
        }}
      >
        The Evidence Engine design system codifies the visual direction committed to in
        ARCHITECTURE.md section 6. A cream paper base, an ink body, a single teal accent, and a
        colour-blind-safe severity scale. Serif display paired with a sans body and a mono for data.
        Browse the Foundations for tokens, motion, and iconography; browse Components for primitives
        that compose into every view.
      </p>
    </main>
  );
}

const meta: Meta<typeof Welcome> = {
  title: 'Welcome',
  component: Welcome,
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Default: StoryObj<typeof Welcome> = {};
