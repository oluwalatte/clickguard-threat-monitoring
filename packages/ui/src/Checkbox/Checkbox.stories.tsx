import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Checkbox } from './Checkbox';

function Controlled(props: Omit<Parameters<typeof Checkbox>[0], 'checked' | 'onChange'> & { initial?: boolean }) {
  const [checked, setChecked] = useState(props.initial ?? false);
  return <Checkbox {...props} checked={checked} onChange={setChecked} />;
}

const meta = {
  title: 'Controls/Checkbox',
  component: Checkbox,
  args: { label: 'Converted at least once', checked: false, onChange: () => {} },
  parameters: {
    docs: { description: { component: 'A native checkbox whose label is the exact condition it applies. "Converted at least once" is evidence of a purchase and never proof that a block was wrong (rule 10).' } },
  },
} satisfies Meta<typeof Checkbox>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Unchecked: Story = { render: (args) => <Controlled {...args} /> };

export const Checked: Story = {
  render: (args) => <Controlled {...args} initial />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('checkbox', { name: 'Converted at least once' })).toBeChecked();
  },
};

/* The label is the click target. Kept apart from Checked so that story still shows a checked box after its test. */
export const ToggleByLabel: Story = {
  render: (args) => <Controlled {...args} />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const box = c.getByRole('checkbox', { name: 'Converted at least once' });
    await expect(box).not.toBeChecked();
    await userEvent.click(c.getByText('Converted at least once'));
    await expect(box).toBeChecked();
  },
};

export const WithDescription: Story = {
  args: { label: 'Submitted an invalid email at least once', description: 'A form went through with an address that does not deliver.' },
  render: (args) => <Controlled {...args} />,
};

export const Focused: Story = {
  render: (args) => <Controlled {...args} />,
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(within(canvasElement).getByRole('checkbox')).toHaveFocus();
  },
};

export const Disabled: Story = { render: (args) => <Controlled {...args} disabled initial /> };
