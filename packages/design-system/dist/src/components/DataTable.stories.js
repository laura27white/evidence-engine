import { jsx as _jsx } from "react/jsx-runtime";
import { Badge } from './Badge';
import { DataTable } from './DataTable';
import { Timestamp } from './Timestamp';
const rows = [
    {
        code: 'A046',
        description: 'Inflation within central bank forecast range',
        tier: 1,
        severity: 'warning',
        drift: 0.6,
        lastSeen: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
        code: 'A047',
        description: 'Interest rates not materially above baseline',
        tier: 1,
        severity: 'safe',
        drift: 0.18,
        lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
        code: 'A048',
        description: 'No new corporate taxes',
        tier: 1,
        severity: 'safe',
        drift: 0,
        lastSeen: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        code: 'A011',
        description: 'Funding available on milestone schedule',
        tier: 3,
        severity: 'warning',
        drift: 0.42,
        lastSeen: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    },
    {
        code: 'A028',
        description: 'Internal budget not reallocated',
        tier: 3,
        severity: 'critical',
        drift: 0.95,
        lastSeen: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
];
const columns = [
    {
        key: 'code',
        header: 'Code',
        kind: 'mono',
        sortable: true,
        compare: (a, b) => a.code.localeCompare(b.code),
        render: (r) => r.code,
    },
    {
        key: 'description',
        header: 'Description',
        kind: 'text',
        render: (r) => r.description,
    },
    {
        key: 'tier',
        header: 'Tier',
        kind: 'number',
        sortable: true,
        compare: (a, b) => a.tier - b.tier,
        render: (r) => r.tier,
    },
    {
        key: 'severity',
        header: 'Status',
        kind: 'badge',
        render: (r) => _jsx(Badge, { variant: r.severity, children: r.severity }),
    },
    {
        key: 'drift',
        header: 'Drift score',
        kind: 'number',
        sortable: true,
        compare: (a, b) => a.drift - b.drift,
        render: (r) => r.drift.toFixed(2),
    },
    {
        key: 'lastSeen',
        header: 'Last observation',
        kind: 'timestamp',
        render: (r) => _jsx(Timestamp, { at: r.lastSeen }),
    },
];
const meta = {
    title: 'Components/DataTable',
    component: DataTable,
};
export default meta;
export const Assumptions = {
    args: {
        rows,
        columns,
        getRowId: (r) => r.code,
        caption: 'HPO24A01 externally anchored plus top movers',
    },
};
export const Empty = {
    args: {
        rows: [],
        columns,
        getRowId: (r) => r.code,
        emptyState: 'No assumptions match the current filters.',
    },
};
//# sourceMappingURL=DataTable.stories.js.map