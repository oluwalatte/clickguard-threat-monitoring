import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button/Button';
import { DecisionSummary } from './DecisionSummary';

const meta = {
  title: 'Decision/DecisionSummary',
  component: DecisionSummary,
  args: {
    status: 'blocked',
    confidence: 'high',
    headline: 'Blocked after visit 4 of 6',
    explanation: 'Returned through four paid ads in 41 minutes and showed no scroll or mouse movement on any visit.',
    decisionTime: '12 Sep 2026, 14:53:44 UTC',
    syncState: 'active',
    syncNote: 'Google Ads confirmed the exclusion at 15:02:10 UTC, 8 minutes after the decision. No paid clicks since.',
    exposure: '$38.40 across 4 paid clicks before the decision',
    evidenceCount: 6,
  },
  parameters: {
    docs: {
      description: {
        component:
          'The verdict panel that leads the visitor detail (success criteria 1, 2, 4 and 6): what happened, why in plain language, when, what it cost, and where the evidence is. The block decision and the exclusion becoming active are different facts with different times (D11). Confidence is one of three labels, never a percentage (D5). The only action offered here never changes a verdict (D9).',
      },
    },
  },
} satisfies Meta<typeof DecisionSummary>;
export default meta;

type Story = StoryObj<typeof meta>;

export const BlockedHighConfidence: Story = {
  args: { actions: <Button variant="secondary" size="sm" icon="download">Export evidence</Button> },
};

export const BlockedModerateConfidence: Story = {
  args: {
    confidence: 'moderate',
    headline: 'Blocked after visit 7 of 9',
    explanation:
      'Seven paid clicks over 3 days on the same keyword from a residential connection, each under 6 seconds on the page. No automation signal, so the pattern reads as a person rather than a script.',
    decisionTime: '12 Sep 2026, 09:41:02 UTC',
    syncState: 'pending',
    syncNote: 'Google Ads exclusion queued 6 minutes ago. Blocking begins when the platform confirms it.',
    exposure: '$43.40 across 7 paid clicks before the decision',
    evidenceCount: 4,
  },
};

export const MonitoringConflictingEvidence: Story = {
  args: {
    status: 'monitoring',
    confidence: 'conflicting',
    headline: 'Monitoring, not blocked',
    explanation:
      'Monitoring: connection hides its location (VPN) and 3 paid visits in 2 days. Not blocked because engagement is real on every visit and a valid form was submitted on visit 2.',
    decisionTime: undefined,
    monitoringNote: '12 Sep 2026, 12:08:57 UTC',
    syncState: undefined,
    syncNote: undefined,
    exposure: '$21.90 across 3 paid clicks',
    evidenceCount: 5,
  },
};

export const MonitoringInsufficientEvidence: Story = {
  args: {
    status: 'monitoring',
    confidence: 'insufficient',
    headline: 'Monitoring, not blocked',
    explanation:
      'Monitoring: 3 paid visits in 12 minutes with shallow engagement. Not blocked because there is no automation signal and the history is three visits long.',
    decisionTime: undefined,
    monitoringNote: '12 Sep 2026, 11:56:40 UTC',
    syncState: undefined,
    syncNote: undefined,
    exposure: '$14.20 across 3 paid clicks',
    evidenceCount: 2,
  },
};

export const NotBlocked: Story = {
  args: {
    status: 'safe',
    confidence: 'none',
    headline: 'Not blocked',
    explanation: 'Two visits from a residential connection with real engagement on both and a valid form on the second.',
    decisionTime: undefined,
    monitoringNote: undefined,
    syncState: undefined,
    syncNote: undefined,
    exposure: '$6.10 across 1 paid click',
    evidenceCount: 2,
  },
};

export const TwoPlatforms: Story = {
  args: {
    syncState: 'pending',
    syncNote: 'One platform has not confirmed the exclusion yet. Paid clicks from it can still reach the site.',
    syncPlatforms: [
      { name: 'Google Ads', state: 'active', detail: 'since 12 Sep 2026, 15:02:10 UTC' },
      { name: 'Meta Ads', state: 'pending', detail: 'queued 6 minutes ago' },
    ],
  },
};

export const SyncFailed: Story = {
  args: {
    syncState: 'failed',
    syncNote: 'Meta Ads rejected the exclusion request twice. This visitor can still reach the site through Meta ads.',
  },
};

export const SyncPendingWithPaidClickSince: Story = {
  args: {
    headline: 'Blocked after visit 3 of 5',
    syncState: 'pending',
    syncNote: 'Google Ads exclusion queued at 14:53:46 UTC. One paid click reached the site at 14:58:20 UTC while the exclusion was pending.',
    exposure: '$28.80 across 3 paid clicks before the decision, plus $9.60 for 1 paid click after it',
  },
};

export const ManuallyAllowed: Story = {
  args: {
    status: 'allowed',
    confidence: 'none',
    headline: 'Blocked after visit 4 of 5, then manually allowed',
    explanation: 'Ada O. allowed this visitor on 11 Sep 2026 as internal QA traffic. The original decision and its evidence remain on record.',
    decisionTime: '10 Sep 2026, 16:20:05 UTC',
    syncState: undefined,
    syncNote: undefined,
    exposure: '$44.25 across 4 paid clicks before the decision',
    evidenceCount: 3,
  },
};

export const NotEvaluated: Story = {
  args: {
    status: 'neutral',
    confidence: 'none',
    headline: 'Not evaluated',
    explanation: 'One visit is not enough history to evaluate. ClickGuard decides cumulatively across the journey.',
    decisionTime: undefined,
    monitoringNote: undefined,
    syncState: undefined,
    syncNote: undefined,
    exposure: '$1.40 across 1 paid click',
    evidenceCount: 0,
  },
};

export const MissingOptionalData: Story = {
  args: {
    decisionTime: undefined,
    monitoringNote: undefined,
    syncState: undefined,
    syncNote: undefined,
    exposure: undefined,
    evidenceCount: undefined,
  },
};
