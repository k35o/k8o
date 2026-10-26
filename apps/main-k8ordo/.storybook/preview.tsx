import { ColorSchemeProvider, colorSchemeState } from '@k8ordo/color-scheme';
import type { ColorScheme } from '@k8ordo/color-scheme';
import { resetStateRegistry } from '@k8ordo/state';
import addonA11y from '@storybook/addon-a11y';
// root entry ('@storybook/addon-docs') は 'mdx/types' への module augmentation で
// @types/mdx の JSX 参照を React の JSX.Element に差し替える。augmentation を持たない
// preview entry から素の annotations を読み込んで合成する
import * as addonDocs from '@storybook/addon-docs/preview';
import { definePreview } from '@storybook/react-vite';
import addonMsw from 'msw-storybook-addon';
import { setupWorker } from 'msw/browser';
import addonDeterminism from 'storybook-addon-determinism';
import addonMockDate from 'storybook-addon-mock-date';

import { AppProvider } from '../src/components/site/app-provider';
import { Background } from '../src/components/site/global-layout/background/background';
import { handlers } from '../src/mocks/handlers';

import '@fontsource-variable/m-plus-2';

import '../src/styles/globals.css';
import './preview.css';

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

  // Story は同じページで続けて実行されるため、前の Story で更新した @k8ordo/state の
  // 状態が残らないよう Story ごとに初期化する。テーマは localStorage に保存されるので、
  // その行も消して toolbar と parameters のテーマから始める
  beforeEach: () => {
    localStorage.removeItem(colorSchemeState.storageKey);
    resetStateRegistry();
  },

  loaders: [
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
    backgrounds: { disable: true },
    layout: 'fullscreen',
    // Math.random/crypto をシードして VRT を決定的にする。mockingDate と違い
    // 例外を投げないため、全Storyでグローバルに有効化して問題ない
    determinism: true,
    // mockingDate はグローバルに設定しない。全Storyで Date を凍結すると、
    // time依存のkey生成などでエラーを出すStoryの描画が壊れ、VRTの
    // スクリーンショット撮影がスキップされる（capture はエラーを持つtaskを
    // 撮影しない）。render時の現在日時に依存するStoryでのみ、個別に
    // parameters.mockingDate を指定すること
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
      const theme = (parameters['theme'] ??
        globals['theme'] ??
        'light') as ColorScheme;

      return (
        // 何も保存していないときは defaultPreference のテーマで描く
        <ColorSchemeProvider defaultPreference={theme}>
          <AppProvider>
            <div className="story-canvas">
              <Background />
              <Story />
            </div>
          </AppProvider>
        </ColorSchemeProvider>
      );
    },
  ],

  addons: [
    addonA11y(),
    addonDocs,
    addonMsw(async () => {
      const worker = setupWorker(...handlers);
      await worker.start({ onUnhandledFrame: 'bypass', quiet: true });
      return worker;
    }),
    addonMockDate(),
    addonDeterminism(),
  ],
});
