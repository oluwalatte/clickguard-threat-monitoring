import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { AccountRow } from './AccountRow';

const meta = {
  title: 'Navigation/AccountRow',
  component: AccountRow,
  args: { name: "Latte's workspace", detail: 'latte@clickguard.com' },
  decorators: [(Story) => <div style={{ width: 'var(--layout-sidebar-width)', background: 'var(--surface-panel)' }}><Story /></div>],
  parameters: {
    docs: { description: { component: 'The workspace row pinned to the bottom of the sidebar. Identification only. Collapsed, the avatar carries the full text as its accessible name and title.' } },
  },
} satisfies Meta<typeof AccountRow>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Expanded: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText("Latte's workspace")).toBeVisible();
    await expect(c.getByText('LW')).toBeInTheDocument();
  },
};

export const Collapsed: Story = {
  args: { collapsed: true },
  decorators: [(Story) => <div style={{ width: 'var(--layout-sidebar-width-collapsed)', background: 'var(--surface-panel)' }}><Story /></div>],
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('img', { name: "Latte's workspace, latte@clickguard.com" })).toBeInTheDocument();
  },
};

export const ExplicitInitials: Story = { args: { initials: 'CG', name: 'ClickGuard demo', detail: undefined } };
