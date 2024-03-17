import React from 'react';
import type { Preview } from '@storybook/react';
import '../src/app/_styles/globals.css';
import { AppProvider } from '../src/app/_providers/app';
import { M_PLUS_2 } from 'next/font/google';

const font = M_PLUS_2({ subsets: ['latin'] });

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  decorators: [
    (Story) => (
      <AppProvider>
        <div className={font.className}>
          <Story />
        </div>
      </AppProvider>
    ),
  ],
};

export default preview;
