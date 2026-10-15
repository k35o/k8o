import addonA11y from '@storybook/addon-a11y';
import addonDocs from '@storybook/addon-docs';
import { definePreview } from '@storybook/nextjs-vite';
import { useTheme } from 'next-themes';
import Script from 'next/script';
import { memo, useEffect } from 'react';
import type { FC } from 'react';
import addonDeterminism from 'storybook-addon-determinism';
import { sb } from 'storybook/test';

import { AppProvider } from '../src/app/_providers/app';
import { mPlus2, notoSansJp } from '../src/app/_styles/font';

import '../src/app/_styles/globals.css';
import './preview.css';

sb.mock(import('@repo/ai-database'));

const ApplyThemeByStorybook: FC<{ theme: string }> = memo(
  function ApplyThemeByStorybook({ theme }) {
    const { theme: currentTheme, setTheme } = useTheme();

    useEffect(() => {
      if (currentTheme !== theme) {
        setTheme(theme === 'dark' ? 'dark' : 'light');
      }
    }, [theme, currentTheme, setTheme]);

    return null;
  },
);

export default definePreview({
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
    // Math.random/crypto をシードして VRT を決定的にする。mockingDate と違い
    // 例外を投げないため、全Storyでグローバルに有効化して問題ない
    determinism: true,
    nextjs: {
      appDirectory: true,
    },
    a11y: {
      test: 'error',
    },
  },

  decorators: [
    function WithAppProvider(Story, { globals, parameters }) {
      return (
        <AppProvider>
          <Script id="storybook-body-class">
            {`document.body.classList.add('${mPlus2.variable}', '${notoSansJp.variable}')`}
          </Script>
          <div className="story-canvas">
            <Story />
          </div>
          <ApplyThemeByStorybook
            theme={
              (parameters['theme'] ?? globals['theme'] ?? 'light') as string
            }
          />
        </AppProvider>
      );
    },
  ],

  addons: [addonA11y(), addonDocs(), addonDeterminism()],
});
