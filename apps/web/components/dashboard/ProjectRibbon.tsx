import { Text } from '@tp/design-system';

export interface ProjectRibbonProps {
  projectCode: string;
  projectName: string;
  latestComputedLabel?: string;
}

export function ProjectRibbon({
  projectCode,
  projectName,
  latestComputedLabel,
}: ProjectRibbonProps) {
  return (
    <div
      role="status"
      aria-label="Active project"
      style={{
        borderBottom: '1px solid #E6E1D8',
        padding: '8px 80px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#FBF9F4',
      }}
    >
      <Text variant="label" tone="tertiary" style={{ letterSpacing: '0.08em' }}>
        {projectCode} &middot; {projectName}
      </Text>
      {latestComputedLabel !== undefined ? (
        <Text variant="label" tone="tertiary" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {latestComputedLabel}
        </Text>
      ) : null}
    </div>
  );
}
