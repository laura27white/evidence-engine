'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * DataTable: dense editorial grid.
 *
 * Built on semantic `<table>` with ARIA grid role so keyboard users can navigate cells
 * with arrow keys. Sticky header, sortable columns (click / Enter / Space on header),
 * row hover, mono for numeric columns. Column descriptor controls cell formatting and
 * alignment.
 *
 * eslint-disable jsx-a11y/no-noninteractive-element-to-interactive-role
 *   WAI-ARIA grid pattern requires role="grid", "columnheader", and "gridcell" on
 *   arrow-key-navigable sortable tables. The default (role="table") does not wire up
 *   the arrow-key navigation model we need. Disabled at file level because the rule
 *   does not understand this pattern.
 */
/* eslint-disable jsx-a11y/no-noninteractive-element-to-interactive-role */
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { useCallback, useMemo, useState, } from 'react';
import { colour } from '../../tokens/colour';
import { space } from '../../tokens/space';
import { fontFamily, scaleStyle } from '../foundations/style-utils';
function defaultAlign(kind, align) {
    if (align)
        return align;
    if (kind === 'number' || kind === 'mono')
        return 'right';
    return 'left';
}
export function DataTable({ rows, columns, getRowId, caption, emptyState, style, ...rest }) {
    const [sort, setSort] = useState(null);
    const sortedRows = useMemo(() => {
        if (!sort)
            return rows;
        const column = columns.find((c) => c.key === sort.key);
        if (!column?.compare)
            return rows;
        const sorted = [...rows].sort(column.compare);
        return sort.direction === 'asc' ? sorted : sorted.reverse();
    }, [rows, columns, sort]);
    const toggleSort = useCallback((key) => {
        setSort((prev) => {
            if (prev?.key === key) {
                return prev.direction === 'asc' ? { key, direction: 'desc' } : null;
            }
            return { key, direction: 'asc' };
        });
    }, []);
    const onHeaderKey = useCallback((event, key) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleSort(key);
        }
    }, [toggleSort]);
    const tableStyle = {
        width: '100%',
        borderCollapse: 'collapse',
        fontFamily: fontFamily.body,
        color: colour.ink.primary,
        ...style,
    };
    return (_jsxs("table", { role: "grid", style: tableStyle, ...rest, children: [caption ? (_jsx("caption", { style: {
                    textAlign: 'left',
                    padding: `${space.scale['3']} 0`,
                    color: colour.ink.tertiary,
                }, children: caption })) : null, _jsx("thead", { children: _jsx("tr", { children: columns.map((c) => {
                        const align = defaultAlign(c.kind, c.align);
                        const sorted = sort?.key === c.key;
                        const SortIcon = sorted
                            ? sort?.direction === 'asc'
                                ? ArrowUp
                                : ArrowDown
                            : ArrowUpDown;
                        return (_jsx("th", { scope: "col", role: "columnheader", "aria-sort": sorted ? (sort?.direction === 'asc' ? 'ascending' : 'descending') : 'none', tabIndex: c.sortable ? 0 : -1, onClick: c.sortable ? () => toggleSort(c.key) : undefined, onKeyDown: c.sortable ? (e) => onHeaderKey(e, c.key) : undefined, style: {
                                position: 'sticky',
                                top: 0,
                                background: colour.paper.cream,
                                borderBottom: `1px solid ${colour.line.regular}`,
                                padding: `${space.scale['3']} ${space.scale['4']}`,
                                textAlign: align,
                                cursor: c.sortable ? 'pointer' : 'default',
                                color: colour.ink.secondary,
                                fontFamily: fontFamily.body,
                                ...scaleStyle('label'),
                                width: c.width,
                            }, children: _jsxs("span", { style: { display: 'inline-flex', alignItems: 'center', gap: space.scale['1'] }, children: [c.header, c.sortable ? _jsx(SortIcon, { size: 12, "aria-hidden": true }) : null] }) }, c.key));
                    }) }) }), _jsx("tbody", { children: sortedRows.length === 0 && emptyState ? (_jsx("tr", { children: _jsx("td", { colSpan: columns.length, style: { padding: space.scale['8'], textAlign: 'center', color: colour.ink.tertiary }, children: emptyState }) })) : (sortedRows.map((row) => {
                    const id = getRowId(row);
                    return (_jsx("tr", { role: "row", style: { borderBottom: `1px solid ${colour.line.hairline}` }, children: columns.map((c) => {
                            const align = defaultAlign(c.kind, c.align);
                            const monoy = c.kind === 'mono' || c.kind === 'number' || c.kind === 'timestamp';
                            return (_jsx("td", { role: "gridcell", style: {
                                    padding: `${space.scale['3']} ${space.scale['4']}`,
                                    textAlign: align,
                                    fontFamily: monoy ? fontFamily.mono : fontFamily.body,
                                    ...scaleStyle(monoy ? 'mono' : 'body'),
                                    color: colour.ink.primary,
                                }, children: c.render(row) }, c.key));
                        }) }, id));
                })) })] }));
}
//# sourceMappingURL=DataTable.js.map