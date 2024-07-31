import React from 'react';
import type { Preview } from '@storybook/react';
import '../src/app/_styles/globals.css';
import { AppProvider } from '../src/providers/app';
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
    mockingDate: new Date(2023, 0, 2),
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
