import React from 'react';
import type { Preview } from '@storybook/react';
import '../src/app/_styles/globals.css';
import { AppProvider } from '../src/providers/app';
import { M_PLUS_2, Noto_Sans_JP } from 'next/font/google';
import clsx from 'clsx';

const font = M_PLUS_2({ subsets: ['latin'] });

const subFont = Noto_Sans_JP({
  subsets: ['latin'],
  variable: '--font-noto-sans-jp',
});

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
        <div className={clsx(font.className, subFont.variable)}>
          <Story />
        </div>
      </AppProvider>
    ),
  ],
};

export default preview;
