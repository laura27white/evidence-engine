import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen } from '@testing-library/react';
// eslint-disable-next-line import/no-named-as-default -- user-event's default export is the userEvent object; the named export exists too but the canonical docs use the default.
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { DataTable } from '../components/DataTable';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { HorizonBar } from '../components/HorizonBar';
import { KPI } from '../components/KPI';
import { LoadingState } from '../components/LoadingState';
import { PageHeader } from '../components/PageHeader';
import { SeverityIndicator } from '../components/SeverityIndicator';
import { SourceLink } from '../components/SourceLink';
import { Text } from '../components/Text';
import { Timestamp } from '../components/Timestamp';
describe('Text', () => {
    it('renders the semantic element requested', () => {
        render(_jsx(Text, { as: "h1", variant: "displayLarge", children: "Title" }));
        const heading = screen.getByRole('heading', { level: 1 });
        expect(heading).toHaveTextContent('Title');
    });
    it('truncates with ellipsis when requested', () => {
        render(_jsx(Text, { truncate: true, "data-testid": "t", children: "Lorem ipsum dolor sit amet" }));
        const el = screen.getByTestId('t');
        expect(el.style.textOverflow).toBe('ellipsis');
        expect(el.style.whiteSpace).toBe('nowrap');
    });
});
describe('Button', () => {
    it('calls onClick when pressed', async () => {
        const onClick = vi.fn();
        const user = userEvent.setup();
        render(_jsx(Button, { onClick: onClick, children: "Go" }));
        await user.click(screen.getByRole('button', { name: 'Go' }));
        expect(onClick).toHaveBeenCalledTimes(1);
    });
    it('sets aria-busy when loading and suppresses onClick', async () => {
        const onClick = vi.fn();
        const user = userEvent.setup();
        render(_jsx(Button, { loading: true, onClick: onClick, children: "Go" }));
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-busy', 'true');
        expect(button).toBeDisabled();
        await user.click(button);
        expect(onClick).not.toHaveBeenCalled();
    });
    it('renders loading text for reduced-motion-friendly users', () => {
        render(_jsx(Button, { loading: true, children: "Save" }));
        expect(screen.getByRole('button')).toHaveTextContent('Loading');
    });
});
describe('Badge', () => {
    it('renders status role with visible label', () => {
        render(_jsx(Badge, { variant: "warning", children: "Warning" }));
        expect(screen.getByRole('status')).toHaveTextContent('Warning');
    });
    it('drops the default icon when icon is null', () => {
        render(_jsx(Badge, { variant: "safe", icon: null, "data-testid": "b", children: "Plain" }));
        const badge = screen.getByTestId('b');
        expect(badge.querySelector('svg')).toBeNull();
    });
});
describe('Card', () => {
    it('renders as the requested element', () => {
        render(_jsx(Card, { as: "article", "data-testid": "c", children: _jsx("p", { children: "Body" }) }));
        const card = screen.getByTestId('c');
        expect(card.tagName).toBe('ARTICLE');
    });
});
describe('SeverityIndicator', () => {
    it('exposes an accessible label combining level and value', () => {
        render(_jsx(SeverityIndicator, { level: "critical", value: "-1.4pp" }));
        expect(screen.getByRole('status')).toHaveAccessibleName('Critical: -1.4pp');
    });
});
describe('Timestamp', () => {
    it('renders an ISO datetime attribute and a relative label', () => {
        const past = new Date(Date.now() - 90_000);
        render(_jsx(Timestamp, { at: past.toISOString() }));
        const time = screen.getByText(/ago$/);
        expect(time.tagName).toBe('TIME');
        expect(time).toHaveAttribute('datetime', past.toISOString());
    });
});
describe('SourceLink', () => {
    it('opens in a new tab with safe rel', () => {
        render(_jsx(SourceLink, { href: "https://example.com/series", label: "ONS:D7G7" }));
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', expect.stringContaining('noreferrer'));
        expect(link).toHaveAccessibleName(/opens in new tab/i);
    });
});
describe('KPI', () => {
    it('renders the label, value, and unit', () => {
        render(_jsx(KPI, { label: "Lead time", value: 47, unit: "days" }));
        expect(screen.getByText('Lead time')).toBeInTheDocument();
        expect(screen.getByText('47')).toBeInTheDocument();
        expect(screen.getByText('days')).toBeInTheDocument();
    });
});
describe('DataTable', () => {
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
            key: 'value',
            header: 'Value',
            kind: 'number',
            sortable: true,
            compare: (a, b) => a.value - b.value,
            render: (r) => r.value,
        },
    ];
    const rows = [
        { code: 'B', value: 2 },
        { code: 'A', value: 1 },
        { code: 'C', value: 3 },
    ];
    it('renders a grid role with header cells', () => {
        render(_jsx(DataTable, { rows: rows, columns: columns, getRowId: (r) => r.code }));
        expect(screen.getByRole('grid')).toBeInTheDocument();
        expect(screen.getAllByRole('columnheader')).toHaveLength(2);
        expect(screen.getAllByRole('row')).toHaveLength(rows.length + 1);
    });
    it('toggles aria-sort when a sortable header is clicked', async () => {
        const user = userEvent.setup();
        render(_jsx(DataTable, { rows: rows, columns: columns, getRowId: (r) => r.code }));
        const codeHeader = screen.getByRole('columnheader', { name: /^Code/ });
        expect(codeHeader).toHaveAttribute('aria-sort', 'none');
        await user.click(codeHeader);
        expect(codeHeader).toHaveAttribute('aria-sort', 'ascending');
        await user.click(codeHeader);
        expect(codeHeader).toHaveAttribute('aria-sort', 'descending');
    });
    it('renders an empty state when rows is empty', () => {
        render(_jsx(DataTable, { rows: [], columns: columns, getRowId: (r) => r.code, emptyState: "Nothing yet" }));
        expect(screen.getByText('Nothing yet')).toBeInTheDocument();
    });
});
describe('HorizonBar', () => {
    it('exposes the description as an accessible label', () => {
        render(_jsx(HorizonBar, { currentPosition: 0.35, projectedBreach: 0.72, severity: "warning", description: "35 percent through horizon, breach month 9." }));
        expect(screen.getByRole('img')).toHaveAccessibleName(/breach month 9/);
    });
    it('clamps currentPosition to [0, 1]', () => {
        render(_jsx(HorizonBar, { "data-testid": "h", currentPosition: 1.5, severity: "critical", description: "over the limit" }));
        expect(screen.getByRole('img')).toBeInTheDocument();
    });
});
describe('AppShell', () => {
    it('marks the active nav item with aria-current', async () => {
        const { AppShell } = await import('../components/AppShell');
        render(_jsx(AppShell, { navItems: [
                { label: 'Horizon', href: '/horizon' },
                { label: 'Cascade', href: '/cascade' },
            ], activePath: "/cascade", children: "body" }));
        const horizonLink = screen.getByRole('link', { name: 'Horizon' });
        const cascadeLink = screen.getByRole('link', { name: 'Cascade' });
        expect(cascadeLink).toHaveAttribute('aria-current', 'page');
        expect(horizonLink).not.toHaveAttribute('aria-current');
    });
});
describe('PageHeader', () => {
    it('renders the title as h1', () => {
        render(_jsx(PageHeader, { title: "Horizon" }));
        expect(screen.getByRole('heading', { level: 1, name: 'Horizon' })).toBeInTheDocument();
    });
});
describe('EmptyState', () => {
    it('renders title and description with status role', () => {
        render(_jsx(EmptyState, { title: "Nothing", description: "Yet" }));
        const panel = screen.getByRole('status');
        expect(panel).toHaveTextContent('Nothing');
        expect(panel).toHaveTextContent('Yet');
    });
});
describe('LoadingState', () => {
    it('has an aria-live region for screen readers', () => {
        render(_jsx(LoadingState, { label: "Loading assumptions" }));
        const panel = screen.getByRole('status');
        expect(panel).toHaveAttribute('aria-live', 'polite');
        expect(panel).toHaveAttribute('aria-label', 'Loading assumptions');
    });
});
describe('ErrorState', () => {
    it('exposes an alert role and renders title + description', () => {
        render(_jsx(ErrorState, { title: "Oh no", description: "Something went wrong" }));
        const alert = screen.getByRole('alert');
        expect(alert).toHaveTextContent('Oh no');
        expect(alert).toHaveTextContent('Something went wrong');
    });
});
//# sourceMappingURL=components.test.js.map