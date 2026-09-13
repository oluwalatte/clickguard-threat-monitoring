import type { Meta, StoryObj } from '@storybook/react-vite';
import { SidebarNav } from './SidebarNav';

const meta = {
  title: 'Navigation/SidebarNav',
  component: SidebarNav,
  decorators: [(Story) => <div style={{ height: '70vh' }}><Story /></div>],
  args: {
    activeId: 'threat-monitoring',
    onNavigate: () => {},
    groups: [
      { label: 'Reporting', items: [{ id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' }, { id: 'threat-monitoring', label: 'Threat monitoring', icon: 'zap' }] },
      { label: 'Protection', items: [{ id: 'exclusions', label: 'Exclusions', icon: 'circle-check', badge: 3 }] },
    ],
  },
} satisfies Meta<typeof SidebarNav>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
