import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { JOURNEY_BLOCK_AND_SYNC, JOURNEY_ORGANIC_RETURN, JOURNEY_SINGLE, JOURNEY_SYNC_DELAY, JOURNEY_SYNC_FAILED } from '../stories/fixtures';
import { VisitTimeline } from './VisitTimeline';

const meta = {
  title: 'Decision/VisitTimeline',
  component: VisitTimeline,
  decorators: [(Story) => <div style={{ maxWidth: '80ch' }}><Story /></div>],
  args: { items: JOURNEY_BLOCK_AND_SYNC, caption: '7 events, 12 Sep 2026' },
  parameters: {
    docs: {
      description: {
        component:
          'Visits and system events in chronological order, so a decision reads as a sequence (success criteria 3, 5 and 7). A collapsed visit shows where it came from, one line of engagement, and only what changed or is unusual; its details disclose what the visit added to the evidence and the full record. The visit the decision followed is named and opened by default. The decision and the sync are separate events (D11).',
      },
    },
  },
} satisfies Meta<typeof VisitTimeline>;
export default meta;

type Story = StoryObj<typeof meta>;

export const BlockThenSync: Story = {};

export const SyncDelayWithPaidClick: Story = {
  args: { items: JOURNEY_SYNC_DELAY, caption: '7 events, 12 Sep 2026' },
};

export const OrganicReturnAfterBlock: Story = {
  args: { items: JOURNEY_ORGANIC_RETURN, caption: '8 events, 12 Sep to 13 Sep 2026' },
};

export const SyncFailed: Story = {
  args: { items: JOURNEY_SYNC_FAILED, caption: '6 events, 12 Sep 2026' },
};

export const ManualOverrideAfterBlock: Story = {
  args: {
    items: [
      ...JOURNEY_BLOCK_AND_SYNC,
      { type: 'override', timestamp: '13 Sep 2026, 09:02:31 UTC', relativeTime: '18 hours later', description: 'Ada O. allowed this visitor: internal QA traffic from the agency office. The decision and its evidence stay on record.' },
    ],
    caption: '8 events, 12 Sep to 13 Sep 2026',
  },
};

export const SingleVisit: Story = {
  args: { items: JOURNEY_SINGLE, caption: '1 event, 11 Sep 2026' },
};

export const OpenTheDetails: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    /* The decision visit opens by default; the first visit opens on request. */
    await expect(c.getByRole('button', { name: 'Hide details' })).toHaveAttribute('aria-expanded', 'true');
    const first = c.getAllByRole('button', { name: 'Details' })[0];
    await userEvent.click(first);
    await expect(c.getAllByRole('button', { name: 'Hide details' })).toHaveLength(2);
    await expect(c.getAllByText('What this visit added to the evidence')).toHaveLength(2);
    await expect(c.getByText('Decision visit')).toBeVisible();
  },
};

export const CollapsedRowsOnly: Story = {
  name: 'Collapsed rows only (no decision visit)',
  args: { items: JOURNEY_BLOCK_AND_SYNC.slice(0, 3).map((i) => ({ ...i, defaultExpanded: false })), caption: '3 events, 12 Sep 2026' },
};
