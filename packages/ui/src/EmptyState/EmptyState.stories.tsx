import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import { EmptyState } from './EmptyState';

const meta = {
  title: 'States/EmptyState',
  component: EmptyState,
  args: { onAction: fn(), onSecondaryAction: fn() },
  decorators: [(Story) => <div style={{ border: 'var(--border-width) solid var(--border-default)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}><Story /></div>],
  parameters: {
    docs: {
      description: {
        component:
          'Explains why a surface has no content and offers the matching way out. An empty table never means the account is clean: it says what is missing and what would show data.',
      },
    },
  },
} satisfies Meta<typeof EmptyState>;
export default meta;

type Story = StoryObj<typeof meta>;

export const NoTrafficInRange: Story = {
  args: {
    variant: 'no-data',
    title: 'No traffic in this date range',
    description: 'ClickGuard recorded no visits between 6 Sep and 12 Sep 2026. Widen the range to see visitors.',
    actionLabel: 'Widen the range',
  },
};

export const NoFilterMatches: Story = {
  args: {
    variant: 'no-matches',
    title: 'No visitors match these filters',
    description: 'Two filters are active. Clearing the status filter would show 42 visitors in this range.',
    actionLabel: 'Clear filters',
    secondaryLabel: 'Change date range',
  },
};

export const DataUnavailable: Story = {
  args: {
    variant: 'unavailable',
    title: 'Visitor detail not available',
    description: 'The journey for this visitor could not be loaded. Nothing here means unknown, not clean.',
    actionLabel: 'Retry',
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    title: 'Threat data could not be loaded',
    description: 'The request failed before any visitors were returned. Nothing here means unknown, not clean.',
    actionLabel: 'Retry',
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('alert')).toBeVisible();
  },
};

export const Compact: Story = {
  args: {
    variant: 'no-matches',
    compact: true,
    title: 'No visitors match these filters',
    description: 'Clearing the status filter would show 42 visitors in this range.',
    actionLabel: 'Clear filters',
  },
};
