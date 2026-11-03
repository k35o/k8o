import type { ComponentProps } from 'react';
import { expect } from 'storybook/test';

import preview from '../../../../.storybook/preview';
import { GlobalLayout } from './global-layout';

const meta = preview.meta({
  title: 'app/globals/global-layout',
  component: GlobalLayout,
  // childrenが必須argsのため、metaで与えないとmeta.story()が呼べない。
  // nullリテラルのままargsを推論させるとmeta.storyの型推論が壊れるため、
  // satisfiesで文脈型（ReactNode）を与えて広げる
  args: { children: null } satisfies Partial<
    ComponentProps<typeof GlobalLayout>
  >,
});

export const Primary = meta.story();

// 古いブラウザ判定時: 最上部に常時バナー、ヘッダーに警告マークが出る。
export const OutdatedBrowser = meta.story({
  args: {
    minVersions: {
      chrome: '9999',
      chrome_android: '9999',
      edge: '9999',
      firefox: '9999',
      firefox_android: '9999',
      safari: '9999',
      safari_ios: '9999',
    },
  },
  // バナーはクライアント側のブラウザ判定後に描画されるため、表示を待ってから
  // VRT のスクリーンショットが撮影されるようにする
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole('alert')).toBeInTheDocument();
  },
});
