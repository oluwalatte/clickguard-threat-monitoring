import type { Meta, StoryObj } from '@storybook/react-vite';
import { EvidenceList } from './EvidenceList';

const meta = {
  title: 'Evidence/EvidenceList',
  component: EvidenceList,
  args: {
    id: 'evidence',
    items: [
      { kind: 'primary', statement: 'Four paid visits in 41 minutes' },
      { kind: 'supporting', statement: 'Datacenter network, not a residential or mobile connection', rawValue: '185.220.101.34' },
      { kind: 'contradictory', statement: 'Completed a purchase on visit 2' },
      { kind: 'missing', statement: 'Device fingerprint unavailable because JavaScript was blocked' },
    ],
  },
} satisfies Meta<typeof EvidenceList>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
