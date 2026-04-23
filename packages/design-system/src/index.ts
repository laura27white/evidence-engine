// @tp/design-system: tokens, primitives, motion, brand, icons.

// Tokens are exposed under a dedicated sub-path, but we also re-export the objects at
// the top level for convenience.
export { colour, typography, space } from '../tokens';
export type { Colour, SeverityTone, Typography, TypographyScale, Space, SpaceKey } from '../tokens';

// Components.
export { Text, type TextProps, type TextTone } from './components/Text';
export { Button, type ButtonProps, type ButtonSize, type ButtonVariant } from './components/Button';
export { Badge, type BadgeProps, type BadgeSize, type BadgeVariant } from './components/Badge';
export { Card, type CardProps, type CardPadding, type CardVariant } from './components/Card';
export {
  SeverityIndicator,
  type SeverityIndicatorProps,
  type SeverityLevel,
} from './components/SeverityIndicator';
export { Timestamp, type TimestampProps } from './components/Timestamp';
export { SourceLink, type SourceLinkProps } from './components/SourceLink';
export { KPI, type KPIProps, type KPITrend } from './components/KPI';
export {
  DataTable,
  type DataTableProps,
  type Column,
  type ColumnAlign,
  type ColumnKind,
} from './components/DataTable';
export { HorizonBar, type HorizonBarProps } from './components/HorizonBar';
export {
  SankeyNode,
  SankeyEdge,
  type SankeyNodeProps,
  type SankeyEdgeProps,
} from './components/Sankey';
export { AppShell, type AppShellProps, type NavItem } from './components/AppShell';
export { PageHeader, type PageHeaderProps } from './components/PageHeader';
export { EmptyState, type EmptyStateProps } from './components/EmptyState';
export { LoadingState, type LoadingStateProps } from './components/LoadingState';
export { ErrorState, type ErrorStateProps } from './components/ErrorState';

// Motion.
export {
  StaggerFade,
  ChartTransition,
  PageTransition,
  useReducedMotion,
  type StaggerFadeProps,
  type ChartTransitionProps,
  type PageTransitionProps,
} from './motion';

// Brand.
export {
  Wordmark,
  Monogram,
  type WordmarkProps,
  type MonogramProps,
  type WordmarkVariant,
} from './brand';

// Icons.
export { DriftArrowIcon, CascadeNodeIcon } from './icons';

// Charts.
export {
  TraceTimeline,
  type TraceTimelineProps,
  type TraceMeasurement,
  HorizonChart,
  type HorizonChartProps,
  type HorizonDatum,
  CascadeSankey,
  type CascadeSankeyProps,
  type SankeyNodeInput,
  type SankeyLinkInput,
  CascadeGraph,
  type CascadeGraphProps,
  type GraphNodeInput,
  type GraphEdgeInput,
} from './charts';
