import {
  AlertTriangle,
  CascadeNodeIcon,
  CheckCircle,
  DriftArrowIcon,
  ExternalLink,
  Info,
  TrendingDown,
  TrendingUp,
  XCircle,
} from './index';

import type { Meta, StoryObj } from '@storybook/react';

function Tile({ label, children }: { label: string; children: React.ReactNode }): JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        padding: 16,
        border: '1px solid #E6E1D8',
        borderRadius: 4,
        background: '#FBF9F4',
        color: '#1A1A1A',
      }}
    >
      {children}
      <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11 }}>{label}</span>
    </div>
  );
}

function Grid(): JSX.Element {
  return (
    <div
      style={{
        padding: 24,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: 12,
      }}
    >
      <Tile label="CheckCircle">
        <CheckCircle size={20} />
      </Tile>
      <Tile label="AlertTriangle">
        <AlertTriangle size={20} />
      </Tile>
      <Tile label="XCircle">
        <XCircle size={20} />
      </Tile>
      <Tile label="Info">
        <Info size={20} />
      </Tile>
      <Tile label="ExternalLink">
        <ExternalLink size={20} />
      </Tile>
      <Tile label="TrendingUp">
        <TrendingUp size={20} />
      </Tile>
      <Tile label="TrendingDown">
        <TrendingDown size={20} />
      </Tile>
      <Tile label="DriftArrow up">
        <DriftArrowIcon direction="up" size={20} />
      </Tile>
      <Tile label="DriftArrow down">
        <DriftArrowIcon direction="down" size={20} />
      </Tile>
      <Tile label="DriftArrow flat">
        <DriftArrowIcon direction="flat" size={20} />
      </Tile>
      <Tile label="CascadeNode">
        <CascadeNodeIcon size={20} />
      </Tile>
    </div>
  );
}

const meta: Meta<typeof Grid> = {
  title: 'Foundations/Iconography',
  component: Grid,
  parameters: { layout: 'fullscreen' },
};

export default meta;
export const Catalogue: StoryObj<typeof Grid> = {};
