import type { Meta, StoryObj } from '@storybook/react-vite';
import { SyncFlag } from './SyncFlag';

const meta = {
  title: 'Status/SyncFlag',
  component: SyncFlag,
  args: { state: 'pending' },
  parameters: {
    docs: {
      description: {
        component:
          'Surfaces an enforcement exception beside a verdict in the table: the exclusion is pending, delayed or failed at the platform. An active exclusion shows nothing here; the per-platform state lives in the visitor detail. Enforcement is never evidence.',
      },
    },
  },
} satisfies Meta<typeof SyncFlag>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Pending: Story = {};
export const Delayed: Story = { args: { state: 'delayed' } };
export const Failed: Story = { args: { state: 'failed' } };
export const WithPlatform: Story = { args: { state: 'failed', platform: 'Meta Ads' } };
