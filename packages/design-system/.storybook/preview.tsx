import type { Preview } from '@storybook/react';

import './preview.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'cream',
      values: [
        { name: 'cream', value: '#F7F4EE' },
        { name: 'paper', value: '#FFFFFF' },
        { name: 'ink', value: '#1A1A1A' },
      ],
    },
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'landmark-one-main', enabled: false },
          { id: 'page-has-heading-one', enabled: false },
        ],
      },
    },
    options: {
      storySort: {
        order: ['Welcome', 'Foundations', ['Tokens', 'Motion', 'Iconography'], 'Components'],
      },
    },
  },
};

export default preview;
