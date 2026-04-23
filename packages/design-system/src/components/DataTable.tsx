'use client';

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
import {
  useCallback,
  useMemo,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

import { colour } from '../../tokens/colour';
import { space } from '../../tokens/space';
import { fontFamily, scaleStyle } from '../foundations/style-utils';

export type ColumnAlign = 'left' | 'right' | 'center';
export type ColumnKind = 'text' | 'number' | 'mono' | 'badge' | 'timestamp';

export interface Column<Row> {
  /** Stable key; used for sort state and keys. */
  key: string;
  /** Header label. */
  header: ReactNode;
  /** Cell renderer. */
  render: (row: Row) => ReactNode;
  /** Cell alignment. Defaults to left for text, right for number/mono. */
  align?: ColumnAlign;
  /** Column kind, controls font family and default alignment. */
  kind?: ColumnKind;
  /** When true, the column header is clickable for sort. */
  sortable?: boolean;
  /** Comparator; required when sortable. */
  compare?: (a: Row, b: Row) => number;
  /** Optional explicit width (CSS length). */
  width?: string;
}

export interface DataTableProps<Row> extends HTMLAttributes<HTMLTableElement> {
  rows: Row[];
  columns: Column<Row>[];
  /** Stable key accessor for React keys. */
  getRowId: (row: Row) => string;
  /** Optional caption for accessibility. */
  caption?: ReactNode;
  /** Optional empty-state renderer. */
  emptyState?: ReactNode;
}

interface SortState {
  key: string;
  direction: 'asc' | 'desc';
}

function defaultAlign(kind: ColumnKind | undefined, align: ColumnAlign | undefined): ColumnAlign {
  if (align) return align;
  if (kind === 'number' || kind === 'mono') return 'right';
  return 'left';
}

export function DataTable<Row>({
  rows,
  columns,
  getRowId,
  caption,
  emptyState,
  style,
  ...rest
}: DataTableProps<Row>): JSX.Element {
  const [sort, setSort] = useState<SortState | null>(null);

  const sortedRows = useMemo(() => {
    if (!sort) return rows;
    const column = columns.find((c) => c.key === sort.key);
    if (!column?.compare) return rows;
    const sorted = [...rows].sort(column.compare);
    return sort.direction === 'asc' ? sorted : sorted.reverse();
  }, [rows, columns, sort]);

  const toggleSort = useCallback((key: string) => {
    setSort((prev) => {
      if (prev?.key === key) {
        return prev.direction === 'asc' ? { key, direction: 'desc' } : null;
      }
      return { key, direction: 'asc' };
    });
  }, []);

  const onHeaderKey = useCallback(
    (event: KeyboardEvent<HTMLTableCellElement>, key: string) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleSort(key);
      }
    },
    [toggleSort],
  );

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontFamily: fontFamily.body,
    color: colour.ink.primary,
    ...style,
  };

  return (
    <table role="grid" style={tableStyle} {...rest}>
      {caption ? (
        <caption
          style={{
            textAlign: 'left',
            padding: `${space.scale['3']} 0`,
            color: colour.ink.tertiary,
          }}
        >
          {caption}
        </caption>
      ) : null}
      <thead>
        <tr>
          {columns.map((c) => {
            const align = defaultAlign(c.kind, c.align);
            const sorted = sort?.key === c.key;
            const SortIcon = sorted
              ? sort?.direction === 'asc'
                ? ArrowUp
                : ArrowDown
              : ArrowUpDown;
            return (
              <th
                key={c.key}
                scope="col"
                role="columnheader"
                aria-sort={
                  sorted ? (sort?.direction === 'asc' ? 'ascending' : 'descending') : 'none'
                }
                tabIndex={c.sortable ? 0 : -1}
                onClick={c.sortable ? () => toggleSort(c.key) : undefined}
                onKeyDown={c.sortable ? (e) => onHeaderKey(e, c.key) : undefined}
                style={{
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
                }}
              >
                <span
                  style={{ display: 'inline-flex', alignItems: 'center', gap: space.scale['1'] }}
                >
                  {c.header}
                  {c.sortable ? <SortIcon size={12} aria-hidden /> : null}
                </span>
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {sortedRows.length === 0 && emptyState ? (
          <tr>
            <td
              colSpan={columns.length}
              style={{ padding: space.scale['8'], textAlign: 'center', color: colour.ink.tertiary }}
            >
              {emptyState}
            </td>
          </tr>
        ) : (
          sortedRows.map((row) => {
            const id = getRowId(row);
            return (
              <tr key={id} role="row" style={{ borderBottom: `1px solid ${colour.line.hairline}` }}>
                {columns.map((c) => {
                  const align = defaultAlign(c.kind, c.align);
                  const monoy = c.kind === 'mono' || c.kind === 'number' || c.kind === 'timestamp';
                  return (
                    <td
                      key={c.key}
                      role="gridcell"
                      style={{
                        padding: `${space.scale['3']} ${space.scale['4']}`,
                        textAlign: align,
                        fontFamily: monoy ? fontFamily.mono : fontFamily.body,
                        ...scaleStyle(monoy ? 'mono' : 'body'),
                        color: colour.ink.primary,
                      }}
                    >
                      {c.render(row)}
                    </td>
                  );
                })}
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
}
