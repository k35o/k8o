import type { Preview } from '@storybook/nextjs-vite';

import '../src/app/globals.css';

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
    },
    a11y: {
      test: 'error',
    },
  },
};

export default preview;
