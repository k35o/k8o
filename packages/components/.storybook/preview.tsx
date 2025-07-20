import type { Preview } from '@storybook/react-vite';
import { ComponentProvider } from '../src/providers';

import '../src/styles.css';
import { FC, memo, useEffect, useState } from 'react';

const ApplayThemeByStorybook: FC<{ theme: 'light' | 'dark' }> = memo(
  ({ theme }) => {
    const [prevTheme, setPrevTheme] = useState<
      'light' | 'dark' | null
    >(null);

    if (prevTheme !== theme) {
      document.documentElement.classList.remove(
        prevTheme === 'dark' ? 'dark' : 'light',
      );
      document.documentElement.classList.add(
        theme === 'dark' ? 'dark' : 'light',
      );
      setPrevTheme(theme);
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
  parameters: {
    backgrounds: { disable: true },
    layout: 'fullscreen',
    mockingDate: new Date(2023, 0, 2, 12, 34, 56),
    a11y: {
      test: 'error',
      options: {
        rules: {
          // コントラスト比がCIでFlakyな働きをするのでfalse
          // 色の設計の段階コントラストセーフなペアを選択しているのでそれを信頼する
          'color-contrast': { enabled: false },
        },
      },
    },
  },
  decorators: [
    (Story, { globals, parameters }) => {
      const theme = parameters.theme
        ? parameters.theme
        : globals.theme
          ? globals.theme
          : ('light' as 'light' | 'dark');
      useEffect(() => {
        document.body.classList.add(
          'text-fg-base',
          'tracking-none',
          'bg-bg-base',
          'font-medium',
          'antialiased',
        );
      }, []);
      return (
        <ComponentProvider>
          <ApplayThemeByStorybook theme={theme} />
          <div className="min-h-svh p-6">
            <Story />
          </div>
        </ComponentProvider>
      );
    },
  ],
};

export default preview;
