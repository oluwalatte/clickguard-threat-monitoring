import type { Meta, StoryObj } from '@storybook/react-vite';
import { EvidenceItem } from './EvidenceItem';

const meta = {
  title: 'Evidence/EvidenceItem',
  component: EvidenceItem,
  decorators: [(Story) => <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}><Story /></ul>],
  args: {
    kind: 'primary',
    statement: 'Four paid visits in 41 minutes',
    rawValue: 'visits=[14:12:08, 14:26:31, 14:41:02, 14:53:44] window=41m',
    sourceVisit: 'From visit 4 at 14:53:44',
    sourceHref: '#visit-4',
  },
} satisfies Meta<typeof EvidenceItem>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
