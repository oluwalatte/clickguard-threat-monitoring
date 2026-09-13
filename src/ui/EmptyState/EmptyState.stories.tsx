import type { Meta, StoryObj } from '@storybook/react-vite';
import { EmptyState } from './EmptyState';

const meta = {
  title: 'States/EmptyState',
  component: EmptyState,
  args: {
    variant: 'no-matches',
    title: 'No visitors match these filters',
    description: 'Three filters are active. Clearing the status filter would show 1,284 visitors in this range.',
    actionLabel: 'Clear filters',
  },
} satisfies Meta<typeof EmptyState>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
