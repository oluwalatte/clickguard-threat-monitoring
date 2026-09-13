import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Checkbox } from '../Checkbox/Checkbox';
import { Select } from '../Select/Select';
import { FilterMenu } from './FilterMenu';

const PLATFORMS = [
  { value: '', label: 'Any platform' },
  { value: 'google-ads', label: 'Google Ads' },
  { value: 'meta-ads', label: 'Meta Ads' },
];
const TRAFFIC = [
  { value: 'any', label: 'Any traffic' },
  { value: 'paid', label: 'Has paid clicks' },
  { value: 'unpaid', label: 'No paid clicks' },
];

function Example({ defaultOpen = false, initialPlatform = '' }: { defaultOpen?: boolean; initialPlatform?: string }) {
  const [platform, setPlatform] = useState(initialPlatform);
  const [traffic, setTraffic] = useState('any');
  const [converted, setConverted] = useState(false);
  const active = (platform ? 1 : 0) + (traffic !== 'any' ? 1 : 0) + (converted ? 1 : 0);
  const clear = () => {
    setPlatform('');
    setTraffic('any');
    setConverted(false);
  };
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', minHeight: '22rem' }}>
      <FilterMenu activeCount={active} onClear={clear} defaultOpen={defaultOpen}>
        <Select label="Paid traffic" options={TRAFFIC} value={traffic} onChange={setTraffic} size="sm" />
        <Select label="Advertising platform" options={PLATFORMS} value={platform} onChange={setPlatform} size="sm" />
        <Checkbox label="Converted at least once" checked={converted} onChange={setConverted} />
      </FilterMenu>
    </div>
  );
}

const meta = {
  title: 'Controls/FilterMenu',
  component: FilterMenu,
  args: { activeCount: 0, children: null },
  parameters: {
    docs: { description: { component: 'Progressive disclosure for the low-frequency filters. The trigger carries the active count so a closed menu never hides state; controls apply immediately; Escape, Done or a click outside closes it and focus returns to the trigger.' } },
  },
} satisfies Meta<typeof FilterMenu>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Closed: Story = { render: () => <Example /> };

export const ClosedWithActiveCount: Story = {
  render: () => <Example initialPlatform="google-ads" />,
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: /filters, 1 active/i });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};

export const Open: Story = {
  render: () => <Example defaultOpen />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const dialog = c.getByRole('dialog', { name: 'Filters' });
    await expect(within(dialog).getByRole('combobox', { name: 'Paid traffic' })).toHaveFocus();
    await expect(within(dialog).getByRole('button', { name: 'Clear' })).toBeDisabled();
  },
};

export const ApplyingUpdatesTheCount: Story = {
  render: () => <Example defaultOpen />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const dialog = c.getByRole('dialog', { name: 'Filters' });
    await userEvent.selectOptions(within(dialog).getByRole('combobox', { name: 'Advertising platform' }), 'meta-ads');
    await userEvent.click(within(dialog).getByRole('checkbox', { name: 'Converted at least once' }));
    await expect(c.getByRole('button', { name: /filters, 2 active/i })).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Clear' }));
    await expect(c.getByRole('button', { name: 'Filters' })).toBeInTheDocument();
  },
};

export const EscapeClosesAndRestoresFocus: Story = {
  render: () => <Example />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const trigger = c.getByRole('button', { name: 'Filters' });
    await userEvent.click(trigger);
    await expect(c.getByRole('dialog', { name: 'Filters' })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await expect(c.queryByRole('dialog')).not.toBeInTheDocument();
    await expect(trigger).toHaveFocus();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};
