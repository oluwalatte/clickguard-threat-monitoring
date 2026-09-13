import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { EvidenceItem } from './EvidenceItem';

const meta = {
  title: 'Evidence/EvidenceItem',
  component: EvidenceItem,
  decorators: [(Story) => <ul style={{ listStyle: 'none', margin: 0, padding: 0, maxWidth: '70ch' }}><Story /></ul>],
  args: { kind: 'supporting', statement: 'No scroll and under 6 seconds on the page across 4 of 4 paid visits' },
  parameters: {
    docs: {
      description: {
        component:
          'One signal behind a decision: a plain sentence, an optional raw value behind a disclosure, and an optional link to the visit it came from. No numeric weight is ever displayed; the system does not claim to know one (D4).',
      },
    },
  },
} satisfies Meta<typeof EvidenceItem>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    kind: 'primary',
    statement: 'Four paid visits in 41 minutes',
    rawValue: 'paid=[14:12:08, 14:26:31, 14:41:02, 14:53:44] window=41m',
    sourceVisit: 'From visit 4, 14:53:44',
    sourceHref: '#visit-4',
  },
};

export const Supporting: Story = {};

export const Contradictory: Story = {
  args: {
    kind: 'contradictory',
    statement: 'Submitted a valid form with a deliverable email address on visit 2',
    sourceVisit: 'From visit 2, 12:08:57',
    sourceHref: '#visit-2',
  },
};

export const Missing: Story = {
  args: { kind: 'missing', statement: 'Device fingerprint unavailable because JavaScript was blocked' },
};

export const RawValueDisclosure: Story = {
  args: {
    kind: 'supporting',
    statement: 'Headless browser signature in the user agent',
    rawValue: 'Mozilla/5.0 (X11; Linux x86_64) HeadlessChrome/121.0.0.0',
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const toggle = c.getByRole('button', { name: 'Show raw value' });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(toggle);
    await expect(c.getByRole('button', { name: 'Hide raw value' })).toHaveAttribute('aria-expanded', 'true');
    await expect(c.getByText(/HeadlessChrome/)).toBeVisible();
  },
};

export const ExpandedByDefault: Story = {
  args: {
    kind: 'primary',
    statement: 'Every paid visit came from one datacenter network',
    rawValue: '185.220.101.34, AS14061',
    defaultExpanded: true,
  },
};

export const DisclosureFocus: Story = {
  args: { kind: 'supporting', statement: 'Headless browser signature in the user agent', rawValue: 'HeadlessChrome/121.0.0.0' },
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(within(canvasElement).getByRole('button', { name: 'Show raw value' })).toHaveFocus();
  },
};
