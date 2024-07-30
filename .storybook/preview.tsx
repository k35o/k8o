import React from 'react';
import type { Preview } from '@storybook/react';
import '../src/app/_styles/globals.css';
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
      <div className={font.className}>
        <Story />
      </div>
    ),
  ],
};

export default preview;
