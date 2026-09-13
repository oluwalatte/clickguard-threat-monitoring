import type { Meta, StoryObj } from '@storybook/react-vite';
import { DecisionSummary } from './DecisionSummary';

const meta = {
  title: 'Decision/DecisionSummary',
  component: DecisionSummary,
  args: {
    status: 'blocked',
    confidence: 'high',
    headline: 'Blocked after visit 4 of 6',
    explanation: 'Returned through four paid ads in 41 minutes from one datacenter IP and showed no scroll or mouse movement on any visit.',
    decisionTime: '19 Feb 2026, 14:53:44 UTC',
    syncState: 'pending',
    syncNote: 'Google Ads exclusion queued 6 minutes ago. Blocking begins when the platform confirms it.',
    exposure: '$38.40 across 4 paid clicks before the decision',
    evidenceCount: 5,
  },
} satisfies Meta<typeof DecisionSummary>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
