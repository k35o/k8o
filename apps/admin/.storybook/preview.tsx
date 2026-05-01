import { cn } from '@repo/helpers/cn';
import type { Preview } from '@storybook/nextjs-vite';
import { useTheme } from 'next-themes';
import Script from 'next/script';
import { type FC, memo, useEffect } from 'react';
import { sb } from 'storybook/test';

import { AppProvider } from '../src/app/_providers/app';
import { mPlus2, notoSansJp } from '../src/app/_styles/font';

import '../src/app/_styles/globals.css';

sb.mock(import('@repo/database'));
sb.mock(
  import('../src/app/(authenticated)/reading-list/_actions/article-actions.ts'),
);
sb.mock(
  import('../src/app/(authenticated)/reading-list/_actions/source-actions.ts'),
);

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
    backgrounds: { disabled: true },
    layout: 'fullscreen',
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
            {`document.body.classList.add(${cn(
              mPlus2.variable,
              notoSansJp.variable,
              'text-fg-base font-medium font-m-plus-2',
            )
              .split(' ')
              .map((c) => `'${c}'`)
              .join(', ')})`}
          </Script>
          <div className="bg-bg-base min-h-svh p-6">
            <Story />
          </div>
          <ApplyThemeByStorybook
            theme={(parameters.theme ?? globals.theme ?? 'light') as string}
          />
        </AppProvider>
      );
    },
  ],
};

export default preview;
