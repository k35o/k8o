import React, { FC, memo } from 'react';
import type { Preview } from '@storybook/react';
import '../src/app/_styles/globals.css';
import { AppProvider } from '../src/providers/app';
import { cn } from '../src/utils/cn';
import { M_PLUS_2, Noto_Sans_JP } from 'next/font/google';
import { useTheme } from 'next-themes';
import { initialize, mswLoader } from 'msw-storybook-addon';
import { handlers } from '../src/mocks/handlers';

initialize(
  {
    onUnhandledRequest: 'bypass',
  },
  handlers,
);

const font = M_PLUS_2({ subsets: ['latin'] });

const subFont = Noto_Sans_JP({
  subsets: ['latin'],
  variable: '--font-noto-sans-jp',
});

const ApplayThemeByStorybook: FC<{ theme: string }> = memo(
  ({ theme }) => {
    const { theme: currentTheme, setTheme } = useTheme();

    if (currentTheme !== theme) {
      setTheme(theme === 'dark' ? 'dark' : 'light');
    }

    return null;
  },
);

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
  loaders: [mswLoader],
  parameters: {
    backgrounds: { disable: true },
    layout: 'fullscreen',
    mockingDate: new Date(2023, 0, 2, 12, 34, 56),
    nextjs: {
      appDirectory: true,
    },
  },
  decorators: [
    (Story, { globals, parameters }) => (
      <AppProvider>
        <div
          className={cn(
            font.className,
            subFont.variable,
            'app-background text-fg-base min-h-screen p-6',
          )}
        >
          <Story />
        </div>
        <ApplayThemeByStorybook
          theme={
            parameters.theme
              ? parameters.theme
              : globals.theme
                ? globals.theme
                : 'light'
          }
        />
      </AppProvider>
    ),
  ],
};

export default preview;
