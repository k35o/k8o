import React from 'react';
import type { Preview } from '@storybook/react';
import '../src/app/globals.css';
import { Fredoka } from 'next/font/google';

const font = Fredoka({ subsets: ['latin'] });

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  decorators: [
    (Story) => (
      <div className={font.className}>
        <Story />
      </div>
    ),
  ],
};

export default preview;
