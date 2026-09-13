import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatusBadge } from './StatusBadge';

const meta = {
  title: 'Status/StatusBadge',
  component: StatusBadge,
  args: { status: 'blocked', size: 'md' },
} satisfies Meta<typeof StatusBadge>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
