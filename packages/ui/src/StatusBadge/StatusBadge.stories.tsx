import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatusBadge, STATUS_LABEL, type StatusKind } from './StatusBadge';

const STATUSES = Object.keys(STATUS_LABEL) as StatusKind[];

const meta = {
  title: 'Status/StatusBadge',
  component: StatusBadge,
  args: { status: 'blocked', size: 'md' },
  parameters: {
    docs: {
      description: {
        component:
          'Names a decision (D3). Colour, marker shape and text always agree: square for Blocked, diamond for Monitoring, filled circle for Not blocked, hollow ring for Manually allowed and Not evaluated. Red belongs to Blocked only. "Not blocked" states the system finding without asserting the visitor is good; "Manually allowed" is a person\'s override in the info tone, never a status colour.',
      },
    },
  },
} satisfies Meta<typeof StatusBadge>;
export default meta;

type Story = StoryObj<typeof meta>;

const row = { display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', alignItems: 'center' } as const;

export const AllStatuses: Story = {
  render: (args) => (
    <div style={row}>
      {STATUSES.map((status) => (
        <StatusBadge key={status} {...args} status={status} />
      ))}
    </div>
  ),
};

export const TableForm: Story = {
  args: { size: 'sm' },
  render: (args) => (
    <div style={row}>
      {STATUSES.map((status) => (
        <StatusBadge key={status} {...args} status={status} />
      ))}
    </div>
  ),
};

export const WithDetail: Story = {
  render: (args) => (
    <div style={row}>
      <StatusBadge {...args} status="blocked" detail="after visit 4 of 6" />
      <StatusBadge {...args} status="monitoring" detail="3 paid visits in 12 minutes" />
      <StatusBadge {...args} status="allowed" detail="by Ada O., 11 Sep 2026" />
    </div>
  ),
};

export const Greyscale: Story = {
  name: 'Greyscale (shapes carry meaning)',
  render: (args) => (
    <div style={{ ...row, filter: 'grayscale(1)' }}>
      {STATUSES.map((status) => (
        <StatusBadge key={status} {...args} status={status} />
      ))}
    </div>
  ),
};
