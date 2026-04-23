import { DataTable } from './DataTable';
import type { Meta, StoryObj } from '@storybook/react';
interface AssumptionRow {
    code: string;
    description: string;
    tier: 1 | 2 | 3;
    severity: 'safe' | 'warning' | 'critical';
    drift: number;
    lastSeen: string;
}
declare const meta: Meta<typeof DataTable<AssumptionRow>>;
export default meta;
type Story = StoryObj<typeof DataTable<AssumptionRow>>;
export declare const Assumptions: Story;
export declare const Empty: Story;
//# sourceMappingURL=DataTable.stories.d.ts.map