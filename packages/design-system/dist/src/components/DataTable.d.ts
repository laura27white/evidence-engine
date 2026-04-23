import { type HTMLAttributes, type ReactNode } from 'react';
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
export declare function DataTable<Row>({ rows, columns, getRowId, caption, emptyState, style, ...rest }: DataTableProps<Row>): JSX.Element;
//# sourceMappingURL=DataTable.d.ts.map