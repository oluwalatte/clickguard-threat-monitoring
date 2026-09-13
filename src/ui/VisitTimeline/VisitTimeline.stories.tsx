import type { Meta, StoryObj } from '@storybook/react-vite';
import { VisitTimeline } from './VisitTimeline';

const meta = {
  title: 'Decision/VisitTimeline',
  component: VisitTimeline,
  args: {
    caption: '5 events, 19 Feb 2026',
    items: [
      { id: 'visit-1', type: 'paid', timestamp: '19 Feb 2026, 14:12:08 UTC', description: 'Landed on /pricing from Non-brand Search', meta: [{ label: 'Keyword', value: 'ppc fraud' }, { label: 'Time on page', value: '3s' }] },
      { id: 'visit-2', type: 'paid', timestamp: '19 Feb 2026, 14:26:31 UTC', relativeTime: '14 minutes later', description: 'Landed on /pricing from Non-brand Search' },
      { type: 'block', timestamp: '19 Feb 2026, 14:53:44 UTC', relativeTime: '41 minutes after the first visit', description: 'Blocked after visit 4' },
      { type: 'sync-pending', timestamp: '19 Feb 2026, 14:53:46 UTC', description: 'Google Ads exclusion queued. Blocking begins when the platform confirms it.' },
      { type: 'sync-active', timestamp: '19 Feb 2026, 15:02:10 UTC', relativeTime: '8 minutes later', description: 'Google Ads confirmed the exclusion.' },
    ],
  },
} satisfies Meta<typeof VisitTimeline>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
