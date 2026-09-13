import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { FilterChip, FilterGroup } from './FilterChip';

const meta = {
  title: 'Controls/FilterChip',
  component: FilterChip,
  args: { children: 'Blocked', pressed: false, onToggle: () => {} },
  parameters: {
    docs: { description: { component: 'A toggle for one filter value, grouped under a visible caption. Pressed is carried by aria-pressed and a weight change as well as the accent surface.' } },
  },
} satisfies Meta<typeof FilterChip>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Unpressed: Story = {};
export const Pressed: Story = { args: { pressed: true, count: 14 } };
export const Disabled: Story = { args: { disabled: true, count: 0 } };

function StatusGroup() {
  const [on, setOn] = useState<string[]>(['blocked']);
  const toggle = (k: string) => setOn((xs) => (xs.includes(k) ? xs.filter((x) => x !== k) : [...xs, k]));
  return (
    <FilterGroup label="Status">
      {[
        ['blocked', 'Blocked', 14],
        ['monitoring', 'Monitoring', 9],
        ['not-blocked', 'Not blocked', 20],
        ['allowed', 'Manually allowed', 1],
        ['not-evaluated', 'Not evaluated', 5],
      ].map(([k, label, count]) => (
        <FilterChip key={String(k)} pressed={on.includes(String(k))} onToggle={() => toggle(String(k))} count={Number(count)}>
          {label}
        </FilterChip>
      ))}
    </FilterGroup>
  );
}

export const Group: Story = {
  render: () => <StatusGroup />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const group = c.getByRole('group', { name: 'Status' });
    const monitoring = within(group).getByRole('button', { name: /monitoring/i });
    await expect(monitoring).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(monitoring);
    await expect(monitoring).toHaveAttribute('aria-pressed', 'true');
  },
};

/* D16: status is a mode switch. One chip is pressed at a time and All returns to the whole list. */
function StatusModeSwitch() {
  const [mode, setMode] = useState('all');
  const options: Array<[string, string, number]> = [
    ['all', 'All', 48],
    ['blocked', 'Blocked', 14],
    ['monitoring', 'Monitoring', 9],
    ['not-blocked', 'Not blocked', 20],
    ['not-evaluated', 'Not evaluated', 5],
  ];
  return (
    <FilterGroup label="Status">
      {options.map(([k, label, count]) => (
        <FilterChip key={k} pressed={mode === k} onToggle={() => setMode(k)} count={count}>
          {label}
        </FilterChip>
      ))}
    </FilterGroup>
  );
}

export const SingleSelectWithAll: Story = {
  render: () => <StatusModeSwitch />,
  play: async ({ canvasElement }) => {
    const group = within(within(canvasElement).getByRole('group', { name: 'Status' }));
    const all = group.getByRole('button', { name: /^all/i });
    const blocked = group.getByRole('button', { name: /blocked 14/i });
    await expect(all).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(blocked);
    await expect(blocked).toHaveAttribute('aria-pressed', 'true');
    await expect(all).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(all);
    await expect(all).toHaveAttribute('aria-pressed', 'true');
    await expect(blocked).toHaveAttribute('aria-pressed', 'false');
  },
};

export const Hover: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByRole('button'));
  },
};

export const Focus: Story = {
  args: { pressed: true },
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(within(canvasElement).getByRole('button')).toHaveFocus();
  },
};
