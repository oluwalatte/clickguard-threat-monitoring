import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button } from './Button';

const meta = {
  title: 'Controls/Button',
  component: Button,
  args: { children: 'Export evidence', variant: 'secondary', size: 'md', onClick: fn() },
  parameters: {
    docs: {
      description: {
        component:
          'The only action control. Primary once per view, secondary for toolbars and filters, quiet inside tables and empty states, destructive for blocking and removal only. The label never disappears: loading swaps the icon for a spinner and keeps the text.',
      },
    },
  },
} satisfies Meta<typeof Button>;
export default meta;

type Story = StoryObj<typeof meta>;

const row = { display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', alignItems: 'center' } as const;

export const Variants: Story = {
  render: (args) => (
    <div style={row}>
      <Button {...args} variant="primary" icon="download">Export</Button>
      <Button {...args} variant="secondary" iconAfter="chevron-down">Filters</Button>
      <Button {...args} variant="quiet">Clear filters</Button>
      <Button {...args} variant="destructive" icon="ban">Remove exclusion</Button>
      <Button {...args} variant="link" icon="arrow-left">Threat monitoring</Button>
    </div>
  ),
};

export const Link: Story = {
  name: 'Link (text button)',
  args: { variant: 'link', icon: 'arrow-left', size: 'sm', children: 'Threat monitoring' },
};

export const Sizes: Story = {
  render: (args) => (
    <div style={row}>
      <Button {...args} size="md" icon="funnel">Filters</Button>
      <Button {...args} size="sm" icon="funnel">Filters</Button>
      <Button {...args} size="sm" variant="quiet">Clear filters</Button>
    </div>
  ),
};

export const WithIcons: Story = {
  args: { icon: 'calendar', iconAfter: 'chevron-down', children: '6 Sep to 12 Sep 2026' },
};

export const Loading: Story = {
  args: { loading: true, variant: 'primary', children: 'Export evidence' },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Export evidence' });
    await expect(button).toBeDisabled();
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const Disabled: Story = {
  render: (args) => (
    <div style={row}>
      <Button {...args} variant="primary" disabled>Export</Button>
      <Button {...args} variant="secondary" disabled>Filters</Button>
      <Button {...args} variant="quiet" disabled>Clear filters</Button>
      <Button {...args} variant="destructive" disabled>Remove exclusion</Button>
    </div>
  ),
};

export const FullWidth: Story = {
  args: { fullWidth: true, variant: 'primary' },
  decorators: [(Story) => <div style={{ width: '40ch' }}><Story /></div>],
};

/* Hover and focus live in CSS. These stories put the control into each state so it can be
   seen and checked, rather than trusting the stylesheet. */
export const Hover: Story = {
  args: { variant: 'primary' },
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByRole('button'));
  },
};

export const Focus: Story = {
  args: { variant: 'secondary' },
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await expect(within(canvasElement).getByRole('button')).toHaveFocus();
  },
};

export const Active: Story = {
  name: 'Active (pressed)',
  args: { variant: 'primary' },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button');
    await userEvent.pointer({ keys: '[MouseLeft>]', target: button });
  },
};
