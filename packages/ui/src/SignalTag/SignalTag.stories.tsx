import type { Meta, StoryObj } from '@storybook/react-vite';
import { SignalTag, SignalTags } from './SignalTag';

const meta = {
  title: 'Evidence/SignalTag',
  component: SignalTag,
  args: { label: '4 paid clicks / 41 min', kind: 'primary' },
  parameters: {
    docs: {
      description: {
        component:
          'A concise evidence label for the table, where a full sentence cannot be compared across rows. Kinds mirror EvidenceItem: primary and supporting stay neutral, contradictory takes the info tone, missing is dashed. No status colour, so a tag never reads as a verdict.',
      },
    },
  },
} satisfies Meta<typeof SignalTag>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const Supporting: Story = { args: { label: 'Datacenter', kind: 'supporting' } };
export const Contradictory: Story = { args: { label: 'Email: Valid', kind: 'contradictory' } };
export const Missing: Story = { args: { label: 'No fingerprint', kind: 'missing' } };

const row = { display: 'grid', gap: 'var(--space-3)', maxWidth: '60ch' } as const;

export const ByVisitorType: Story = {
  name: 'By visitor type',
  render: () => (
    <div style={row}>
      <SignalTags signals={[{ label: '4 paid clicks / 41 min', kind: 'primary' }, { label: 'No interaction', kind: 'primary' }, { label: 'Datacenter' }, { label: 'Bot: 96%' }]} label="Blocked" />
      <SignalTags signals={[{ label: 'VPN detected' }, { label: 'High interaction', kind: 'contradictory' }, { label: 'Email: Valid', kind: 'contradictory' }]} label="Ambiguous" />
      <SignalTags signals={[{ label: 'Email: Valid', kind: 'contradictory' }, { label: 'Converted', kind: 'contradictory' }, { label: 'High interaction', kind: 'contradictory' }]} label="Legitimate" />
      <SignalTags signals={[{ label: 'Email: Invalid' }, { label: 'No conversion' }, { label: 'Low interaction', kind: 'primary' }]} label="Invalid lead" />
      <SignalTags signals={[]} label="Nothing recorded" />
    </div>
  ),
};
