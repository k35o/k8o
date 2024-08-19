import React, { FC } from 'react';
import type { Decorator, Preview } from '@storybook/react';
import '../src/app/_styles/globals.css';
import { AppProvider } from '../src/providers/app';
import { cn } from '../src/utils/cn';
import { M_PLUS_2, Noto_Sans_JP } from 'next/font/google';
import { useTheme } from 'next-themes';

const font = M_PLUS_2({ subsets: ['latin'] });

const subFont = Noto_Sans_JP({
  subsets: ['latin'],
  variable: '--font-noto-sans-jp',
});

const ApplayThemeByStorybook: FC<{ theme: string }> = ({ theme }) => {
  const { theme: currentTheme, setTheme } = useTheme();

  if (currentTheme !== theme) {
    setTheme(theme === 'dark' ? 'dark' : 'light');
  }

  return null;
};

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Toggle Color Theme.',
      defaultValue: 'light',
      toolbar: {
        title: 'Color Scheme',
        items: [
          { value: 'light', title: 'Light Mode', icon: 'sun' },
          { value: 'dark', title: 'Dark Mode', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    backgrounds: { disable: true },
    layout: 'fullscreen',
    mockingDate: new Date(2023, 0, 2, 12, 34, 56),
  },
  decorators: [
    (Story, { globals }) => (
      <AppProvider>
        <div
          className={cn(
            font.className,
            subFont.variable,
            'h-screen bg-bgBase p-6',
          )}
        >
          <Story />
        </div>
        <ApplayThemeByStorybook
          theme={globals.theme ? globals.theme : 'light'}
        />
      </AppProvider>
    ),
  ],
};

export default preview;
