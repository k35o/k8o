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

// Tab の最初の止まり先がスキップリンクで、押すと main へ移り、次の Tab が main の中から始まる
export const SkipLink = meta.story({
  args: { children: <button type="button">本文のボタン</button> },
  parameters: { vrt: { skip: true } },
  play: async ({ canvas, userEvent }) => {
    const skipLink = canvas.getByRole('link', { name: '本文へ移動' });
    // vitest のブラウザの殻は <base target="_parent"> を置き、リンクが親の枠を移して試験が切れる
    skipLink.setAttribute('target', '_self');

    await userEvent.tab();
    await expect(skipLink).toHaveFocus();
    await expect(skipLink.getBoundingClientRect().width).toBeGreaterThan(1);

    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('main')).toHaveFocus();
    await expect(skipLink.getBoundingClientRect().width).toBe(1);

    await userEvent.tab();
    await expect(
      canvas.getByRole('button', { name: '本文のボタン' }),
    ).toHaveFocus();
  },
});

// 上へのスクロールで出てくるヘッダーが、Shift+Tab で戻ったときのフォーカスを覆わない
export const ScrollPaddingClearsHeader = meta.story({
  parameters: { vrt: { skip: true } },
  play: async ({ canvas }) => {
    const header = canvas.getByRole('banner');
    const scrollPaddingTop = Number.parseFloat(
      getComputedStyle(document.documentElement).scrollPaddingTop,
    );

    await expect(scrollPaddingTop).toBeGreaterThanOrEqual(
      header.getBoundingClientRect().height,
    );
  },
});

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
