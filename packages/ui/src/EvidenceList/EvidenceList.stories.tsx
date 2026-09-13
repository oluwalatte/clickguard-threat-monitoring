import type { Meta, StoryObj } from '@storybook/react-vite';
import { EVIDENCE_FULL, EVIDENCE_LONG_COPY } from '../stories/fixtures';
import { EvidenceList } from './EvidenceList';

const meta = {
  title: 'Evidence/EvidenceList',
  component: EvidenceList,
  decorators: [(Story) => <div style={{ maxWidth: '72ch' }}><Story /></div>],
  args: { id: 'evidence', items: EVIDENCE_FULL },
  parameters: {
    docs: {
      description: {
        component:
          'The ordered set of signals behind a verdict, strongest first. Contradictory items stay in the list; an auditable decision shows all of its evidence and never hides the parts that disagree.',
      },
    },
  },
} satisfies Meta<typeof EvidenceList>;
export default meta;

type Story = StoryObj<typeof meta>;

export const FullVerdict: Story = {
  args: {
    footnote: 'Paid exposure is the sum of recorded cost per click on paid visits before the decision: $9.60 x 4 = $38.40.',
  },
};

export const ContradictoryStaysVisible: Story = {
  args: {
    title: 'Evidence for a Monitoring visitor',
    items: [
      { id: 'c-1', kind: 'supporting', statement: '3 paid visits in 12 minutes' },
      { id: 'c-2', kind: 'supporting', statement: 'Shallow engagement on visits 1 and 3' },
      { id: 'c-3', kind: 'contradictory', statement: 'Submitted a valid form with a deliverable email address on visit 2', sourceVisit: 'From visit 2', sourceHref: '#visit-2' },
      { id: 'c-4', kind: 'contradictory', statement: 'Connection hides its location (VPN), but engagement is real on every visit' },
      { id: 'c-5', kind: 'missing', statement: 'Automation signal not present' },
    ],
  },
};

export const LongCopy: Story = {
  args: { items: EVIDENCE_LONG_COPY },
};

export const SignalsFromOneVisit: Story = {
  args: {
    title: 'Signals from this visit',
    items: [
      { id: 'v-1', kind: 'primary', statement: 'Fourth paid click within 41 minutes', rawValue: 'paid=[14:12:08, 14:26:31, 14:53:44] window=41m' },
      { id: 'v-2', kind: 'missing', statement: 'Device fingerprint unavailable because JavaScript was blocked' },
    ],
  },
};
