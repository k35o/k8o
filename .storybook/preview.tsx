import React, { FC, memo } from 'react';
import Script from 'next/script';
import type { Preview } from '@storybook/react';
import { AppProvider } from '../src/providers/app';
import { cn } from '../src/utils/cn';
import { useTheme } from 'next-themes';
import { initialize, mswLoader } from 'msw-storybook-addon';
import { handlers } from '../src/mocks/handlers';
import { mPlus2, notoSansJp } from '../src/app/_styles/font';

import '../src/app/_styles/globals.css';

initialize(
  {
    onUnhandledRequest: 'bypass',
  },
  handlers,
);

const ApplayThemeByStorybook: FC<{ theme: string }> = memo(
  ({ theme }) => {
    const { theme: currentTheme, setTheme } = useTheme();

    if (currentTheme !== theme) {
      setTheme(theme === 'dark' ? 'dark' : 'light');
    }

    return null;
  },
);

ApplayThemeByStorybook.displayName = 'ApplayThemeByStorybook';

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
        <Script id="add-class-list">
          {`document.body.classList.add(${cn(
            mPlus2.variable,
            notoSansJp.variable,
            'text-fg-base font-medium font-m-plus-2',
          )
            .split(' ')
            .map((c) => `'${c}'`)
            .join(', ')})`}
        </Script>
        <div className="app-background min-h-screen p-6">
          <Story />
        </div>
        <ApplayThemeByStorybook
          theme={
            (parameters.theme
              ? parameters.theme
              : globals.theme
                ? globals.theme
                : 'light') as string
          }
        />
      </AppProvider>
    ),
  ],
};

export default preview;
