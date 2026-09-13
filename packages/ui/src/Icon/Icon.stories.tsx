import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon, ICON_NAMES } from './Icon';

const meta = {
  title: 'Foundations/Icon',
  component: Icon,
  args: { name: 'shield-ban', size: 'md' },
  argTypes: { name: { control: 'select', options: ICON_NAMES } },
  parameters: {
    docs: {
      description: {
        component:
          'A curated registry over lucide-react at 1.75 stroke. Icons are aria-hidden unless a label is passed, because text is always the authoritative carrier of meaning. Sizes: sm inline with support text, md in tables and buttons, nav in navigation, lg in empty states.',
      },
    },
  },
} satisfies Meta<typeof Icon>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
      <Icon {...args} size="sm" />
      <Icon {...args} size="md" />
      <Icon {...args} size="nav" />
      <Icon {...args} size="lg" />
    </div>
  ),
};

export const Labelled: Story = {
  args: { name: 'rotate-cw', label: 'Retry sync' },
};

export const Registry: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(12ch, 1fr))', gap: 'var(--space-4)' }}>
      {ICON_NAMES.map((name) => (
        <div key={name} style={{ display: 'grid', gap: 'var(--space-1)', justifyItems: 'center', color: 'var(--text-secondary)' }}>
          <Icon name={name} size="lg" />
          <code style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-label-size)', color: 'var(--text-muted)' }}>{name}</code>
        </div>
      ))}
    </div>
  ),
};
