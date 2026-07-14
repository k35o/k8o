/* oxlint-disable import/max-dependencies -- Storybook全体の provider・mock・MSW 設定を集約するため */

import { cn } from '@repo/helpers/cn';
import type { Preview } from '@storybook/nextjs-vite';
import { initialize, mswLoader } from 'msw-storybook-addon';
import { useTheme } from 'next-themes';
import Script from 'next/script';
import { memo, useEffect } from 'react';
import type { FC } from 'react';
import { sb } from 'storybook/test';

import { Background } from '../src/app/_components/global-layout/background/background';
import { AppProvider } from '../src/app/_providers/app';
import { mPlus2 } from '../src/app/_styles/font';
import { handlers } from '../src/mocks/handlers';

import '../src/app/_styles/globals.css';

sb.mock(import('./../src/app/blog/_components/link-card/metadata.ts'));
sb.mock(import('./../src/features/blog/interface/queries.ts'));
sb.mock(import('@repo/database'));
sb.mock(import('./../src/features/contact/interface/actions.ts'));
sb.mock(import('./../src/features/blog/interface/actions.ts'));
sb.mock(import('./../src/features/reading-list/interface/article-actions.ts'));

initialize(
  {
    onUnhandledRequest: 'bypass',
    quiet: true,
  },
  handlers,
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
  loaders: [
    mswLoader,
    // M PLUS 2はfont-display: swapのため、初回ペイントまでにロードが
    // 間に合わないとフォールバック表示になり、VRTのスクリーンショットが
    // 揺れる。Story描画前に登録済みフォントをすべてロードして折り返し
    // 位置を決定的にする
    async () => {
      await Promise.all(
        [...document.fonts].map((font) => font.load().catch(() => undefined)),
      );
    },
  ],
  parameters: {
    backgrounds: { disabled: true },
    layout: 'fullscreen',
    // Math.random/crypto をシードして VRT を決定的にする。mockingDate と違い
    // 例外を投げないため、全Storyでグローバルに有効化して問題ない
    determinism: true,
    // mockingDate はグローバルに設定しない。全Storyで Date を凍結すると、
    // time依存のkey生成などでエラーを出すStoryの描画が壊れ、VRTの
    // スクリーンショット撮影がスキップされる（capture はエラーを持つtaskを
    // 撮影しない）。render時の現在日時に依存するStoryでのみ、個別に
    // parameters.mockingDate を指定すること
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
    function WithAppProvider(Story, { globals, parameters }) {
      return (
        <AppProvider>
          <Script id="storybook-body-class">
            {`document.body.classList.add(${cn(
              mPlus2.variable,
              'text-fg-base font-medium font-m-plus-2',
            )
              .split(' ')
              .map((c) => `'${c}'`)
              .join(', ')})`}
          </Script>
          <div className="min-h-svh p-6">
            <Background />
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
