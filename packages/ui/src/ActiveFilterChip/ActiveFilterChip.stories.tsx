import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { ActiveFilterBar, ActiveFilterChip } from './ActiveFilterChip';

const meta = {
  title: 'Controls/ActiveFilterChip',
  component: ActiveFilterChip,
  args: { label: 'Google Ads', onRemove: () => {} },
  parameters: {
    docs: { description: { component: 'An applied secondary filter with a remove control, shown in a bar under the toolbar so a closed Filters menu never hides what narrows the table. Not a toggle: removing it is the only action.' } },
  },
} satisfies Meta<typeof ActiveFilterChip>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Single: Story = {};

export const LongLabel: Story = { args: { label: 'Submitted an invalid email at least once' } };

function Bar() {
  const [active, setActive] = useState(['Google Ads', 'Country: Germany', 'Submitted an invalid email at least once']);
  if (!active.length) return <p>No secondary filters active.</p>;
  return (
    <ActiveFilterBar onClearAll={() => setActive([])}>
      {active.map((label) => (
        <ActiveFilterChip key={label} label={label} onRemove={() => setActive((xs) => xs.filter((x) => x !== label))} />
      ))}
    </ActiveFilterBar>
  );
}

export const InABar: Story = {
  render: () => <Bar />,
  play: async ({ canvasElement }) => {
    const group = within(canvasElement).getByRole('group', { name: 'Active filters' });
    await expect(within(group).getAllByRole('button', { name: /^Remove filter:/ })).toHaveLength(3);
    await expect(within(group).getByRole('button', { name: 'Clear all' })).toBeInTheDocument();
  },
};

/* Kept apart from InABar so that story still shows its chips after its test runs. */
export const RemoveAndClearAll: Story = {
  render: () => <Bar />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const group = c.getByRole('group', { name: 'Active filters' });
    await userEvent.click(within(group).getByRole('button', { name: 'Remove filter: Google Ads' }));
    await expect(within(group).queryByText('Google Ads')).not.toBeInTheDocument();
    await userEvent.click(within(group).getByRole('button', { name: 'Clear all' }));
    await expect(c.getByText('No secondary filters active.')).toBeInTheDocument();
  },
};

export const RemoveHover: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByRole('button'));
  },
};

export const RemoveFocus: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(within(canvasElement).getByRole('button')).toHaveFocus();
  },
};
