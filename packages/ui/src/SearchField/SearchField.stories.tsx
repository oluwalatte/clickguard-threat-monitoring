import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { SearchField } from './SearchField';

function Controlled(props: Omit<Parameters<typeof SearchField>[0], 'value' | 'onChange'> & { initial?: string }) {
  const [value, setValue] = useState(props.initial ?? '');
  return <SearchField {...props} value={value} onChange={setValue} />;
}

const meta = {
  title: 'Controls/SearchField',
  component: SearchField,
  args: { label: 'Search visitors', placeholder: 'IP address or location', value: '', onChange: () => {} },
  decorators: [(Story) => <div style={{ maxWidth: '40ch' }}><Story /></div>],
  parameters: {
    docs: { description: { component: 'A native search input with a clear button. The label is always present, visually hidden by default so the placeholder can carry the hint in a toolbar.' } },
  },
} satisfies Meta<typeof SearchField>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = { render: (args) => <Controlled {...args} /> };

export const WithValue: Story = {
  render: (args) => <Controlled {...args} initial="185.220" />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('searchbox', { name: 'Search visitors' })).toHaveValue('185.220');
    await userEvent.click(c.getByRole('button', { name: 'Clear search visitors' }));
    await expect(c.getByRole('searchbox', { name: 'Search visitors' })).toHaveValue('');
  },
};

export const VisibleLabel: Story = { render: (args) => <Controlled {...args} showLabel /> };

export const Small: Story = { render: (args) => <Controlled {...args} size="sm" /> };
