import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { SignalTags } from '../SignalTag/SignalTag';
import { StatusBadge } from '../StatusBadge/StatusBadge';
import { SyncFlag } from '../SyncFlag/SyncFlag';
import { LONG_ROW, VISITOR_ROWS, type VisitorRow } from '../stories/fixtures';
import { ThreatTable, type TableSort, type ThreatTableColumn } from './ThreatTable';

const STATUS_ORDER: Record<VisitorRow['status'], number> = { blocked: 0, monitoring: 1, safe: 2, allowed: 3, neutral: 4 };

const columns: ThreatTableColumn<VisitorRow>[] = [
  {
    key: 'ip',
    header: 'Visitor',
    width: '22%',
    mono: true,
    render: (r) => (
      <>
        <span>{r.ip}</span>
        <span>{r.location}</span>
      </>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    width: 160,
    sortValue: (r) => STATUS_ORDER[r.status],
    render: (r) => (
      <>
        <span><StatusBadge status={r.status} size="sm" /></span>
        {r.status === 'blocked' ? <span>19 Feb, 14:53</span> : null}
        {r.status === 'blocked' && r.id === 'v-1036' ? <span><SyncFlag state="failed" /></span> : null}
      </>
    ),
  },
  { key: 'visits', header: 'Visits', width: 90, align: 'right', render: (r) => `${r.visits}` },
  { key: 'paidVisits', header: 'Paid', width: 80, align: 'right' },
  { key: 'signals', header: 'Key evidence', sortable: false, render: (r) => <SignalTags signals={r.signals} /> },
  {
    key: 'lastSeen',
    header: 'Last seen',
    width: 140,
    render: (r) => (
      <>
        <span>{r.lastSeenRelative}</span>
        <span>{r.lastSeen}</span>
      </>
    ),
  },
];

const meta = {
  title: 'Data/ThreatTable',
  component: ThreatTable,
  args: {
    columns,
    rows: VISITOR_ROWS,
    layout: 'table',
    rowActionLabel: 'View visitor',
    onRowActivate: fn(),
    getRowId: (r) => r.id,
    caption: '6 visitors, most recently active first',
  },
  parameters: {
    docs: {
      description: {
        component:
          'One row per visitor, never per visit (D1). The table owns sorting, its loading, empty and error bodies, and a stacked layout for narrow containers. Sort state is visible and announced through a live region; every row has a focusable action with the visitor in its accessible name. Stories pin the layout because container measurement is not reliable in Storybook.',
      },
    },
  },
} satisfies Meta<typeof ThreatTable<VisitorRow>>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Populated: Story = {};

export const Loading: Story = {
  args: { state: 'loading', skeletonRows: 5, caption: undefined },
};

export const InitialEmpty: Story = {
  args: {
    state: 'empty',
    rows: [],
    caption: undefined,
    emptyState: {
      variant: 'no-data',
      title: 'No traffic in this date range',
      description: 'ClickGuard recorded no visits between 13 Feb and 19 Feb 2026. Widen the range to see visitors.',
      actionLabel: 'Widen the range',
      onAction: fn(),
    },
  },
};

export const FilteredEmpty: Story = {
  args: {
    state: 'empty',
    rows: [],
    caption: undefined,
    emptyState: {
      variant: 'no-matches',
      title: 'No visitors match these filters',
      description: 'Two filters are active. Clearing the status filter would show 42 visitors in this range.',
      actionLabel: 'Clear filters',
      onAction: fn(),
    },
  },
};

export const Error: Story = {
  args: { state: 'error', rows: [], caption: undefined, errorState: { onAction: fn() } },
};

export const LongContent: Story = {
  args: { rows: [LONG_ROW, ...VISITOR_ROWS.slice(0, 2)], caption: '3 visitors' },
};

export const Stacked: Story = {
  name: 'Stacked (narrow container)',
  args: { layout: 'stacked', rows: VISITOR_ROWS.slice(0, 3), caption: undefined },
  decorators: [(Story) => <div style={{ maxWidth: '48ch' }}><Story /></div>],
};

export const SortByHeader: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const header = c.getByRole('columnheader', { name: /^paid$/i });
    await expect(header).toHaveAttribute('aria-sort', 'none');
    await userEvent.click(within(header).getByRole('button'));
    await expect(header).toHaveAttribute('aria-sort', 'ascending');
    await expect(c.getByText('Paid, sorted ascending')).toBeInTheDocument();
    await userEvent.click(within(header).getByRole('button'));
    await expect(header).toHaveAttribute('aria-sort', 'descending');
    const firstCells = c.getAllByRole('row').slice(1).map((row) => within(row).getAllByRole('cell')[3].textContent);
    await expect(firstCells[0]).toBe('7');
  },
};

export const RowActionIsKeyboardReachable: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    const action = c.getByRole('button', { name: 'View visitor: 185.220.101.34, Frankfurt, Germany' });
    action.focus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onRowActivate).toHaveBeenCalledWith(VISITOR_ROWS[0]);
  },
};

export const RowClickOpensTheVisitor: Story = {
  play: async ({ canvasElement, args }) => {
    const c = within(canvasElement);
    const firstRow = c.getAllByRole('row')[1];
    await userEvent.click(within(firstRow).getAllByRole('cell')[2]);
    await expect(args.onRowActivate).toHaveBeenCalledWith(VISITOR_ROWS[0]);
    /* The action button opens the row itself; the click must not bubble into a second call. */
    await userEvent.click(within(firstRow).getByRole('button', { name: /^View visitor/ }));
    await expect(args.onRowActivate).toHaveBeenCalledTimes(2);
  },
};

function ControlledSortExample() {
  const [sort, setSort] = useState<TableSort | null>({ key: 'lastSeen', direction: 'desc' });
  return (
    <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 'var(--text-support-size)' }}>
        Sort is owned by the page: {sort ? `${sort.key}, ${sort.direction}` : 'none'}
      </p>
      <ThreatTable columns={columns} rows={VISITOR_ROWS} layout="table" sort={sort} onSortChange={setSort} getRowId={(r) => r.id} onRowActivate={() => {}} />
    </div>
  );
}

export const ControlledSort: Story = {
  render: () => <ControlledSortExample />,
};

export const RowHover: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.hover(c.getAllByRole('row')[1]);
  },
};

export const RowActionFocus: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const action = c.getByRole('button', { name: 'View visitor: 72.14.201.88, Atlanta, United States' });
    action.focus();
    await expect(action).toHaveFocus();
  },
};
