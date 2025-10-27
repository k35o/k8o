import { cn } from '@k8o/helpers/cn';
import type { Preview } from '@storybook/nextjs-vite';
import { initialize, mswLoader } from 'msw-storybook-addon';
import Script from 'next/script';
import { useTheme } from 'next-themes';
import { type FC, memo, useEffect } from 'react';
import { sb } from 'storybook/test';
import { AppProvider } from '../src/app/_providers/app';
import { mPlus2, notoSansJp } from '../src/app/_styles/font';
import { handlers } from '../src/mocks/handlers';

import '../src/app/_styles/globals.css';

sb.mock(import('./../src/app/_components/link-card/metadata.ts'));
sb.mock(import('./../src/app/blog/_api/index.ts'));
sb.mock(import('./../src/libs/react.ts'));

initialize(
  {
    onUnhandledRequest: 'bypass',
    quiet: true,
  },
  handlers,
);

const ApplayThemeByStorybook: FC<{ theme: string }> = memo(({ theme }) => {
  const { theme: currentTheme, setTheme } = useTheme();

  useEffect(() => {
    if (currentTheme !== theme) {
      setTheme(theme === 'dark' ? 'dark' : 'light');
    }
  }, [theme, currentTheme, setTheme]);

  return null;
});

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
    backgrounds: { disabled: true },
    layout: 'fullscreen',
    mockingDate: new Date(2023, 0, 2, 12, 34, 56),
    nextjs: {
      appDirectory: true,
    },
    a11y: {
      test: 'error',
      options: {
        rules: {
          // コントラスト比がCIでFlakyな働きをするのでfalse
          'color-contrast': { enabled: false },
        },
      },
    },
  },
  decorators: [
    (Story, { globals, parameters }) => (
      <AppProvider>
        <Script>
          {`document.body.classList.add(${cn(
            mPlus2.variable,
            notoSansJp.variable,
            'text-fg-base font-medium font-m-plus-2',
          )
            .split(' ')
            .map((c) => `'${c}'`)
            .join(', ')})`}
        </Script>
        <div className="app-background min-h-svh p-6">
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
