import type { Preview } from '@storybook/react-vite';
import '../src/ui/styles.css';

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    a11y: { test: 'todo' },
    options: { storySort: { order: ['Foundations', 'Controls', 'Status', 'Evidence', 'Decision', 'Data', 'States', 'Navigation'] } },
    layout: 'padded',
  },
};

export default preview;
