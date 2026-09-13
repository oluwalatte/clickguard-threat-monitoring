import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { NAV_GROUPS } from '../stories/fixtures';
import { SidebarNav } from './SidebarNav';

const meta = {
  title: 'Navigation/SidebarNav',
  component: SidebarNav,
  decorators: [(Story) => <div style={{ height: '70vh', display: 'flex' }}><Story /></div>],
  args: { groups: NAV_GROUPS, activeId: 'threat-monitoring', onNavigate: fn(), onToggleCollapse: fn() },
  parameters: {
    docs: {
      description: {
        component:
          'The product\'s left navigation (D13). The active item changes weight as well as surface and carries aria-current, so "you are here" uses the accent without competing with status colour. Badges use the blocked tone and are for things that need attention, not unread counts. Only Threat monitoring is a live destination in this prototype.',
      },
    },
  },
} satisfies Meta<typeof SidebarNav>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Expanded: Story = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const active = c.getByRole('link', { name: 'Threat monitoring' });
    await expect(active).toHaveAttribute('aria-current', 'page');
    await expect(c.getByRole('button', { name: 'Collapse navigation' })).toHaveAttribute('aria-expanded', 'true');
  },
};

export const Collapsed: Story = {
  args: { collapsed: true },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('button', { name: 'Expand navigation' })).toHaveAttribute('aria-expanded', 'false');
    await expect(c.getByRole('link', { name: 'Threat monitoring' })).toHaveAttribute('title', 'Threat monitoring');
  },
};

export const WithAttentionBadge: Story = {
  args: {
    groups: NAV_GROUPS.map((g) => (g.label === 'Protection' ? { ...g, items: g.items.map((i) => (i.id === 'exclusions' ? { ...i, badge: 2 } : i)) } : g)),
  },
};

export const WithFooter: Story = {
  args: {
    footer: (
      <div style={{ display: 'grid', gap: 'var(--space-0)', padding: 'var(--space-3)', borderTop: 'var(--border-width) solid var(--border-default)' }}>
        <span style={{ fontSize: 'var(--text-support-size)', fontWeight: 600, color: 'var(--text-primary)' }}>Demo Workspace</span>
        <span style={{ fontSize: 'var(--text-label-size)', color: 'var(--text-muted)' }}>owner@example.com</span>
      </div>
    ),
  },
};

export const NavigateCallsBack: Story = {
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole('link', { name: 'Exclusions' }));
    await expect(args.onNavigate).toHaveBeenCalledWith('exclusions');
  },
};
