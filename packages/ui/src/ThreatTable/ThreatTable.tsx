import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import { EmptyState, type EmptyStateVariant } from '../EmptyState/EmptyState';
import { Icon } from '../Icon/Icon';
import { TABLE_NARROW_BREAKPOINT_PX } from '../tokens/breakpoints';
import styles from './ThreatTable.module.css';

export type SortDirection = 'asc' | 'desc';
export interface TableSort {
  key: string;
  direction: SortDirection;
}

export interface ThreatTableColumn<Row> {
  key: string;
  header: string;
  /** Fixed width, e.g. "22%" or 160. Needed because the table uses fixed layout. */
  width?: string | number;
  align?: 'left' | 'right';
  /** Set false for columns with no meaningful order (e.g. evidence summary). */
  sortable?: boolean;
  /** Comparable value when the cell renders something other than a scalar. */
  sortValue?: (row: Row) => string | number | null;
  /** Cell content. Use StatusBadge here; status is never colour-only. */
  render?: (row: Row) => ReactNode;
  /** Renders the cell in the mono family for IPs, hashes and user agents. */
  mono?: boolean;
}

export interface ThreatTableProps<Row extends Record<string, unknown>> {
  columns: ThreatTableColumn<Row>[];
  rows: Row[];
  /** `empty` and `error` render an EmptyState in place of the table body. */
  state?: 'ready' | 'loading' | 'empty' | 'error';
  /** Controlled sort. Omit to let the table own its sort state. */
  sort?: TableSort | null;
  onSortChange?: (sort: TableSort) => void;
  /** Adds a focusable per-row action button. Rows are never click-only. */
  onRowActivate?: (row: Row) => void;
  /** Accessible name prefix for the row action, combined with `row.visitorLabel`. */
  rowActionLabel?: string;
  caption?: string;
  emptyState?: { variant?: EmptyStateVariant; title?: string; description?: string; actionLabel?: string; onAction?: () => void };
  errorState?: { title?: string; description?: string; actionLabel?: string; onAction?: () => void };
  skeletonRows?: number;
  getRowId?: (row: Row) => string;
  /** `auto` measures the container and switches to the stacked layout below the
   *  narrow breakpoint. Pass `table` or `stacked` to pin one layout. Required in
   *  Storybook, where container measurement is not reliable. */
  layout?: 'auto' | 'table' | 'stacked';
}

/* Auto layout measures the container, not the viewport, so the table adapts
   inside a split pane as well as on a phone. */
function useNarrow(ref: RefObject<HTMLDivElement | null>, layout: 'auto' | 'table' | 'stacked') {
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    if (layout !== 'auto') return;
    const node = ref.current;
    if (!node) return;
    const measure = () => setNarrow(node.getBoundingClientRect().width < TABLE_NARROW_BREAKPOINT_PX);
    measure();
    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(measure);
      ro.observe(node);
    }
    window.addEventListener('resize', measure);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [ref, layout]);

  if (layout === 'stacked') return true;
  if (layout === 'table') return false;
  return narrow;
}

function SortIcon({ state }: { state: SortDirection | 'none' }) {
  if (state === 'asc') return <Icon name="arrow-up" size="sm" />;
  if (state === 'desc') return <Icon name="arrow-down" size="sm" />;
  return <Icon name="chevrons-up-down" size="sm" className={styles.sortIdle} />;
}

function Skeleton({ wide }: { wide?: boolean }) {
  return <span aria-hidden="true" className={styles.skeleton} data-wide={wide || undefined} />;
}

function cellValue<Row extends Record<string, unknown>>(row: Row, col: ThreatTableColumn<Row>): ReactNode {
  if (col.render) return col.render(row);
  const v = row[col.key];
  return typeof v === 'string' || typeof v === 'number' ? v : null;
}

function rowIdentity<Row extends Record<string, unknown>>(row: Row, i: number, getRowId?: (row: Row) => string) {
  if (getRowId) return getRowId(row);
  const id = row.id;
  return typeof id === 'string' || typeof id === 'number' ? String(id) : String(i);
}

function TableRow<Row extends Record<string, unknown>>({
  row,
  columns,
  onActivate,
  actionLabel,
}: {
  row: Row;
  columns: ThreatTableColumn<Row>[];
  onActivate?: () => void;
  actionLabel: string;
}) {
  /* Every row action needs its own accessible name. Fall back to the first
     scalar cell value when the row carries no explicit label. */
  const explicit = row.visitorLabel;
  const rowName =
    (typeof explicit === 'string' && explicit) ||
    columns.map((c) => row[c.key]).find((v): v is string => typeof v === 'string' && v.length > 0) ||
    '';
  return (
    <tr className={styles.row} data-activatable={onActivate ? true : undefined}>
      {columns.map((col, j) => (
        <td key={col.key} className={styles.cell} data-align={col.align || 'left'} data-first={j === 0 || undefined} data-mono={col.mono || undefined}>
          <div className={styles.cellStack}>{cellValue(row, col)}</div>
        </td>
      ))}
      {onActivate ? (
        <td className={styles.cell} data-align="right" data-action>
          <button type="button" onClick={onActivate} aria-label={actionLabel + (rowName ? `: ${rowName}` : '')} className={styles.action}>
            <Icon name="arrow-right" size="sm" />
          </button>
        </td>
      ) : null}
    </tr>
  );
}

export function ThreatTable<Row extends Record<string, unknown>>({
  columns,
  rows,
  state = 'ready',
  sort,
  onSortChange,
  onRowActivate,
  rowActionLabel = 'View visitor',
  caption,
  emptyState,
  errorState,
  skeletonRows = 6,
  getRowId,
  layout = 'auto',
}: ThreatTableProps<Row>) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const narrow = useNarrow(wrapRef, layout);
  const [internalSort, setInternalSort] = useState<TableSort | null>(sort ?? null);
  const activeSort = sort !== undefined ? sort : internalSort;

  const setSort = (key: string) => {
    const next: TableSort =
      activeSort && activeSort.key === key ? { key, direction: activeSort.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: 'asc' };
    onSortChange?.(next);
    if (sort === undefined) setInternalSort(next);
  };

  const sorted = useMemo(() => {
    if (!activeSort) return rows;
    const col = columns.find((c) => c.key === activeSort.key);
    if (!col || col.sortable === false) return rows;
    const get = col.sortValue ?? ((row: Row) => (row[col.key] as string | number | null | undefined) ?? null);
    const dir = activeSort.direction === 'desc' ? -1 : 1;
    return [...rows].sort((a, b) => {
      const av = get(a);
      const bv = get(b);
      if (av === bv) return 0;
      if (av === null || av === undefined) return 1;
      if (bv === null || bv === undefined) return -1;
      return (typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv))) * dir;
    });
  }, [rows, columns, activeSort]);

  const sortMessage = activeSort
    ? `${columns.find((c) => c.key === activeSort.key)?.header ?? ''}, sorted ${activeSort.direction === 'asc' ? 'ascending' : 'descending'}`
    : 'Not sorted';

  const loading = state === 'loading';

  return (
    <div ref={wrapRef} className={styles.root}>
      <p aria-live="polite" className="cg-visually-hidden">
        {sortMessage}
      </p>

      {state === 'error' ? (
        <EmptyState
          variant="error"
          title={errorState?.title || 'Threat data could not be loaded'}
          description={errorState?.description || 'The request failed before any visitors were returned. Nothing here means unknown, not clean.'}
          actionLabel={errorState?.actionLabel || 'Retry'}
          onAction={errorState?.onAction}
        />
      ) : state === 'empty' ? (
        <EmptyState
          variant={emptyState?.variant || 'no-data'}
          title={emptyState?.title || 'No traffic in this date range'}
          description={emptyState?.description || 'Widen the range to see visitors.'}
          actionLabel={emptyState?.actionLabel}
          onAction={emptyState?.onAction}
        />
      ) : narrow ? (
        <ul className={styles.stack}>
          {loading
            ? Array.from({ length: skeletonRows }, (_, i) => (
                <li key={i} className={styles.stackRow}>
                  <div className={styles.stackSkeleton}>
                    <Skeleton wide />
                  </div>
                </li>
              ))
            : sorted.map((row, i) => (
                <li key={rowIdentity(row, i, getRowId)} className={styles.stackRow}>
                  <button
                    type="button"
                    onClick={() => onRowActivate?.(row)}
                    className={styles.stackButton}
                    data-activatable={onRowActivate ? true : undefined}
                  >
                    {columns.map((col) => (
                      <span key={col.key} className={styles.stackField}>
                        <span className={styles.stackLabel}>{col.header}</span>
                        <span className={styles.stackValue}>{cellValue(row, col)}</span>
                      </span>
                    ))}
                  </button>
                </li>
              ))}
        </ul>
      ) : (
        <div className={styles.scroll}>
          <table className={styles.table}>
            {caption ? <caption className={styles.caption}>{caption}</caption> : null}
            <thead>
              <tr className={styles.headRow}>
                {columns.map((col) => {
                  const isSorted = activeSort?.key === col.key;
                  const ariaSort = isSorted ? (activeSort.direction === 'asc' ? 'ascending' : 'descending') : 'none';
                  return (
                    <th
                      key={col.key}
                      scope="col"
                      className={styles.th}
                      style={{ width: col.width }}
                      aria-sort={col.sortable === false ? undefined : ariaSort}
                      data-align={col.align || 'left'}
                    >
                      {col.sortable === false ? (
                        <span className={styles.thLabel}>{col.header}</span>
                      ) : (
                        <button type="button" onClick={() => setSort(col.key)} className={styles.sortButton} data-sorted={isSorted || undefined}>
                          {col.header}
                          <SortIcon state={isSorted ? activeSort.direction : 'none'} />
                        </button>
                      )}
                    </th>
                  );
                })}
                {onRowActivate ? (
                  <th scope="col" className={styles.th} data-action>
                    <span className="cg-visually-hidden">Actions</span>
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: skeletonRows }, (_, i) => (
                    <tr key={i} className={styles.row}>
                      {columns.map((col, j) => (
                        <td key={col.key} className={styles.cell}>
                          <Skeleton wide={j === 0} />
                        </td>
                      ))}
                      {onRowActivate ? <td className={styles.cell} data-action /> : null}
                    </tr>
                  ))
                : sorted.map((row, i) => (
                    <TableRow
                      key={rowIdentity(row, i, getRowId)}
                      row={row}
                      columns={columns}
                      onActivate={onRowActivate ? () => onRowActivate(row) : undefined}
                      actionLabel={rowActionLabel}
                    />
                  ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
