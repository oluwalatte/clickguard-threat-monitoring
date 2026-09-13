import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Select } from './Select';

const RANGES = [
  { value: 'all', label: 'All time' },
  { value: '24h', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
];

function Controlled(props: Omit<Parameters<typeof Select>[0], 'value' | 'onChange'> & { initial?: string }) {
  const [value, setValue] = useState(props.initial ?? props.options[0].value);
  return <Select {...props} value={value} onChange={setValue} />;
}

const meta = {
  title: 'Controls/Select',
  component: Select,
  args: { label: 'Date range', options: RANGES, value: 'all', onChange: () => {} },
  decorators: [(Story) => <div style={{ maxWidth: '32ch' }}><Story /></div>],
  parameters: {
    docs: { description: { component: 'A native select. The option text carries the current value, so a hidden label needs options that read on their own ("All time", not "All"). Presets, never a calendar (D16). In Chromium 135 and later the option list opens directly under the field and takes the system tokens; other browsers keep their native picker.' } },
  },
} satisfies Meta<typeof Select>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Labelled: Story = { render: (args) => <Controlled {...args} /> };

export const ToolbarWithIcon: Story = {
  args: { showLabel: false, icon: 'calendar' },
  render: (args) => <Controlled {...args} initial="7d" />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const select = c.getByRole('combobox', { name: 'Date range' });
    await expect(select).toHaveValue('7d');
    await userEvent.selectOptions(select, '24h');
    await expect(select).toHaveValue('24h');
  },
};

export const Small: Story = { render: (args) => <Controlled {...args} size="sm" /> };

export const Focused: Story = {
  render: (args) => <Controlled {...args} />,
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(within(canvasElement).getByRole('combobox')).toHaveFocus();
  },
};

export const Disabled: Story = { render: (args) => <Controlled {...args} disabled /> };
