import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { JOURNEY_BLOCK_AND_SYNC, JOURNEY_ORGANIC_RETURN, JOURNEY_SINGLE, JOURNEY_SYNC_DELAY, JOURNEY_SYNC_FAILED } from '../stories/fixtures';
import { VisitTimeline } from './VisitTimeline';

const meta = {
  title: 'Decision/VisitTimeline',
  component: VisitTimeline,
  decorators: [(Story) => <div style={{ maxWidth: '80ch' }}><Story /></div>],
  args: { items: JOURNEY_BLOCK_AND_SYNC, caption: '7 events, 19 Feb 2026' },
  parameters: {
    docs: {
      description: {
        component:
          'Visits and system events in chronological order, so a decision reads as a sequence (success criteria 3, 5 and 7). Visits have round markers; the block decision and exclusion sync events have square ones and a heavier label. The decision and the sync are separate events (D11), and one golden case has a paid click land between them.',
      },
    },
  },
} satisfies Meta<typeof VisitTimeline>;
export default meta;

type Story = StoryObj<typeof meta>;

export const BlockThenSync: Story = {};

export const SyncDelayWithPaidClick: Story = {
  args: { items: JOURNEY_SYNC_DELAY, caption: '7 events, 19 Feb 2026' },
};

export const OrganicReturnAfterBlock: Story = {
  args: { items: JOURNEY_ORGANIC_RETURN, caption: '8 events, 19 Feb to 21 Feb 2026' },
};

export const SyncFailed: Story = {
  args: { items: JOURNEY_SYNC_FAILED, caption: '6 events, 19 Feb 2026' },
};

export const SingleVisit: Story = {
  args: { items: JOURNEY_SINGLE, caption: '1 event, 18 Feb 2026' },
};

export const ExpandVisitEvidence: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const toggles = c.getAllByRole('button', { name: 'Show visit evidence' });
    await expect(toggles).toHaveLength(2);
    await userEvent.click(toggles[0]);
    await expect(c.getByRole('button', { name: 'Hide visit evidence' })).toHaveAttribute('aria-expanded', 'true');
    await expect(c.getByText('Signals from this visit')).toBeVisible();
  },
};
