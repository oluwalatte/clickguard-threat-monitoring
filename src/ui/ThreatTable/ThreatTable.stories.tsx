import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatusBadge, type StatusKind } from '../StatusBadge/StatusBadge';
import { ThreatTable, type ThreatTableColumn } from './ThreatTable';

interface Row extends Record<string, unknown> {
  id: string;
  ip: string;
  location: string;
  status: StatusKind;
  paidVisits: number;
  reason: string;
}

const rows: Row[] = [
  { id: '1', ip: '185.220.101.34', location: 'Frankfurt, Germany', status: 'blocked', paidVisits: 4, reason: 'Four paid visits in 41 minutes, no engagement' },
  { id: '2', ip: '98.14.202.7', location: 'Brooklyn, United States', status: 'monitoring', paidVisits: 3, reason: 'Three paid visits in 12 minutes, shallow engagement' },
  { id: '3', ip: '81.2.69.160', location: 'Manchester, United Kingdom', status: 'safe', paidVisits: 1, reason: 'Real engagement and a valid form' },
];

const columns: ThreatTableColumn<Row>[] = [
  { key: 'ip', header: 'Visitor', width: '24%', mono: true, render: (r) => <>{r.ip}<span>{r.location}</span></> },
  { key: 'status', header: 'Status', width: 170, render: (r) => <StatusBadge status={r.status} size="sm" />, sortValue: (r) => r.status },
  { key: 'paidVisits', header: 'Paid visits', width: 120, align: 'right' },
  { key: 'reason', header: 'Why', sortable: false },
];

const meta = {
  title: 'Data/ThreatTable',
  component: ThreatTable,
  args: { columns, rows, layout: 'table', rowActionLabel: 'View visitor', onRowActivate: () => {} },
} satisfies Meta<typeof ThreatTable<Row>>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
